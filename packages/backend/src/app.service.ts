import { Injectable } from '@nestjs/common';

/**
 * Service principal da aplicação
 * Fornece funcionalidades básicas como health check e informações da API
 */
@Injectable()
export class AppService {
  /**
   * Retorna mensagem de health check
   * @returns Objeto com informações básicas da API
   */
  getHello(): object {
    return {
      message: 'Running...',
      version: process.env.APP_VERSION || 'beta',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retorna informações detalhadas da API
   * @returns Objeto com informações completas da API
   */
  getInfo(): object {
    return {
      name: 'TRunning...',
      version: process.env.APP_VERSION || 'beta',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}