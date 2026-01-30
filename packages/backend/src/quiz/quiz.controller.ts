import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto, GeneratedQuiz } from './dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  async generateQuiz(@Body() dto: GenerateQuizDto): Promise<GeneratedQuiz> {
    return this.quizService.generateQuiz(dto);
  }
}