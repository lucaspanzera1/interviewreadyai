import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller para servir arquivos de upload (imagens, vídeos, etc.)
 */
@Controller('uploads')
export class UploadsController {
  
  /**
   * Serve imagens de header do usuário
   */
  @Get('headers/:filename')
  @Public()
  async getHeaderImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', 'headers', filename);
    
    if (!existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: 'File not found',
        error: 'Not Found'
      });
    }

    return res.sendFile(filePath);
  }

  /**
   * Serve vídeos de interview
   */
  @Get('videos/:filename')
  @Public()
  async getVideo(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', 'videos', filename);
    
    if (!existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: 'File not found',
        error: 'Not Found'
      });
    }

    return res.sendFile(filePath);
  }
}