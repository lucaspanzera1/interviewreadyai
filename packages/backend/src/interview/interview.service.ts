import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { t, SupportedLanguage } from '../common/i18n';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GenerateInterviewDto, GeneratedInterview, InterviewAttemptDto } from './dto';
import { Interview, InterviewDocument, InterviewAttempt, InterviewAttemptDocument } from './schemas';
import { ModuleRef } from '@nestjs/core';
import { forwardRef, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class InterviewService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    @InjectModel(InterviewAttempt.name) private interviewAttemptModel: Model<InterviewAttemptDocument>,
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private async getUserService(): Promise<any> {
    return this.userService;
  }

  async generateInterview(dto: GenerateInterviewDto, userId: string): Promise<GeneratedInterview> {
    // Validar que o usuário existe e tem tokens suficientes (2 tokens)
    const userService = await this.getUserService();
    const user = await userService.findById(userId);
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
      // Detectar o site da vaga e fazer scraping apropriado
      const jobData = await this.scrapeJob(dto.jobUrl);

      const lang = (user.preferredLanguage as SupportedLanguage) || 'pt-BR';

      // Gerar a simulação de entrevista baseada nos dados da vaga
      const interview = await this.generateInterviewFromJobData(jobData, dto, userId, lang);

      // Deduzir 2 tokens do usuário após sucesso
      await userService.removeTokensFromUser(userId, 2, 'interview_generation');

      return interview;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to generate interview simulation. Please check the job URL and try again.',
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
                       t('quiz.jobTitleNotFound');
      
      const companyName = $('.top-card-layout__card .topcard__org-name-link, .topcard__flavor--black-link, [data-test-id="company-name"]').first().text().trim() ||
                         $('.top-card-layout__card a[data-tracking-control-name="public_jobs_topcard-org-name"]').first().text().trim() ||
                         t('quiz.companyNotFound');
      
      const location = $('.top-card-layout__card .topcard__flavor--bullet, .topcard__flavor, [data-test-id="job-location"]').first().text().trim() ||
                      t('quiz.locationNotFound');
      
      // Tentar múltiplos seletores para descrição
      const description = $('.show-more-less-html__markup, .description__text, [data-test-id="job-description"]').text().trim() ||
                         $('div[class*="description"]').first().text().trim() ||
                         $('section[data-test-id="job-details"]').text().trim() ||
                         t('quiz.descriptionNotAvailable');


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
   * Faz scraping de uma vaga do Gupy
   */
  private async scrapeGupyJob(url: string): Promise<any> {
    try {
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

      const jobTitle = $('h1[data-testid="job-title"], .job-title, h1').first().text().trim() ||
                       $('h1').first().text().trim() ||
                       t('quiz.jobTitleNotFound');

      const companyName = $('[data-testid="company-name"], .company-name, .employer-name').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         t('quiz.companyNotFound');

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      t('quiz.locationNotFound');

      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-details-content').text().trim() ||
                         t('quiz.descriptionNotAvailable');

      const requirements: string[] = [];
      const responsibilities: string[] = [];
      const skills: string[] = [];

      const descriptionLower = description.toLowerCase();

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

      // Extract skills
      const skillPatterns = /\b(javascript|typescript|react|angular|vue|node|python|java|c\#|\.net|sql|mongodb|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi;
      const foundSkills = description.match(skillPatterns);
      if (foundSkills) {
        skills.push(...[...new Set(foundSkills.map(skill => skill.toLowerCase()))]);
      }

      return {
        jobTitle,
        companyName,
        location,
        description,
        requirements,
        responsibilities,
        skills,
        url,
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
                       t('quiz.jobTitleNotFound');

      const companyName = $('[data-testid="company-name"], .company-name, .company').first().text().trim() ||
                         $('.company-info a').first().text().trim() ||
                         t('quiz.companyNotFound');

      const location = $('[data-testid="job-location"], .job-location, .location').first().text().trim() ||
                      $('.location-info').first().text().trim() ||
                      t('quiz.locationNotFound');

      const description = $('[data-testid="job-description"], .job-description, .description').text().trim() ||
                         $('.job-content').text().trim() ||
                         t('quiz.descriptionNotAvailable');

      const requirements: string[] = [];
      const responsibilities: string[] = [];
      const skills: string[] = [];

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

      const skillPatterns = /\b(javascript|typescript|react|angular|vue|node|python|java|c\#|\.net|sql|mongodb|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi;
      const foundSkills = description.match(skillPatterns);
      if (foundSkills) {
        skills.push(...[...new Set(foundSkills.map(skill => skill.toLowerCase()))]);
      }

      return {
        jobTitle,
        companyName,
        location,
        description,
        requirements,
        responsibilities,
        skills,
        url,
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
      const skills: string[] = [];

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

      const skillPatterns = /\b(javascript|typescript|react|angular|vue|node|python|java|c\#|\.net|sql|mongodb|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi;
      const foundSkills = description.match(skillPatterns);
      if (foundSkills) {
        skills.push(...[...new Set(foundSkills.map(skill => skill.toLowerCase()))]);
      }

      return {
        jobTitle,
        companyName,
        location,
        description,
        requirements,
        responsibilities,
        skills,
        url,
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
      const skills: string[] = [];

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

      const skillPatterns = /\b(javascript|typescript|react|angular|vue|node|python|java|c\#|\.net|sql|mongodb|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi;
      const foundSkills = description.match(skillPatterns);
      if (foundSkills) {
        skills.push(...[...new Set(foundSkills.map(skill => skill.toLowerCase()))]);
      }

      return {
        jobTitle,
        companyName,
        location,
        description,
        requirements,
        responsibilities,
        skills,
        url,
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
   * Gera a simulação de entrevista baseada nos dados da vaga
   */
  private async generateInterviewFromJobData(
    jobData: any, 
    dto: GenerateInterviewDto, 
    userId: string,
    lang: SupportedLanguage = 'pt-BR'
  ): Promise<GeneratedInterview> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException('GROQ_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // Ler o template de prompt para simulação de entrevista
      const promptTemplate = await this.getInterviewPromptTemplate(lang);

      // Construir o prompt com os dados da vaga
      const prompt = this.buildInterviewPrompt(promptTemplate, jobData, dto);

      // Chamar a API do Groq
      const response = await this.callGroqAPI(prompt, apiKey, lang);

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
      this.validateGeneratedInterview(generatedInterview, dto.numberOfQuestions || 4);

      // Salvar simulação no banco de dados
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      const savedInterview = await this.interviewModel.create({
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        linkedinUrl: jobData.url,
        questions: generatedInterview.questions,
        numberOfQuestions: dto.numberOfQuestions || 4,
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
  private async callGroqAPI(prompt: string, apiKey: string, lang: SupportedLanguage = 'pt-BR'): Promise<string> {
    try {
      const systemContent = lang === 'en' ?
        'You are an expert interview coach and HR professional. Generate realistic and relevant interview questions based on job requirements. Always respond with valid JSON format.' :
        'Você é um coach de entrevistas especialista e profissional de RH. Gere perguntas de entrevista realistas e relevantes baseadas nos requisitos da vaga. Sempre responda com formato JSON válido.';
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: systemContent
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

      return response.data.choices[0].message.content;
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
  private async getInterviewPromptTemplate(lang: SupportedLanguage = 'pt-BR'): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const filename = lang === 'en' ? 'interview-simulation-en.md' : 'interview-simulation.md';
    const promptPath = path.join(__dirname, '../../../../prompt', filename);
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      return template;
    } catch (error) {
      return this.getDefaultInterviewPrompt(lang);
    }
  }

  /**
   * Template de prompt padrão se não houver arquivo
   */
  private getDefaultInterviewPrompt(lang: SupportedLanguage = 'pt-BR'): string {
    if (lang === 'en') {
      return `
# Interview Simulation Generation

You are an expert in human resources and interview conductor. Based on the job data provided,
generate a realistic interview simulation with {{numberOfQuestions}} questions focused on video recording.

## Job Data:
- **Title**: {{jobTitle}}
- **Company**: {{companyName}}
- **Location**: {{location}}
- **Requirements**: {{requirements}}
- **Skills**: {{skills}}
- **Description**: {{description}}
- **Experience Level**: {{experienceLevel}}

## Instructions:
1. Generate varied questions: technical, behavioral, situational and company-specific
2. Include different difficulty levels
3. Provide tips for each question
4. List important keywords for the answers
5. Provide preparation tips
6. Estimate realistic interview duration
7. **IMPORTANT**: Set suggested time for each question (for video recording)

**IMPORTANT**: Respond ONLY with valid JSON in the specified format.

## Response Format:
\`\`\`json
{
  "jobTitle": "string",
  "companyName": "string",
  "questions": [
    {
      "id": 1,
      "question": "Interview question",
      "type": "technical|behavioral|situational|company_specific",
      "category": "Question category",
      "difficulty": "easy|medium|hard",
      "tips": "Tips to answer well",
      "keywords": ["keyword1", "keyword2"],
      "maxDuration": 120
    }
  ],
  "estimatedDuration": 20,
  "preparationTips": ["Tip 1", "Tip 2"],
  "jobRequirements": ["Requirement 1", "Requirement 2"],
  "companyInfo": "Company information"
}
\`\`\`

**Suggested Times:**
- Easy questions: 60-90 seconds
- Medium questions: 90-120 seconds
- Hard questions: 120-180 seconds
- Total simulation: 8-15 minutes (4 questions)
`;
    }
    return `
# Geração de Simulação de Entrevista

Você é um especialista em recursos humanos e condutor de entrevistas. Baseado nos dados da vaga fornecidos, 
gere uma simulação de entrevista realista com {{numberOfQuestions}} perguntas focadas para gravação de vídeo.

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
7. **IMPORTANTE**: Defina tempo sugerido para cada pergunta (para gravação de vídeo)

**IMPORTANTE**: Responda APENAS com um JSON válido no formato especificado.

## Format da Resposta:
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
      "keywords": ["palavra-chave1", "palavra-chave2"],
      "maxDuration": 120
    }
  ],
  "estimatedDuration": 20,
  "preparationTips": ["Dica 1", "Dica 2"],
  "jobRequirements": ["Requisito 1", "Requisito 2"],
  "companyInfo": "Informações sobre a empresa"
}
\`\`\`

**Tempos Sugeridos:**
- Perguntas fáceis: 60-90 segundos
- Perguntas médias: 90-120 segundos  
- Perguntas difíceis: 120-180 segundos
- Total da simulação: 8-15 minutos (4 perguntas)
`;
  }

  /**
   * Constrói o prompt substituindo as variáveis
   */
  private buildInterviewPrompt(template: string, jobData: any, dto: GenerateInterviewDto): string {
    return template
      .replace(/{{numberOfQuestions}}/g, (dto.numberOfQuestions || 4).toString())
      .replace(/{{jobTitle}}/g, jobData.jobTitle || t('interview.notSpecified'))
      .replace(/{{companyName}}/g, jobData.companyName || t('interview.notSpecifiedFem'))
      .replace(/{{location}}/g, jobData.location || t('interview.notSpecifiedFem'))
      .replace(/{{requirements}}/g, jobData.requirements?.join(', ') || t('interview.notSpecified'))
      .replace(/{{skills}}/g, jobData.skills?.join(', ') || t('interview.notSpecified'))
      .replace(/{{description}}/g, jobData.description || t('interview.notAvailable'))
      .replace(/{{experienceLevel}}/g, dto.experienceLevel || t('interview.notSpecified'));
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

  async getUserInterviewsByAdmin(userId: string, page: number, limit: number) {
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
  async getUserAttempts(userId: string, page: number, limit: number, interviewId?: string) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const skip = (page - 1) * limit;
    
    // Build query filter
    const query: any = { userId: userObjectId };
    if (interviewId) {
      query.interviewId = new Types.ObjectId(interviewId);
    }
    
    const attempts = await this.interviewAttemptModel
      .find(query)
      .populate('interviewId', 'jobTitle companyName') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await this.interviewAttemptModel.countDocuments(query);
    
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

  /**
   * Registra tentativa de entrevista com vídeo
   */
  async recordVideoInterviewAttempt(
    interviewId: string,
    userId: string,
    videoFiles: Express.Multer.File[],
    attemptDto: any
  ) {
    console.log(`[VideoUpload] Starting upload for interview ${interviewId}, user ${userId}, ${videoFiles.length} files`);
    
    const { Types } = require('mongoose');
    const fs = require('fs');
    const path = require('path');
    
    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    console.log(`[VideoUpload] process.cwd(): ${process.cwd()}`);
    console.log(`[VideoUpload] __dirname: ${__dirname}`);
    console.log(`[VideoUpload] uploadDir: ${uploadDir}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`[VideoUpload] Created directory: ${uploadDir}`);
    }
    
    const videoPaths: string[] = [];
    const savedFiles: string[] = [];
    
    // Salvar todos os vídeos
    for (const [index, videoFile] of videoFiles.entries()) {
      const videoFileName = `interview_${interviewId}_${userId}_q${index}_${Date.now()}.${videoFile.originalname.split('.').pop()}`;
      const videoPath = path.join(uploadDir, videoFileName);
      
      try {
        fs.writeFileSync(videoPath, videoFile.buffer);
        
        // Verificar se o arquivo foi salvo corretamente
        if (!fs.existsSync(videoPath)) {
          throw new Error(`File was not saved: ${videoPath}`);
        }
        
        const stats = fs.statSync(videoPath);
        if (stats.size === 0) {
          throw new Error(`File saved but is empty: ${videoPath}`);
        }
        
        videoPaths.push(`/api/uploads/videos/${videoFileName}`);
        savedFiles.push(videoPath);
        console.log(`[VideoUpload] Saved video ${index + 1}/${videoFiles.length}: ${videoFileName} (${stats.size} bytes) at ${videoPath}`);
      } catch (error) {
        console.error(`[VideoUpload] Error saving video ${index}:`, error);
        // Continuar com os outros vídeos mesmo se um falhar
      }
    }
    
    console.log(`[VideoUpload] All saved files:`, savedFiles);
    console.log(`[VideoUpload] All video paths:`, videoPaths);
    
    if (videoPaths.length === 0) {
      throw new Error('Failed to save any video files');
    }
    
    // Criar tentativa com status pending para análise
    const attempt = await this.interviewAttemptModel.create({
      interviewId: new Types.ObjectId(interviewId),
      userId: new Types.ObjectId(userId),
      actualDuration: attemptDto.actualDuration || 0,
      difficultyRating: attemptDto.difficultyRating || 3,
      feedback: attemptDto.feedback,
      hasVideo: true,
      videoPath: videoPaths[0], // Caminho do primeiro vídeo (principal)
      videoPaths: videoPaths, // Todos os vídeos
      analysisStatus: 'pending',
      isCompleted: false,
    });

    console.log(`[VideoUpload] Created attempt ${attempt._id} with ${videoPaths.length} videos`);

    // Disparar análise de vídeo em background (analisar todos os vídeos)
    this.processVideoAnalysis(attempt._id.toString(), savedFiles, interviewId, userId);

    console.log(`[VideoUpload] Upload completed successfully for attempt ${attempt._id}`);

    return {
      attemptId: attempt._id.toString(),
      status: 'uploaded',
      message: t('interview.videosUploaded', 'pt-BR', { count: videoPaths.length }),
      videosCount: videoPaths.length,
    };
  }

  /**
   * Processa análise de vídeo com Google Gemini
   */
  private async processVideoAnalysis(attemptId: string, videoPaths: string[], interviewId: string, userId?: string) {
    try {
      console.log(`[VideoAnalysis] Starting analysis for attempt ${attemptId} with ${videoPaths.length} videos`);

      // Determine user's preferred language
      let lang: SupportedLanguage = 'pt-BR';
      if (userId) {
        try {
          const userService = await this.getUserService();
          const user = await userService.findById(userId);
          if (user?.preferredLanguage) {
            lang = user.preferredLanguage as SupportedLanguage;
          }
        } catch (e) {
          // Ignore - use default language
        }
      }
      
      // Atualizar status para 'processing'
      await this.interviewAttemptModel.findByIdAndUpdate(attemptId, {
        analysisStatus: 'processing'
      });

      // Buscar perguntas da entrevista para contexto
      const interview = await this.interviewModel.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      console.log(`[VideoAnalysis] Calling Gemini API for ${videoPaths.length} videos`);
      
      // Chamar Google Gemini API com todos os vídeos
      const analysisResult = await this.analyzeVideoWithGemini(videoPaths, interview.questions, lang);

      console.log(`[VideoAnalysis] Analysis completed successfully`);

      // Salvar resultado da análise
      await this.interviewAttemptModel.findByIdAndUpdate(attemptId, {
        videoAnalysis: analysisResult,
        analysisStatus: 'completed',
        isCompleted: true,
        completedAt: new Date(),
        strengths: analysisResult.summary?.strengths || [],
        improvements: analysisResult.summary?.improvements || [],
        preparednessScore: analysisResult.overall_score || 0,
      });

      // Atualizar estatísticas da simulação
      await this.interviewModel.findByIdAndUpdate(interviewId, {
        $inc: { 
          totalAttempts: 1,
          totalCompletions: 1,
        }
      });

      console.log(`[VideoAnalysis] Results saved successfully`);

    } catch (error) {
      console.error(`[VideoAnalysis] Error processing video analysis:`, error);
      console.error(`[VideoAnalysis] Error stack:`, error.stack);
      
      // Usar análise de fallback e marcar como concluído (com limitações)
      const fallbackAnalysis = this.createFallbackAnalysis();
      
      await this.interviewAttemptModel.findByIdAndUpdate(attemptId, {
        videoAnalysis: fallbackAnalysis,
        analysisStatus: 'completed_with_errors',
        isCompleted: true,
        completedAt: new Date(),
        strengths: fallbackAnalysis.summary?.strengths || [],
        improvements: fallbackAnalysis.summary?.improvements || [],
        preparednessScore: fallbackAnalysis.overall_score || 70,
      });
      
      console.log(`[VideoAnalysis] Saved fallback analysis due to error`);
    }
  }

  /**
   * Analisa vídeos usando Google Gemini
   */
  private async analyzeVideoWithGemini(videoPaths: string[], questions: any[], lang: SupportedLanguage = 'pt-BR'): Promise<any> {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const fs = require('fs');
      const path = require('path');
      
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Usar gemini-1.5-flash para análise de vídeo (mais rápido e otimizado)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Carregar template de prompt
      let promptTemplate: string;
      try {
        const filename = lang === 'en' ? 'video-analysis-en.md' : 'video-analysis.md';
        const promptPath = path.join(process.cwd(), 'prompt', filename);
        promptTemplate = fs.readFileSync(promptPath, 'utf-8');
      } catch (error) {
        // Fallback simplificado se não conseguir ler o template
        promptTemplate = this.getVideoAnalysisFallbackPrompt(lang);
      }

      // Processar cada vídeo individualmente e combinar resultados
      const allMoments = [];
      let totalDuration = 0;
      let totalScore = 0;
      let allStrengths = [];
      let allImprovements = [];

      for (let i = 0; i < videoPaths.length; i++) {
        const videoPath = videoPaths[i];
        const question = questions[i];

        console.log(`[VideoAnalysis] Analyzing video ${i + 1}/${videoPaths.length}: ${videoPath}`);

        // Construir prompt específico para essa pergunta
        const questionsText = `${i + 1}. ${question.question} (${question.type})`;
        const prompt = promptTemplate
          .replace(/{{questions}}/g, questionsText)
          .replace(/{{jobTitle}}/g, 'Cargo da Entrevista')
          .replace(/{{companyName}}/g, 'Empresa Simulação')
          + `\n\nNota: Este é o vídeo da pergunta ${i + 1} de ${videoPaths.length}.`;

        // Converter vídeo para base64
        const videoBuffer = fs.readFileSync(videoPath);
        const videoBase64 = videoBuffer.toString('base64');
        
        // Detectar tipo MIME baseado na extensão
        const ext = path.extname(videoPath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.mov': 'video/quicktime',
          '.avi': 'video/x-msvideo'
        };
        const mimeType = mimeTypes[ext] || 'video/mp4';

        const result = await model.generateContent([
          {
            inlineData: {
              data: videoBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Parse JSON response
        let videoAnalysis;
        try {
          // Remover possíveis markdown code blocks
          const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim();
          // Remover possíveis textos antes/depois do JSON
          const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? jsonMatch[0] : cleanJson;
          videoAnalysis = JSON.parse(jsonText);
        } catch (parseError) {
          console.error(`[VideoAnalysis] Error parsing JSON for video ${i + 1}:`, parseError);
          // Criar análise simplificada para este vídeo
          videoAnalysis = {
            overall_score: 70,
            duration: 60,
            moments: [{
              timestamp: totalDuration + 30,
              type: 'neutral',
              category: 'content',
              message: `Resposta para pergunta ${i + 1}: ${question.question}`,
              severity: 'low',
              suggestion: 'Análise detalhada não disponível'
            }],
            summary: {
              strengths: ['Tentativa de resposta'],
              improvements: ['Análise detalhada pendente']
            }
          };
        }

        // Ajustar timestamps para considerar vídeos anteriores
        const adjustedMoments = videoAnalysis.moments?.map(moment => ({
          ...moment,
          timestamp: totalDuration + (moment.timestamp || 0),
          questionIndex: i,
          questionText: question.question
        })) || [];

        allMoments.push(...adjustedMoments);
        totalDuration += videoAnalysis.duration || 60;
        totalScore += videoAnalysis.overall_score || 70;
        
        if (videoAnalysis.summary?.strengths) {
          allStrengths.push(...videoAnalysis.summary.strengths);
        }
        if (videoAnalysis.summary?.improvements) {
          allImprovements.push(...videoAnalysis.summary.improvements);
        }

        console.log(`[VideoAnalysis] Video ${i + 1} analyzed successfully`);
      }

      // Combinar resultados
      const analysisData = {
        overall_score: Math.round(totalScore / videoPaths.length),
        duration: totalDuration,
        moments: allMoments,
        summary: {
          strengths: allStrengths,
          improvements: allImprovements
        }
      };

      console.log(`[VideoAnalysis] Combined analysis: ${allMoments.length} moments, ${totalDuration}s total, score ${analysisData.overall_score}`);

      return analysisData;

    } catch (error) {
      console.error('Error analyzing video with Gemini:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Se for erro 404, pode ser modelo incorreto
      if (error.response?.status === 404) {
        console.error('Gemini API 404 - Modelo não encontrado. Verifique se o modelo está correto e se a API key tem acesso.');
      }
      
      // Fallback analysis em caso de erro
      return this.createFallbackAnalysis();
    }
  }

  /**
   * Cria análise de fallback em caso de erro
   */
  private createFallbackAnalysis(): any {
    return {
      overall_score: 75,
      duration: 120, // 2 minutos
      moments: [
        {
          timestamp: 30,
          type: 'neutral',
          category: 'content',
          message: 'Análise detalhada não disponível no momento',
          severity: 'low',
          suggestion: 'Tente enviar o vídeo novamente mais tarde'
        }
      ],
      summary: {
        strengths: [t('interview.simulationParticipation'), t('interview.recordingCompleted')],
        improvements: [t('interview.analysisComingSoon')],
        keyPoints: ['Vídeo recebido com sucesso', 'Sistema processando análise']
      },
      metrics: {
        speech_clarity: 75,
        confidence_level: 75,
        engagement: 75,
        technical_accuracy: 75
      }
    };
  }

  /**
   * Template de prompt fallback para análise de vídeo
   */
  private getVideoAnalysisFallbackPrompt(lang: SupportedLanguage = 'pt-BR'): string {
    if (lang === 'en') {
      return `
Analyze this interview simulation video and provide feedback in JSON:

Interview questions:
{{questions}}

Respond ONLY with valid JSON following this structure:
{
  "overall_score": 0-100,
  "duration": seconds,
  "moments": [
    {
      "timestamp": seconds,
      "type": "positive|improvement|neutral|warning",
      "category": "verbal|non-verbal|content|technical", 
      "message": "specific observation",
      "severity": "low|medium|high",
      "suggestion": "improvement suggestion"
    }
  ],
  "summary": {
    "strengths": ["strengths"],
    "improvements": ["areas to improve"],
    "keyPoints": ["important observations"]
  },
  "metrics": {
    "speech_clarity": 0-100,
    "confidence_level": 0-100,
    "engagement": 0-100,
    "technical_accuracy": 0-100
  }
}`;
    }
    return `
Analise este vídeo de simulação de entrevista e forneça feedback em JSON:

Perguntas da entrevista:
{{questions}}

Responda APENAS com JSON válido seguindo esta estrutura:
{
  "overall_score": 0-100,
  "duration": seconds,
  "moments": [
    {
      "timestamp": seconds,
      "type": "positive|improvement|neutral|warning",
      "category": "verbal|non-verbal|content|technical", 
      "message": "observação específica",
      "severity": "low|medium|high",
      "suggestion": "sugestão de melhoria"
    }
  ],
  "summary": {
    "strengths": ["pontos fortes"],
    "improvements": ["áreas para melhorar"],
    "keyPoints": ["observações importantes"]
  },
  "metrics": {
    "speech_clarity": 0-100,
    "confidence_level": 0-100,
    "engagement": 0-100,
    "technical_accuracy": 0-100
  }
}`;
  }

  /**
   * Obtém resultado da análise de vídeo
   */
  async getVideoAnalysis(attemptId: string, userId: string) {
    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);
    
    const attempt = await this.interviewAttemptModel.findOne({
      _id: attemptId,
      userId: userObjectId
    });

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    return {
      status: attempt.analysisStatus,
      hasVideo: attempt.hasVideo,
      videoPath: attempt.videoPath,
      videoPaths: attempt.videoPaths,
      analysis: attempt.videoAnalysis,
      completedAt: attempt.completedAt,
    };
  }

  async serveVideoFile(filename: string, userId: string, res: any) {
    const { Types } = require('mongoose');
    const path = require('path');
    const fs = require('fs');

    try {
      console.log(`[VideoAccess] Request to access video: ${filename} by user: ${userId}`);
      
      // Extract userId from filename
      // Format: interview_{interviewId}_{userId}_q{questionIndex}_{timestamp}.{ext}
      const filenameParts = filename.split('_');
      if (filenameParts.length < 4) {
        console.error(`[VideoAccess] Invalid filename format: ${filename}`);
        throw new NotFoundException('Invalid filename format');
      }

      const fileUserId = filenameParts[2]; // userId is the 3rd part (0-indexed: 0=interview, 1=interviewId, 2=userId)
      
      console.log(`[VideoAccess] File belongs to user: ${fileUserId}, requesting user: ${userId}`);
      console.log(`[VideoAccess] File userId type: ${typeof fileUserId}, User ID type: ${typeof userId}`);

      // Normalize both IDs for comparison (convert to string if needed)
      const normalizedFileUserId = fileUserId.toString();
      const normalizedRequestUserId = userId.toString();
      
      console.log(`[VideoAccess] Normalized comparison: ${normalizedFileUserId} === ${normalizedRequestUserId}`);

      // Verify that the requesting user owns this video
      if (normalizedFileUserId !== normalizedRequestUserId) {
        console.error(`[VideoAccess] Access denied: User ${normalizedRequestUserId} tried to access video owned by ${normalizedFileUserId}`);
        throw new HttpException('Access denied. You do not own this video.', HttpStatus.FORBIDDEN);
      }

      console.log(`[VideoAccess] Access granted for user ${userId} to video ${filename}`);

      // Construct file path
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
      const filePath = path.join(uploadDir, filename);

      console.log(`[VideoAccess] Looking for file at: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`[VideoAccess] File not found: ${filePath}`);
        throw new NotFoundException('Video file not found');
      }

      console.log(`[VideoAccess] File found, serving: ${filename}`);

      // Get file stats for content type and size
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = res.req.headers.range;

      // Handle range requests for video streaming
      if (res.req && res.req.headers.range) {
        const parts = res.req.headers.range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/webm',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
        };

        res.status(206).set(head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/webm',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Expose-Headers': 'Content-Length, Accept-Ranges',
        };

        res.status(200).set(head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error(`[VideoAccess] Error serving video file ${filename}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error serving video file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obter estatísticas de atividade do usuário (para heatmap)
   */
  async getUserActivityStats(userId: string, days: number = 365) {
    const { Types } = require('mongoose');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attempts = await this.interviewAttemptModel
      .find({
        userId: new Types.ObjectId(userId),
        isCompleted: true,
        createdAt: { $gte: startDate }
      })
      .select('createdAt actualDuration difficultyRating')
      .exec();

    // Agrupar por data
    const activityMap = new Map<string, { attempts: number; totalDuration: number; avgDifficulty: number }>();

    attempts.forEach(attempt => {
      const dateKey = (attempt as any).createdAt.toISOString().split('T')[0];
      const existing = activityMap.get(dateKey) || { attempts: 0, totalDuration: 0, avgDifficulty: 0 };
      existing.attempts += 1;
      existing.totalDuration += attempt.actualDuration || 0;
      existing.avgDifficulty += attempt.difficultyRating || 0;
      activityMap.set(dateKey, existing);
    });

    // Calcular médias por data
    const activity = Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      attempts: data.attempts,
      avgDuration: data.attempts > 0 ? data.totalDuration / data.attempts : 0,
      avgDifficulty: data.attempts > 0 ? data.avgDifficulty / data.attempts : 0,
      intensity: Math.min(data.attempts, 5), // 0-5 baseado no número de tentativas
    }));

    return activity.sort((a, b) => a.date.localeCompare(b.date));
  }
}