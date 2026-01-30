import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exceção para erros de validação de dados
 */
export class ValidationException extends BaseException {
  constructor(
    message = 'Validation failed',
    public readonly validationErrors?: any[],
    errorCode?: string,
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode);
  }

  /**
   * Retorna o objeto de erro formatado com detalhes de validação
   */
  getErrorResponse() {
    const baseResponse = super.getErrorResponse();
    return {
      ...baseResponse,
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Exceção para dados não encontrados
 */
export class NotFoundException extends BaseException {
  constructor(message = 'Resource not found', errorCode?: string) {
    super(message, HttpStatus.NOT_FOUND, errorCode);
  }
}

/**
 * Exceção para conflito de dados (ex: email já existe)
 */
export class ConflictException extends BaseException {
  constructor(message = 'Resource conflict', errorCode?: string) {
    super(message, HttpStatus.CONFLICT, errorCode);
  }
}