import { Controller, Post, Body, Get, Param, Patch, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto, GeneratedQuiz } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateQuiz(
    @Body() dto: GenerateQuizDto,
    @CurrentUser() user: any, // JWT payload, not UserDocument
  ): Promise<GeneratedQuiz> {
    return this.quizService.generateQuiz(dto, user.userId);
  }

  @Post(':id/attempt')
  @UseGuards(JwtAuthGuard)
  async recordAttempt(
    @Param('id') quizId: string,
    @Body() body: { selectedAnswers: number[]; score: number; totalQuestions: number; timeSpent?: number },
    @CurrentUser() user: any, // JWT payload, not UserDocument
  ) {
    return this.quizService.recordQuizAttempt(
      quizId,
      user.userId,
      body.selectedAnswers,
      body.score,
      body.totalQuestions,
      body.timeSpent,
    );
  }

  @Post(':id/access')
  async recordAccess(@Param('id') quizId: string) {
    return this.quizService.incrementQuizAccess(quizId);
  }

  @Get('public')
  async getPublicQuizzes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.quizService.getPublicQuizzes(
      parseInt(page),
      parseInt(limit),
      category,
      level,
      search,
    );
  }

  @Get('public/:id')
  async getPublicQuizById(@Param('id') id: string) {
    const quiz = await this.quizService.getQuizById(id);
    if (!quiz || !quiz.isActive) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }
}