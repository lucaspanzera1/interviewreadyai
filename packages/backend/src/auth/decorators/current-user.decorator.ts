import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair dados do usuário atual da requisição
 * Uso: @CurrentUser() user: any
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);