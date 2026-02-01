import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { GenerateQuizDto, GeneratedQuiz } from './dto';
import { Quiz, QuizDocument, QuizAttempt, QuizAttemptDocument } from './schemas';

@Injectable()
export class QuizService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttemptDocument>,
  ) { }

  async generateQuiz(dto: GenerateQuizDto, userId: string): Promise<GeneratedQuiz> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
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
      let content = response;
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const generatedQuiz: GeneratedQuiz = JSON.parse(content);

      // Save quiz to database
      const savedQuiz = await this.quizModel.create({
        ...dto,
        questions: generatedQuiz.questions,
        createdBy: userId,
      });

      return {
        ...generatedQuiz,
        quizId: savedQuiz._id.toString(),
      };
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.error('Response content:', response);
      throw new HttpException('Failed to parse quiz response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getPromptTemplate(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(__dirname, '../../../../prompt/free-quiz.md');
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      console.log('Prompt template loaded, length:', template.length);
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
      model: 'openai/gpt-oss-120b', // Using Mixtral 8x7B model
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

IMPORTANTE: Sempre formate código adequadamente usando as marcações especificadas.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };

    console.log('Calling Groq API with model:', payload.model);
    console.log('Prompt length:', prompt.length);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      console.log('Groq API response received');
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
    const filter: any = { isActive: true, isFree: true };

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

    return attempt;
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

  async incrementQuizAccess(quizId: string) {
    return this.quizModel.findByIdAndUpdate(quizId, {
      $inc: { totalAccess: 1 },
    });
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

  async getUserStats(userId: string) {
    const attempts = await this.quizAttemptModel
      .find({ userId })
      .populate('quizId', 'titulo categoria')
      .sort({ createdAt: -1 })
      .exec();

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.completed).length;
    const averageScore = completedAttempts > 0
      ? attempts.filter(a => a.completed).reduce((sum, a) => sum + a.percentage, 0) / completedAttempts
      : 0;

    const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

    // Calculate evolution (compare last 5 vs first 5 attempts)
    const recentAttempts = attempts.slice(0, 5);
    const olderAttempts = attempts.slice(-5);
    const recentAvg = recentAttempts.length > 0
      ? recentAttempts.reduce((sum, a) => sum + a.percentage, 0) / recentAttempts.length
      : 0;
    const olderAvg = olderAttempts.length > 0
      ? olderAttempts.reduce((sum, a) => sum + a.percentage, 0) / olderAttempts.length
      : 0;
    const evolution = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    // Get recent attempts (last 3)
    const recentSimulados = attempts.slice(0, 3).map(attempt => ({
      id: attempt._id,
      title: (attempt.quizId as any).titulo,
      score: attempt.percentage,
      date: (attempt as any).createdAt.toISOString(),
      status: attempt.completed ? 'completed' : 'in_progress'
    }));

    return {
      totalAttempts,
      averageScore,
      averageTime,
      evolution,
      recentSimulados
    };
  }
}