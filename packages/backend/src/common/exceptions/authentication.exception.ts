import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exceção para erros de autenticação
 */
export class AuthenticationException extends BaseException {
  constructor(message = 'Authentication failed', errorCode?: string) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode);
  }
}

/**
 * Exceção para token inválido ou expirado
 */
export class InvalidTokenException extends BaseException {
  constructor(message = 'Invalid or expired token', errorCode?: string) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode);
  }
}

/**
 * Exceção para acesso negado (autorização)
 */
export class ForbiddenException extends BaseException {
  constructor(message = 'Access denied', errorCode?: string) {
    super(message, HttpStatus.FORBIDDEN, errorCode);
  }
}