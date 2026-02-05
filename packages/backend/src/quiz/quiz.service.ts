import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GenerateQuizDto, GeneratedQuiz, GenerateJobQuizDto } from './dto';
import { Quiz, QuizDocument, QuizAttempt, QuizAttemptDocument } from './schemas';
import { UserService } from '../user/user.service';

@Injectable()
export class QuizService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttemptDocument>,
    private readonly userService: UserService,
  ) { }

  async generateQuiz(dto: GenerateQuizDto, userId: string): Promise<GeneratedQuiz> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    // Read the prompt template
    const promptTemplate = await this.getPromptTemplate();

    // Replace placeholders
    const prompt = this.buildPrompt(promptTemplate, dto);

    // Call Groq API
    const response = await this.callGroqAPI(prompt, apiKey);

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      let content = response.trim();
      
      // Try to find JSON content between ```json and ``` or just between ```
      const jsonCodeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonCodeBlockMatch) {
        content = jsonCodeBlockMatch[1];
      } else if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON if there's text before/after
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch && !content.trim().startsWith('{')) {
        content = jsonMatch[0];
      }
      
      content = content.trim();
      const generatedQuiz: GeneratedQuiz = JSON.parse(content);

      // Save quiz to database - Convert userId string to ObjectId
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      // Check if user is admin to set quiz as public
      const user = await this.userService.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      const savedQuiz = await this.quizModel.create({
        ...dto,
        questions: generatedQuiz.questions,
        createdBy: userObjectId,
        isPublic: isAdmin, // Quizzes created by admins are public
        isFree: isAdmin, // Only admin quizzes are free (with daily limits)
      });
      
      return {
        ...generatedQuiz,
        quizId: savedQuiz._id.toString(),
      };
    } catch (error) {
      throw new HttpException('Failed to parse quiz response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getPromptTemplate(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(__dirname, '../../../../prompt/free-quiz.md');
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      return template;
    } catch (error) {
      // Fallback to hardcoded template
      return `# Prompt para Geração de Quizzes

Você é um especialista em criar quizzes educacionais de alta qualidade. Sua função é gerar perguntas desafiadoras, precisas e bem estruturadas com base nas informações fornecidas.

## Instruções Gerais:
- Crie exatamente {quantidade_questoes} questões sobre o tema especificado
- Todas as questões devem ter 4 alternativas (A, B, C, D)
- Apenas UMA alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis, mas claramente distintas da correta
- Evite pegadinhas desnecessárias ou questões ambíguas
- Use linguagem clara e objetiva

## Nível de Dificuldade: {nivel}

### Para nível INICIANTE:
- Foque em conceitos fundamentais e definições básicas
- Use linguagem simples e direta
- Perguntas devem testar conhecimento básico e compreensão inicial
- Evite casos extremos ou exceções à regra

### Para nível MÉDIO:
- Combine conceitos e requeira aplicação prática
- Inclua cenários realistas que exigem análise
- Teste compreensão de relações entre conceitos
- Pode incluir algumas exceções comuns

### Para nível DIFÍCIL:
- Requeira análise profunda e pensamento crítico
- Inclua cenários complexos e casos edge
- Teste capacidade de aplicar conhecimento em situações não óbvias
- Pode incluir comparações sutis entre conceitos similares

### Para nível EXPERT:
- Questões devem desafiar até especialistas
- Inclua nuances técnicas e casos raros
- Requeira conhecimento profundo de implementação e otimização
- Pode abordar debates atuais e melhores práticas avançadas

## Informações do Quiz:
- **Categoria:** {categoria}
- **Título:** {titulo}
- **Descrição:** {descricao}
- **Tags:** {tags}
- **Quantidade de Questões:** {quantidade_questoes}
- **Nível:** {nivel}

## Formato de Resposta Obrigatório (JSON):

Retorne APENAS um JSON válido, sem texto adicional, seguindo exatamente esta estrutura:
\`\`\`json
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
\`\`\`

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

  private async callGroqAPI(prompt: string, apiKey: string): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
      model: 'llama-3.3-70b-versatile', // Using Llama 3.3 70B model
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em educação e tecnologia, especializado em criar quizzes de alta qualidade sobre programação, desenvolvimento de software e tecnologias relacionadas.

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
3. NÃO inclua explicações, comentários ou texto fora do JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
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
      const hasAccess = await this.userService.canDoFreeQuiz(userId);
      if (!hasAccess) {
        throw new HttpException(
          'Você atingiu o limite diário de 3 quizzes gratuitos. Aguarde até amanhã ou compre tokens para continuar jogando.',
          HttpStatus.FORBIDDEN
        );
      }
      const result = await this.userService.incrementFreeQuizCount(userId);
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
    const hasAccess = await this.userService.canDoFreeQuiz(userId);
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

    if (!quiz.isFree && !isCreator) {
      // Se não é gratuito E não é o criador, verificar se o usuário tem tokens suficientes
      const userTokens = await this.userService.getUserTokens(userId);
      if (userTokens < 1) {
        throw new HttpException(
          'Você não tem tokens suficientes para jogar este quiz. Compre tokens para continuar.',
          HttpStatus.FORBIDDEN
        );
      }

      // Debitar 1 token
      await this.userService.removeTokensFromUser(userId, 1, 'quiz_play');
    } else if (quiz.isFree) {
      // Se é gratuito, verificar limite diário
      const hasAccess = await this.userService.canDoFreeQuiz(userId);
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
    const attempts = await this.quizAttemptModel
      .find({ userId })
      .select('score')
      .exec();

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0
      ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
      : 0;

    // Buscar totalFreeQuizzesCompleted do usuário
    const user = await this.userService.findById(userId);
    const totalFreeQuizzesCompleted = user.totalFreeQuizzesCompleted || 0;

    return {
      totalAttempts,
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
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    if (user.tokens < 1) {
      throw new HttpException('Insufficient tokens. You need at least 1 token to generate a job quiz.', HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      // Fazer scraping da vaga do LinkedIn
      const jobData = await this.scrapeLinkedInJob(dto.linkedinUrl);

      // Gerar o quiz baseado nos dados da vaga
      const quiz = await this.generateJobQuizFromData(jobData, userId);

      // Deduzir 1 token do usuário após sucesso
      await this.userService.removeTokensFromUser(userId, 1, 'quiz_generation');

      return quiz;
    } catch (error) {
      console.error('Error generating job quiz:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate job quiz. Please check the LinkedIn URL and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
      const jobTitle = $('h1.top-card-layout__title, h2.top-card-layout__title').first().text().trim() || 
                       $('h1').first().text().trim();
      
      const companyName = $('.top-card-layout__card .topcard__org-name-link, .topcard__flavor--black-link').first().text().trim() ||
                         $('.top-card-layout__card a[data-tracking-control-name="public_jobs_topcard-org-name"]').first().text().trim();
      
      const location = $('.top-card-layout__card .topcard__flavor--bullet, .topcard__flavor').first().text().trim();
      
      const description = $('.show-more-less-html__markup, .description__text').text().trim() ||
                         $('div[class*="description"]').first().text().trim();

      // Extrair requisitos e responsabilidades do texto da descrição
      const requirements: string[] = [];
      const responsibilities: string[] = [];

      // Tentar identificar seções no texto
      const descriptionLower = description.toLowerCase();
      
      if (descriptionLower.includes('requirements') || descriptionLower.includes('requisitos')) {
        const reqSection = description.substring(
          Math.max(
            descriptionLower.indexOf('requirements'),
            descriptionLower.indexOf('requisitos')
          )
        );
        // Extrair linhas que começam com bullet points ou números
        const lines = reqSection.split('\n').slice(0, 10);
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed && (trimmed.match(/^[•\-\*\d]/) || trimmed.length > 20)) {
            requirements.push(trimmed.replace(/^[•\-\*\d.]+\s*/, ''));
          }
        });
      }

      if (descriptionLower.includes('responsibilities') || descriptionLower.includes('responsabilidades')) {
        const respSection = description.substring(
          Math.max(
            descriptionLower.indexOf('responsibilities'),
            descriptionLower.indexOf('responsabilidades')
          )
        );
        const lines = respSection.split('\n').slice(0, 10);
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed && (trimmed.match(/^[•\-\*\d]/) || trimmed.length > 20)) {
            responsibilities.push(trimmed.replace(/^[•\-\*\d.]+\s*/, ''));
          }
        });
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
    const response = await this.callGroqAPI(prompt, apiKey);

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

      // Salvar quiz no banco de dados
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      const savedQuiz = await this.quizModel.create({
        categoria: 'Vaga de Emprego',
        titulo: `Quiz: ${jobData.jobTitle} - ${jobData.companyName}`,
        descricao: `Quiz personalizado para a vaga de ${jobData.jobTitle} na empresa ${jobData.companyName}`,
        tags: ['vaga', 'linkedin', jobData.jobTitle.toLowerCase()],
        quantidade_questoes: 10,
        nivel: 'MEDIO',
        questions: generatedQuiz.questions,
        createdBy: userObjectId,
        isActive: true,
        isFree: false, // Quiz de vaga é pessoal, sem limites diários
        isPublic: false, // Quiz de vaga é privado, apenas para o criador
      });
      
      return {
        ...generatedQuiz,
        quizId: savedQuiz._id.toString(),
      };
    } catch (error) {
      console.error('Parse error:', error);
      throw new HttpException('Failed to parse quiz response', HttpStatus.INTERNAL_SERVER_ERROR);
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

Você é um especialista em recrutamento técnico e preparação de candidatos para entrevistas de emprego. Sua função é gerar um quiz de 10 perguntas que prepare o candidato para uma vaga específica.

## Informações da Vaga:
- **Cargo:** {jobTitle}
- **Empresa:** {companyName}
- **Localização:** {location}
- **Descrição:** {description}
- **Requisitos:** {requirements}
- **Responsabilidades:** {responsibilities}

## Instruções para Criação do Quiz:

1. Crie EXATAMENTE 10 questões relevantes para a vaga
2. As questões devem focar em:
   - Conhecimentos técnicos mencionados nos requisitos
   - Habilidades necessárias para as responsabilidades listadas
   - Cenários práticos relacionados ao trabalho
   - Melhores práticas da área
   - Ferramentas e tecnologias mencionadas

3. Cada questão deve ter 4 alternativas (A, B, C, D)
4. Apenas UMA alternativa deve estar correta
5. O nível deve ser intermediário, adequado para candidatos à vaga
6. As alternativas incorretas devem ser plausíveis

## Formato de Resposta Obrigatório (JSON):

Retorne APENAS um JSON válido, sem texto adicional:

\`\`\`json
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
      "explanation": "Explicação detalhada da resposta correta e por que as outras estão erradas."
    }
  ]
}
\`\`\`

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
}