import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Estratégia do Google OAuth2 para autenticação
 * Configura e processa o fluxo de autenticação com Google
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Valida e processa o perfil do usuário retornado pelo Google
   * @param accessToken Token de acesso do Google
   * @param refreshToken Token de refresh do Google
   * @param profile Perfil do usuário do Google
   * @param done Callback do Passport
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      name: displayName,
      picture: photos?.[0]?.value,
    };

    done(null, user);
  }
}