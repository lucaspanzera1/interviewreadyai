import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * Controller principal da aplicação
 * Fornece endpoints básicos de health check e informações da API
 */
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * @returns Informações básicas da API
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check da API' })
  @ApiResponse({ 
    status: 200, 
    description: 'API funcionando corretamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        version: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  getHello(): object {
    return this.appService.getHello();
  }

  /**
   * Endpoint de informações da API
   * @returns Informações detalhadas sobre a API
   */
  @Get('info')
  @Public()
  @ApiOperation({ summary: 'Informações da API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informações da API retornadas com sucesso' 
  })
  getInfo(): object {
    return this.appService.getInfo();
  }
}