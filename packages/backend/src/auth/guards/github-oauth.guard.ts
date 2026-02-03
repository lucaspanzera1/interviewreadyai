import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard do GitHub OAuth para proteger rotas de autenticação OAuth
 * Redireciona para o GitHub para autenticação
 */
@Injectable()
export class GitHubOAuthGuard extends AuthGuard('github') {}