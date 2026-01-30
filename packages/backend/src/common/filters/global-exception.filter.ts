import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';

/**
 * Interface para resposta de erro padronizada
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  errorCode?: string;
  validationErrors?: any[];
}

/**
 * Filtro global de exceções para padronizar respostas de erro
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;

    if (exception instanceof BaseException) {
      // Exceções personalizadas
      errorResponse = {
        ...exception.getErrorResponse(),
        path: request.url,
      };
    } else if (exception instanceof HttpException) {
      // Exceções HTTP do NestJS
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      errorResponse = {
        statusCode: status,
        message: typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || exception.message,
        error: exception.constructor.name.replace('Exception', ''),
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      // Adiciona erros de validação se existirem
      if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
        const responseObj = exceptionResponse as any;
        if (Array.isArray(responseObj.message)) {
          errorResponse.validationErrors = responseObj.message;
        }
      }
    } else {
      // Exceções não tratadas
      errorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    // Log do erro
    this.logError(exception, request, errorResponse);

    // Resposta HTTP
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Registra o erro no log
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ): void {
    const { statusCode, message, path } = errorResponse;
    const method = request.method;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    if (statusCode >= 500) {
      // Erros do servidor - log completo
      this.logger.error(
        `${method} ${path} ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : exception,
        {
          ip,
          userAgent,
          body: request.body,
          params: request.params,
          query: request.query,
        },
      );
    } else {
      // Erros do cliente - log simples
      this.logger.warn(
        `${method} ${path} ${statusCode} - ${message}`,
        {
          ip,
          userAgent,
        },
      );
    }
  }
}