import { Controller, Post, Body, Get, Param, Patch, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto, GeneratedQuiz, GenerateJobQuizDto } from './dto';
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
    @CurrentUser() user: UserDocument,
  ): Promise<GeneratedQuiz> {
    return this.quizService.generateQuiz(dto, user._id.toString());
  }

  @Post('generate-job')
  @UseGuards(JwtAuthGuard)
  async generateJobQuiz(
    @Body() dto: GenerateJobQuizDto,
    @CurrentUser() user: UserDocument,
  ): Promise<GeneratedQuiz> {
    return this.quizService.generateJobQuiz(dto, user._id.toString());
  }

  @Post(':id/attempt')
  @UseGuards(JwtAuthGuard)
  async recordAttempt(
    @Param('id') quizId: string,
    @Body() body: { selectedAnswers: number[]; score: number; totalQuestions: number; timeSpent?: number },
    @CurrentUser() user: UserDocument,
  ) {
    return this.quizService.recordQuizAttempt(
      quizId,
      user._id.toString(),
      body.selectedAnswers,
      body.score,
      body.totalQuestions,
      body.timeSpent,
    );
  }

  @Post(':id/access')
  @UseGuards(JwtAuthGuard)
  async recordAccess(@Param('id') quizId: string, @CurrentUser() user: UserDocument) {
    return this.quizService.incrementQuizAccess(quizId, user._id.toString());
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
  @Get('public/filters')
  async getPublicFilters() {
    return this.quizService.getPublicFilters();
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

  @Get(':id/play')
  @UseGuards(JwtAuthGuard)
  async getQuizForPlaying(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.quizService.getQuizForPlaying(id, user._id.toString());
  }

  @Get('my-attempts')
  @UseGuards(JwtAuthGuard)
  async getUserAttempts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: UserDocument,
  ) {
    return this.quizService.getUserAttempts(user._id.toString(), parseInt(page), parseInt(limit));
  }

  @Get('my-quizzes')
  @UseGuards(JwtAuthGuard)
  async getUserQuizzes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: UserDocument,
  ) {
    return this.quizService.getUserQuizzes(user._id.toString(), parseInt(page), parseInt(limit));
  }

  @Get('my-attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getUserAttemptDetails(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.quizService.getUserAttemptDetails(attemptId, user._id.toString());
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@CurrentUser() user: UserDocument) {
    return this.quizService.getUserStats(user._id.toString());
  }
}