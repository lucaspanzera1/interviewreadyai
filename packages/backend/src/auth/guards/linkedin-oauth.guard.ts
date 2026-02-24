import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard do LinkedIn OAuth para proteger rotas de autenticação OAuth
 * Redireciona para o LinkedIn para autenticação
 */
@Injectable()
export class LinkedInOAuthGuard extends AuthGuard('linkedin') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      callbackUrl.searchParams.set('error', 'authentication_failed');
      res.redirect(callbackUrl.toString());
      return null;
    }
    return user;
  }
}
