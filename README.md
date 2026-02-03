# TreinaVaga 🤖

> **Transforme o link de uma vaga em um simulado técnico personalizado em segundos.**
> 🔗 Acesse agora: **[treinavaga.tech](https://treinavaga.tech)**

![TreinaVaga](https://www.treinavaga.tech/banner.png)

O **TreinaVaga** é um Micro-SaaS focado em desenvolvedores que acabaram de conseguir uma entrevista, mas sentem aquela insegurança com a stack técnica. A plataforma utiliza IA para ler os requisitos da vaga e gerar um Quiz de avaliação e um deck de Flashcards (estilo Anki) para garantir que você não "trave" na hora do papo com o recrutador.

---

## 🚀 Como rodar em Desenvolvimento

Siga os passos abaixo para preparar o ambiente e rodar o projeto localmente.

![Preview](https://www.treinavaga.tech/demo.png)

### Pré-requisitos

*   **Node.js**: >=18.0.0
*   **PNPM**: >=8.0.0
*   **Docker** (necessário para rodar o MongoDB e outros serviços auxiliares)

### 1. Instalação e Configuração

Para instalar as dependências, configurar as variáveis de ambiente iniciais e subir os containers docker, rode:

```bash
pnpm setup
```

Este comando executa em sequência:
1.  `pnpm install`: Instala as dependências do monorepo.
2.  `pnpm setup:env`: Script utilitário que ajuda na configuração dos `.env`.
3.  `pnpm docker:up`: Sobe os containers necessários (MongoDB, etc) via Docker Compose.

### 2. Rodando a Aplicação

Para iniciar o ambiente de desenvolvimento (Backend + Frontend):

```bash
pnpm dev
```

> Alternativamente, se preferir ver os containers subindo junto com os logs em um único comando: `pnpm dev:simple`

Outros comandos úteis:
*   `pnpm dev:backend`: Roda apenas o Backend.
*   `pnpm dev:frontend`: Roda apenas o Frontend.
*   `pnpm docker:down`: Para os containers do Docker.

---

## ☁️ Rodando em Produção

A arquitetura de produção utiliza Cloudflare para DNS, SSL e Proxy Reverso (via Tunnel), garantindo segurança e acessibilidade sem expor portas diretamente na VPS.

![Preview](https://www.treinavaga.tech/proxy.png)

### 1. DNS e Cloudflare

O projeto espera que os seguintes domínios estejam configurados e apontando para o seu servidor (via Cloudflare Tunnel ou Proxy tradicional):

| Domínio | Serviço | Descrição |
| :--- | :--- | :--- |
| `app.treinavaga.tech` | Proxy | Direciona para o Proxy na Vercel |
| `origin.treinavaga.tech` | Frontend | Aplicação React servida via Vite Preview ou Nginx. |
| `api.treinavaga.tech` | Backend | API NestJS. |

### 2. Cloudflare Tunnel

Utilizamos o **cloudflared** para expor os serviços locais para a internet de forma segura.

Configuração típica do `~/treinavaga-tunnel.yml` do tunnel (exemplo):

```yaml
tunnel: 2b65c54b-99ba-468e-90be-e8b4400efbb7
credentials-file: /Users/lucaspazera/.cloudflared/2b65c54b-99ba-468e-90be-e8b4400efbb7.json

ingress:
  - hostname: origin.treinavaga.tech
    service: http://localhost:8080
  - hostname: api.treinavaga.tech
    service: http://localhost:8081
  - service: http_status:404
```

Para rodar o tunnel:
```bash
cloudflared tunnel --config ~/treinavaga-tunnel.yml run
```

### 3. Configuração de Variáveis (.env.prod)

Para rodar em produção, você **DEVE** criar/configurar os arquivos `.env.prod` em cada pacote.

#### Root e Backend
Variáveis críticas no `packages/backend/.env.prod` ou injetadas no ambiente:

*   `NODE_ENV=production`
*   `FRONTEND_URL=https://app.treinavaga.tech`
*   `BACKEND_URL=https://api.treinavaga.tech`
*   `CORS_ORIGIN=https://app.treinavaga.tech`
*   `COOKIE_DOMAIN=treinavaga.tech` (Importante para login funcionar entre subdomínios)
*   `MONGODB_URI` (Com autenticação ativada)

#### Frontend
No `packages/frontend/.env.prod`:

*   `VITE_API_BASE_URL=https://api.treinavaga.tech` (Aponta diretamente para a API pública, não para localhost)

### 4. Executando em Produção

Para buildar e iniciar a aplicação em modo de produção localmente (ou no servidor):

```bash
pnpm start:prod
```

Este comando realiza:
1.  Build do Backend (`pnpm build:backend`).
2.  Build do Frontend (`pnpm build:frontend`).
3.  Inicia o Backend em modo produção.
4.  Inicia o Frontend em modo **preview** (servindo a pasta `dist` na porta 8080).

### 5. Configurações Adicionais (Vite)

O `vite.config.ts` do frontend está configurado para permitir os hosts de produção no modo preview:

```typescript
preview: {
  allowedHosts: [
    'app.treinavaga.tech',
    '.treinavaga.tech',
    'localhost'
  ],
}
```

