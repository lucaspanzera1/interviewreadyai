import { Controller, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post(':id/pay')
  async payForPlan(
    @Param('id') planId: string,
    @CurrentUser() user: User,
  ) {
    if (!user.cellphone || !user.taxid) {
      throw new BadRequestException('CPF e telefone são obrigatórios para realizar pagamentos');
    }

    if (!user.abacatepayCustomerId) {
      throw new BadRequestException('Cliente não cadastrado na AbacatePay. Atualize seu perfil primeiro.');
    }

    return this.plansService.createPayment(planId, user);
  }
}