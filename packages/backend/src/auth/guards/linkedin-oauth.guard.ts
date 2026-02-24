import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard do LinkedIn OAuth para proteger rotas de autenticação OAuth
 * Redireciona para o LinkedIn para autenticação
 */
@Injectable()
export class LinkedInOAuthGuard extends AuthGuard('linkedin') {
  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    if (err || !user) {
      // Marca a request com flag de erro para o controller tratar o redirect.
      // NÃO fazemos o redirect aqui para evitar ERR_HTTP_HEADERS_SENT:
      // se retornássemos null o NestJS lançaria UnauthorizedException e o
      // exception filter tentaria escrever JSON em uma resposta já enviada.
      const req = context.switchToHttp().getRequest();
      req.__linkedinAuthError = true;
      return {} as any; // objeto truthy para o guard passar
    }
    return user;
  }
}
