import { Controller, Post, Body, Headers, BadRequestException, Query, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PlansService } from './plans.service';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';

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
    console.log('🔍 Webhook recebido!');
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

  @Post('test')
  @Public()
  async testEndpoint(
    @Body() payload: any,
    @Headers() allHeaders: any,
    @Query() allQuery: any,
  ) {
    console.log('🧪 Endpoint de teste chamado!');
    console.log('  - Headers:', JSON.stringify(allHeaders, null, 2));
    console.log('  - Query params:', JSON.stringify(allQuery, null, 2));
    console.log('  - Payload:', JSON.stringify(payload, null, 2));

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