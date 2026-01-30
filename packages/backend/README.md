# TreinaVagaAI Backend

Backend API do sistema TreinaVagaAI desenvolvido com NestJS, TypeScript e MongoDB.

## 🏗️ Arquitetura

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de dados**: MongoDB
- **ODM**: Mongoose
- **Autenticação**: Passport (Google OAuth + JWT)
- **Documentação**: Swagger/OpenAPI

## 📁 Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── user/                 # Módulo de usuários
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── address.controller.ts
│   ├── address.service.ts
│   ├── schemas/          # Mongoose schemas
│   │   ├── user.schema.ts
│   │   └── address.schema.ts
│   └── user.module.ts
├── database/             # Configuração do banco
│   └── database.module.ts
├── app.controller.ts     # Controller principal
├── app.service.ts        # Service principal
├── app.module.ts         # Módulo principal
└── main.ts              # Bootstrap da aplicação
```

## 🔐 Autenticação

### Fluxo OAuth com Google

1. `GET /auth/google` - Inicia fluxo OAuth
2. `GET /auth/google/callback` - Callback do Google
3. `POST /auth/logout` - Logout do usuário
4. `POST /auth/refresh` - Refresh do JWT token

### Proteção de Rotas

Use o guard `@UseGuards(JwtAuthGuard)` para proteger endpoints:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
getProfile(@Request() req) {
  return req.user;
}
```

## 🗄️ Banco de Dados

### Schemas (MongoDB/Mongoose)

- **User**: Informações do usuário (id, googleId, email, name, picture, role, active)
- **Address**: Endereços do usuário

### Configuração

O MongoDB é configurado via variável de ambiente `MONGODB_URI` no arquivo `.env`.

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/treinavagaai?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Application
NODE_ENV=development
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Admin emails (comma separated)
ADMIN_EMAILS=admin@example.com
```

## 🚀 Scripts Disponíveis

- `pnpm dev` - Inicia em modo desenvolvimento
- `pnpm build` - Build de produção
- `pnpm start:prod` - Inicia em modo produção
- `pnpm test` - Executa testes
- `pnpm lint` - Executa ESLint