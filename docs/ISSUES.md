## 🧭 **Guia de Criação de Issues — TreinaVagaAI**

> Este documento define o padrão de criação e organização de **issues** no repositório, garantindo clareza, rastreabilidade e consistência no ciclo de desenvolvimento.

---

### 🧩 **1. Tipos de Issue**

As issues são criadas a partir de **templates** no GitHub (`.github/ISSUE_TEMPLATE/`), e se dividem nos seguintes tipos:

| Tipo                                           | Descrição                                                               | Exemplos                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 🐞 **Bug Report (`bug_report.yml`)**           | Relato de erros encontrados em produção ou ambiente de desenvolvimento. | Erro 500 no login, falha ao salvar perfil                          |
| 🌱 **Feature Request (`feature_request.yml`)** | Solicitação de novas funcionalidades, endpoints ou telas.               | Novo módulo de relatórios, integração com API externa              |
| ⚙️ **Task (`task.yml`)**                       | Atividades técnicas, refatorações ou melhorias internas.                | Atualizar dependências, otimizar queries SQL, ajustar build Docker |

---

### 🧭 **2. Estrutura de Título**

Os títulos devem seguir o formato:

```
[escopo] descrição curta e clara
```

Exemplos:

* `[frontend] Corrigir validação de formulário de login`
* `[backend] Implementar refresh token`
* `[infra] Ajustar Dockerfile para build de produção`
* `[bd] Criar índice para otimizar busca de usuários`

---

### 🧩 **3. Labels**

Cada issue deve receber **labels técnicas** para facilitar o filtro e a priorização.
As labels principais são:

| Label      | Cor          | Descrição                           |
| ---------- | ------------ | ----------------------------------- |
| `frontend` | 🟩 `#3FB950` | Relacionada ao app React/Vite       |
| `backend`  | 🟦 `#0969DA` | Relacionada à API Node.js / Java    |
| `bd`       | 🟧 `#F9A825` | Banco de dados, migrations, queries |
| `infra`    | ⚙️ `#6E7781` | Docker, CI/CD, deploy, ambiente     |
| `bug`      | 🟥 `#D73A4A` | Erro de execução ou lógica          |
| `feature`  | 🟪 `#A371F7` | Nova funcionalidade                 |
| `task`     | ⚫ `#000000`  | Atividade técnica interna           |
| `docs`     | 📘 `#0E8A16` | Documentação ou padronização        |

> 💡 *As cores e labels são carregadas automaticamente via `.github/labels.yml` quando configurado.*

---

### 🧱 **4. Estrutura da Issue**

Cada issue deve conter os seguintes blocos no corpo:

1. **Contexto / Descrição**

   * Explica o problema ou objetivo.
2. **Critérios de Aceite**

   * Define quando a issue será considerada concluída.
3. **Tarefas técnicas (opcional)**

   * Lista passo a passo das ações esperadas.
4. **Status / Observações**

   * Observações relevantes, dependências ou links de PRs.

---

### 🧾 **Exemplo — Feature Request**

```markdown
### 💡 Descrição
Implementar autenticação via Google OAuth2 no backend.

### ✅ Critérios de Aceite
- [ ] Rota `/auth/google` funcional
- [ ] Login redireciona corretamente
- [ ] Usuário salvo no banco com provider `google`

### ⚙️ Stack
`backend`, `auth`, `feature`

### 📎 Observações
Referência: https://developers.google.com/identity
```

---

### 🧭 **5. Boas Práticas**

* Sempre **crie a issue antes do desenvolvimento** (exceto documentação retroativa).
* Use **um título claro e objetivo**.
* Mencione **commits e PRs relacionados** com `Closes #ID` ou `Fixes #ID`.
* Marque **responsáveis** (Assignees) e **projetos** quando aplicável.
* **Evite duplicar** issues — pesquise antes.

---

### 🔁 **6. Fluxo de Vida da Issue**

| Status                | Ação                                            | Responsável             |
| --------------------- | ----------------------------------------------- | ----------------------- |
| `Aberta`              | Criada e aguardando início                      | Criador                 |
| `Em andamento`        | Em desenvolvimento                              | Dev responsável         |
| `Em revisão`          | PR aberto e aguardando merge                    | Reviewer                |
| `Concluída`           | PR mergeado na `main`                           | Automático (via PR)     |
| `Fechada manualmente` | Encerrada sem merge (duplicada, inválida, etc.) | Criador / Líder técnico |

---

### 🧩 **7. Exemplo de Commit Linkado à Issue**

```bash
git commit -m "feat(backend): adiciona autenticação OAuth Google (#12)"
```

> O número `#12` faz o link automático com a issue correspondente.

---