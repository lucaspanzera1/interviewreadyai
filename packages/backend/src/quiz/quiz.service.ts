import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModuleRef } from '@nestjs/core';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { QuizAttempt, QuizAttemptDocument } from './schemas/quiz-attempt.schema';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GenerateJobQuizDto } from './dto/generate-job-quiz.dto';
import { GeneratedQuiz } from './dto/quiz-response.dto';
import { forwardRef, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { FlashcardService } from '../flashcard/flashcard.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttemptDocument>,
    private configService: ConfigService,
    private httpService: HttpService,
    private moduleRef: ModuleRef,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => FlashcardService))
    private readonly flashcardService: FlashcardService,
  ) {}

  private async getUserService(): Promise<any> {
    return this.userService;
  }

  /**
   * Gera um quiz baseado no DTO fornecido
   * Deduz 1 token do usuário antes de gerar
   */
  async generateQuiz(dto: GenerateQuizDto, userId: string): Promise<GeneratedQuiz> {
    // Validar que o usuário existe e tem tokens suficientes
    const userService = await this.getUserService();
    const user = await userService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.tokens < 1) {
      throw new HttpException('Insufficient tokens. You need at least 1 token to generate a quiz.', HttpStatus.PAYMENT_REQUIRED);
    }

    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const promptTemplate = this.getPromptTemplate();
      const prompt = this.buildPrompt(promptTemplate, dto);

      const response = await this.callGroqAPI(prompt, apiKey, false);

      // Parse do JSON de resposta
      try {
        let content = response.trim();

        // Remover blocos de código markdown se presentes
        const jsonCodeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonCodeBlockMatch) {
          content = jsonCodeBlockMatch[1];
        } else if (content.startsWith('```json')) {
          content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch && !content.trim().startsWith('{')) {
          content = jsonMatch[0];
        }

        content = content.trim();
        const generatedQuiz: GeneratedQuiz = JSON.parse(content);

        // Validate the generated quiz
        this.validateGeneratedQuiz(generatedQuiz, dto.quantidade_questoes);

        // Salvar quiz no banco de dados
        const { Types } = require('mongoose');
        const userObjectId = new Types.ObjectId(userId);

        const savedQuiz = await this.quizModel.create({
          categoria: dto.categoria,
          titulo: dto.titulo,
          descricao: dto.descricao,
          tags: dto.tags,
          quantidade_questoes: dto.quantidade_questoes,
          nivel: dto.nivel,
          questions: generatedQuiz.questions,
          createdBy: userObjectId,
          isActive: true,
          isFree: false,
          isPublic: false,
        });

        // Deduzir 1 token do usuário após sucesso
        const userService = await this.getUserService();
        await userService.removeTokensFromUser(userId, 1, 'quiz_generation');

        return {
          ...generatedQuiz,
          quizId: savedQuiz._id.toString(),
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response content:', response);
        throw new HttpException(
          'Failed to parse quiz response from AI. Please try again.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate quiz. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getPromptTemplate(): string {
    return `# Prompt para Geração de Quiz

Você é um especialista em educação e tecnologia, especializado em criar quizzes de alta qualidade sobre programação, desenvolvimento de software e tecnologias relacionadas.

Sua expertise inclui:
- Linguagens de programação (JavaScript, TypeScript, Python, Java, C#, Go, Rust, etc.)
- Frameworks e bibliotecas (React, Next.js, Vue, Angular, Node.js, Express, Django, Flask, Spring, etc.)
- Tecnologias frontend (HTML, CSS, Sass, Tailwind, Webpack, Vite, etc.)
- Tecnologias backend (APIs REST, GraphQL, bancos de dados SQL/NoSQL, autenticação, etc.)
- DevOps e ferramentas (Docker, Kubernetes, CI/CD, Git, Linux, etc.)
- Conceitos de desenvolvimento (algoritmos, estruturas de dados, padrões de design, arquitetura, etc.)
- Boas práticas de código e desenvolvimento
- Tecnologias modernas (microserviços, serverless, cloud computing, etc.)

Quando gerar código em suas respostas:
- Use blocos de código delimitados por \`\`\`linguagem
- Especifique sempre a linguagem (javascript, typescript, python, etc.)
- Mantenha o código limpo, bem formatado e comentado quando necessário
- Use exemplos práticos e realistas
- Evite código muito longo - foque no essencial

Para questões sobre código:
- Inclua trechos relevantes nas perguntas quando apropriado
- Use formatação adequada para destacar código inline com \`código\`
- Garanta que as alternativas também sigam as convenções de formatação

IMPORTANTE:
1. Sempre formate código adequadamente usando as marcações especificadas.
2. Retorne APENAS JSON válido, sem texto adicional antes ou depois.
3. NÃO inclua explicações, comentários ou texto fora do JSON.

FORMATO EXATO (APENAS JSON):
{
  "questions": [
    {
      "question": "Texto da pergunta aqui?",
      "options": [
        "Alternativa A",
        "Alternativa B",
        "Alternativa C",
        "Alternativa D"
      ],
      "correct_answer": 0,
      "explanation": "Explicação detalhada do por quê a resposta correta está certa e por que as outras estão erradas."
    }
  ]
}

## Regras Importantes:
1. O campo \`correct_answer\` deve ser o índice da resposta correta (0, 1, 2 ou 3)
2. Cada questão deve ter exatamente 4 opções
3. A explicação deve ser educativa e ajudar o usuário a aprender
4. Mantenha consistência no nível de dificuldade entre todas as questões
5. Varie os tipos de questões (conceitual, aplicação, análise, etc.)
6. Embaralhe a posição da resposta correta entre as questões
7. Use contexto das tags fornecidas para refinar o foco das questões

## Diretrizes de Qualidade:
- ✅ Perguntas claras e sem ambiguidade
- ✅ Alternativas balanceadas em comprimento
- ✅ Respostas incorretas realistas (não obviamente erradas)
- ✅ Explicações que agregam valor educacional
- ❌ Evite perguntas "pegadinha"
- ❌ Evite alternativas como "Todas as anteriores" ou "Nenhuma das anteriores"
- ❌ Não repita conceitos entre questões próximas

Gere agora {quantidade_questoes} questões de nível {nivel} sobre "{titulo}" na categoria "{categoria}".`;
  }

  private buildPrompt(template: string, dto: GenerateQuizDto): string {
    return template
      .replace(/{categoria}/g, dto.categoria)
      .replace(/{titulo}/g, dto.titulo)
      .replace(/{descricao}/g, dto.descricao)
      .replace(/{tags}/g, dto.tags.join(', '))
      .replace(/{quantidade_questoes}/g, dto.quantidade_questoes.toString())
      .replace(/{nivel}/g, dto.nivel)
      .replace(/{contexto}/g, dto.contexto || 'Nenhum contexto adicional fornecido');
  }

  private buildSimplifiedPrompt(dto: GenerateQuizDto): string {
    return `Gere um quiz com ${dto.quantidade_questoes} perguntas sobre "${dto.titulo}" na categoria "${dto.categoria}" com nível ${dto.nivel}.

Descrição: ${dto.descricao}

Tags: ${dto.tags.join(', ')}

Contexto adicional: ${dto.contexto || 'Nenhum'}

FORMATO EXATO (APENAS JSON):
{
  "questions": [
    {
      "question": "Texto da pergunta",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Explicação detalhada"
    }
  ]
}`;
  }

  private async callGroqAPI(prompt: string, apiKey: string, isJobQuiz: boolean = false): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const systemMessage = isJobQuiz ?
      `Você é um recrutador técnico sênior e engenheiro de software experiente com 15+ anos de experiência conduzindo entrevistas técnicas em empresas de tecnologia de ponta (FAANG, unicórnios e startups de alto crescimento).

Sua expertise inclui:
- Avaliação precisa de senioridade baseada em títulos e descrições de vagas
- Criação de perguntas que simulam entrevistas técnicas reais
- Foco em habilidades práticas, resolução de problemas e conhecimento técnico profundo
- Adaptação de dificuldade baseada no nível sênior esperado (junior, pleno, sênior, staff)
- Ênfase em cenários do mundo real e decisões de arquitetura

Para questões técnicas:
- Use código real e moderno das tecnologias mencionadas
- Inclua análise de código, debugging e otimização
- Foque em conceitos fundamentais e aplicação prática
- Evite perguntas teóricas sem contexto prático

IMPORTANTE:
1. Retorne APENAS JSON válido, sem texto adicional antes ou depois.
2. Garanta que todas as perguntas sejam relevantes para a vaga específica.
3. Mantenha o nível de dificuldade apropriado para o cargo.` :
      `Você é um especialista em educação e tecnologia, especializado em criar quizzes de alta qualidade sobre programação, desenvolvimento de software e tecnologias relacionadas.

Sua expertise inclui:
- Linguagens de programação (JavaScript, TypeScript, Python, Java, C#, Go, Rust, etc.)
- Frameworks e bibliotecas (React, Next.js, Vue, Angular, Node.js, Express, Django, Flask, Spring, etc.)
- Tecnologias frontend (HTML, CSS, Sass, Tailwind, Webpack, Vite, etc.)
- Tecnologias backend (APIs REST, GraphQL, bancos de dados SQL/NoSQL, autenticação, etc.)
- DevOps e ferramentas (Docker, Kubernetes, CI/CD, Git, Linux, etc.)
- Conceitos de desenvolvimento (algoritmos, estruturas de dados, padrões de design, arquitetura, etc.)
- Boas práticas de código e desenvolvimento
- Tecnologias modernas (microserviços, serverless, cloud computing, etc.)

Quando gerar código em suas respostas:
- Use blocos de código delimitados por \`\`\`linguagem
- Especifique sempre a linguagem (javascript, typescript, python, etc.)
- Mantenha o código limpo, bem formatado e comentado quando necessário
- Use exemplos práticos e realistas
- Evite código muito longo - foque no essencial

Para questões sobre código:
- Inclua trechos relevantes nas perguntas quando apropriado
- Use formatação adequada para destacar código inline com \`código\`
- Garanta que as alternativas também sigam as convenções de formatação

IMPORTANTE:
1. Sempre formate código adequadamente usando as marcações especificadas.
2. Retorne APENAS JSON válido, sem texto adicional antes ou depois.
3. NÃO inclua explicações, comentários ou texto fora do JSON.`;

    const payload = {
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: isJobQuiz ? 0.6 : 0.7, // Slightly lower temperature for job quizzes for more consistency
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new HttpException(
        `Failed to generate quiz: ${error.response?.data?.error?.message || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin methods
  async getAllQuizzes(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const quizzes = await this.quizModel
      .find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.quizModel.countDocuments().exec();

    return {
      quizzes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicQuizzes(page: number = 1, limit: number = 10, category?: string, level?: string, search?: string) {
    const skip = (page - 1) * limit;
    const filter: any = { isActive: true, isFree: true, isPublic: true };

    if (category && category !== 'Todas') {
      filter.categoria = category;
    }

    if (level && level !== 'Todas') {
      filter.nivel = level;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { titulo: searchRegex },
        { descricao: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const quizzes = await this.quizModel
      .find(filter)
      .populate('createdBy', 'name')
      .select('titulo descricao categoria tags nivel quantidade_questoes totalAccess totalAttempts totalCompletions averageScore createdAt')
      .sort({ totalAccess: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.quizModel.countDocuments(filter).exec();

    return {
      quizzes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicFilters() {
    const categories = await this.quizModel.distinct('categoria', { isActive: true, isFree: true, isPublic: true }).exec();
    const levels = await this.quizModel.distinct('nivel', { isActive: true, isFree: true, isPublic: true }).exec();
    return { categories, levels };
  }

  async getQuizById(id: string) {
    return this.quizModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();
  }

  async getPublicQuizById(id: string) {
    return this.quizModel
      .findOne({ _id: id, isActive: true })
      .populate('createdBy', 'name')
      .select('titulo descricao categoria tags nivel quantidade_questoes totalAccess totalAttempts totalCompletions averageScore createdAt')
      .exec();
  }

  async updateQuizStatus(id: string, isActive: boolean) {
    return this.quizModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
  }

  async deleteQuiz(id: string) {
    // Delete quiz and all its attempts
    await this.quizAttemptModel.deleteMany({ quizId: id }).exec();
    return this.quizModel.findByIdAndDelete(id).exec();
  }

  async getQuizStats(id: string) {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) return null;

    const attempts = await this.quizAttemptModel
      .find({ quizId: id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    const stats = {
      quiz: {
        ...quiz.toObject(),
        questions: quiz.questions // Include questions in the response
      },
      attempts,
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.completed).length,
      averageScore: attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        : 0,
    };

    return stats;
  }

  // User methods
  async recordQuizAttempt(quizId: string, userId: string, selectedAnswers: number[], score: number, totalQuestions: number, timeSpent: number = 0) {
    const percentage = Math.round((score / totalQuestions) * 100);

    // Verificar se o quiz é gratuito e incrementar contador
    const quiz = await this.quizModel.findById(quizId);
    let tokenReward = false;
    if (quiz && quiz.isFree) {
      // Check limit before incrementing
      const userService = await this.getUserService();
      const hasAccess = await userService.canDoFreeQuiz(userId);
      if (!hasAccess) {
        throw new HttpException(
          'Você atingiu o limite diário de 3 quizzes gratuitos. Aguarde até amanhã ou compre tokens para continuar jogando.',
          HttpStatus.FORBIDDEN
        );
      }
      const result = await userService.incrementFreeQuizCount(userId);
      tokenReward = result.tokenReward;
    }

    const attempt = await this.quizAttemptModel.create({
      quizId,
      userId,
      selectedAnswers,
      score,
      totalQuestions,
      percentage,
      timeSpent,
      completed: true,
      completedAt: new Date(),
    });

    // Update quiz statistics
    const allAttempts = await this.quizAttemptModel.find({ quizId }).exec();
    const averageScore = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length
      : 0;

    await this.quizModel.findByIdAndUpdate(quizId, {
      $inc: {
        totalAttempts: 1,
        totalCompletions: 1,
      },
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
    });

    return {
      ...attempt.toObject(),
      tokenReward
    };
  }

  async getUserAttempts(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const attempts = await this.quizAttemptModel
      .find({ userId })
      .populate({
        path: 'quizId',
        select: 'titulo categoria nivel quantidade_questoes tags',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Filter out attempts where quiz was not found or inactive
    const validAttempts = attempts.filter(attempt => attempt.quizId);

    const total = await this.quizAttemptModel.countDocuments({
      userId,
      quizId: { $in: validAttempts.map(a => a.quizId) }
    }).exec();

    return {
      attempts: validAttempts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserAttemptDetails(attemptId: string, userId: string) {
    const attempt = await this.quizAttemptModel
      .findOne({ _id: attemptId, userId })
      .populate({
        path: 'quizId',
        select: 'titulo categoria nivel quantidade_questoes questions tags'
      })
      .exec();

    if (!attempt) {
      throw new NotFoundException('Attempt not found or does not belong to user');
    }

    return attempt;
  }

  async incrementQuizAccess(quizId: string, userId: string) {
    // Verificar se o quiz existe e é gratuito
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isFree) {
      // Se não é gratuito, não há limite de acesso
      return { success: true };
    }

    // Verificar se o usuário ainda tem acesso aos quizzes gratuitos
    const userService = await this.getUserService();
    const hasAccess = await userService.canDoFreeQuiz(userId);
    if (!hasAccess) {
      throw new HttpException(
        'Você atingiu o limite diário de 3 quizzes gratuitos. Aguarde até amanhã ou compre tokens para continuar jogando.',
        HttpStatus.FORBIDDEN
      );
    }

    // Incrementar contador de acesso
    await this.quizModel.findByIdAndUpdate(quizId, {
      $inc: { totalAccess: 1 }
    });

    return { success: true };
  }

  async getQuizForPlaying(quizId: string, userId: string) {
    // Verificar se o quiz existe
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isActive) {
      throw new HttpException('Este quiz não está disponível no momento.', HttpStatus.FORBIDDEN);
    }

    // Verificar se o usuário é o criador do quiz
    const isCreator = quiz.createdBy.toString() === userId.toString();

    const userService = await this.getUserService();

    if (!quiz.isFree && !isCreator) {
      // Se não é gratuito E não é o criador, verificar se o usuário tem tokens suficientes
      const userTokens = await userService.getUserTokens(userId);
      if (userTokens < 1) {
        throw new HttpException(
          'Você não tem tokens suficientes para jogar este quiz. Compre tokens para continuar.',
          HttpStatus.FORBIDDEN
        );
      }

      // Debitar 1 token
      await userService.removeTokensFromUser(userId, 1, 'quiz_play');
    } else if (quiz.isFree) {
      // Se é gratuito, verificar limite diário
      const hasAccess = await userService.canDoFreeQuiz(userId);
      if (!hasAccess) {
        throw new HttpException(
          'Você atingiu o limite diário de 3 quizzes gratuitos. Aguarde até amanhã ou compre tokens para continuar jogando.',
          HttpStatus.FORBIDDEN
        );
      }
    }
    // Se é o criador, não faz nenhuma verificação (pode jogar livremente)

    // Retornar quiz completo com questões
    return {
      _id: quiz._id,
      titulo: quiz.titulo,
      descricao: quiz.descricao,
      categoria: quiz.categoria,
      tags: quiz.tags,
      nivel: quiz.nivel,
      quantidade_questoes: quiz.quantidade_questoes,
      questions: quiz.questions,
      isFree: quiz.isFree,
    };
  }

  async getUserStats(userId: string) {
    // Buscar tentativas de quiz
    const attempts = await this.quizAttemptModel
      .find({ userId })
      .select('score')
      .exec();

    const quizAttempts = attempts.length;
    const averageScore = quizAttempts > 0
      ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts
      : 0;

    // Buscar sessões de flashcard
    let flashcardSessions = 0;
    try {
      const flashcardStats = await this.flashcardService.getUserStats(userId);
      flashcardSessions = flashcardStats.totalStudySessions || 0;
    } catch (error) {
      console.log('[API] FlashcardService não encontrado para estatísticas de quiz');
    }

    // Buscar totalFreeQuizzesCompleted do usuário
    const userService = await this.getUserService();
    const user = await userService.findById(userId);
    const totalFreeQuizzesCompleted = user.totalFreeQuizzesCompleted || 0;

    return {
      totalAttempts: quizAttempts + flashcardSessions, // Combinar tentativas de quiz e sessões de flashcard
      quizAttempts, // Manter separado para referência
      flashcardSessions, // Manter separado para referência
      averageScore,
      totalFreeQuizzesCompleted, // Apenas quizzes gratuitos
    };
  }

  /**
   * Busca quizzes criados pelo usuário
   */
  async getUserQuizzes(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);

    const [quizzes, total] = await Promise.all([
      this.quizModel
        .find({ createdBy: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-questions') // Não retornar as questões na listagem
        .exec(),
      this.quizModel.countDocuments({ createdBy: userObjectId }).exec(),
    ]);

    return {
      data: quizzes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Gera quiz personalizado baseado em vaga do LinkedIn
   * Deduz 1 token do usuário antes de gerar
   */
  async generateJobQuiz(dto: GenerateJobQuizDto, userId: string): Promise<GeneratedQuiz> {
    // Validar que o usuário existe e tem tokens suficientes
    const userService = await this.getUserService();
    const user = await userService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.tokens < 1) {
      throw new HttpException('Insufficient tokens. You need at least 1 token to generate a job quiz.', HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      // Detectar o site da vaga e fazer scraping apropriado
      const jobData = await this.scrapeJob(dto.jobUrl);

      // Gerar o quiz baseado nos dados da vaga
      const quiz = await this.generateJobQuizFromData(jobData, userId);

      // Deduzir 1 token do usuário após sucesso
      await userService.removeTokensFromUser(userId, 1, 'quiz_generation');

      return quiz;
    } catch (error) {
      console.error('Error generating job quiz:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate job quiz. Please check the job URL and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Detecta o site da vaga e chama o scraper apropriado
   */
  private async scrapeJob(url: string): Promise<any> {
    if (url.includes('linkedin.com')) {
      return this.scrapeLinkedInJob(url);
    } else if (url.includes('gupy.io') || url.includes('gupy.com.br')) {
      return this.scrapeGupyJob(url);
    } else if (url.includes('infojobs.com') || url.includes('infojobs.net')) {
      return this.scrapeInfojobsJob(url);
    } else if (url.includes('glassdoor.com') || url.includes('glassdoor.com.br')) {
      return this.scrapeGlassdoorJob(url);
    } else if (url.includes('indeed.com') || url.includes('indeed.com.br')) {
      return this.scrapeIndeedJob(url);
    } else {
      throw new HttpException('Unsupported job site. Currently supported: LinkedIn, Gupy, Infojobs, Glassdoor, Indeed.', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Faz scraping de uma vaga do LinkedIn
   */
  private async scrapeLinkedInJob(url: string): Promise<any> {
    try {
      // Validar que é uma URL do LinkedIn
      if (!url.includes('linkedin.com/jobs/view') && !url.includes('linkedin.com/jobs/collections')) {
        throw new HttpException('Invalid LinkedIn job URL', HttpStatus.BAD_REQUEST);
      }

      // Fazer requisição HTTP para obter o HTML da página
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      // Fazer parsing do HTML com Cheerio
      const $ = cheerio.load(response.data);

      // Extrair informações da vaga
      const jobTitle = $('h1.top-card-layout__title, h2.top-card-layout__title, h1[data-test-id="job-title"]').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       'Título da Vaga Não Encontrado';

      const companyName = $('.top-card-layout__card .topcard__org-name-link, .topcard__flavor--black-link, [data-test-id="company-name"]').first().text().trim() ||
                         $('.top-card-layout__card a[data-tracking-control-name="public_jobs_topcard-org-name"]').first().text().trim() ||
                         'Empresa Não Encontrada';

      const location = $('.top-card-layout__card .topcard__flavor--bullet, .topcard__flavor, [data-test-id="job-location"]').first().text().trim() ||
                      'Localização Não Encontrada';

      // Tentar múltiplos seletores para descrição
      const description = $('.show-more-less-html__markup, .description__text, [data-test-id="job-description"]').text().trim() ||
                         $('div[class*="description"]').first().text().trim() ||
                         $('section[data-test-id="job-details"]').text().trim() ||
                         'Descrição não disponível';

      // Extrair requisitos e responsabilidades do texto da descrição
      const requirements: string[] = [];
      const responsibilities: string[] = [];

      // Melhorar extração de seções
      const descriptionLower = description.toLowerCase();

      // Procurar por seções de requisitos
      const reqPatterns = ['requirements', 'requisitos', 'qualifications', 'qualificações', 'skills', 'habilidades', 'what you need', 'o que você precisa'];
      let reqStart = -1;
      for (const pattern of reqPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          reqStart = index;
          break;
        }
      }

      if (reqStart !== -1) {
        const reqSection = description.substring(reqStart);
        // Extrair linhas que parecem ser bullet points ou itens de lista
        const lines = reqSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          // Verificar se é um item de lista (bullet, número, etc.)
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('responsibilities') && !trimmed.includes('responsabilidades'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              requirements.push(cleanItem);
            }
          }
          // Parar se encontrar próxima seção
          if (trimmed.toLowerCase().includes('responsibilities') || trimmed.toLowerCase().includes('responsabilidades') ||
              trimmed.toLowerCase().includes('what you will') || trimmed.toLowerCase().includes('o que você fará')) {
            break;
          }
        }
      }

      // Procurar por seções de responsabilidades
      const respPatterns = ['responsibilities', 'responsabilidades', 'what you will', 'o que você fará', 'what you\'ll do', 'o que você irá fazer'];
      let respStart = -1;
      for (const pattern of respPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          respStart = index;
          break;
        }
      }

      if (respStart !== -1) {
        const respSection = description.substring(respStart);
        const lines = respSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('requirements') && !trimmed.includes('requisitos'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              responsibilities.push(cleanItem);
            }
          }
        }
      }

      // Fallback se não encontrou seções estruturadas
      if (requirements.length === 0) {
        // Extrair frases que contenham palavras-chave técnicas
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'api', 'git', 'docker', 'aws', 'cloud'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (techKeywords.some(keyword => lowerSentence.includes(keyword))) {
            requirements.push(sentence.trim());
          }
        }
      }

      if (responsibilities.length === 0) {
        // Extrair frases que contenham verbos de ação
        const actionVerbs = ['desenvolver', 'implementar', 'criar', 'gerenciar', 'manter', 'otimizar', 'integrar', 'colaborar', 'develop', 'implement', 'create', 'manage', 'maintain', 'optimize', 'integrate', 'collaborate'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
            responsibilities.push(sentence.trim());
          }
        }
      }

      return {
        jobTitle: jobTitle || 'Job Title Not Found',
        companyName: companyName || 'Company Not Found',
        location: location || 'Location Not Found',
        description: description || 'Description not available',
        requirements: requirements.length > 0 ? requirements : ['Requirements not specified'],
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Responsibilities not specified'],
      };
    } catch (error) {
      console.error('Scraping error:', error.message);
      throw new HttpException(
        'Failed to scrape LinkedIn job. The page might be private or the URL is invalid.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Faz scraping de uma vaga do Gupy
   */
  private async scrapeGupyJob(url: string): Promise<any> {
    try {
      // Validar que é uma URL do Gupy
      if (!url.includes('gupy.io') && !url.includes('gupy.com.br')) {
        throw new HttpException('Invalid Gupy job URL', HttpStatus.BAD_REQUEST);
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // Extrair informações da vaga
      const jobTitle = $('h1[data-testid="job-title"], .job-title, h1').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       'Título da Vaga Não Encontrado';

      const companyName = $('[data-testid="company-name"], .company-name, .employer-name').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         'Empresa Não Encontrada';

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      'Localização Não Encontrada';

      // Descrição da vaga
      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-details-content').text().trim() ||
                         'Descrição não disponível';

      // Extrair requisitos e responsabilidades
      const requirements: string[] = [];
      const responsibilities: string[] = [];

      const descriptionLower = description.toLowerCase();

      // Procurar por seções de requisitos
      const reqPatterns = ['requisitos', 'requirements', 'qualificações', 'qualifications', 'habilidades', 'skills', 'o que esperamos', 'what we expect'];
      let reqStart = -1;
      for (const pattern of reqPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          reqStart = index;
          break;
        }
      }

      if (reqStart !== -1) {
        const reqSection = description.substring(reqStart);
        const lines = reqSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('responsabilidades') && !trimmed.includes('atividades'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              requirements.push(cleanItem);
            }
          }
          if (trimmed.toLowerCase().includes('responsabilidades') || trimmed.toLowerCase().includes('atividades') ||
              trimmed.toLowerCase().includes('o que você fará')) {
            break;
          }
        }
      }

      // Procurar por seções de responsabilidades
      const respPatterns = ['responsabilidades', 'atividades', 'responsibilities', 'o que você fará', 'what you will do'];
      let respStart = -1;
      for (const pattern of respPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          respStart = index;
          break;
        }
      }

      if (respStart !== -1) {
        const respSection = description.substring(respStart);
        const lines = respSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('requisitos'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              responsibilities.push(cleanItem);
            }
          }
        }
      }

      // Fallback se não encontrou seções estruturadas
      if (requirements.length === 0) {
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'api', 'git', 'docker', 'aws', 'cloud'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (techKeywords.some(keyword => lowerSentence.includes(keyword))) {
            requirements.push(sentence.trim());
          }
        }
      }

      if (responsibilities.length === 0) {
        const actionVerbs = ['desenvolver', 'implementar', 'criar', 'gerenciar', 'manter', 'otimizar', 'integrar', 'colaborar', 'develop', 'implement', 'create', 'manage', 'maintain', 'optimize', 'integrate', 'collaborate'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
            responsibilities.push(sentence.trim());
          }
        }
      }

      return {
        jobTitle: jobTitle || 'Job Title Not Found',
        companyName: companyName || 'Company Not Found',
        location: location || 'Location Not Found',
        description: description || 'Description not available',
        requirements: requirements.length > 0 ? requirements : ['Requirements not specified'],
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Responsibilities not specified'],
      };
    } catch (error) {
      console.error('Gupy scraping error:', error.message);
      throw new HttpException(
        'Failed to scrape Gupy job. The page might be private or the URL is invalid.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Faz scraping de uma vaga do Infojobs
   */
  private async scrapeInfojobsJob(url: string): Promise<any> {
    try {
      if (!url.includes('infojobs.com') && !url.includes('infojobs.net')) {
        throw new HttpException('Invalid Infojobs job URL', HttpStatus.BAD_REQUEST);
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      const jobTitle = $('h1[data-testid="job-title"], .job-title, h1').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       'Título da Vaga Não Encontrado';

      const companyName = $('[data-testid="company-name"], .company-name, .company').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         'Empresa Não Encontrada';

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      'Localização Não Encontrada';

      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-content').text().trim() ||
                         'Descrição não disponível';

      // Similar extraction logic as Gupy
      const requirements: string[] = [];
      const responsibilities: string[] = [];

      const descriptionLower = description.toLowerCase();

      const reqPatterns = ['requisitos', 'requirements', 'qualificações', 'qualifications', 'habilidades', 'skills'];
      let reqStart = -1;
      for (const pattern of reqPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          reqStart = index;
          break;
        }
      }

      if (reqStart !== -1) {
        const reqSection = description.substring(reqStart);
        const lines = reqSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('responsabilidades'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              requirements.push(cleanItem);
            }
          }
          if (trimmed.toLowerCase().includes('responsabilidades') || trimmed.toLowerCase().includes('funções')) {
            break;
          }
        }
      }

      const respPatterns = ['responsabilidades', 'funções', 'responsibilities', 'functions'];
      let respStart = -1;
      for (const pattern of respPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          respStart = index;
          break;
        }
      }

      if (respStart !== -1) {
        const respSection = description.substring(respStart);
        const lines = respSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('requisitos'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              responsibilities.push(cleanItem);
            }
          }
        }
      }

      // Fallback similar to LinkedIn
      if (requirements.length === 0) {
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'api', 'git', 'docker', 'aws', 'cloud'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (techKeywords.some(keyword => lowerSentence.includes(keyword))) {
            requirements.push(sentence.trim());
          }
        }
      }

      if (responsibilities.length === 0) {
        const actionVerbs = ['desenvolver', 'implementar', 'criar', 'gerenciar', 'manter', 'otimizar', 'integrar', 'colaborar'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
            responsibilities.push(sentence.trim());
          }
        }
      }

      return {
        jobTitle: jobTitle || 'Job Title Not Found',
        companyName: companyName || 'Company Not Found',
        location: location || 'Location Not Found',
        description: description || 'Description not available',
        requirements: requirements.length > 0 ? requirements : ['Requirements not specified'],
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Responsibilities not specified'],
      };
    } catch (error) {
      console.error('Infojobs scraping error:', error.message);
      throw new HttpException(
        'Failed to scrape Infojobs job. The page might be private or the URL is invalid.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Faz scraping de uma vaga do Glassdoor
   */
  private async scrapeGlassdoorJob(url: string): Promise<any> {
    try {
      if (!url.includes('glassdoor.com') && !url.includes('glassdoor.com.br')) {
        throw new HttpException('Invalid Glassdoor job URL', HttpStatus.BAD_REQUEST);
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      const jobTitle = $('[data-test="job-title"], .job-title, h1').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       'Job Title Not Found';

      const companyName = $('[data-test="employer-name"], .employer-name, .company').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         'Company Not Found';

      const location = $('[data-test="location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      'Location Not Found';

      const description = $('[data-test="job-description"], .job-description, .description').text().trim() ||
                         $('.job-content').text().trim() ||
                         'Description not available';

      const requirements: string[] = [];
      const responsibilities: string[] = [];

      const descriptionLower = description.toLowerCase();

      const reqPatterns = ['requirements', 'qualifications', 'skills', 'what you need'];
      let reqStart = -1;
      for (const pattern of reqPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          reqStart = index;
          break;
        }
      }

      if (reqStart !== -1) {
        const reqSection = description.substring(reqStart);
        const lines = reqSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('responsibilities'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              requirements.push(cleanItem);
            }
          }
          if (trimmed.toLowerCase().includes('responsibilities') || trimmed.toLowerCase().includes('what you will')) {
            break;
          }
        }
      }

      const respPatterns = ['responsibilities', 'what you will', 'what you\'ll do'];
      let respStart = -1;
      for (const pattern of respPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          respStart = index;
          break;
        }
      }

      if (respStart !== -1) {
        const respSection = description.substring(respStart);
        const lines = respSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('requirements'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              responsibilities.push(cleanItem);
            }
          }
        }
      }

      if (requirements.length === 0) {
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'api', 'git', 'docker', 'aws', 'cloud'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (techKeywords.some(keyword => lowerSentence.includes(keyword))) {
            requirements.push(sentence.trim());
          }
        }
      }

      if (responsibilities.length === 0) {
        const actionVerbs = ['develop', 'implement', 'create', 'manage', 'maintain', 'optimize', 'integrate', 'collaborate'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
            responsibilities.push(sentence.trim());
          }
        }
      }

      return {
        jobTitle: jobTitle || 'Job Title Not Found',
        companyName: companyName || 'Company Not Found',
        location: location || 'Location Not Found',
        description: description || 'Description not available',
        requirements: requirements.length > 0 ? requirements : ['Requirements not specified'],
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Responsibilities not specified'],
      };
    } catch (error) {
      console.error('Glassdoor scraping error:', error.message);
      throw new HttpException(
        'Failed to scrape Glassdoor job. The page might be private or the URL is invalid.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Faz scraping de uma vaga do Indeed
   */
  private async scrapeIndeedJob(url: string): Promise<any> {
    try {
      if (!url.includes('indeed.com') && !url.includes('indeed.com.br')) {
        throw new HttpException('Invalid Indeed job URL', HttpStatus.BAD_REQUEST);
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      const jobTitle = $('[data-testid="job-title"], .job-title, h1').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       'Job Title Not Found';

      const companyName = $('[data-testid="company-name"], .company-name, .company').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         'Company Not Found';

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      'Location Not Found';

      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-content').text().trim() ||
                         'Description not available';

      const requirements: string[] = [];
      const responsibilities: string[] = [];

      const descriptionLower = description.toLowerCase();

      const reqPatterns = ['requirements', 'qualifications', 'skills', 'what you need'];
      let reqStart = -1;
      for (const pattern of reqPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          reqStart = index;
          break;
        }
      }

      if (reqStart !== -1) {
        const reqSection = description.substring(reqStart);
        const lines = reqSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('responsibilities'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              requirements.push(cleanItem);
            }
          }
          if (trimmed.toLowerCase().includes('responsibilities') || trimmed.toLowerCase().includes('what you will')) {
            break;
          }
        }
      }

      const respPatterns = ['responsibilities', 'what you will', 'what you\'ll do'];
      let respStart = -1;
      for (const pattern of respPatterns) {
        const index = descriptionLower.indexOf(pattern);
        if (index !== -1) {
          respStart = index;
          break;
        }
      }

      if (respStart !== -1) {
        const respSection = description.substring(respStart);
        const lines = respSection.split('\n').filter(line => line.trim().length > 0).slice(0, 15);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.)]\s/) ||
              (trimmed.length > 10 && !trimmed.includes('requirements'))) {
            const cleanItem = trimmed.replace(/^[-•*\d]+[\.)]?\s*/, '').trim();
            if (cleanItem.length > 5 && cleanItem.length < 200) {
              responsibilities.push(cleanItem);
            }
          }
        }
      }

      if (requirements.length === 0) {
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'api', 'git', 'docker', 'aws', 'cloud'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (techKeywords.some(keyword => lowerSentence.includes(keyword))) {
            requirements.push(sentence.trim());
          }
        }
      }

      if (responsibilities.length === 0) {
        const actionVerbs = ['develop', 'implement', 'create', 'manage', 'maintain', 'optimize', 'integrate', 'collaborate'];
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        for (const sentence of sentences.slice(0, 8)) {
          const lowerSentence = sentence.toLowerCase();
          if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
            responsibilities.push(sentence.trim());
          }
        }
      }

      return {
        jobTitle: jobTitle || 'Job Title Not Found',
        companyName: companyName || 'Company Not Found',
        location: location || 'Location Not Found',
        description: description || 'Description not available',
        requirements: requirements.length > 0 ? requirements : ['Requirements not specified'],
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Responsibilities not specified'],
      };
    } catch (error) {
      console.error('Indeed scraping error:', error.message);
      throw new HttpException(
        'Failed to scrape Indeed job. The page might be private or the URL is invalid.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Gera quiz baseado nos dados da vaga
   */
  private async generateJobQuizFromData(jobData: any, userId: string): Promise<GeneratedQuiz> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Ler o template de prompt para quiz de vagas
    const promptTemplate = await this.getJobQuizPromptTemplate();

    // Construir o prompt com os dados da vaga
    const prompt = this.buildJobQuizPrompt(promptTemplate, jobData);

    // Chamar a API do Groq
    const response = await this.callGroqAPI(prompt, apiKey, true);

    // Parse do JSON de resposta
    try {
      let content = response.trim();

      // Remover blocos de código markdown se presentes
      const jsonCodeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonCodeBlockMatch) {
        content = jsonCodeBlockMatch[1];
      } else if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch && !content.trim().startsWith('{')) {
        content = jsonMatch[0];
      }

      content = content.trim();
      const generatedQuiz: GeneratedQuiz = JSON.parse(content);

      // Validate the generated quiz
      this.validateGeneratedQuiz(generatedQuiz, 10);

      // Salvar quiz no banco de dados
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);

      const savedQuiz = await this.quizModel.create({
        categoria: 'Vaga de Emprego',
        titulo: `Quiz: ${jobData.jobTitle} - ${jobData.companyName}`,
        descricao: `Quiz personalizado para a vaga de ${jobData.jobTitle} na empresa ${jobData.companyName}`,
        tags: ['vaga', 'emprego', jobData.jobTitle.toLowerCase()],
        quantidade_questoes: 10,
        nivel: 'MEDIO',
        questions: generatedQuiz.questions,
        createdBy: userObjectId,
        isActive: true,
        isFree: false,
        isPublic: false,
      });

      return {
        ...generatedQuiz,
        quizId: savedQuiz._id.toString(),
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response content:', response);
      throw new HttpException(
        'Failed to parse quiz response from AI. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtém o template de prompt para quiz de vagas
   */
  private async getJobQuizPromptTemplate(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(__dirname, '../../../../prompt/job-quiz.md');
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      return template;
    } catch (error) {
      // Fallback para template hardcoded
      return this.getDefaultJobQuizPrompt();
    }
  }

  /**
   * Template padrão para quiz de vagas (fallback)
   */
  private getDefaultJobQuizPrompt(): string {
    return `# Prompt para Geração de Quiz de Vaga de Emprego

Você é um recrutador técnico sênior e engenheiro de software experiente com 15+ anos de experiência conduzindo entrevistas técnicas em empresas de tecnologia de ponta (FAANG, unicórnios e startups de alto crescimento).

Sua expertise inclui:
- Avaliação precisa de senioridade baseada em títulos e descrições de vagas
- Criação de perguntas que simulam entrevistas técnicas reais
- Foco em habilidades práticas, resolução de problemas e conhecimento técnico profundo
- Adaptação de dificuldade baseada no nível sênior esperado (junior, pleno, sênior, staff)
- Ênfase em cenários do mundo real e decisões de arquitetura

Para questões técnicas:
- Use código real e moderno das tecnologias mencionadas
- Inclua análise de código, debugging e otimização
- Foque em conceitos fundamentais e aplicação prática
- Evite perguntas teóricas sem contexto prático

IMPORTANTE:
1. Retorne APENAS JSON válido, sem texto adicional antes ou depois.
2. Garanta que todas as perguntas sejam relevantes para a vaga específica.
3. Mantenha o nível de dificuldade apropriado para o cargo.

FORMATO EXATO (APENAS JSON):
{
  "questions": [
    {
      "question": "Texto da pergunta aqui?",
      "options": [
        "Alternativa A",
        "Alternativa B",
        "Alternativa C",
        "Alternativa D"
      ],
      "correct_answer": 0,
      "explanation": "Explicação detalhada do por quê a resposta correta está certa e por que as outras estão erradas."
    }
  ]
}

## Regras Importantes:
- O campo \`correct_answer\` deve ser o índice da resposta correta (0, 1, 2 ou 3)
- Use linguagem profissional e clara
- As explicações devem ser educativas e preparar o candidato
- Varie os tipos de questão (conceitual, prática, situacional)
- Mantenha relevância com a vaga específica

Gere agora 10 questões para preparar o candidato para esta vaga.`;
  }

  /**
   * Constrói o prompt com os dados da vaga
   */
  private buildJobQuizPrompt(template: string, jobData: any): string {
    return template
      .replace(/{jobTitle}/g, jobData.jobTitle)
      .replace(/{companyName}/g, jobData.companyName)
      .replace(/{location}/g, jobData.location)
      .replace(/{description}/g, jobData.description.substring(0, 1000)) // Limitar tamanho
      .replace(/{requirements}/g, jobData.requirements.join('\n- '))
      .replace(/{responsibilities}/g, jobData.responsibilities.join('\n- '));
  }

  /**
   * Valida a estrutura do quiz gerado pela IA
   */
  private validateGeneratedQuiz(quiz: GeneratedQuiz, expectedQuestions: number): void {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new HttpException('Invalid quiz format: questions array missing', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (quiz.questions.length !== expectedQuestions) {
      throw new HttpException(`Invalid quiz format: expected ${expectedQuestions} questions, got ${quiz.questions.length}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      if (!question.question || typeof question.question !== 'string') {
        throw new HttpException(`Invalid question ${i + 1}: missing or invalid question text`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
        throw new HttpException(`Invalid question ${i + 1}: must have exactly 4 options`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (typeof question.correct_answer !== 'number' || question.correct_answer < 0 || question.correct_answer > 3) {
        throw new HttpException(`Invalid question ${i + 1}: correct_answer must be 0-3`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!question.explanation || typeof question.explanation !== 'string' || question.explanation.length < 10) {
        throw new HttpException(`Invalid question ${i + 1}: explanation too short or missing`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Check that correct answer index is valid
      if (!question.options[question.correct_answer]) {
        throw new HttpException(`Invalid question ${i + 1}: correct_answer index out of bounds`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Obter estatísticas de atividade do usuário (para heatmap)
   */
  async getUserActivityStats(userId: string, days: number = 365) {
    const { Types } = require('mongoose');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attempts = await this.quizAttemptModel
      .find({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      })
      .select('createdAt score')
      .exec();

    // Agrupar por data
    const activityMap = new Map<string, { attempts: number; totalScore: number; avgScore: number }>();

    attempts.forEach(attempt => {
      const dateKey = (attempt as any).createdAt.toISOString().split('T')[0];
      const existing = activityMap.get(dateKey) || { attempts: 0, totalScore: 0, avgScore: 0 };
      existing.attempts += 1;
      existing.totalScore += attempt.score;
      activityMap.set(dateKey, existing);
    });

    // Calcular média por data
    const activity = Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      attempts: data.attempts,
      avgScore: data.attempts > 0 ? data.totalScore / data.attempts : 0,
      intensity: Math.min(data.attempts, 5), // 0-5 baseado no número de tentativas
    }));

    return activity.sort((a, b) => a.date.localeCompare(b.date));
  }
}