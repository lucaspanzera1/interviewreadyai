import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Patch,
  Delete, 
  Query, 
  UseGuards, 
  NotFoundException 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FlashcardService } from './flashcard.service';
import { GenerateJobFlashcardDto, GeneratedFlashcard, StudySessionDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserDocument } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Post('generate-job')
  @UseGuards(JwtAuthGuard)
  async generateJobFlashcard(
    @Body() dto: GenerateJobFlashcardDto,
    @CurrentUser() user: UserDocument,
  ): Promise<GeneratedFlashcard> {
    return this.flashcardService.generateJobFlashcard(dto, user._id.toString());
  }

  @Get('my-flashcards')
  @UseGuards(JwtAuthGuard)
  async getMyFlashcards(
    @CurrentUser() user: UserDocument,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('categoria') categoria?: string,
    @Query('nivel') nivel?: string,
  ) {
    return this.flashcardService.getUserFlashcards(
      user._id.toString(),
      parseInt(page),
      parseInt(limit),
      categoria,
      nivel,
    );
  }

  @Get('public')
  @Public()
  async getPublicFlashcards(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('categoria') categoria?: string,
    @Query('nivel') nivel?: string,
  ) {
    return this.flashcardService.getPublicFlashcards(
      parseInt(page),
      parseInt(limit),
      categoria,
      nivel,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFlashcardForStudy(
    @Param('id') flashcardId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.getFlashcardForStudy(flashcardId, user._id.toString());
  }

  @Post(':id/study')
  @UseGuards(JwtAuthGuard)
  async recordStudySession(
    @Param('id') flashcardId: string,
    @Body() studySession: StudySessionDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.recordStudySession(
      flashcardId,
      user._id.toString(),
      studySession,
    );
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  async getStudyProgress(
    @Param('id') flashcardId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.getStudyProgress(flashcardId, user._id.toString());
  }

  @Get(':id/card/:cardIndex/history')
  @UseGuards(JwtAuthGuard)
  async getCardHistory(
    @Param('id') flashcardId: string,
    @Param('cardIndex') cardIndex: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.getCardHistory(flashcardId, user._id.toString(), parseInt(cardIndex));
  }

  @Get('user/study-stats')
  @UseGuards(JwtAuthGuard)
  async getStudyStats(
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.getUserStudyStats(user._id.toString());
  }

  @Get('user/due-for-review')
  @UseGuards(JwtAuthGuard)
  async getCardsForReview(
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.getCardsForReview(user._id.toString());
  }

  @Patch(':id/toggle-public')
  @UseGuards(JwtAuthGuard)
  async togglePublic(
    @Param('id') flashcardId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.togglePublic(flashcardId, user._id.toString());
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFlashcard(
    @Param('id') flashcardId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.flashcardService.deleteFlashcard(flashcardId, user._id.toString());
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllFlashcards(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.flashcardService.getAllFlashcards(parseInt(page), parseInt(limit));
  }

  @Patch('admin/:id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(
    @Param('id') flashcardId: string,
  ) {
    return this.flashcardService.toggleActive(flashcardId);
  }

  @Get('admin/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserFlashcardsByAdmin(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
  ) {
    return this.flashcardService.getUserFlashcardsByAdmin(userId, parseInt(page), parseInt(limit));
  }

  /**
   * Obter estatísticas do usuário sobre flashcards
   */
  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obter estatísticas de flashcards',
    description: 'Retorna estatísticas detalhadas sobre o uso de flashcards pelo usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalFlashcardsCreated: { type: 'number', example: 15 },
        totalStudySessions: { type: 'number', example: 42 },
        totalReviews: { type: 'number', example: 180 },
        totalStudyTime: { type: 'number', example: 350 },
        averageCardsPerSession: { type: 'number', example: 8 },
        difficultyStats: {
          type: 'object',
          properties: {
            facil: { type: 'number', example: 5 },
            medio: { type: 'number', example: 7 },
            dificil: { type: 'number', example: 3 }
          }
        },
        recentActivity: { type: 'number', example: 12 },
        lastStudySession: { type: 'string', format: 'date-time', nullable: true }
      }
    }
  })
  async getUserStats(@CurrentUser() user: UserDocument) {
    return this.flashcardService.getUserStats(user._id.toString());
  }

  /**
   * Obter atividade do usuário para heatmap
   */
  @Get('my-activity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obter atividade de flashcards',
    description: 'Retorna dados de atividade diária para visualização em heatmap'
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: 'number',
    description: 'Número de dias para buscar (padrão: 365)',
    example: 90
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de atividade retornados com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', example: '2024-01-15' },
          sessions: { type: 'number', example: 3 },
          totalReviews: { type: 'number', example: 12 },
          studyTime: { type: 'number', example: 25 },
          intensity: { type: 'number', example: 4 }
        }
      }
    }
  })
  async getUserActivity(
    @CurrentUser() user: UserDocument,
    @Query('days') days: string = '365'
  ) {
    return this.flashcardService.getUserActivityStats(user._id.toString(), parseInt(days));
  }

  /**
   * Obter estatísticas de um flashcard específico
   */
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obter estatísticas de um flashcard',
    description: 'Retorna estatísticas detalhadas de estudo para um flashcard específico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do flashcard',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do flashcard retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        flashcard: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titulo: { type: 'string' },
            vagaTitulo: { type: 'string' },
            nivel: { type: 'string', enum: ['FACIL', 'MEDIO', 'DIFICIL'] },
            createdAt: { type: 'string', format: 'date-time' },
            totalCards: { type: 'number' }
          }
        },
        studyStats: {
          type: 'object',
          properties: {
            totalReviews: { type: 'number', example: 8 },
            totalStudyTime: { type: 'number', example: 45 },
            cardsStudied: { type: 'number', example: 12 },
            lastStudied: { type: 'string', format: 'date-time', nullable: true },
            averageInterval: { type: 'number', example: 2.5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Flashcard não encontrado' })
  async getFlashcardStats(
    @Param('id') flashcardId: string,
    @CurrentUser() user: UserDocument
  ) {
    return this.flashcardService.getFlashcardStats(flashcardId, user._id.toString());
  }
}