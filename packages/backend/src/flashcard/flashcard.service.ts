import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

import { GenerateJobFlashcardDto, GeneratedFlashcard, StudySessionDto, StudyCardDto } from './dto';
import { 
  Flashcard, 
  FlashcardDocument, 
  FlashcardStudy, 
  FlashcardStudyDocument,
  FlashcardLevel,
  FlashcardItem,
  ReviewHistory
} from './schemas';
import { UserService } from '../user/user.service';
import { CardDifficulty, CardProgress } from './schemas/flashcard-study.schema';

@Injectable()
export class FlashcardService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Flashcard.name) private flashcardModel: Model<FlashcardDocument>,
    @InjectModel(FlashcardStudy.name) private flashcardStudyModel: Model<FlashcardStudyDocument>,
    private readonly userService: UserService,
  ) {}

  /**
   * Gera flashcards personalizados baseado em vaga do LinkedIn
   * Deduz 2 tokens do usuário antes de gerar
   */
  async generateJobFlashcard(dto: GenerateJobFlashcardDto, userId: string): Promise<GeneratedFlashcard> {
    // Validar que o usuário existe e tem tokens suficientes
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    if (user.tokens < 2) {
      throw new HttpException('Insufficient tokens. You need at least 2 tokens to generate flashcards.', HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      console.log('Starting flashcard generation for user:', userId);
      
      // Detectar o site da vaga e fazer scraping apropriado
      const jobData = await this.scrapeJob(dto.jobUrl);

      // Gerar os flashcards baseados nos dados da vaga
      const flashcards = await this.generateFlashcardsFromJobData(jobData, dto, userId);

      // Deduzir 2 tokens do usuário após sucesso
      await this.userService.removeTokensFromUser(userId, 2, 'flashcard_generation');

      console.log('Flashcards generated successfully');
      return flashcards;
    } catch (error) {
      console.error('Error generating job flashcards:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate flashcards. Please check the LinkedIn URL and try again.',
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
   * Faz scraping de uma vaga do LinkedIn (reutilizado do quiz.service.ts)
   */
  private async scrapeLinkedInJob(url: string): Promise<any> {
    try {
      // Validar que é uma URL do LinkedIn
      if (!url.includes('linkedin.com/jobs/view') && !url.includes('linkedin.com/jobs/collections')) {
        throw new HttpException('Invalid LinkedIn job URL', HttpStatus.BAD_REQUEST);
      }

      console.log('Scraping LinkedIn job:', url);

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

      console.log('Job data extracted successfully');

      return {
        title: jobTitle,
        company: companyName,
        location: location,
        description: description,
        url: url
      };

    } catch (error) {
      console.error('Error scraping LinkedIn job:', error);
      throw new HttpException(
        'Unable to scrape LinkedIn job. Please check if the URL is accessible.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Faz scraping de uma vaga do Gupy
   */
  private async scrapeGupyJob(url: string): Promise<any> {
    try {
      if (!url.includes('gupy.io') && !url.includes('gupy.com.br')) {
        throw new HttpException('Invalid Gupy job URL', HttpStatus.BAD_REQUEST);
      }

      console.log('Scraping Gupy job:', url);

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

      const companyName = $('[data-testid="company-name"], .company-name, .employer-name').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         'Empresa Não Encontrada';

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      'Localização Não Encontrada';

      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-details-content').text().trim() ||
                         'Descrição não disponível';

      return {
        title: jobTitle,
        company: companyName,
        location: location,
        description: description,
        url: url
      };
    } catch (error) {
      console.error('Error scraping Gupy job:', error);
      throw new HttpException(
        'Unable to scrape Gupy job. Please check if the URL is accessible.',
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

      console.log('Scraping Infojobs job:', url);

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

      return {
        title: jobTitle,
        company: companyName,
        location: location,
        description: description,
        url: url
      };
    } catch (error) {
      console.error('Error scraping Infojobs job:', error);
      throw new HttpException(
        'Unable to scrape Infojobs job. Please check if the URL is accessible.',
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

      console.log('Scraping Glassdoor job:', url);

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

      return {
        title: jobTitle,
        company: companyName,
        location: location,
        description: description,
        url: url
      };
    } catch (error) {
      console.error('Error scraping Glassdoor job:', error);
      throw new HttpException(
        'Unable to scrape Glassdoor job. Please check if the URL is accessible.',
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

      console.log('Scraping Indeed job:', url);

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

      return {
        title: jobTitle,
        company: companyName,
        location: location,
        description: description,
        url: url
      };
    } catch (error) {
      console.error('Error scraping Indeed job:', error);
      throw new HttpException(
        'Unable to scrape Indeed job. Please check if the URL is accessible.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Gera flashcards baseados nos dados da vaga
   */
  private async generateFlashcardsFromJobData(
    jobData: any, 
    dto: GenerateJobFlashcardDto,
    userId: string
  ): Promise<GeneratedFlashcard> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // Ler o template de prompt para flashcards
      const promptTemplate = await this.getFlashcardPromptTemplate();
      
      // Construir o prompt com os dados da vaga
      const prompt = this.buildFlashcardPrompt(promptTemplate, jobData, dto);

      console.log('Calling Groq API for flashcard generation');
      
      // Chamar a API do Groq
      const response = await this.callGroqAPI(prompt, apiKey);

      // Parse da resposta JSON
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
      
      // Tentar extrair JSON se houver texto antes/depois
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch && !content.trim().startsWith('{')) {
        content = jsonMatch[0];
      }
      
      content = content.trim();
      const generatedFlashcard: GeneratedFlashcard = JSON.parse(content);

      // Validar flashcards gerados
      this.validateGeneratedFlashcard(generatedFlashcard, dto.quantidade_cards || 10);

      // Salvar flashcard no banco de dados
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      console.log(`Saving flashcard for user: ${userId} (ObjectId: ${userObjectId})`);
      
      // Verificar se usuário é admin para definir como público
      const user = await this.userService.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      const flashcardData = {
        titulo: generatedFlashcard.titulo,
        categoria: generatedFlashcard.categoria,
        descricao: generatedFlashcard.descricao,
        tags: generatedFlashcard.tags,
        quantidade_cards: generatedFlashcard.quantidade_cards,
        nivel: generatedFlashcard.nivel,
        cards: generatedFlashcard.cards,
        vaga_titulo: jobData.title,
        vaga_empresa: jobData.company,
        vaga_localizacao: jobData.location,
        vaga_url: jobData.url,
        createdBy: userObjectId,
        isPublic: isAdmin,
        isFree: isAdmin,
      };
      
      console.log('Flashcard data to save:', flashcardData);
      
      const savedFlashcard = await this.flashcardModel.create(flashcardData);
      
      console.log('Flashcard saved successfully with ID:', savedFlashcard._id.toString());

      return {
        ...generatedFlashcard,
        flashcardId: savedFlashcard._id.toString(),
        vaga_titulo: jobData.title,
        vaga_empresa: jobData.company,
        vaga_localizacao: jobData.location,
        vaga_url: jobData.url,
      };

    } catch (error) {
      if (error.message?.includes('parse') || error.message?.includes('JSON')) {
        console.log('JSON parsing failed, trying simplified prompt...');
        // Tentar novamente com prompt simplificado se o parsing do JSON falhou
        try {
          const simplePrompt = this.buildSimplifiedFlashcardPrompt(jobData, dto);
          const retryResponse = await this.callGroqAPI(simplePrompt, apiKey);
          
          let content = retryResponse.trim();
          const jsonCodeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonCodeBlockMatch) {
            content = jsonCodeBlockMatch[1];
          }
          
          const generatedFlashcard: GeneratedFlashcard = JSON.parse(content);
          this.validateGeneratedFlashcard(generatedFlashcard, dto.quantidade_cards || 10);
          
          // Salvar no banco da mesma forma...
          const { Types } = require('mongoose');
          const userObjectId = new Types.ObjectId(userId);
          
          const user = await this.userService.findById(userId);
          const isAdmin = user && user.role === 'admin';
          
          const savedFlashcard = await this.flashcardModel.create({
            titulo: generatedFlashcard.titulo,
            categoria: generatedFlashcard.categoria,
            descricao: generatedFlashcard.descricao,
            tags: generatedFlashcard.tags,
            quantidade_cards: generatedFlashcard.quantidade_cards,
            nivel: generatedFlashcard.nivel,
            cards: generatedFlashcard.cards,
            vaga_titulo: jobData.title,
            vaga_empresa: jobData.company,
            vaga_localizacao: jobData.location,
            vaga_url: jobData.url,
            createdBy: userObjectId,
            isPublic: isAdmin,
            isFree: isAdmin,
          });

          return {
            ...generatedFlashcard,
            flashcardId: savedFlashcard._id.toString(),
            vaga_titulo: jobData.title,
            vaga_empresa: jobData.company,
            vaga_localizacao: jobData.location,
            vaga_url: jobData.url,
          };
        } catch (retryError) {
          throw new HttpException(
            'Failed to generate flashcards. The AI response could not be processed.',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
      throw error;
    }
  }

  /**
   * Métodos auxiliares para prompts e API
   */
  private async getFlashcardPromptTemplate(): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'prompt', 'flashcard-job.md');
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.warn('Flashcard prompt template not found, using default');
      return this.getDefaultFlashcardPrompt();
    }
  }

  private getDefaultFlashcardPrompt(): string {
    return `
Você é um especialista em criação de flashcards educacionais para preparação técnica.
Baseado na vaga de emprego fornecida, crie flashcards no estilo Anki para ajudar candidatos a se prepararem.

VAGA:
Título: {vaga_titulo}
Empresa: {vaga_empresa}
Localização: {vaga_localizacao}
Descrição: {vaga_descricao}

REQUISITOS:
- Criar {quantidade_cards} flashcards
- Nível de dificuldade: {nivel}
- Cada flashcard deve ter uma pergunta (frente) e uma resposta (verso)
- Focar em conhecimentos técnicos relevantes para a vaga
- Incluir explicações quando necessário
- Usar linguagem clara e objetiva

NÍVEL DE DIFICULDADE:
- FACIL: Conceitos básicos, definições simples
- MEDIO: Aplicações práticas, cenários intermediários  
- DIFICIL: Cenários complexos, otimizações, arquitetura

Retorne APENAS um JSON válido no formato:
{
  "titulo": "Flashcards: [Nome da Vaga]",
  "categoria": "[Área técnica principal]",
  "descricao": "Flashcards para se preparar para a vaga de [cargo] na [empresa]",
  "tags": ["tag1", "tag2", "tag3"],
  "nivel": "{nivel}",
  "quantidade_cards": {quantidade_cards},
  "cards": [
    {
      "question": "Pergunta do flashcard?",
      "answer": "Resposta detalhada",
      "explanation": "Explicação adicional (opcional)",
      "tags": ["tag-especifico"]
    }
  ]
}
`;
  }

  private buildFlashcardPrompt(template: string, jobData: any, dto: GenerateJobFlashcardDto): string {
    return template
      .replace(/{vaga_titulo}/g, jobData.title)
      .replace(/{vaga_empresa}/g, jobData.company)
      .replace(/{vaga_localizacao}/g, jobData.location)
      .replace(/{vaga_descricao}/g, jobData.description)
      .replace(/{quantidade_cards}/g, (dto.quantidade_cards || 10).toString())
      .replace(/{nivel}/g, dto.nivel);
  }

  private buildSimplifiedFlashcardPrompt(jobData: any, dto: GenerateJobFlashcardDto): string {
    return `
Crie ${dto.quantidade_cards || 10} flashcards de nível ${dto.nivel} para a vaga:
${jobData.title} na ${jobData.company}

Descrição da vaga:
${jobData.description.substring(0, 1500)}

Retorne JSON:
{
  "titulo": "Flashcards: ${jobData.title}",
  "categoria": "Tecnologia", 
  "descricao": "Flashcards para ${jobData.title}",
  "tags": ["javascript", "backend", "api"],
  "nivel": "${dto.nivel}",
  "quantidade_cards": ${dto.quantidade_cards || 10},
  "cards": [
    {"question": "O que é...?", "answer": "Resposta..."}
  ]
}
`;
  }

  private async callGroqAPI(prompt: string, apiKey: string): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const systemMessage = `Você é um especialista em criar flashcards educacionais no estilo Anki para preparação técnica. Sua tarefa é criar flashcards baseados na descrição de uma vaga de emprego para ajudar candidatos a se prepararem para entrevistas e testes técnicos.

Sua expertise inclui:
- Criação de flashcards no formato pergunta/resposta
- Adaptação de conteúdo por nível de dificuldade
- Foco em conhecimentos técnicos práticos
- Linguagens de programação e frameworks
- Conceitos de desenvolvimento de software

IMPORTANTE: 
1. Retorne APENAS JSON válido, sem texto adicional antes ou depois.
2. Cada flashcard deve ter uma pergunta clara e resposta completa.
3. Adapte o nível de complexidade conforme solicitado (FACIL, MEDIO, DIFICIL).`;

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
        `Failed to generate flashcards: ${error.response?.data?.error?.message || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private validateGeneratedFlashcard(flashcard: GeneratedFlashcard, expectedCount: number) {
    if (!flashcard.titulo || !flashcard.categoria || !flashcard.cards) {
      throw new HttpException('Invalid flashcard format from AI', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!Array.isArray(flashcard.cards) || flashcard.cards.length === 0) {
      throw new HttpException('No flashcards generated', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (const [index, card] of flashcard.cards.entries()) {
      if (!card.question || !card.answer) {
        throw new HttpException(
          `Invalid flashcard at index ${index}: missing question or answer`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    // Ajustar quantidade se houver discrepância
    if (flashcard.cards.length !== expectedCount) {
      flashcard.quantidade_cards = flashcard.cards.length;
    }
  }

  /**
   * Busca flashcards do usuário
   */
  async getUserFlashcards(
    userId: string,
    page: number = 1,
    limit: number = 10,
    categoria?: string,
    nivel?: string
  ) {
    const skip = (page - 1) * limit;
    const { Types } = require('mongoose');
    
    const filter: any = { 
      createdBy: new Types.ObjectId(userId),
      isActive: true 
    };

    if (categoria) {
      filter.categoria = new RegExp(categoria, 'i');
    }
    if (nivel) {
      filter.nivel = nivel;
    }

    console.log('Searching flashcards with filter:', filter);

    const [flashcards, total] = await Promise.all([
      this.flashcardModel
        .find(filter)
        .select('-cards') // Não retornar os cards na listagem
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.flashcardModel.countDocuments(filter)
    ]);

    console.log(`Found ${flashcards.length} flashcards for user ${userId}`);

    return {
      flashcards,
      currentPage: page,
      totalItems: total,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserFlashcardsByAdmin(
    userId: string,
    page: number = 1,
    limit: number = 100
  ) {
    const skip = (page - 1) * limit;
    const { Types } = require('mongoose');
    
    const filter: any = { 
      createdBy: new Types.ObjectId(userId)
    };

    const [flashcards, total] = await Promise.all([
      this.flashcardModel
        .find(filter)
        .select('-cards') // Não retornar os cards na listagem
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.flashcardModel.countDocuments(filter)
    ]);

    return {
      flashcards,
      currentPage: page,
      totalItems: total,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca flashcards públicos
   */
  async getPublicFlashcards(
    page: number = 1,
    limit: number = 10,
    categoria?: string,
    nivel?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { 
      isPublic: true,
      isActive: true 
    };

    if (categoria) {
      filter.categoria = new RegExp(categoria, 'i');
    }
    if (nivel) {
      filter.nivel = nivel;
    }

    const [flashcards, total] = await Promise.all([
      this.flashcardModel
        .find(filter)
        .select('-cards')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.flashcardModel.countDocuments(filter)
    ]);

    return {
      flashcards,
      currentPage: page,
      totalItems: total,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtém flashcard para estudo
   */
  async getFlashcardForStudy(flashcardId: string, userId: string) {
    // Verificar se o flashcard existe
    const flashcard = await this.flashcardModel.findById(flashcardId);
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    if (!flashcard.isActive) {
      throw new HttpException('Este flashcard não está disponível no momento.', HttpStatus.FORBIDDEN);
    }

    // Verificar se o usuário é o criador do flashcard
    const isCreator = flashcard.createdBy.toString() === userId.toString();

    if (!flashcard.isFree && !isCreator) {
      // Se não é gratuito E não é o criador, verificar se o usuário tem tokens suficientes
      const userTokens = await this.userService.getUserTokens(userId);
      if (userTokens < 1) {
        throw new HttpException(
          'Você não tem tokens suficientes para estudar este flashcard. Compre tokens para continuar.',
          HttpStatus.FORBIDDEN
        );
      }

      // Debitar 1 token (custo para estudar flashcards de outros usuários)
      await this.userService.removeTokensFromUser(userId, 1, 'flashcard_study');
    }

    // Buscar ou criar progresso do usuário
    let studyProgress = await this.flashcardStudyModel.findOne({
      flashcardId: flashcardId,
      userId: userId
    });

    if (!studyProgress) {
      // Criar progresso inicial
      const cardProgress = flashcard.cards.map((_, index) => ({
        cardIndex: index,
        difficulty: CardDifficulty.NORMAL,
        timesStudied: 0,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        history: []
      }));

      studyProgress = await this.flashcardStudyModel.create({
        flashcardId: flashcardId,
        userId: userId,
        cardProgress: cardProgress
      });
    }

    return {
      flashcard: {
        _id: flashcard._id,
        titulo: flashcard.titulo,
        descricao: flashcard.descricao,
        categoria: flashcard.categoria,
        tags: flashcard.tags,
        nivel: flashcard.nivel,
        quantidade_cards: flashcard.quantidade_cards,
        cards: flashcard.cards,
        vaga_titulo: flashcard.vaga_titulo,
        vaga_empresa: flashcard.vaga_empresa,
        vaga_localizacao: flashcard.vaga_localizacao,
      },
      studyProgress
    };
  }

  /**
   * Registra uma sessão de estudo
   */
  async recordStudySession(
    flashcardId: string,
    userId: string,
    studySession: StudySessionDto
  ) {
    const studyProgress = await this.flashcardStudyModel.findOne({
      flashcardId: flashcardId,
      userId: userId
    });

    if (!studyProgress) {
      throw new NotFoundException('Study progress not found');
    }

    const now = new Date();

    // Atualizar progresso de cada card estudado
    for (const cardStudy of studySession.cards) {
      const cardProgressIndex = studyProgress.cardProgress.findIndex(
        cp => cp.cardIndex === cardStudy.cardIndex
      );

      if (cardProgressIndex >= 0) {
        const cardProgress = studyProgress.cardProgress[cardProgressIndex];
        
        // Atualizar dificuldade e contadores
        cardProgress.difficulty = cardStudy.difficulty;
        cardProgress.timesStudied += 1;
        cardProgress.lastStudiedAt = now;

        // Garantir que os campos novos existam (para compatibilidade com dados antigos)
        if (cardProgress.easeFactor === undefined) cardProgress.easeFactor = 2.5;
        if (cardProgress.repetitions === undefined) cardProgress.repetitions = 0;
        if (!cardProgress.history) cardProgress.history = [];

        // Calcular próximo intervalo de revisão usando SM-2
        const { newInterval, newEaseFactor, newRepetitions } = this.calculateSM2(
          cardProgress.interval,
          cardProgress.easeFactor,
          cardProgress.repetitions,
          cardStudy.difficulty
        );

        cardProgress.interval = newInterval;
        cardProgress.easeFactor = newEaseFactor;
        cardProgress.repetitions = newRepetitions;
        
        // Definir próxima data de revisão
        cardProgress.nextReviewAt = new Date(
          now.getTime() + cardProgress.interval * 24 * 60 * 60 * 1000
        );

        // Adicionar ao histórico
        cardProgress.history.push({
          reviewedAt: now,
          difficulty: cardStudy.difficulty,
          intervalBefore: cardProgress.interval,
          intervalAfter: newInterval,
          easeFactor: newEaseFactor
        });
      }
    }

    // Atualizar estatísticas gerais
    studyProgress.totalReviews += studySession.cards.length;
    studyProgress.lastStudySession = now;
    if (studySession.totalSessionTime) {
      studyProgress.totalStudyTime += Math.round(studySession.totalSessionTime / 60); // converter para minutos
    }

    // Calcular streak (sequência)
    studyProgress.streak = this.calculateStreak(studyProgress.lastStudySession, studyProgress.streak);

    await studyProgress.save();

    return { success: true, studyProgress };
  }

  /**
   * Calcula o próximo intervalo usando algoritmo SM-2 (similar ao Anki)
   */
  private calculateSM2(
    currentInterval: number,
    currentEaseFactor: number,
    currentRepetitions: number,
    difficulty: CardDifficulty
  ): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
    // Mapear dificuldade para qualidade (1-4)
    let quality: number;
    switch (difficulty) {
      case CardDifficulty.HARD:
        quality = 1; // Again
        break;
      case CardDifficulty.NORMAL:
        quality = 3; // Good
        break;
      case CardDifficulty.EASY:
        quality = 4; // Easy
        break;
      default:
        quality = 3;
    }

    let newEaseFactor = currentEaseFactor;
    let newRepetitions = currentRepetitions;
    let newInterval = currentInterval;

    if (quality >= 3) {
      // Resposta correta
      if (currentRepetitions === 0) {
        newInterval = 1;
      } else if (currentRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * currentEaseFactor);
      }
      newRepetitions = currentRepetitions + 1;
    } else {
      // Resposta incorreta
      newRepetitions = 0;
      newInterval = 1;
    }

    // Atualizar ease factor
    newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Mínimo 1.3

    // Limitar intervalo máximo (ex: 1 ano)
    newInterval = Math.min(newInterval, 365);

    return { newInterval, newEaseFactor, newRepetitions };
  }

  /**
   * Calcula streak de estudos consecutivos
   */
  private calculateStreak(lastStudy: Date, currentStreak: number): number {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (!lastStudy) return 1;

    // Se estudou hoje ou ontem, mantém/incrementa streak
    if (lastStudy >= yesterday) {
      return lastStudy.toDateString() === now.toDateString() ? currentStreak : currentStreak + 1;
    }
    
    // Streak quebrado, reinicia
    return 1;
  }

  /**
   * Obtém progresso de estudo
   */
  async getStudyProgress(flashcardId: string, userId: string) {
    const studyProgress = await this.flashcardStudyModel
      .findOne({ flashcardId, userId })
      .populate('flashcardId', 'titulo categoria nivel quantidade_cards');

    if (!studyProgress) {
      throw new NotFoundException('Study progress not found');
    }

    const cardsDueForReview = studyProgress.cardProgress.filter(
      cp => cp.nextReviewAt && cp.nextReviewAt <= new Date()
    ).length;

    return {
      ...studyProgress.toJSON(),
      cardsDueForReview
    };
  }

  /**
   * Obtém estatísticas gerais do usuário
   */
  async getUserStudyStats(userId: string) {
    const studyProgresses = await this.flashcardStudyModel.find({ userId });
    
    const stats = {
      totalFlashcards: studyProgresses.length,
      totalStudyTime: studyProgresses.reduce((sum, sp) => sum + sp.totalStudyTime, 0),
      totalReviews: studyProgresses.reduce((sum, sp) => sum + sp.totalReviews, 0),
      currentStreak: Math.max(...studyProgresses.map(sp => sp.streak), 0),
      cardsDueToday: 0,
    };

    // Contar cards devido para revisão hoje
    for (const progress of studyProgresses) {
      const dueCards = progress.cardProgress.filter(
        cp => cp.nextReviewAt && cp.nextReviewAt <= new Date()
      ).length;
      stats.cardsDueToday += dueCards;
    }

    return stats;
  }

  /**
   * Obtém cards que precisam de revisão
   */
  async getCardsForReview(userId: string) {
    const now = new Date();
    const studyProgresses = await this.flashcardStudyModel
      .find({ userId })
      .populate('flashcardId', 'titulo categoria cards');

    const cardsForReview = [];

    for (const progress of studyProgresses) {
      const dueCards = progress.cardProgress.filter(
        cp => cp.nextReviewAt && cp.nextReviewAt <= now
      );

      for (const cardProgress of dueCards) {
        const flashcard = progress.flashcardId as any;
        const card = flashcard.cards[cardProgress.cardIndex];
        
        if (card) {
          cardsForReview.push({
            flashcardId: flashcard._id,
            flashcardTitle: flashcard.titulo,
            categoria: flashcard.categoria,
            cardIndex: cardProgress.cardIndex,
            card: card,
            difficulty: cardProgress.difficulty,
            timesStudied: cardProgress.timesStudied,
            lastStudiedAt: cardProgress.lastStudiedAt,
          });
        }
      }
    }

    // Ordenar por prioridade (cards mais antigos primeiro)
    cardsForReview.sort((a, b) => {
      if (!a.lastStudiedAt) return -1;
      if (!b.lastStudiedAt) return 1;
      return a.lastStudiedAt.getTime() - b.lastStudiedAt.getTime();
    });

    return cardsForReview;
  }

  /**
   * Toggle público/privado
   */
  async togglePublic(flashcardId: string, userId: string) {
    const flashcard = await this.flashcardModel.findById(flashcardId);
    
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    if (flashcard.createdBy.toString() !== userId) {
      throw new HttpException('You can only modify your own flashcards', HttpStatus.FORBIDDEN);
    }

    flashcard.isPublic = !flashcard.isPublic;
    await flashcard.save();

    return { success: true, isPublic: flashcard.isPublic };
  }

  /**
   * Deleta flashcard
   */
  async deleteFlashcard(flashcardId: string, userId: string) {
    const flashcard = await this.flashcardModel.findById(flashcardId);
    
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    if (flashcard.createdBy.toString() !== userId) {
      throw new HttpException('You can only delete your own flashcards', HttpStatus.FORBIDDEN);
    }

    // Deletar também todos os progressos associados
    await this.flashcardStudyModel.deleteMany({ flashcardId: flashcardId });
    await this.flashcardModel.deleteOne({ _id: flashcardId });

    return { success: true };
  }

  /**
   * Métodos de admin
   */
  async getAllFlashcards(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [flashcards, total] = await Promise.all([
      this.flashcardModel
        .find()
        .select('-cards')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.flashcardModel.countDocuments()
    ]);

    return {
      flashcards,
      currentPage: page,
      totalItems: total,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleActive(flashcardId: string) {
    const flashcard = await this.flashcardModel.findById(flashcardId);
    
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    flashcard.isActive = !flashcard.isActive;
    await flashcard.save();

    return { success: true, isActive: flashcard.isActive };
  }

  /**
   * Obter estatísticas do usuário para flashcards
   */
  async getUserStats(userId: string) {
    // Total de flashcards criados pelo usuário
    const totalFlashcardsCreated = await this.flashcardModel
      .countDocuments({ userId })
      .exec();

    // Estatísticas de estudos
    const studySessions = await this.flashcardStudyModel
      .find({ userId })
      .exec();

    const totalStudySessions = studySessions.length;
    const totalReviews = studySessions.reduce((sum, session) => sum + session.totalReviews, 0);
    const totalStudyTime = studySessions.reduce((sum, session) => sum + session.totalStudyTime, 0);
    
    // Calcular média de cards estudados por sessão
    const averageCardsPerSession = studySessions.length > 0
      ? studySessions.reduce((sum, session) => sum + session.cardProgress.length, 0) / studySessions.length
      : 0;

    // Estatísticas por dificuldade
    const { Types } = require('mongoose');
    const flashcardsByDifficulty = await this.flashcardModel
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: '$nivel', count: { $sum: 1 } } }
      ])
      .exec();

    const difficultyStats = {
      facil: flashcardsByDifficulty.find(d => d._id === 'FACIL')?.count || 0,
      medio: flashcardsByDifficulty.find(d => d._id === 'MEDIO')?.count || 0,
      dificil: flashcardsByDifficulty.find(d => d._id === 'DIFICIL')?.count || 0,
    };

    // Atividade semanal (últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentActivity = await this.flashcardStudyModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: weekAgo }
      })
      .exec();

    // Calcular streak atual
    const currentStreak = studySessions.length > 0 
      ? Math.max(...studySessions.map(s => s.streak))
      : 0;

    return {
      totalFlashcardsCreated,
      totalStudySessions,
      totalReviews,
      totalStudyTime,
      averageCardsPerSession: Math.round(averageCardsPerSession),
      difficultyStats,
      recentActivity,
      currentStreak,
      lastStudySession: studySessions.length > 0 
        ? studySessions[studySessions.length - 1].lastStudySession 
        : null,
    };
  }

  /**
   * Obter estatísticas de atividade do usuário (para heatmap)
   */
  async getUserActivityStats(userId: string, days: number = 365) {
    const { Types } = require('mongoose');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.flashcardStudyModel
      .find({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      })
      .select('createdAt totalReviews totalStudyTime cardProgress')
      .exec();

    // Agrupar por data
    const activityMap = new Map<string, { count: number; reviews: number; studyTime: number; cardsStudied: number }>();

    sessions.forEach(session => {
      const dateKey = session.createdAt.toISOString().split('T')[0];
      const existing = activityMap.get(dateKey) || { count: 0, reviews: 0, studyTime: 0, cardsStudied: 0 };
      
      activityMap.set(dateKey, {
        count: existing.count + 1,
        reviews: existing.reviews + session.totalReviews,
        studyTime: existing.studyTime + session.totalStudyTime,
        cardsStudied: existing.cardsStudied + session.cardProgress.length,
      });
    });

    // Converter para array ordenado
    const activity = Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      sessions: data.count,
      totalReviews: data.reviews,
      studyTime: data.studyTime,
      cardsStudied: data.cardsStudied,
      intensity: Math.min(Math.round(data.studyTime / 5), 5), // 0-5 baseado em minutos
    }));

    return activity.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Obter estatísticas detalhadas de um flashcard específico
   */
  async getFlashcardStats(flashcardId: string, userId: string) {
    const { Types } = require('mongoose');
    const flashcard = await this.flashcardModel.findOne({
      _id: flashcardId,
      userId: new Types.ObjectId(userId)
    }).exec();

    if (!flashcard) {
      throw new NotFoundException('Flashcard não encontrado');
    }

    // Estatísticas de estudo para este flashcard
    const flashcardStudy = await this.flashcardStudyModel
      .findOne({
        flashcardId: new Types.ObjectId(flashcardId),
        userId: new Types.ObjectId(userId)
      })
      .exec();

    let studyStats = {
      totalReviews: 0,
      totalStudyTime: 0,
      cardsStudied: 0,
      lastStudied: null as Date,
      averageInterval: 0,
    };

    if (flashcardStudy) {
      studyStats = {
        totalReviews: flashcardStudy.totalReviews,
        totalStudyTime: flashcardStudy.totalStudyTime,
        cardsStudied: flashcardStudy.cardProgress.length,
        lastStudied: flashcardStudy.lastStudySession,
        averageInterval: flashcardStudy.cardProgress.length > 0
          ? flashcardStudy.cardProgress.reduce((sum, cp) => sum + cp.interval, 0) / flashcardStudy.cardProgress.length
          : 0,
      };
    }

    return {
      flashcard: {
        id: flashcard._id,
        titulo: flashcard.titulo,
        vagaTitulo: flashcard.vaga_titulo,
        nivel: flashcard.nivel,
        createdAt: flashcard.createdAt,
        totalCards: flashcard.cards?.length || 0,
      },
      studyStats,
    };
  }

  /**
   * Obtém o histórico de revisões de um card específico
   */
  async getCardHistory(flashcardId: string, userId: string, cardIndex: number) {
    const studyProgress = await this.flashcardStudyModel.findOne({
      flashcardId: flashcardId,
      userId: userId
    });

    if (!studyProgress) {
      throw new NotFoundException('Study progress not found');
    }

    const cardProgress = studyProgress.cardProgress.find(cp => cp.cardIndex === cardIndex);
    if (!cardProgress) {
      throw new NotFoundException('Card progress not found');
    }

    return {
      cardIndex,
      history: cardProgress.history || [],
      currentStats: {
        timesStudied: cardProgress.timesStudied,
        interval: cardProgress.interval,
        easeFactor: cardProgress.easeFactor,
        repetitions: cardProgress.repetitions,
        nextReviewAt: cardProgress.nextReviewAt
      }
    };
  }
}