import { Controller, Post, Body, Get, Param, Patch, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto, GeneratedQuiz } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Public } from '../auth/decorators/public.decorator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

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

  @Public()
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

  @Public()
  @Get('public/:id')
  async getPublicQuizById(@Param('id') id: string) {
    const quiz = await this.quizService.getPublicQuizById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  @Get('my-attempts')
  @UseGuards(JwtAuthGuard)
  async getUserAttempts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: any,
  ) {
    return this.quizService.getUserAttempts(user.userId, parseInt(page), parseInt(limit));
  }

  @Get('my-attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getUserAttemptDetails(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getUserAttemptDetails(attemptId, user.userId);
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@CurrentUser() user: any) {
    return this.quizService.getUserStats(user.userId);
  }
}