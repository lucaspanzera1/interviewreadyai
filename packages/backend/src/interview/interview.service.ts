import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GenerateInterviewDto, GeneratedInterview, InterviewAttemptDto } from './dto';
import { Interview, InterviewDocument, InterviewAttempt, InterviewAttemptDocument } from './schemas';
import { UserService } from '../user/user.service';

@Injectable()
export class InterviewService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    @InjectModel(InterviewAttempt.name) private interviewAttemptModel: Model<InterviewAttemptDocument>,
    private readonly userService: UserService,
  ) {}

  async generateInterview(dto: GenerateInterviewDto, userId: string): Promise<GeneratedInterview> {
    // Validar que o usuário existe e tem tokens suficientes (2 tokens)
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    if (user.tokens < 2) {
      throw new HttpException(
        'Insufficient tokens. You need at least 2 tokens to generate an interview simulation.',
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    try {
      // Fazer scraping da vaga do LinkedIn (reutiliza logic do quiz)
      const jobData = await this.scrapeLinkedInJob(dto.linkedinUrl);

      // Gerar a simulação de entrevista baseada nos dados da vaga
      const interview = await this.generateInterviewFromJobData(jobData, dto, userId);

      // Deduzir 2 tokens do usuário após sucesso
      await this.userService.removeTokensFromUser(userId, 2, 'interview_generation');

      return interview;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to generate interview simulation. Please check the LinkedIn URL and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Faz scraping de uma vaga do LinkedIn (similar ao quiz)
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
      const skills: string[] = [];

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
          if (trimmed.toLowerCase().includes('responsibilities') || 
              trimmed.toLowerCase().includes('what you will')) {
            break;
          }
        }
      }

      // Extract skills (tecnologias específicas)
      const skillPatterns = /\b(javascript|typescript|react|angular|vue|node|python|java|c\#|\.net|sql|mongodb|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi;
      const foundSkills = description.match(skillPatterns);
      if (foundSkills) {
        skills.push(...[...new Set(foundSkills.map(skill => skill.toLowerCase()))]);
      }

      const result = {
        jobTitle,
        companyName,
        location,
        description,
        requirements,
        responsibilities,
        skills,
        url,
      };

      return result;

    } catch (error) {
      throw new HttpException(
        'Failed to scrape LinkedIn job data. Please check the URL and try again.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Gera a simulação de entrevista baseada nos dados da vaga
   */
  private async generateInterviewFromJobData(
    jobData: any, 
    dto: GenerateInterviewDto, 
    userId: string
  ): Promise<GeneratedInterview> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // Ler o template de prompt para simulação de entrevista
      const promptTemplate = await this.getInterviewPromptTemplate();

      // Construir o prompt com os dados da vaga
      const prompt = this.buildInterviewPrompt(promptTemplate, jobData, dto);

      // Chamar a API do Groq
      const response = await this.callGroqAPI(prompt, apiKey);

      // Parse do JSON de resposta
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

      const generatedInterview: GeneratedInterview = JSON.parse(content);

      // Validar a simulação gerada
      this.validateGeneratedInterview(generatedInterview, dto.numberOfQuestions || 8);

      // Salvar simulação no banco de dados
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      const savedInterview = await this.interviewModel.create({
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        linkedinUrl: jobData.url,
        questions: generatedInterview.questions,
        numberOfQuestions: dto.numberOfQuestions || 8,
        estimatedDuration: generatedInterview.estimatedDuration,
        preparationTips: generatedInterview.preparationTips,
        jobRequirements: generatedInterview.jobRequirements,
        companyInfo: generatedInterview.companyInfo,
        experienceLevel: dto.experienceLevel,
        createdBy: userObjectId,
        isActive: true,
        rawJobData: jobData,
        interviewType: this.determineInterviewType(generatedInterview.questions),
      });

      return {
        ...generatedInterview,
        interviewId: savedInterview._id.toString(),
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException('Failed to parse interview response - invalid JSON format', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions as-is
      }
      
      throw new HttpException('Failed to generate interview: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Chama a API do Groq para gerar conteúdo
   */
  private async callGroqAPI(prompt: string, apiKey: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: 'You are an expert interview coach and HR professional. Generate realistic and relevant interview questions based on job requirements. Always respond with valid JSON format.'
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 4000,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
          },
        ),
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from Groq API');
      }

      return content;
    } catch (error) {
      // More specific error messages
      if (error.response?.status === 401) {
        throw new HttpException('Invalid API key for Groq API', HttpStatus.INTERNAL_SERVER_ERROR);
      } else if (error.response?.status === 429) {
        throw new HttpException('Rate limit exceeded for Groq API', HttpStatus.TOO_MANY_REQUESTS);
      } else if (error.response?.status === 400) {
        throw new HttpException('Invalid request to Groq API: ' + (error.response?.data?.error?.message || 'Bad request'), HttpStatus.INTERNAL_SERVER_ERROR);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new HttpException('Groq API request timeout', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      throw new HttpException('Failed to generate interview content: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Determina o tipo de entrevista baseado nas perguntas geradas
   */
  private determineInterviewType(questions: any[]): string {
    const technicalCount = questions.filter(q => q.type === 'technical').length;
    const behavioralCount = questions.filter(q => q.type === 'behavioral').length;
    
    if (technicalCount > behavioralCount * 2) return 'TECHNICAL';
    if (behavioralCount > technicalCount * 2) return 'BEHAVIORAL';
    return 'MIXED';
  }

  /**
   * Valida a simulação de entrevista gerada
   */
  private validateGeneratedInterview(interview: GeneratedInterview, expectedQuestions: number): void {
    if (!interview.questions || !Array.isArray(interview.questions)) {
      throw new HttpException('Invalid interview format: missing questions', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (interview.questions.length < expectedQuestions - 2 || interview.questions.length > expectedQuestions + 2) {
      throw new HttpException(
        `Interview should have approximately ${expectedQuestions} questions, got ${interview.questions.length}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Validar cada pergunta
    for (const [index, question] of interview.questions.entries()) {
      if (!question.question || typeof question.question !== 'string') {
        throw new HttpException(`Invalid question at index ${index}: missing question text`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!question.type || !['technical', 'behavioral', 'situational', 'company_specific'].includes(question.type)) {
        throw new HttpException(`Invalid question type at index ${index}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        throw new HttpException(`Invalid difficulty at index ${index}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Obtém o template de prompt para simulação de entrevista
   */
  private async getInterviewPromptTemplate(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(__dirname, '../../../../prompt/interview-simulation.md');
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      return template;
    } catch (error) {
      return this.getDefaultInterviewPrompt();
    }
  }

  /**
   * Template de prompt padrão se não houver arquivo
   */
  private getDefaultInterviewPrompt(): string {
    return `
# Geração de Simulação de Entrevista

Você é um especialista em recursos humanos e condutor de entrevistas. Baseado nos dados da vaga fornecidos, 
gere uma simulação de entrevista realista com {{numberOfQuestions}} perguntas.

## Dados da Vaga:
- **Título**: {{jobTitle}}
- **Empresa**: {{companyName}}
- **Localização**: {{location}}
- **Requisitos**: {{requirements}}
- **Habilidades**: {{skills}}
- **Descrição**: {{description}}
- **Nível de Experiência**: {{experienceLevel}}

## Instruções:
1. Gere perguntas variadas: técnicas, comportamentais, situacionais e específicas da empresa
2. Inclua diferentes níveis de dificuldade
3. Forneça dicas para cada pergunta
4. Liste palavras-chave importantes para as respostas
5. Forneça dicas de preparação
6. Estime duração realista da entrevista

**IMPORTANTE**: Responda APENAS com um JSON válido no formato especificado.

## Formato da Resposta:
\`\`\`json
{
  "jobTitle": "string",
  "companyName": "string", 
  "questions": [
    {
      "id": 1,
      "question": "Pergunta da entrevista",
      "type": "technical|behavioral|situational|company_specific",
      "category": "Categoria da pergunta",
      "difficulty": "easy|medium|hard",
      "tips": "Dicas para responder bem",
      "keywords": ["palavra-chave1", "palavra-chave2"]
    }
  ],
  "estimatedDuration": 45,
  "preparationTips": ["Dica 1", "Dica 2"],
  "jobRequirements": ["Requisito 1", "Requisito 2"],
  "companyInfo": "Informações sobre a empresa"
}
\`\`\`
`;
  }

  /**
   * Constrói o prompt substituindo as variáveis
   */
  private buildInterviewPrompt(template: string, jobData: any, dto: GenerateInterviewDto): string {
    return template
      .replace(/{{numberOfQuestions}}/g, (dto.numberOfQuestions || 8).toString())
      .replace(/{{jobTitle}}/g, jobData.jobTitle || 'Não especificado')
      .replace(/{{companyName}}/g, jobData.companyName || 'Não especificada')
      .replace(/{{location}}/g, jobData.location || 'Não especificada')
      .replace(/{{requirements}}/g, jobData.requirements?.join(', ') || 'Não especificado')
      .replace(/{{skills}}/g, jobData.skills?.join(', ') || 'Não especificado')
      .replace(/{{description}}/g, jobData.description || 'Não disponível')
      .replace(/{{experienceLevel}}/g, dto.experienceLevel || 'Não especificado');
  }

  /**
   * Registra uma tentativa de entrevista
   */
  async recordInterviewAttempt(
    interviewId: string,
    userId: string,
    attemptDto: InterviewAttemptDto,
  ) {
    const { Types } = require('mongoose');
    
    const attempt = await this.interviewAttemptModel.create({
      interviewId: new Types.ObjectId(interviewId),
      userId: new Types.ObjectId(userId),
      userAnswers: attemptDto.userAnswers.map((answer, index) => ({
        questionId: index + 1,
        answer: answer,
      })),
      actualDuration: attemptDto.actualDuration,
      difficultyRating: attemptDto.difficultyRating,
      feedback: attemptDto.feedback,
      isCompleted: true,
      completedAt: new Date(),
    });

    // Atualizar estatísticas da simulação
    await this.interviewModel.findByIdAndUpdate(interviewId, {
      $inc: { 
        totalAttempts: 1,
        totalCompletions: 1,
      },
      $push: {
        $each: [],
        $slice: -1
      }
    });

    // Calcular estatística de dificuldade média
    const attempts = await this.interviewAttemptModel.find({ interviewId });
    const avgDifficulty = attempts.reduce((sum, att) => sum + att.difficultyRating, 0) / attempts.length;
    
    await this.interviewModel.findByIdAndUpdate(interviewId, {
      averageDifficulty: Math.round(avgDifficulty * 100) / 100,
    });

    return attempt;
  }

  /**
   * Incrementa access count da simulação
   */
  async incrementInterviewAccess(interviewId: string, userId: string) {
    await this.interviewModel.findByIdAndUpdate(interviewId, {
      $inc: { totalAccess: 1 }
    });
    
    return { success: true };
  }

  /**
   * Obtém simulação para jogar
   */
  async getInterviewForPlaying(interviewId: string, userId: string) {
    const interview = await this.interviewModel.findById(interviewId);
    
    if (!interview) {
      throw new NotFoundException('Interview simulation not found');
    }

    // Verificar se o usuário tem acesso (é o criador)
    if (interview.createdBy.toString() !== userId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    // Retornar apenas dados necessários (sem respostas)
    return {
      _id: interview._id,
      jobTitle: interview.jobTitle,
      companyName: interview.companyName,
      questions: interview.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips,
      })),
      estimatedDuration: interview.estimatedDuration,
      preparationTips: interview.preparationTips,
      jobRequirements: interview.jobRequirements,
      companyInfo: interview.companyInfo,
    };
  }

  /**
   * Obtém simulações do usuário
   */
  async getUserInterviews(userId: string, page: number, limit: number) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const skip = (page - 1) * limit;
    
    const interviews = await this.interviewModel
      .find({ createdBy: userObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('jobTitle companyName estimatedDuration totalAttempts createdAt interviewType');
      
    const total = await this.interviewModel.countDocuments({ createdBy: userObjectId });
    
    return {
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém tentativas do usuário
   */
  async getUserAttempts(userId: string, page: number, limit: number) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const skip = (page - 1) * limit;
    
    const attempts = await this.interviewAttemptModel
      .find({ userId: userObjectId })
      .populate('interviewId', 'jobTitle companyName') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await this.interviewAttemptModel.countDocuments({ userId: userObjectId });
    
    return {
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém detalhes de uma tentativa
   */
  async getUserAttemptDetails(attemptId: string, userId: string) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const attempt = await this.interviewAttemptModel
      .findOne({ _id: attemptId, userId: userObjectId })
      .populate('interviewId');
    
    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }
    
    return attempt;
  }

  /**
   * Obtém estatísticas do usuário
   */
  async getUserStats(userId: string) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const totalInterviews = await this.interviewModel.countDocuments({ createdBy: userObjectId });
    const totalAttempts = await this.interviewAttemptModel.countDocuments({ userId: userObjectId });
    
    const attempts = await this.interviewAttemptModel.find({ userId: userObjectId });
    const avgDifficulty = attempts.length > 0 
      ? attempts.reduce((sum, att) => sum + att.difficultyRating, 0) / attempts.length 
      : 0;
    
    const avgDuration = attempts.length > 0
      ? attempts.reduce((sum, att) => sum + att.actualDuration, 0) / attempts.length
      : 0;
    
    return {
      totalInterviewsGenerated: totalInterviews,
      totalAttempts,
      averageDifficultyRating: Math.round(avgDifficulty * 100) / 100,
      averageDuration: Math.round(avgDuration),
      tokensSpentOnInterviews: totalInterviews * 2, // 2 tokens por interview
    };
  }

  /**
   * Obtém simulação por ID
   */
  async getInterviewById(interviewId: string, userId: string) {
    const interview = await this.interviewModel.findById(interviewId);
    
    if (!interview) {
      return null;
    }

    // Verificar se o usuário tem acesso (é o criador)
    if (interview.createdBy.toString() !== userId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return interview;
  }

  /**
   * Completa uma simulação (marca como finalizada)
   */
  async completeInterview(interviewId: string, userId: string) {
    const interview = await this.interviewModel.findById(interviewId);
    
    if (!interview) {
      throw new NotFoundException('Interview simulation not found');
    }

    if (interview.createdBy.toString() !== userId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    await this.interviewModel.findByIdAndUpdate(interviewId, {
      $inc: { totalCompletions: 1 }
    });
    
    return { success: true };
  }
}