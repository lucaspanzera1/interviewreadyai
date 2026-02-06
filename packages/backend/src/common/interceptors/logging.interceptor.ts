import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor para logging de requisições e respostas
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  private getMethodColor(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return '\x1b[34m'; // Azul
      case 'POST':
        return '\x1b[32m'; // Verde
      case 'PUT':
        return '\x1b[33m'; // Amarelo
      case 'DELETE':
        return '\x1b[31m'; // Vermelho
      case 'PATCH':
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[37m'; // Branco
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;
    const now = Date.now();
    const methodColor = this.getMethodColor(method);

    // Log da requisição de entrada
    console.log(`${methodColor}[${method}]\x1b[0m ${url} - Incoming request from ${ip} (${userAgent})`);

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('Content-Length');
        const responseTime = Date.now() - now;

        if (statusCode >= 200 && statusCode < 300) {
          // Sucesso - log verde
          console.log(`${methodColor}[${method}]\x1b[0m ${url} ${statusCode} - ${responseTime}ms`);
        } else if (statusCode >= 400) {
          // Erro - log vermelho (mas erros já são logados no filter)
          console.error(`${methodColor}[${method}]\x1b[0m ${url} ${statusCode} - ${responseTime}ms`);
        }
      }),
    );
  }
}