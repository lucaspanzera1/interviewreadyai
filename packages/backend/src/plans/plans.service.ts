import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TokenPackageService } from '../token-package/token-package.service';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { t, SupportedLanguage } from '../common/i18n';

@Injectable()
export class PlansService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenPackageService: TokenPackageService,
    private readonly userService: UserService,
  ) { }

  async createAbacatePayCustomerIfNeeded(user: User): Promise<string | null> {
    if (user.abacatepayCustomerId) {
      return user.abacatepayCustomerId;
    }

    if (!user.cellphone || !user.taxid || !user.name || !user.email) {
      return null;
    }

    const customerId = await this.userService.createAbacatePayCustomer({
      name: user.name,
      email: user.email,
      cellphone: user.cellphone,
      taxid: user.taxid,
    });

    if (customerId) {
      // Atualizar o usuário com o customerId
      await this.userService.updateUser((user as any)._id.toString(), { abacatepayCustomerId: customerId });
    }

    return customerId;
  }

  async createPayment(planId: string, user: User) {
    // Buscar o plano
    const plan = await this.tokenPackageService.findOne(planId);
    if (!plan || !plan.active || !plan.value) {
      throw new NotFoundException(t('plan.notFoundOrUnavailable'));
    }

    // Garantir que o plano tenha externalId
    if (!plan.externalId) {
      await this.tokenPackageService.update(planId, { externalId: planId });
    }

    const abacatepayToken = this.configService.get<string>('ABACATEPAY_TOKEN');
    if (!abacatepayToken) {
      throw new BadRequestException(t('plan.paymentConfigUnavailable'));
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
      returnUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080') + '/order-confirmation?status=pending',
      completionUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080') + '/order-confirmation?status=completed',
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

      const billingId = response.data.data?.id || response.data.id;
      const checkoutUrl = response.data.data?.url || response.data.url;

      // Atualizar as URLs com o billingId
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
      const returnUrlWithId = `${frontendUrl}/order-confirmation?status=pending&billingId=${billingId}`;
      const completionUrlWithId = `${frontendUrl}/order-confirmation?status=completed&billingId=${billingId}`;

      // Atualizar o billing com as URLs corretas (se a API suportar)
      // Nota: Isso depende da API do AbacatePay. Se não suportar, as URLs já foram enviadas no payload inicial.

      return {
        checkoutUrl,
        billingId,
      };
    } catch (error) {
      console.error('Erro ao criar cobrança na AbacatePay:', error.response?.data || error.message);
      throw new BadRequestException(t('plan.paymentError'));
    }
  }

  /**
   * Ativa um plano para um usuário (chamado pelo webhook)
   * @param abacatepayCustomerId ID do cliente na AbacatePay
   * @param planId ID do plano
   * @param customerEmail Email do cliente (fallback)
   */
  async activatePlanForUser(abacatepayCustomerId: string, planId: string, customerEmail?: string) {
    // Encontrar usuário pelo abacatepayCustomerId
    let user = await this.userService.findByAbacatePayCustomerId(abacatepayCustomerId);
    if (!user && customerEmail) {
      // Tentar encontrar pelo email e atualizar o customerId
      user = await this.userService.findByEmail(customerEmail);
      if (user) {
        await this.userService.updateUser((user as any)._id.toString(), { abacatepayCustomerId });
      }
    }
    if (!user) {
      console.error(`Usuário não encontrado para customerId: ${abacatepayCustomerId} ou email: ${customerEmail}`);
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

  }
}