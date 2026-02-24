import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Estratégia do LinkedIn OAuth2 (OIDC) para autenticação.
 * Usa passport-oauth2 diretamente e chama o endpoint /v2/userinfo,
 * que é o correto para apps que usam os scopes openid/profile/email.
 */
@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email'],
    });
  }

  /**
   * Valida e processa o perfil do usuário retornado pelo LinkedIn.
   * Chama o endpoint OIDC /v2/userinfo para obter os dados do usuário.
   * NestJS PassportStrategy remove o `done` automaticamente — retornar o usuário é suficiente.
   */
  async validate(
    accessToken: string,
    _refreshToken: string,
    _profile: any,
  ): Promise<any> {
    const { data } = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      linkedinId: data.sub,
      email: data.email,
      name: data.name || `${data.given_name ?? ''} ${data.family_name ?? ''}`.trim(),
      picture: data.picture,
    };
  }
}
