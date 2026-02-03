import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PlansService } from './plans.service';

@Controller('abacatepay')
export class AbacatePayWebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-secret') secretParam?: string,
  ) {
    const webhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');

    // Verificar assinatura HMAC se fornecida
    if (signature) {
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('base64');

      if (signature !== expectedSignature) {
        throw new BadRequestException('Assinatura inválida');
      }
    } else if (secretParam && secretParam === webhookSecret) {
      // Fallback: verificar parâmetro de query
    } else {
      throw new BadRequestException('Autenticação do webhook falhou');
    }

    // Processar apenas eventos de pagamento aprovado
    if (payload.event === 'billing.paid') {
      await this.processPaymentSuccess(payload.data);
    }

    return { status: 'ok' };
  }

  private async processPaymentSuccess(data: any) {
    try {
      // Extrair customerId de múltiplas possibilidades
      const customerId = data.billing?.customer?.id ||
                        data.customerId ||
                        data.customer?.id;

      if (!customerId) {
        console.error('Customer ID não encontrado no payload:', data);
        return;
      }

      // Extrair planId do produto
      const product = data.billing?.products?.[0] || data.products?.[0];
      const planId = product?.externalId;

      if (!planId) {
        console.error('Plan ID não encontrado no payload:', data);
        return;
      }

      // Aqui você implementaria a lógica para ativar o plano do usuário
      // Por enquanto, apenas log
      console.log(`Pagamento confirmado - Customer: ${customerId}, Plan: ${planId}`);

      // Ativar o plano
      await this.plansService.activatePlanForUser(customerId, planId);

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
    }
  }
}