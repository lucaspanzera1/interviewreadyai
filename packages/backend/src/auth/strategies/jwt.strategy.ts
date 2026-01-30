import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

/**
 * Interface para o payload do JWT token
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
}

/**
 * Estratégia JWT para validação de tokens de acesso
 * Protege rotas que requerem autenticação
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Valida o payload do JWT token
   * @param payload Payload decodificado do JWT
   * @returns Dados do usuário para anexar à requisição
   */
  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: payload.sub,  // Adicionado para compatibilidade com controllers
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}