import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TokenPackageService } from '../token-package/token-package.service';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class PlansService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenPackageService: TokenPackageService,
    private readonly userService: UserService,
  ) {}

  async createAbacatePayCustomerIfNeeded(user: User): Promise<string | null> {
    if (user.abacatepayCustomerId) {
      return user.abacatepayCustomerId;
    }

    if (!user.cellphone || !user.taxid || !user.name || !user.email) {
      return null;
    }

    return await this.userService.createAbacatePayCustomer({
      name: user.name,
      email: user.email,
      cellphone: user.cellphone,
      taxid: user.taxid,
    });
  }

  async createPayment(planId: string, user: User) {
    // Buscar o plano
    const plan = await this.tokenPackageService.findOne(planId);
    if (!plan || !plan.active || !plan.value) {
      throw new NotFoundException('Plano não encontrado ou não disponível para compra');
    }

    // Garantir que o plano tenha externalId
    if (!plan.externalId) {
      await this.tokenPackageService.update(planId, { externalId: planId });
    }

    const abacatepayToken = this.configService.get<string>('ABACATEPAY_TOKEN');
    if (!abacatepayToken) {
      throw new BadRequestException('Configuração de pagamento não disponível');
    }

    // Preparar payload para AbacatePay
    const payload = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [
        {
          externalId: planId,
          name: plan.name,
          description: plan.description || `Pacote ${plan.name}`,
          quantity: 1,
          price: Math.round(plan.value * 100), // Converter para centavos
        },
      ],
      returnUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080') + '/tokens',
      completionUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080') + '/tokens',
      customerId: user.abacatepayCustomerId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://api.abacatepay.com/v1/billing/create', payload, {
          headers: {
            'Authorization': `Bearer ${abacatepayToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      return {
        checkoutUrl: response.data.data?.url || response.data.url,
        billingId: response.data.data?.id || response.data.id,
      };
    } catch (error) {
      console.error('Erro ao criar cobrança na AbacatePay:', error.response?.data || error.message);
      throw new BadRequestException('Erro ao processar pagamento. Tente novamente.');
    }
  }

  /**
   * Ativa um plano para um usuário (chamado pelo webhook)
   * @param abacatepayCustomerId ID do cliente na AbacatePay
   * @param planId ID do plano
   */
  async activatePlanForUser(abacatepayCustomerId: string, planId: string) {
    // Encontrar usuário pelo abacatepayCustomerId
    const user = await this.userService.findByAbacatePayCustomerId(abacatepayCustomerId);
    if (!user) {
      console.error(`Usuário não encontrado para customerId: ${abacatepayCustomerId}`);
      return;
    }

    // Buscar o plano
    let plan = await this.tokenPackageService.findByExternalId(planId);
    if (!plan) {
      plan = await this.tokenPackageService.findOne(planId);
    }
    if (!plan || !plan.active) {
      console.error(`Plano não encontrado ou inativo: ${planId}`);
      // Log available plans for debugging
      const allPlans = await this.tokenPackageService.findAll();
      console.error('Planos disponíveis:', allPlans.map(p => ({ id: (p as any).id || p['_id'], name: p.name, externalId: p.externalId })));
      return;
    }

    // Ativar o plano para o usuário
    await this.tokenPackageService.redeem(planId, user);

    console.log(`Plano ${plan.name} ativado para usuário ${user.email}`);
  }
}