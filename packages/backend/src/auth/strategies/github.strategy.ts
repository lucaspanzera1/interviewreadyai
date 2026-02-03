import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

/**
 * Estratégia do GitHub OAuth2 para autenticação
 * Configura e processa o fluxo de autenticação com GitHub
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'user'],
    });
  }

  /**
   * Valida e processa o perfil do usuário retornado pelo GitHub
   * @param accessToken Token de acesso do GitHub
   * @param refreshToken Token de refresh do GitHub
   * @param profile Perfil do usuário do GitHub
   * @param done Callback do Passport
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos, username, _json } = profile;

    // Tentar detectar LinkedIn do blog
    let linkedinUrl: string | undefined;
    if (_json?.blog && _json.blog.includes('linkedin.com')) {
      linkedinUrl = _json.blog;
    }

    const user = {
      githubId: id,
      email: emails?.[0]?.value,
      name: displayName || username,
      picture: photos?.[0]?.value,
      bio: _json?.bio,
      location: _json?.location,
      githubUrl: `https://github.com/${username}`,
      linkedinUrl,
    };

    done(null, user);
  }
}