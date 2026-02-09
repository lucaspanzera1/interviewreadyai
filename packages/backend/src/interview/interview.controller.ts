import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  NotFoundException,
  Patch,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Res,
  Req,
  UnauthorizedException
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { GenerateInterviewDto, GeneratedInterview, InterviewAttemptDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly configService: ConfigService
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateInterview(
    @Body() dto: GenerateInterviewDto,
    @CurrentUser() user: UserDocument,
  ): Promise<GeneratedInterview> {
    return this.interviewService.generateInterview(dto, user._id.toString());
  }

  @Post(':id/attempt')
  @UseGuards(JwtAuthGuard)
  async recordAttempt(
    @Param('id') interviewId: string,
    @Body() attemptDto: InterviewAttemptDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.recordInterviewAttempt(
      interviewId,
      user._id.toString(),
      attemptDto,
    );
  }

  @Post(':id/access')
  @UseGuards(JwtAuthGuard)
  async recordAccess(
    @Param('id') interviewId: string, 
    @CurrentUser() user: UserDocument
  ) {
    return this.interviewService.incrementInterviewAccess(
      interviewId, 
      user._id.toString()
    );
  }

  @Get(':id/play')
  @UseGuards(JwtAuthGuard)
  async getInterviewForPlaying(
    @Param('id') id: string, 
    @CurrentUser() user: UserDocument
  ) {
    return this.interviewService.getInterviewForPlaying(id, user._id.toString());
  }

  @Get('my-interviews')
  @UseGuards(JwtAuthGuard)
  async getUserInterviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.getUserInterviews(
      user._id.toString(), 
      parseInt(page), 
      parseInt(limit)
    );
  }

  @Get('my-attempts')
  @UseGuards(JwtAuthGuard)
  async getUserAttempts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('interviewId') interviewId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.getUserAttempts(
      user._id.toString(), 
      parseInt(page), 
      parseInt(limit),
      interviewId
    );
  }

  @Get('my-attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getUserAttemptDetails(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.getUserAttemptDetails(attemptId, user._id.toString());
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@CurrentUser() user: UserDocument) {
    return this.interviewService.getUserStats(user._id.toString());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInterviewById(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument
  ) {
    const interview = await this.interviewService.getInterviewById(id, user._id.toString());
    if (!interview) {
      throw new NotFoundException('Interview simulation not found');
    }
    return interview;
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  async completeInterview(
    @Param('id') interviewId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.completeInterview(interviewId, user._id.toString());
  }

  @Post(':id/video-attempt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('videos', 10, { // Aceitar até 10 vídeos
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max por arquivo
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('video/')) {
        return callback(new BadRequestException('Only video files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async recordVideoAttempt(
    @Param('id') interviewId: string,
    @UploadedFiles() videoFiles: Express.Multer.File[],
    @Body() attemptDto: any,
    @CurrentUser() user: UserDocument,
  ) {
    if (!videoFiles || videoFiles.length === 0) {
      throw new BadRequestException('At least one video file is required');
    }

    // Validar tamanho dos arquivos
    for (const file of videoFiles) {
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('One or more video files are empty');
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        throw new BadRequestException('Video file too large (max 50MB)');
      }
    }

    return this.interviewService.recordVideoInterviewAttempt(
      interviewId,
      user._id.toString(),
      videoFiles,
      attemptDto,
    );
  }

  @Get('video-analysis/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getVideoAnalysis(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.getVideoAnalysis(attemptId, user._id.toString());
  }

  @Get('video/:filename')
  @Public()
  async getVideoFile(
    @Param('filename') filename: string,
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let userId: string;
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new BadRequestException('JWT configuration error');
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwtToken = authHeader.substring(7);
      try {
        const payload = jwt.verify(jwtToken, jwtSecret) as any;
        if (!payload || !payload.sub) {
          throw new UnauthorizedException('Invalid token payload');
        }
        userId = payload.sub;
      } catch (error) {
        console.error('[VideoAuth] Error verifying JWT from Authorization header:', error);
        throw new UnauthorizedException('Invalid authorization token');
      }
    } else if (token) {
      try {
        const payload = jwt.verify(token, jwtSecret) as any;
        if (!payload || !payload.sub) {
          throw new UnauthorizedException('Invalid token payload');
        }
        userId = payload.sub;
      } catch (error) {
        console.error('[VideoAuth] Error verifying JWT from query parameter:', error);
        throw new UnauthorizedException('Invalid query token');
      }
    } else {
      throw new UnauthorizedException('No authentication provided');
    }
    
    return this.interviewService.serveVideoFile(filename, userId, res);
  }
}