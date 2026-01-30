# Ativação de Usuários (Fluxo de Login)

Documento curto para explicar o fluxo atual de autenticação e como ativar/desativar usuários diretamente no banco PostgreSQL.

## Visão geral
- O sistema cria usuários automaticamente quando alguém faz login com Google (fluxo `findOrCreateUser`).
- O campo `active` na tabela `users` indica se o perfil está ativo.
- Por configuração atual, novos registros são criados com `active = false` (ou seja, são inativos por padrão).
- Um usuário só poderá efetuar login com sucesso se `active = true`.

## Porque esse fluxo
- Permite controle manual sobre quem pode acessar o sistema, útil em ambientes internos ou durante testes.
- Evita acesso automático de qualquer conta Google a menos que você autorize explicitamente.

## Verificar se a coluna `active` existe
Execute (via Docker ou psql) para checar a estrutura da tabela:

```bash
# via docker
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"
```

## Adicionar a coluna `active` (se necessário)
Se a coluna não existir, adicione com:

```sql
ALTER TABLE users
ADD COLUMN active boolean DEFAULT false;
```

Ou via Docker/psql:

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "ALTER TABLE users ADD COLUMN active boolean DEFAULT false;"
```

> Nota: em ambientes controlados prefira criar uma migration TypeORM em vez de alterar direto em produção.

## Ativar um usuário (por email)
Substitua `usuario@exemplo.com` pelo e‑mail real do usuário:

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "UPDATE users SET active = true WHERE email = 'usuario@exemplo.com';"
```

Verificar o resultado:

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "SELECT id, email, active, created_at, last_login_at FROM users WHERE email = 'usuario@exemplo.com';"
```

## Ativar por id
Se preferir usar o id (UUID):

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "UPDATE users SET active = true WHERE id = '123e4567-e89b-12d3-a456-426614174000';"
```

## Pré-cadastrar um usuário (opcional)
Você pode inserir um usuário manualmente já ativo (útil para testes):

```sql
-- se precisar habilitar extensão UUID (uma vez):
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO users (id, google_id, email, name, picture, role, active, created_at, updated_at)
VALUES (uuid_generate_v4(), 'google-id-123', 'usuario@exemplo.com', 'Nome Exemplo', 'https://foto', NULL, true, now(), now());
```

Ou via Docker:

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; INSERT INTO users (id, google_id, email, name, picture, role, active, created_at, updated_at) VALUES (uuid_generate_v4(), 'google-id-123', 'usuario@exemplo.com', 'Nome Exemplo', 'https://foto', NULL, true, now(), now());"
```

## Desativar / reverter
Para desativar um usuário:

```bash
docker exec -it treinavagaai-postgres psql -U admin -d treinavagaai -c "UPDATE users SET active = false WHERE email = 'usuario@exemplo.com';"
```

## Debug do fluxo de login
- Se o login falhar mesmo com `active = true`, verifique logs do backend (procure por mensagens no `AuthController` / `AuthService`).
- Confirme se o backend redirecionou o callback para o frontend com os tokens (URL `/auth/callback?access_token=...&refresh_token=...`).
- Verifique o console/network do navegador para ver se os tokens chegaram ao frontend.

## Melhoria opcional
- Gerar uma migration TypeORM para adicionar a coluna `active` (recomendado para produção).
- Criar um painel de administração para ativar/desativar usuários em vez de usar SQL manual.
- Implementar e-mails de notificação quando a conta for ativada.

## Segurança
- Em produção, proteja quem pode executar UPDATEs (não use `POSTGRES_HOST_AUTH_METHOD=trust`).
- Faça backup antes de alterações em massa (pg_dump).

---

Se quiser, eu posso:
- Gerar a migration TypeORM para adicionar a coluna `active` (e marcar alguns emails como ativos),
- Ou criar um pequeno script (Node/TS) para ativar um email via CLI,
- Ou adicionar uma nota no README principal apontando para este documento.

Diga qual dessas opções prefere.