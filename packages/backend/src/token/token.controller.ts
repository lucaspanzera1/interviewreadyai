import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenService } from './token.service';
import { Token } from './schemas/token.schema';

@Controller('tokens')
@UseGuards(JwtAuthGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getAllTokens(): Promise<Token[]> {
    return this.tokenService.findAllActive();
  }
}