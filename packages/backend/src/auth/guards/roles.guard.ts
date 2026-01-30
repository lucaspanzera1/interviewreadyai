import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não houver @Roles, permite qualquer usuário autenticado
    if (requiredRoles === undefined) {
      return true;
    }
    // Se @Roles() foi usado sem argumentos, permite qualquer usuário autenticado
    if (Array.isArray(requiredRoles) && requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => role.toLowerCase() === (user.role || '').toLowerCase());
  }
}