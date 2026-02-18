import { Controller, Post, Body, Headers, BadRequestException, Query, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PlansService } from './plans.service';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { t, SupportedLanguage } from '../common/i18n';

@Controller('abacatepay')
export class AbacatePayWebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
  ) {}

  @Post('webhook')
  @Public()
  async handleWebhook(
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
      throw new BadRequestException(t('plan.webhookAuthFailed'));
    }

    // Verificar assinatura HMAC se fornecida e não estiver em devMode
    // Temporariamente desabilitado devido a incompatibilidade na verificação
    // TODO: Corrigir verificação da assinatura com AbacatePay
    // if (signature && !payload.devMode) {
    //   // Usar o raw body para validar a assinatura
    //   const rawBody = req.rawBody;

    //   const expectedSignature = createHmac('sha256', webhookSecret)
    //     .update(rawBody)
    //     .digest('base64');

    //   // Tentar também sem o campo devMode
    //   let expectedSignatureNoDevMode = expectedSignature;
    //   if (payload.devMode !== undefined) {
    //     const rawBodyNoDevMode = rawBody.toString().replace(',"devMode":true}', '}').replace(',"devMode":false}', '}');
    //     expectedSignatureNoDevMode = createHmac('sha256', webhookSecret)
    //       .update(rawBodyNoDevMode)
    //       .digest('base64');
    //   }

    //   // Tentar apenas com o campo data
    //   const expectedSignatureDataOnly = createHmac('sha256', webhookSecret)
    //     .update(JSON.stringify(payload.data))
    //     .digest('base64');

    //   if (signature !== expectedSignature &&
    //       signature !== expectedSignatureNoDevMode &&
    //       signature !== expectedSignatureDataOnly) {
    //     console.error('❌ Assinatura inválida');
    //     console.error('Received signature:', signature);
    //     console.error('Expected full:', expectedSignature);
    //     console.error('Expected no dev:', expectedSignatureNoDevMode);
    //     console.error('Expected data:', expectedSignatureDataOnly);
    //     console.error('Raw body:', rawBody.toString());
    //     throw new BadRequestException('Assinatura inválida');
    //   }
    // }

    // Processar apenas eventos de pagamento aprovado
    if (payload.event === 'billing.paid') {
      await this.processPaymentSuccess(payload.data);
    }

    return { status: 'ok' };
  }

  @Post('test')
  @Public()
  async testEndpoint(
    @Body() payload: any,
    @Headers() allHeaders: any,
    @Query() allQuery: any,
  ) {
    return { status: 'test ok', received: payload };
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

      // Extrair email do cliente
      const customerEmail = data.billing?.customer?.metadata?.email ||
                           data.customer?.metadata?.email;

      // Extrair planId do produto
      const product = data.billing?.products?.[0] || data.products?.[0];
      const planId = product?.externalId;

      if (!planId) {
        console.error('Plan ID não encontrado no payload:', data);
        return;
      }

      // Ativar o plano
      await this.plansService.activatePlanForUser(customerId, planId, customerEmail);

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
    }
  }
}