import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exceção para erros de banco de dados
 */
export class DatabaseException extends BaseException {
  constructor(message = 'Database operation failed', errorCode?: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode);
  }
}

/**
 * Exceção para erro de conexão com banco de dados
 */
export class DatabaseConnectionException extends BaseException {
  constructor(message = 'Database connection failed', errorCode?: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, errorCode);
  }
}