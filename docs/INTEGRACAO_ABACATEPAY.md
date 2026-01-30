# Integração AbacatePay no TreinaVagaAI

## Visão Geral
O TreinaVagaAI integra pagamentos recorrentes e avulsos via AbacatePay para facilitar a assinatura de planos pagos pelos usuários. O fluxo garante que o usuário preencha CPF e celular, crie (ou vincule) um cliente na AbacatePay e seja direcionado para o checkout PIX.

## Fluxo de Integração

1. **Seleção do Plano**
   - Usuário escolhe um plano pago na Home.
   - Se não tiver CPF/celular, é solicitado no modal.

2. **Cadastro/Atualização do Usuário**
   - O frontend envia os dados para `/users/profile`.
   - O backend verifica se o usuário já possui um `abacatepayCustomerId`.
   - Se não possuir, cria um cliente na AbacatePay e salva o ID no banco.

3. **Criação da Cobrança**
   - O frontend chama `/plans/:id/pay`.
   - O backend monta o payload e chama a API `/v1/billing/create` da AbacatePay, enviando:
     - `frequency: "ONE_TIME"`
     - `methods: ["PIX"]`
     - `products`: dados do plano
     - `customerId`: ID salvo no usuário
     - `returnUrl` e `completionUrl`: URLs de retorno para o frontend
   - Se sucesso, retorna a URL do checkout AbacatePay para o frontend.

4. **Redirecionamento**
   - O usuário é redirecionado para a tela de pagamento PIX da AbacatePay.

## Detalhes Técnicos

- O campo `abacatepayCustomerId` é salvo na tabela de usuários.
- O backend busca o usuário completo no banco ao validar o JWT, garantindo que o ID esteja disponível em `req.user`.
- O método de pagamento padrão é apenas PIX ("CARD" pode ser habilitado futuramente).
- O token da AbacatePay deve ser configurado na variável de ambiente `ABACATEPAY_TOKEN`.

## Endpoints Envolvidos

- `PUT /users/profile` — Atualiza dados do usuário e cria cliente na AbacatePay se necessário.
- `POST /plans/:id/pay` — Cria cobrança e retorna URL do checkout AbacatePay.

## Observações
- Se a loja não estiver habilitada para cartão, o backend envia apenas `methods: ["PIX"]`.
- O campo `abacatepayCustomerId` agora é retornado no DTO de profile.
- O frontend só permite seguir para o pagamento se CPF e celular estiverem preenchidos.

## Exemplo de Payload para AbacatePay
```json
{
  "frequency": "ONE_TIME",
  "methods": ["PIX"],
  "products": [
    {
      "externalId": "plan-uuid",
      "name": "Plano Mensal",
      "description": "Assinatura mensal do TreinaVagaAI",
      "quantity": 1,
      "price": 9900
    }
  ],
  "returnUrl": "https://treinavagaai.app/dashboard",
  "completionUrl": "https://treinavagaai.app/dashboard",
  "customerId": "cust_abc123"
}
```

## Referências
- [API AbacatePay - Criar Cobrança](https://docs.abacatepay.com/pages/payment/create)
- [AbacatePay - Documentação Oficial](https://docs.abacatepay.com/)
