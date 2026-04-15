# TreinaVaga 🤖

> **Transforme o link de uma vaga em um simulado técnico personalizado em segundos.**
> 🔗 Acesse agora: **[treinavaga.tech](https://treinavaga.tech)**
> 
<img src="https://komarev.com/ghpvc/?username=lucaspanzera1&label=Views&color=brightgreen&style=flat&page_id=lucaspanzera1.interviewreadyai" alt="Profile Views" /> <img src="https://img.shields.io/badge/status-descontinuado-red?style=flat" alt="Status: Descontinuado" />

![TreinaVaga](https://www.lucaspanzera.com/interviewready.png)

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

# Cloudflare Tunnel servico

Vou te ajudar a criar um serviço para rodar o cloudflared tunnel no macOS. No macOS, usamos o `launchd` para gerenciar serviços.

## Passo a passo para criar o serviço Treinavagaai

### 1. Primeiro, vamos criar o arquivo de configuração do serviço

Crie o arquivo plist do serviço:

```bash
sudo nano ~/Library/LaunchAgents/com.treinavagaai.cloudflared.plist
```

### 2. Cole o seguinte conteúdo no arquivo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.treinavagaai.cloudflared</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cloudflared</string>
        <string>tunnel</string>
        <string>--config</string>
        <string>/Users/lucaspazera/treinavaga-tunnel.yml</string>
        <string>run</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/Users/lucaspazera/Library/Logs/treinavagaai-stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Users/lucaspazera/Library/Logs/treinavagaai-stderr.log</string>
</dict>
</plist>
```

**Nota:** Se o cloudflared estiver em outro local, você pode encontrá-lo com o comando `which cloudflared` e ajustar o caminho no arquivo.

### 3. Salve o arquivo
- Pressione `Ctrl + O` para salvar
- Pressione `Enter` para confirmar
- Pressione `Ctrl + X` para sair

### 4. Ajuste as permissões do arquivo

```bash
chmod 644 ~/Library/LaunchAgents/com.treinavagaai.cloudflared.plist
```

### 5. Carregue o serviço

```bash
launchctl load ~/Library/LaunchAgents/com.treinavagaai.cloudflared.plist
```

### 6. Comandos úteis para gerenciar o serviço

**Iniciar o serviço:**
```bash
launchctl start com.treinavagaai.cloudflared
```

**Parar o serviço:**
```bash
launchctl stop com.treinavagaai.cloudflared
```

**Descarregar o serviço (desabilitar):**
```bash
launchctl unload ~/Library/LaunchAgents/com.treinavagaai.cloudflared.plist
```

**Verificar o status:**
```bash
launchctl list | grep treinavagaai
```

**Ver os logs:**
```bash
tail -f ~/Library/Logs/treinavagaai-stdout.log
tail -f ~/Library/Logs/treinavagaai-stderr.log
```

### 7. Verificar se está funcionando

Após carregar o serviço, ele deve iniciar automaticamente. Você pode verificar os logs para confirmar:

```bash
tail -20 ~/Library/Logs/treinavagaai-stdout.log
```
# App como servico
Ótimo! Vou criar um serviço para rodar o `pnpm start:prod` no diretório do TreinaVaga.

## Criando o serviço TreinaVaga

### 1. Crie o arquivo de configuração do serviço

```bash
nano ~/Library/LaunchAgents/com.treinavaga.app.plist
```

### 2. Cole o seguinte conteúdo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.treinavaga.app</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/pnpm</string>
        <string>start:prod</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>/Users/lucaspazera/TreinaVaga</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/Users/lucaspazera/Library/Logs/treinavaga-app-stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Users/lucaspazera/Library/Logs/treinavaga-app-stderr.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
```

### 3. Salve o arquivo
- `Ctrl + O` → Enter → `Ctrl + X`

### 4. Ajuste as permissões

```bash
chmod 644 ~/Library/LaunchAgents/com.treinavaga.app.plist
```

### 5. Carregue o serviço

```bash
launchctl load ~/Library/LaunchAgents/com.treinavaga.app.plist
```

### 6. Comandos úteis para gerenciar o serviço

**Verificar status:**
```bash
launchctl list | grep treinavaga
```

**Ver logs em tempo real:**
```bash
tail -f ~/Library/Logs/treinavaga-app-stdout.log
```

**Ver erros:**
```bash
tail -f ~/Library/Logs/treinavaga-app-stderr.log
```

**Parar o serviço:**
```bash
launchctl stop com.treinavaga.app
```

**Iniciar o serviço:**
```bash
launchctl start com.treinavaga.app
```

**Recarregar (após editar o plist):**
```bash
launchctl unload ~/Library/LaunchAgents/com.treinavaga.app.plist
launchctl load ~/Library/LaunchAgents/com.treinavaga.app.plist
```

### 7. Verificar se está funcionando

```bash
tail -20 ~/Library/Logs/treinavaga-app-stdout.log
```
