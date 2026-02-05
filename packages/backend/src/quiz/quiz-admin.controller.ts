import { Controller, Get, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('admin/quiz')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class QuizAdminController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  async getAllQuizzes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.quizService.getAllQuizzes(parseInt(page), parseInt(limit));
  }

  @Get('user/:userId')
  async getUserQuizzes(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
  ) {
    return this.quizService.getUserQuizzes(userId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @Get(':id/stats')
  async getQuizStats(@Param('id') id: string) {
    return this.quizService.getQuizStats(id);
  }

  @Patch(':id/status')
  async updateQuizStatus(
    @Param('id') id: string,
    @Query('active') isActive: string,
  ) {
    return this.quizService.updateQuizStatus(id, isActive === 'true');
  }

  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}