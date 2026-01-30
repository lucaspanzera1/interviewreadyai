import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GenerateQuizDto, GeneratedQuiz } from './dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateQuiz(dto: GenerateQuizDto): Promise<GeneratedQuiz> {
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
      const quiz: GeneratedQuiz = JSON.parse(content);
      return quiz;
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
      .replace(/{nivel}/g, dto.nivel);
  }

  private async callGroqAPI(prompt: string, apiKey: string): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
      model: 'openai/gpt-oss-120b', // Using Mixtral 8x7B model
      messages: [
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
}