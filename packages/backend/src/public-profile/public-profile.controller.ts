import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/decorators';
import { PublicProfileService } from './public-profile.service';

@Controller('api/public/profile')
export class PublicProfileController {
  constructor(private readonly publicProfileService: PublicProfileService) { }

  @Public()
  @Get(':id/badge')
  async getBadge(
    @Param('id') id: string,
    @Query('theme') theme: string,
    @Res() res: Response,
  ): Promise<void> {
    const svg = await this.publicProfileService.getBadgeSvg(id, theme);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(svg);
  }
}
