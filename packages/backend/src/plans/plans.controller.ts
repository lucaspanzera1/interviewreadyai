import { Controller, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from '../user/user.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly userService: UserService,
  ) {}

  @Post(':id/pay')
  async payForPlan(
    @Param('id') planId: string,
    @CurrentUser() user: User,
  ) {
    if (!user.cellphone || !user.taxid) {
      throw new BadRequestException('CPF e telefone são obrigatórios para realizar pagamentos');
    }

    // Tentar criar cliente na AbacatePay se não existir
    if (!user.abacatepayCustomerId) {
      try {
        const customerId = await this.plansService.createAbacatePayCustomerIfNeeded(user);
        if (customerId) {
          // Atualizar o usuário com o novo customerId
          await this.userService.updateUser((user as any)._id.toString(), { abacatepayCustomerId: customerId });
          user.abacatepayCustomerId = customerId;
        } else {
          throw new BadRequestException('Cliente não cadastrado na AbacatePay. Atualize seu perfil primeiro.');
        }
      } catch (error) {
        console.error('Erro ao criar cliente na AbacatePay durante pagamento:', error);
        throw new BadRequestException('Cliente não cadastrado na AbacatePay. Atualize seu perfil primeiro.');
      }
    }

    return this.plansService.createPayment(planId, user);
  }
}