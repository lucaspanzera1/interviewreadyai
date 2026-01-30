import { SetMetadata } from '@nestjs/common';

/**
 * Chave para identificar rotas públicas
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar rotas como públicas (não requerem autenticação)
 * Uso: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);