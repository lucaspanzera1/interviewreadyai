import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// ...existing code...

/**
 * Guard JWT para proteger rotas que requerem autenticação
 * Verifica se o usuário possui um token JWT válido e está ativo
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determina se a rota pode ser ativada
   * @param context Contexto de execução
   * @returns true se autorizado, false caso contrário
   */
  async canActivate(context: ExecutionContext) {
    // Verifica se a rota é pública (marcada com @Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ...existing code...

    return true;
  }
}