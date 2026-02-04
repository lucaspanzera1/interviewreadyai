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
    console.log('🔍 Webhook AbacatePay recebido!');
    console.log('  - Todos os headers:', JSON.stringify(allHeaders, null, 2));
    console.log('  - Todos os query params:', JSON.stringify(allQuery, null, 2));
    console.log('  - Payload:', JSON.stringify(payload, null, 2));

    const webhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');
    console.log('  - Webhook secret configurado:', webhookSecret);

    // Verificar autenticação de múltiplas formas
    const secretFromHeader = allHeaders['x-webhook-secret'];
    const secretFromQuery = allQuery['webhookSecret'];
    const providedSecret = secretFromHeader || secretFromQuery;

    console.log('  - Secret do header:', secretFromHeader);
    console.log('  - Secret do query:', secretFromQuery);
    console.log('  - Secret usado:', providedSecret);

    if (!providedSecret || providedSecret !== webhookSecret) {
      console.error('❌ Webhook secret inválido. Recebido:', providedSecret, 'Esperado:', webhookSecret);
      throw new BadRequestException('Autenticação do webhook falhou');
    }

    console.log('✅ Webhook autenticado com sucesso');

    // Verificar assinatura HMAC se fornecida e não estiver em devMode
    const signature = allHeaders['x-webhook-signature'];
    if (signature && !payload.devMode) {
      // Usar o raw body para validar a assinatura
      const rawBody = req.rawBody;
      console.log('  - Raw body para assinatura:', rawBody?.toString());

      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('base64');

      console.log('  - Assinatura esperada (raw body):', expectedSignature);

      // Tentar também sem o campo devMode
      let expectedSignatureNoDevMode = expectedSignature;
      if (payload.devMode !== undefined) {
        const rawBodyNoDevMode = rawBody.toString().replace(',"devMode":true}', '}').replace(',"devMode":false}', '}');
        expectedSignatureNoDevMode = createHmac('sha256', webhookSecret)
          .update(rawBodyNoDevMode)
          .digest('base64');
        console.log('  - Assinatura esperada (sem devMode):', expectedSignatureNoDevMode);
      }

      // Tentar apenas com o campo data
      const expectedSignatureDataOnly = createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload.data))
        .digest('base64');
      console.log('  - Assinatura esperada (apenas data):', expectedSignatureDataOnly);

      console.log('  - Assinatura recebida:', signature);

      if (signature !== expectedSignature &&
          signature !== expectedSignatureNoDevMode &&
          signature !== expectedSignatureDataOnly) {
        console.error('❌ Assinatura inválida');
        throw new BadRequestException('Assinatura inválida');
      }

      console.log('✅ Assinatura HMAC validada com sucesso');
    }

    // Processar apenas eventos de pagamento aprovado
    if (payload.event === 'billing.paid') {
      console.log('🎉 Webhook de pagamento recebido e autenticado:', payload.event);
      await this.processPaymentSuccess(payload.data);
    } else {
      console.log('ℹ️ Webhook recebido (evento não processado):', payload.event);
    }

    return { status: 'ok' };
  }

  private async processPaymentSuccess(data: any) {
    try {
      const { billing, payment } = data;
      const abacatepayCustomerId = billing.customer.id;

      console.log('💰 Processando pagamento bem-sucedido:', {
        billingId: billing.id,
        customerId: abacatepayCustomerId,
        amount: payment.amount,
        products: billing.products,
      });

      // Ativar plano para o usuário
      for (const product of billing.products) {
        const planId = product.externalId;
        await this.plansService.activatePlanForUser(abacatepayCustomerId, planId);
      }

      console.log('✅ Pagamento processado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      throw error;
    }
  }
}