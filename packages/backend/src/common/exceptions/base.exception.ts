import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exceção base personalizada para padronizar respostas de erro
 */
export abstract class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorCode?: string,
  ) {
    super(message, statusCode);
  }

  /**
   * Retorna o objeto de erro formatado
   */
  getErrorResponse() {
    return {
      statusCode: this.getStatus(),
      message: this.message,
      error: this.constructor.name.replace('Exception', ''),
      errorCode: this.errorCode,
      timestamp: new Date().toISOString(),
    };
  }
}