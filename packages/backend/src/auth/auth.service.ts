import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Processa login do Google OAuth
   */
  async googleLogin(googleUser: any): Promise<TokenResponse> {
    if (!googleUser) {
      throw new UnauthorizedException('No user from Google');
    }

    const user = await this.userService.findOrCreateUser({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    return this.generateTokens(user);
  }

  /**
   * Processa login do GitHub OAuth
   */
  async githubLogin(githubUser: any): Promise<TokenResponse> {
    if (!githubUser) {
      throw new UnauthorizedException('No user from GitHub');
    }

    const user = await this.userService.findOrCreateUser({
      githubId: githubUser.githubId,
      email: githubUser.email,
      name: githubUser.name,
      picture: githubUser.picture,
      bio: githubUser.bio,
      location: githubUser.location,
      githubUrl: githubUser.githubUrl,
      linkedinUrl: githubUser.linkedinUrl,
    });

    return this.generateTokens(user);
  }

  /**
   * Gera tokens JWT para o usuário
   */
  async generateTokens(user: UserDocument): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }

  /**
   * Atualiza o access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Valida o payload do JWT
   */
  async validateJwtPayload(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  /**
   * Retorna status do módulo de autenticação
   */
  getStatus(): object {
    return {
      module: 'AuthModule',
      status: 'active',
      provider: 'Google OAuth, GitHub OAuth',
      jwt: 'enabled',
      timestamp: new Date().toISOString(),
    };
  }
}