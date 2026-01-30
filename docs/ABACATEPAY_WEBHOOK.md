# Integração Webhook AbacatePay – TreinaVagaAI

## Visão Geral

O backend do TreinaVagaAI expõe um endpoint público para receber notificações de eventos de pagamento da AbacatePay. O principal objetivo é ativar automaticamente o plano do usuário assim que o pagamento for confirmado.

---

## 1. URL do Webhook

- **Endpoint:** `POST /abacatepay/webhook`
- **Exemplo completo:** `https://dev.treinavagaai.app/abacatepay/webhook`

---

## 2. Segurança e Validação

O webhook implementa duas camadas de validação:

### a) Assinatura HMAC (recomendada)
- O header `X-Webhook-Signature` deve conter o HMAC-SHA256 (base64) do corpo bruto da requisição, usando o segredo configurado (`ABACATEPAY_WEBHOOK_SECRET`).
- O backend lê o corpo bruto (raw bytes) e valida a assinatura usando `crypto.timingSafeEqual`.
- Se a assinatura for inválida, o backend retorna 401, exceto se o fallback abaixo for aceito.

### b) Fallback: Secret na URL (compatibilidade)
- Se o header de assinatura não for enviado ou for inválido, o backend aceita o parâmetro de query `?webhookSecret=SEU_SECRET`.
- Se o secret bater com o valor da env, o webhook é aceito (log de compatibilidade).

---

## 3. Eventos Suportados

- `billing.paid` (principal): ativa o plano do usuário.
- Outros eventos são ignorados ou reservados para uso futuro.

---

## 4. Fluxo de Processamento do Evento `billing.paid`

1. **Recepção:** O backend recebe o payload do AbacatePay.
2. **Extração de Dados:**
   - O código busca o `customerId` em múltiplos lugares do payload (ex: `data.billing.customer.id`, `data.customerId`, etc).
   - Também extrai o `planId` (normalmente em `products[].externalId`).
3. **Lookup de Usuário:**
   - Tenta encontrar o usuário pelo campo `abacatepayCustomerId` (exato, sem prefixo, parcial).
   - Se não encontrar, tenta pelo email presente em `metadata` do customer.
   - Se encontrar pelo email, atualiza o `abacatepayCustomerId` do usuário para o novo ID recebido.
4. **Ativação do Plano:**
   - Busca o plano pelo `planId`.
   - Chama `subscribeToPlan(user.id, plan)` para ativar o plano, marcar como ativo, definir validade e status de pagamento.
5. **Retorno:**
   - Sempre retorna HTTP 200 OK para evitar retries desnecessários.

---

## 5. Resiliência e Fallbacks

- O sistema é tolerante a variações de payload e IDs.
- Se o usuário não for encontrado por ID, tenta por email e atualiza o ID.
- Se o plano não for encontrado, loga e ignora o evento.

---

## 6. Recomendações de Produção

- **Idempotência:** Recomenda-se implementar persistência do `body.id` do evento para evitar processar o mesmo evento duas vezes.
- **Logs:** Todos os logs de debug foram removidos. Apenas erros críticos são registrados.
- **Segredo:** O segredo do webhook deve ser mantido seguro e nunca exposto em logs.

---

## 7. Como Configurar na AbacatePay

1. No dashboard da AbacatePay, acesse a seção de Webhooks.
2. Cadastre a URL: `https://dev.treinavagaai.app/abacatepay/webhook`
3. Defina o segredo igual ao valor de `ABACATEPAY_WEBHOOK_SECRET` no backend.
4. Selecione o evento `billing.paid`.

---

## 8. Exemplo de Payload Recebido

```json
{
  "id": "evt_...",
  "event": "billing.paid",
  "data": {
    "billing": {
      "customer": {
        "id": "cust_...",
        "metadata": {
          "email": "...",
          "name": "..."
        }
      },
      "products": [
        { "externalId": "..." }
      ]
    },
    "payment": { ... }
  },
  "devMode": true
}
```

---

## 9. Referências
- [Documentação oficial AbacatePay Webhooks](https://docs.abacatepay.com/pages/webhooks)
- Código: `src/plans/abacatepay-webhook.controller.ts`, `src/user/user.service.ts`

---

Dúvidas? Fale com o time TreinaVagaAI.
