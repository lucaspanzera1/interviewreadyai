import { 
  Controller, 
  Get, 
  Post, 
  UseGuards, 
  Req, 
  Res, 
  Body,
  UnauthorizedException 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiProperty 
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, TokenResponseDto, RefreshTokenDto } from './dto';
import { GoogleOAuthGuard, GitHubOAuthGuard, JwtAuthGuard } from './guards';
import { Public, CurrentUser } from './decorators';
import { 
  UnauthorizedErrorDto, 
  ValidationErrorDto 
} from '../common/dto';

/**
 * Controller de autenticação
 * Gerencia endpoints de login OAuth, callback e logout
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia o fluxo de autenticação com Google
   */
  @Get('google/login')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Inicia login com Google OAuth' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redireciona para página de autenticação do Google' 
  })
  async googleLogin() {
    // O guard do Google redireciona automaticamente
  }

  /**
   * Callback do Google OAuth - processa retorno da autenticação
   */
  @Get('google/callback')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redireciona para frontend com tokens de autenticação'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Falha na autenticação',
    type: UnauthorizedErrorDto
  })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const loginData = await this.authService.googleLogin(req.user);
      
      // Redireciona para o frontend com os tokens como query parameters
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      
      callbackUrl.searchParams.set('access_token', loginData.accessToken);
      callbackUrl.searchParams.set('refresh_token', loginData.refreshToken);
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.redirect(callbackUrl.toString());
    } catch (error) {
      // Redireciona para o frontend com erro
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      callbackUrl.searchParams.set('error', 'authentication_failed');
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.redirect(callbackUrl.toString());
    }
  }

  /**
   * Inicia o fluxo de autenticação com GitHub
   */
  @Get('github/login')
  @Public()
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'Inicia login com GitHub OAuth' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redireciona para página de autenticação do GitHub' 
  })
  async githubLogin() {
    // O guard do GitHub redireciona automaticamente
  }

  /**
   * Callback do GitHub OAuth - processa retorno da autenticação
   */
  @Get('github/callback')
  @Public()
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'Callback do GitHub OAuth' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redireciona para frontend com tokens de autenticação'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Falha na autenticação',
    type: UnauthorizedErrorDto
  })
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const loginData = await this.authService.githubLogin(req.user);
      
      // Redireciona para o frontend com os tokens como query parameters
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      
      callbackUrl.searchParams.set('access_token', loginData.accessToken);
      callbackUrl.searchParams.set('refresh_token', loginData.refreshToken);
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.redirect(callbackUrl.toString());
    } catch (error) {
      // Redireciona para o frontend com erro
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      callbackUrl.searchParams.set('error', 'authentication_failed');
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.redirect(callbackUrl.toString());
    }
  }

  /**
   * Renova token de acesso usando refresh token
   */
  @Post('refresh')
  @Public()
  @ApiOperation({ 
    summary: 'Renova token de acesso',
    description: 'Utiliza o refresh token para gerar um novo access token quando o atual expira'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado com sucesso',
    type: TokenResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados de entrada inválidos',
    type: ValidationErrorDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de refresh inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Logout do usuário (invalidar tokens no frontend)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout realizado com sucesso' 
  })
  async logout(@CurrentUser() user: any): Promise<{ message: string }> {
    // Em uma implementação completa, você poderia invalidar o token no servidor
    // Por enquanto, o logout é feito no frontend removendo os tokens
    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Endpoint temporário para testar o módulo de autenticação
   * @returns Status do módulo de autenticação
   */
  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Status do módulo de autenticação' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status retornado com sucesso' 
  })
  getStatus(): object {
    return this.authService.getStatus();
  }
}