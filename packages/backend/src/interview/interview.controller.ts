import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  NotFoundException,
  Patch
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { GenerateInterviewDto, GeneratedInterview, InterviewAttemptDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

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
    @CurrentUser() user: UserDocument,
  ) {
    return this.interviewService.getUserAttempts(
      user._id.toString(), 
      parseInt(page), 
      parseInt(limit)
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
}