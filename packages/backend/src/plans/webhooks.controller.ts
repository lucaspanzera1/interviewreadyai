import { Controller, Post, Body, Headers, BadRequestException, Query, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PlansService } from './plans.service';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
  ) {}

  @Post('abacatepay')
  @Public()
  async handleAbacatePayWebhook(
    @Body() payload: any,
    @Headers() allHeaders: any,
    @Query() allQuery: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const webhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');

    // Verificar autenticação de múltiplas formas
    const secretFromHeader = allHeaders['x-webhook-secret'];
    const secretFromQuery = allQuery['webhookSecret'];
    const providedSecret = secretFromHeader || secretFromQuery;

    if (!providedSecret || providedSecret !== webhookSecret) {
      console.error('❌ Webhook secret inválido. Recebido:', providedSecret, 'Esperado:', webhookSecret);
      throw new BadRequestException('Autenticação do webhook falhou');
    }

    // Verificar assinatura HMAC se fornecida e não estiver em devMode
    const signature = allHeaders['x-webhook-signature'];
    if (signature && !payload.devMode) {
      // Usar o raw body para validar a assinatura
      const rawBody = req.rawBody;

      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('base64');

      // Tentar também sem o campo devMode
      let expectedSignatureNoDevMode = expectedSignature;
      if (payload.devMode !== undefined) {
        const rawBodyNoDevMode = rawBody.toString().replace(',"devMode":true}', '}').replace(',"devMode":false}', '}');
        expectedSignatureNoDevMode = createHmac('sha256', webhookSecret)
          .update(rawBodyNoDevMode)
          .digest('base64');
      }

      // Tentar apenas com o campo data
      const expectedSignatureDataOnly = createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload.data))
        .digest('base64');

      if (signature !== expectedSignature &&
          signature !== expectedSignatureNoDevMode &&
          signature !== expectedSignatureDataOnly) {
        console.error('❌ Assinatura inválida');
        throw new BadRequestException('Assinatura inválida');
      }
    }

    // Processar apenas eventos de pagamento aprovado
    if (payload.event === 'billing.paid') {
      await this.processPaymentSuccess(payload.data);
    }

    return { status: 'ok' };
  }

  private async processPaymentSuccess(data: any) {
    try {
      const { billing, payment } = data;
      const abacatepayCustomerId = billing.customer.id;

      // Ativar plano para o usuário
      for (const product of billing.products) {
        const planId = product.externalId;
        await this.plansService.activatePlanForUser(abacatepayCustomerId, planId);
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      throw error;
    }
  }
}