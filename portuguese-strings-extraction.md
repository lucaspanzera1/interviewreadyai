# Portuguese Strings Extraction - TreinaVaga Frontend

> **Research Document** — Extracted from `packages/frontend/src/components/` and utility files.
> Note: `BottomNav.tsx` already uses `react-i18next` with `useTranslation()` — it is partially internationalized.

---

## SHARED / RECURRING STRINGS (appear across multiple files)

### Niche Options Array
Used in: `ProfilePage`, `OnboardingModal`, `FreeQuizzesPage`, `UserSearchPage`, `PublicProfilePage`, `UserDetailsModal`
```
'Tecnologia', 'Educação', 'Recursos Humanos', 'Financeiro', 'Saúde',
'Vendas', 'Marketing', 'Jurídico', 'Engenharia', 'Design', 'Produto', 'Outro'
```

### Career Time Options
Used in: `ProfilePage`, `OnboardingModal`, `PublicProfilePage`, `UserDetailsModal`
```
'0-1 ano', '1-3 anos', '3-5 anos', '5-10 anos', '10+ anos'
(UserDetailsModal variant: 'Menos de 1 ano', '1-3 anos', '3-5 anos', '5-10 anos', 'Mais de 10 anos')
```

### Difficulty Labels
Used in: `CreateQuizByLinkPage`, `AdminQuizzesPage`, `UserQuizAttemptDetailsPage`, `CardHistoryModal`, `MyFlashcardsPage`
```
'Iniciante', 'Médio', 'Difícil', 'Expert', 'Fácil', 'Normal'
```

### Navigation Buttons
Used across many files:
```
'Anterior', 'Próxima', 'Próximo', 'Voltar', 'Cancelar', 'Salvar', 'Editar',
'Salvando...', 'Carregando...', 'Gerando...'
```

### Pagination
```
'Mostrando página X de Y', 'Página X de Y', 'Mostrando X de Y resultados'
```

### Common Labels
```
'Ativo', 'Inativo', 'Completo', 'Pendente', 'Gratuito', 'Premium', 'Nunca'
```

### Relative Date Strings
Used in: `MyInterviewsPage`, `MyInterviewAttemptsPage`
```
'Agora mesmo', 'há X min', 'há X h'
```

### Common Toast Patterns
```
'Erro ao ...' (dozens of variants)
'... com sucesso!' (success pattern)
```

---

## FILE-BY-FILE EXTRACTION

---

### 1. ProfilePage.tsx (~1260 lines)

**Page Title:** `'Perfil - TreinaVagaAI'` (~L480)

**Section Headers:**
- `'Informações Pessoais'` (~L565)
- `'Dados de Pagamento'` (~L780)
- `'Dados Profissionais'` (~L895)
- `'Detalhes da Conta'` (~L1020)
- `'Atividades & Conquistas'` (~L1060)
- `'Recompensas'` (~L1135)

**Form Labels:**
- `'Email'` (~L580)
- `'Nome Completo'` (~L595)
- `'Biografia'` (~L615)
- `'Localização'` (~L640)
- `'LinkedIn'` (~L665)
- `'GitHub'` (~L685)
- `'Telefone'` (~L810) with `<span>*</span>`
- `'CPF'` (~L840) with `<span>*</span>`
- `'Área de Atuação'` (~L910)
- `'Experiência na área tech'` / `'Experiência profissional'` (~L960)
- `'Tech Stack'` (~L990)

**Buttons:**
- `'Editar'` (multiple sections ~L570, L785, L900)
- `'Cancelar'` (multiple ~L575, L790, L905)
- `'Salvar'` / `'Salvando...'` (multiple ~L580, L795, L910)
- `'Editar Capa'` (~L490)
- `'Escolher'` (~L498)
- `'Recomendado: 1500x500px'` (~L496)
- `'Configurações'` (~L1220)
- `'Sair da Conta'` (~L1230)

**Display:**
- `'Não informado'` (multiple fallbacks ~L625, L650, L825, L855, L970)
- `'Nenhuma tecnologia selecionada'` (~L1010)
- `'N/A'` (multiple fallbacks)
- `'Selecione...'` (~L935)
- `'Membro desde'` (~L1030)
- `'Plano'` (~L1035)
- `'Administrador'` / `'Gratuito'` / `'Usuário'` (~L1045)
- `'Plano expira em'` (~L1050)
- `'Tokens'` (~L1055)

**Payment Section:**
- `'Necessário para pagamentos via PIX'` (~L830, L860)
- `'Pronto para pagamentos'` / `'Complete seus dados'` (~L875)
- `'Você pode adquirir planos pagos via PIX'` (~L878)
- `'Adicione telefone e CPF para desbloquear pagamentos'` (~L880)

**Activity Section:**
- `'Histórico de Quizzes'` (~L1075)
- `'Veja seu progresso e pontuações'` (~L1078)
- `'Atividades'` (~L1100)
- `'Média Geral'` (~L1105)
- `'Quizzes Gratuitos'` (~L1110)
- `'Sessões Flashcard'` (~L1115)
- `'Quizzes gratuitos feitos'` (~L1145)
- `'Próximo token em X quizzes'` (~L1160)
- `'Histórico de Recompensas'` (~L1170)
- `'Ver completo'` (~L1175)
- `'Nova Conquista'` / `'Plano Ativado'` / `'Pacote'` / `'Recompensa'` (~L1195)
- `'Nenhuma recompensa recebida ainda'` (~L1205)

**Toast Messages:**
- `'Erro ao atualizar informações pessoais'` (~L285)
- `'Erro ao atualizar dados de pagamento'` (~L305)
- `'Erro ao atualizar perfil profissional'` (~L325)
- `'Erro ao atualizar imagem do header'` (~L345)
- `'Por favor, selecione um arquivo de imagem válido'` (~L365)
- `'A imagem deve ter no máximo 5MB'` (~L370)
- `'Erro ao sair'` (~L405)

**Career Options:** `'0-1 ano'`, `'1-3 anos'`, `'3-5 anos'`, `'5-10 anos'`, `'10+ anos'` (~L454-458)
**Niche Options:** (see shared list) (~L461-472)

---

### 2. SettingsPage.tsx

**Page Title:** `'Configurações - TreinaVagaAI'`

**Section Headers:**
- `'Aparência'`
- `'Notificações'`
- `'Privacidade do Perfil'`
- `'Segurança & Conta'`
- `'Zona de Perigo'`

**Theme Labels:**
- `'Tema do Sistema'` — description about auto theme
- `'Tema Claro'` / `'Tema Escuro'`
- Theme variant labels: `'Azul Profissional'`, `'Laranja Vibrante'` (both light/dark)

**Toggle Labels:**
- `'Notificações Push'` / `'Receba alertas sobre novos quizzes e resultados'`
- `'Email Marketing'` / `'Receba dicas e novidades por email'`
- `'Som de Notificação'` / `'Toque sonoro ao receber notificações'`
- `'Perfil Público'` / description about profile visibility
- `'Em Desenvolvimento'` badge

**Account Section:**
- `'Excluir Conta'`
- `'Ao excluir, todos os seus dados serão permanentemente removidos...'`
- `'Excluir minha conta permanentemente'`
- Confirmation dialog text

**Toasts:**
- `'Perfil atualizado para público/privado com sucesso!'`
- `'Erro ao atualizar privacidade do perfil'`

---

### 3. TokensPage.tsx

**Page Title:** `'Créditos - TreinaVagaAI'`

**Headers/Labels:**
- `'Créditos'`
- `'Saldo'`
- `'Simulados Gratuitos'`
- `'X de 3 simulados usados hoje'` / `'X restantes'`
- `'Turbine seus estudos'`
- `'Pacotes Sugeridos'`
- `'Em Desenvolvimento'`
- `'Ganhe créditos extras completando desafios'`
- Plan card labels: `'tokens'`, `'Assinar'` / `'Atual'`
- Plan features list items (Portuguese)

---

### 4. CreateQuizByLinkPage.tsx (~830 lines)

**Page Title:** `'Criar Quiz com IA'` / `'Criar Quiz com IA - TreinaVagaAI'`

**Main Page:**
- `'Por Vaga de Emprego'` — `'Gere um quiz baseado em uma vaga real'`
- `'Por Tema Personalizado'` — `'Crie quizzes sobre qualquer assunto'`
- `'Custa 1 Token'` badge
- `'Inteligência Artificial'` — `'Perguntas geradas baseadas exatamente no que a vaga pede, aumentando suas chances.'`
- `'Evolução'` — `'Acompanhe seu desempenho e identifique pontos de melhoria antes da entrevista real.'`
- `'Não gostou do quiz gerado?'` — `'Fale conosco no WhatsApp'`

**Step Names:** `'Básico'`, `'Configuração'`, `'Revisão'`
**Step Labels:** `'Passo X de Y'`

**Job URL Form:**
- `'Cole o Link da Vaga *'`
- Placeholder: `'https://www.linkedin.com/jobs/...'`
- `'Quantidade de Questões'` with range labels `'1 questão'` / `'20 questões'`
- `'Gerar Quiz com IA'` / `'Gerando...'`
- `'Dica: Cole o link da vaga do LinkedIn, Indeed, etc.'`

**Theme Quiz Modal:**
- `'Criar Quiz Personalizado'`
- `'Título do Quiz *'` — placeholder: `'Ex: Marketing Digital, Anatomia Humana, História da Arte...'`
- `'Categoria *'` — placeholder: `'Ex: Negócios, Saúde, Artes, Tecnologia...'`
- `'Descrição *'` — placeholder: `'Descreva o objetivo e os principais tópicos que serão abordados neste quiz...'`
- `'Nível de Dificuldade'`
- `'Quantidade de Questões'`
- `'Contexto Adicional (IA)'` — `'Opcional'`
- Placeholder: `'Cole aqui um texto, artigo ou documentação para a IA usar como base...'`
- `'Tags Relacionadas'` — `'Digite uma tag e pressione Enter'` — `'Adicionar'`
- `'Nenhuma tag adicionada'` — `'Tags ajudam a categorizar seu quiz'`
- `'Pronto para gerar!'` — description text
- `'Voltar'` / `'Próximo'` / `'Gerar Quiz'` / `'Gerando...'`

**Toasts:**
- `'Erro: O campo de URL é obrigatório.'`
- `'Erro: Insira uma URL válida.'`
- `'Quiz gerado com sucesso!'`
- Various error toasts

---

### 5. GeneratedQuizPage.tsx

**Page Title:** `'Resultado do Quiz - TreinaVagaAI'`

**Results:**
- `'Resultado do Quiz'`
- Result messages: `'Excelente! Você mandou muito bem!'` / `'Bom trabalho! Continue praticando!'` / `'Não desista! Pratique mais e volte para tentar novamente!'`
- `'Revisão das Questões'`
- `'Explicação:'`
- `'Voltar'` / `'Refazer Quiz'`

**Quiz Play:**
- `'Questão X de Y'`
- `'Finalizar Quiz'` / `'Próxima Questão'`

---

### 6. FlashcardStudyPage.tsx

**Difficulty Buttons:** `'Errei'`, `'Difícil'`, `'Bom'`, `'Fácil'`

**SRS Info Modal:**
- `'Como funciona o SRS?'`
- `'Repetição Espaçada (SRS)'`
- Description paragraph about spaced repetition
- Difficulty explanations for each button
- `'Entendi!'`

**Progress/Labels:**
- `'Cartão X de Y'`
- `'Virar'`
- `'Completados: X/Y'`
- `'Sessão concluída! 🎉'`
- `'Todos os X cards foram revisados'`
- `'Voltar aos Flashcards'`
- `'Revisar Novamente'`

---

### 7. CreateFlashcardByLinkPage.tsx

**Page Title:** `'Criar Flashcards com IA - TreinaVagaAI'`

**Form Labels:**
- `'Cole o Link da Vaga *'`
- Placeholder: `'https://www.linkedin.com/jobs/...'`
- `'Dificuldade'` — options: `'Fácil'`, `'Médio'`, `'Difícil'`
- `'Quantidade de Cards'` — with range `'5 cards'` / `'30 cards'`
- `'Gerar Flashcards com IA'` / `'Gerando...'`
- `'Dica: Cole o link completo da vaga...'`
- `'Custa 1 Token'` badge

**Toasts:**
- `'URL é obrigatória'`
- `'URL inválida'`
- Error messages

---

### 8. FreeQuizzesPage.tsx

**Page Title:** `'Explorar - TreinaVagaAI'`

**Headers:**
- `'Explorar Quizzes'`
- `'Descubra e pratique com quizzes gratuitos da comunidade'`

**Filter Labels:**
- `'Todos'`
- Niche options (shared list)

**Daily Limit Messages:**
- `'Limite diário de 3 quizzes atingido. Volte amanhã! 🎉'`
- `'Simulados gratuitos restantes hoje:'`
- `'Recompensa: Complete 5 quizzes gratuitos para ganhar 1 Token! 🎁'`

**Card Labels:**
- `'questões'` count
- `'Grátis'` badge
- `'Jogar'` button

**Empty State:**
- `'Nenhum quiz encontrado'`
- `'Tente ajustar os filtros.'`

**Search:**
- `'Buscar por título ou categoria...'` placeholder

---

### 9. CreateInterviewPage.tsx

**Page Title:** `'Simulação de Entrevista com IA - TreinaVagaAI'`

**Loading Messages:** (array of rotating messages)
- `'Analisando a vaga e seus requisitos...'`
- `'Preparando as melhores perguntas...'`
- `'Personalizando a entrevista para você...'`
- `'Finalizando a simulação...'`

**Form:**
- `'Cole o Link da Vaga *'` — placeholder
- `'Tipo de Entrevista'` — `'Técnica'`, `'Comportamental'`, `'Mista'`
- Type descriptions for each
- `'Nível de Experiência'` — `'Júnior'`, `'Pleno'`, `'Sênior'`
- `'Duração Estimada'` — `'X min'` labels
- `'Gerar Entrevista com IA'` / `'Gerando Entrevista...'`
- `'Custa 1 Token'` badge
- `'Dica: Cole o link completo da vaga...'`

**Toasts:**
- `'URL é obrigatória!'`
- `'Insira uma URL válida.'`
- `'Entrevista gerada com sucesso! 🎯'`
- Error messages

---

### 10. InterviewPlayPage.tsx

**Question Type Labels:** `'Técnica'`, `'Comportamental'`, `'Situacional'`

**UI:**
- `'Questão X de Y'`
- `'Digite sua resposta aqui...'` placeholder
- `'Responder'` / `'Próxima Questão'` / `'Finalizar Entrevista'`
- `'Carregando...'`

**Completion:**
- `'Entrevista Concluída! 🎉'`
- `'Parabéns por completar a simulação.'`
- `'Dificuldade da Entrevista:'` — `'1 - Muito Fácil'` to `'5 - Muito Difícil'`
- `'Ver Minhas Simulações'`
- `'Enviar Avaliação'`

---

### 11. InterviewVideoRecorderPage.tsx (~540 lines)

**Permission Messages:**
- `'Câmera e microfone necessários'` (title)
- `'Permita o acesso para gravar suas respostas em vídeo.'`
- `'Permitir Acesso'`

**Recording UI:**
- `'Finalizar'` button (~L530)
- `'Próxima'` button (~L537)

**Error Messages:**
- Permission denied errors
- Recording errors

---

### 12. VideoTimelineAnalysisPage.tsx (~760 lines)

**Note:** This page is mostly in English (analysis UI). Portuguese strings are minimal.

**English strings that could be translated:**
- `'Initializing Analysis Engine'`, `'Decryption and biometric processing in progress...'`
- `'Key Strengths'`, `'Areas for Growth'`, `'Analysis Notes'`
- `'Video Segment X'`, `'Question X'`
- `'Analyzing Interview'`, `'Return to Dashboard'`
- `'Analysis Failed'`
- `'No moments found for this filter.'`
- Tab labels: `'Timeline'`, `'Summary'`, `'Videos'`
- Filter labels: `'All'`, `'Highlights'`, `'Tips'`, `'Warnings'`

---

### 13. GeneratedInterviewPage.tsx (~569 lines)

**Mode Selection:**
- `'Escolha o modo de simulação ideal para você.'`
- `'Modo Vídeo'` — `'Recomendado para melhor feedback'`
- `'Modo Texto'` — `'Responda via chat'`

**Info:**
- `'Histórico de Tentativas'`
- `'Ao iniciar, o tempo começará a contar.'`

**Section Headers/Labels:**
- Interview details display
- `'perguntas'`, `'min'` duration labels
- Type labels: `'Técnica'`, `'Comportamental'`, `'Mista'`
- Level labels: `'Júnior'`, `'Pleno'`, `'Sênior'`

**Toasts:**
- Loading/error messages for interview start

---

### 14. OnboardingModal.tsx

**Step Titles/Descriptions:**
- Step 1: `'Bem-vindo ao TreinaVagaAI!'` — `'Antes de começar, queremos personalizar sua experiência...'`
- Step 2: `'Sua área de atuação'` — `'Selecione a área que melhor descreve sua carreira...'`
- Step 3: `'Seu tempo de carreira'`
- Step 4: (Tech Stack for tech niche)
- Step 5: `'Tudo pronto! 🎉'` — `'Seu perfil está configurado...'`

**Form Labels:**
- `'Nome'`, `'Email'`
- `'Selecione sua área'` (niche selection)
- Career time option labels (shared)

**Buttons:**
- `'Próximo'`, `'Voltar'`, `'Começar a Treinar!'`, `'Pular'`

**Niche/Career Arrays:** (shared list)

---

### 15. OnboardingGuide.tsx

**Feature Descriptions (tour steps):**
- `'Criar Quiz'` — `'Crie quizzes personalizados com IA...'`
- `'Explorar'` — `'Descubra quizzes gratuitos da comunidade...'`
- `'Flashcards'` — `'Estude com cartões inteligentes...'`
- `'Simulação'` — `'Pratique entrevistas com IA...'`
- `'Evolução'` — `'Acompanhe seu progresso...'`

**Buttons:** `'Próximo'`, `'Anterior'`, `'Entendi!'`, `'Pular Tour'`
**Badge:** `'NOVO'`

---

### 16. MyQuizzesPage.tsx

**Page Title:** `'Meus Quizzes - TreinaVagaAI'`

**Headers:**
- `'Meus Quizzes'`
- `'Gerencie e acesse todos os quizzes que você criou.'`
- `'Novo Quiz'`

**Empty State:**
- `'Comece sua Jornada'`
- `'Você ainda não criou nenhum quiz...'`
- `'Criar Primeiro Quiz'`

**Card Labels:**
- `'questões'`, `'Jogar'`, `'Detalhes'`
- `'Nova'` badge

**Help Section:**
- `'Dúvidas sobre Quizzes?'`
- `'Como funcionam os Quizzes?'`
- Description text about quiz functionality
- `'Precisa de ajuda? Fale com nosso suporte'`

---

### 17. MyInterviewsPage.tsx (~300 lines)

**Page Title:** `'Minhas Simulações - TreinaVagaAI'`

**Headers:**
- `'Minhas Simulações'` (~L50)
- `'Acompanhe seu progresso e continue praticando para conquistar sua vaga dos sonhos.'` (~L52)
- `'Nova Simulação'` (~L55)

**Loading:** `'Carregando suas simulações...'` (~L80)

**Empty State:**
- `'Comece sua Jornada'` (~L90)
- `'Você ainda não criou nenhuma simulação...'` (~L92)
- `'Criar Primeira Simulação'` (~L95)

**Card Labels:**
- `'Técnica'` / `'Comportamental'` / `'Mista'` (~L110)
- `'perguntas'`, `'tentativas'` (~L120)
- `'Nova'` badge, `'Praticar'`, `'Detalhes'` (~L125-130)

**Pagination:** `'Anterior'`, `'Próxima'` (~L140)

**Help Section:**
- `'Dúvidas sobre Simulações?'` (~L150)
- `'Como funcionam as Simulações?'` (~L152)
- Help description text (~L155)
- `'Precisa de ajuda? Fale com nosso suporte'` (~L160)

**Toasts:**
- `'Esta simulação não está disponível ou não tem perguntas.'` (~L170)
- `'Simulação iniciada! Boa sorte! 🎯'` (~L175)
- `'Erro ao iniciar a simulação.'` (~L180)

---

### 18. MyInterviewAttemptsPage.tsx (~320 lines)

**Page Title/Header:**
- `'Tentativas de Vídeo'` (~L45)
- `'Acompanhe suas gravações de vídeo...'` (~L48) (dynamic with interview title)
- `'Atualizar'` (~L55)

**Loading:** `'Carregando suas tentativas...'` (~L80)

**Empty State:**
- `'Nenhuma Tentativa Ainda'` (~L90)
- `'Você ainda não fez nenhuma tentativa com vídeo...'` (~L92)
- `'Voltar para Simulação'` / `'Ver Minhas Simulações'` (~L95-97)

**Status Labels:**
- `'Análise Completa'` / `'Processando Vídeo'` / `'Análise com Erros'` / `'Aguardando Análise'` (~L110)

**Card Labels:**
- `'Simulação de Entrevista'` (fallback) (~L120)
- `'Pontos Fortes'` (~L125)
- `'itens'` (~L128)
- `'+X mais...'` (~L130)
- `'Ver Análise'` / `'Refazer'` (~L135)

**Pagination:** `'Anterior'` / `'Próxima'` (~L145)

**Toasts:**
- `'Tentativas atualizadas'` (~L150)
- `'Erro ao carregar tentativas'` (~L155)

---

### 19. MyFlashcardsPage.tsx (~310 lines)

**Page Title:** `'Meus Flashcards - TreinaVagaAI'` (~L40)

**Headers:**
- `'Meus Flashcards'` (~L45)
- `'Gerencie e estude os flashcards que você criou.'` (~L48)
- `'Criar Novos Flashcards'` / `'Criar'` (~L52)
- `'BETA'` badge (~L55)

**Empty State:**
- `'Nenhum flashcard criado ainda'` (~L65)
- `'Crie seus primeiros flashcards baseados em vagas de emprego...'` (~L68)
- `'Criar Primeiro Flashcard'` (~L70)

**Card Labels:**
- `'Fácil'` / `'Médio'` / `'Difícil'` levels (~L80)
- `'Estudados'` / `'Tempo'` / `'Revisões'` (~L85)
- `'Último estudo:'` / `'Criado em'` (~L90)
- `'Estudar'` / `'Carregando...'` (~L95)

**Help Section:**
- `'Dúvidas sobre Flashcards?'` (~L100)
- `'Como funcionam os Flashcards?'` (~L102)
- SRS explanation text (~L105)
- `'Precisa de ajuda? Fale com nosso suporte'` (~L110)

**Toasts:**
- `'Iniciando sessão de estudo! 📚'` (~L115)
- `'Erro ao iniciar o estudo.'` (~L120)

---

### 20. AdminUsers.tsx (~500 lines)

**Page Title:** `'Gestão de Usuários'` (~L30)

**Stat Cards:**
- `'Total de Usuários'` — `'Cadastrados na plataforma'` (~L50)
- `'Alunos / Clientes'` — `'Usuários padrão'` (~L55)
- `'Administradores'` — `'Permissão total'` (~L60)

**Section:**
- `'Usuários'` (~L70)
- `'Gerencie e monitore os membros da plataforma'` (~L72)

**Search:** `'Buscar por nome ou email...'` (~L80)

**Table Headers:**
- `'Usuário'` / `'Status'` / `'Onboarding'` / `'Último Acesso'` / `'Cadastro'` / `'Ações'` (~L90)

**Labels:**
- `'Completo'` / `'Pendente'` (onboarding) (~L100)
- `'Nunca'` (last login) (~L105)
- `'Ver detalhes'` (title attr) (~L110)

**Loading:** `'Carregando usuários...'` / `'Carregando mais...'` (~L115)
**Empty:** `'Nenhum usuário encontrado.'` (~L120)
**Footer:** `'Mostrando X de Y resultados'` (~L125)

**Toast:** `'Erro ao buscar usuários.'` (~L35)

---

### 21. AdminQuizzesPage.tsx (~732 lines)

**Page Title:** `'Gerenciar Quizzes'` (~L30)
**Description:** `'Administre todos os quizzes disponíveis na plataforma'` (~L32)

**Buttons:** `'Criar Quiz'` (~L35)
**Search:** `'Buscar por título, categoria ou criador...'` (~L40)
**Filters:** `'Todos os Status'` / `'Ativos'` / `'Inativos'` (~L45)

**Table Headers:**
- `'Quiz Detalhes'` / `'Criador'` / `'Analytics'` / `'Status'` / `'Ações'` (~L60)

**Card Labels:**
- `'questões'` (~L70)
- `'Acessos'` / `'Concluídos'` / `'Média'` (~L75)
- `'Ativo'` / `'Inativo'` (~L80)

**Empty:** `'Nenhum quiz encontrado'` — `'Tente ajustar os filtros de busca.'` (~L85)
**Pagination:** `'Mostrando página X de Y'`, `'Anterior'` / `'Próxima'` (~L90)

**Create Modal (lines 500-732):**
- `'Criar Novo Quiz'` (~L505)
- `'Passo X de Y'` (~L508)
- Steps: `'Básico'` / `'Configuração'` / `'Revisão'` (~L510)
- `'Título do Quiz *'` — placeholder: `'Ex: Fundamentos do React 2024'`
- `'Categoria *'` — placeholder: `'Ex: Frontend, Backend, DevOps'`
- `'Descrição *'` — placeholder: `'Descreva o objetivo e o conteúdo deste quiz...'`
- `'Nível de Dificuldade'` — `'Iniciante'` / `'Médio'` / `'Difícil'` / `'Expert'` (~L580)
- `'Número de Questões'` (~L605)
- `'Contexto Adicional (IA)'` — `'Opcional'` (~L620)
- Placeholder: `'Cole aqui um texto, artigo ou documentação para a IA usar como base...'`
- `'Tags Relacionadas'` — `'Digite uma tag e pressione Enter'` — `'Adicionar'`
- `'Nenhuma tag adicionada ainda'` (~L660)
- `'Pronto para gerar!'` — AI description (~L670)
- `'Voltar'` / `'Próximo'` / `'Gerar Quiz com IA'` / `'Gerando Quiz...'` (~L700-720)

**Toasts:**
- `'Erro ao carregar quizzes'`
- `'Quiz desativado'` / `'Quiz ativado'`
- `'Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.'`
- `'Quiz excluído com sucesso!'`
- `'Erro ao excluir quiz'`
- `'Quiz criado com sucesso!'`
- `'Erro ao criar quiz. Tente novamente.'`

---

### 22. AdminQuizStatsPage.tsx (~280 lines)

**Empty:** `'Estatísticas não encontradas'` (~L40) — `'Voltar para Quizzes'` (~L42)

**Stat Labels:**
- `'Total de Acessos'` / `'Tentativas'` / `'Média de Acertos'` / `'Questões'` (~L60)
- `'taxa de conclusão'` (~L65)
- `'Ver Questões'` (~L70)

**Sections:**
- `'Últimas Tentativas'` (~L80)
- Table: `'Usuário'` / `'Desempenho'` / `'Tempo'` / `'Data'` (~L85)
- `'Nenhuma tentativa registrada ainda.'` (~L90)
- `'Resumo de Engajamento'` (~L95)
- `'Conclusões com Sucesso'` / `'Taxa de Abandono'` (~L100)

**Toast:** `'Erro ao carregar estatísticas do quiz'` (~L35)

---

### 23. AdminQuizDetailsPage.tsx (~300 lines)

**Empty:** `'Detalhes não encontrados'` (~L40) — `'Voltar para Quizzes'` (~L42)

**Headers:**
- `'Detalhes do Quiz'` (~L50)
- `'Ver Estatísticas Gerais'` (~L55)

**Labels:**
- `'Questão X de Y'` (~L60)
- `'Taxa de Acerto'` (~L65)
- `'Respostas (X)'` (~L70)
- `'Nenhuma resposta registrada para esta questão ainda.'` (~L75)
- `'Correto:'` (~L80)

**Toast:** `'Erro ao carregar detalhes do quiz'` (~L35)

---

### 24. AdminRolesPage.tsx (~310 lines)

**Page Title:** `'Gerenciar Cargos'` (~L30)
**Description:** `'Administre os cargos e níveis de acesso disponíveis no sistema'` (~L32)

**Labels:**
- `'cargos'` count (~L35)
- `'Novo Cargo'` (~L38)
- `'Buscar por nome ou descrição...'` (~L42)

**Table:** `'Cargo'` / `'Descrição'` / `'Cor de Identificação'` / `'Ações'` (~L50)

**Empty:** `'Nenhum cargo encontrado'` — `'Tente ajustar sua busca ou crie um novo cargo.'` (~L55)

**Modal:** `'Editar Cargo'` / `'Criar Novo Cargo'` (~L60)
**Form:**
- `'Nome do Cargo *'` / `'Descrição'` / `'Cor de Destaque'` (~L65)
- `'Cancelar'` / `'Salvar Alterações'` / `'Criar Cargo'` (~L75)

**Title attrs:** `'Editar'` / `'Desativar'` (~L80)

**Toasts:**
- `'Erro ao buscar cargos.'`
- `'O nome do cargo é obrigatório.'`
- `'Cargo criado com sucesso!'`
- `'Erro ao criar cargo.'`
- `'Cargo atualizado com sucesso!'`
- `'Erro ao atualizar cargo.'`
- `'Tem certeza que deseja desativar este cargo?'`
- `'Cargo desativado com sucesso!'`
- `'Erro ao desativar cargo.'`

---

### 25. AdminTokenPackagesPage.tsx (~430 lines)

**Page Title:** `'Pacotes de Tokens'` (~L30)
**Description:** `'Gerencie os pacotes de tokens e benefícios associados'` (~L32)

**Labels:**
- `'pacotes'` count (~L35)
- `'Novo Pacote'` (~L38)
- `'Buscar por nome ou descrição...'` (~L42)

**Table:** `'Pacote'` / `'Tokens'` / `'Valor'` / `'Cargo Atribuído'` / `'Benefícios'` / `'Ações'` (~L50)

**Default:** `'Sem descrição'` (~L55)
**Unit:** `'tokens'` (~L58)
**Empty:** `'Nenhum pacote encontrado'` — `'Tente ajustar sua busca ou crie um novo pacote.'` (~L60)

**Modal:** `'Editar Pacote'` / `'Criar Novo Pacote'` (~L70)
**Form Labels:**
- `'Nome do Pacote *'` — placeholder: `'Ex: Start, Professional, Enterprise'`
- `'Descrição'` — placeholder: `'Uma breve descrição sobre este pacote'`
- `'Quantidade de Tokens *'`
- `'Validade (dias)'` — `'Vazio = Vitalício'` / `'Deixe vazio para vitalício'`
- `'Valor (R$)'` — `'Valor em reais (opcional)'`
- `'Cargo Associado *'` — `'Selecione um cargo'`
- `'Benefícios (um por linha)'` — placeholder with benefit examples
- `'Dica: Pressione Enter para adicionar cada benefício em uma nova linha.'`
- `'Cancelar'` / `'Salvar Alterações'` / `'Criar Pacote'`

**Title attrs:** `'Editar'` / `'Desativar'`

**Toasts:**
- `'Preencha os campos obrigatórios corretamente.'`
- `'Pacote criado com sucesso!'`
- `'Erro ao criar pacote.'`
- `'Pacote atualizado com sucesso!'`
- `'Erro ao atualizar pacote.'`
- `'Tem certeza que deseja desativar este pacote?'`
- `'Pacote desativado com sucesso!'`
- `'Erro ao desativar pacote.'`
- `'Erro ao buscar pacotes de tokens.'`

---

### 26. UserQuizHistoryPage.tsx (~350 lines)

**Page Title:** `'Evolução - TreinaVagaAI'` (~L30)

**Headers:**
- `'Evolução'` (~L35)
- `'Seu histórico de aprendizado e performance.'` (~L38)

**Stat Labels:**
- `'Média Geral'` (~L45)
- `'Quizzes'` / `'Melhor Score'` / `'Tempo Total'` / `'Sequência'` (~L50)

**Section:**
- `'Histórico Recente'` — `'atividades'` count (~L60)

**Empty:**
- `'Nenhuma atividade encontrada'` (~L70)
- `'Você ainda não realizou nenhum quiz...'` (~L72)
- `'Explorar Quizzes'` (~L75)

**Labels:** `'acertos'` (~L80)
**Pagination:** `'Página X de Y'`, sr-only `'Anterior'` / `'Próxima'` (~L85)

---

### 27. UserQuizPage.tsx (~400 lines)

**Page Title:** `'Resultado do Quiz'` (~L30)

**Result Messages:**
- `'Excelente Performance!'` / `'Bom Trabalho!'` / `'Continue Praticando!'` (~L40)
- `'Você acertou X de Y questões.'` (~L45)

**Buttons:**
- `'Refazer Quiz'` / `'Meus Quizzes'` (~L50)

**Section:**
- `'Revisão das Questões'` (~L55)
- `'Explicação:'` (~L60)

**Quiz Play:**
- `'Questão X / Y'` (~L70)
- `'Anterior'` / `'Finalizar Quiz'` / `'Próxima Questão'` (~L75)

**Toast:** `'Erro ao reiniciar quiz. Tente novamente.'` (~L80)

---

### 28. UserQuizAttemptDetailsPage.tsx (~280 lines)

**Page Title:** `'Detalhes da Tentativa'` (~L30)

**Level Labels:** `'Iniciante'` / `'Médio'` / `'Difícil'` / `'Expert'` (~L40)

**Labels:**
- `'Questões (X de Y)'` (~L50)
- `'Anterior'` / `'Próxima'` (~L55)
- `'Sua resposta'` badge (~L60)
- `'Resposta Correta!'` / `'Resposta Incorreta'` (~L65)
- `'Correta:'` (~L70)
- `'Explicação:'` (~L75)
- `'questões'` count (~L80)

**Empty:** `'Tentativa não encontrada'` (~L35)
**Toast:** `'Erro ao carregar detalhes da tentativa'` (~L32)

---

### 29. OrderConfirmationPage.tsx (~400 lines)

**Page Title:** `'Confirmação do Pedido - TreinaVagaAI'` (~L30)

**Status-dependent headers:**
- Confirmed: `'Pagamento Confirmado! 🎉'` — `'Seu plano foi ativado com sucesso...'` (~L40)
- Failed: `'Pagamento Não Concluído'` — `'O pagamento não foi concluído...'` (~L45)
- Pending: `'Aguardando Confirmação'` — `'Estamos processando seu pagamento...'` (~L50)

**Polling UI:**
- `'ID do Pedido:'` (~L60)
- `'Verificando atualizações...'` — `'Aguardando confirmação do pagamento...'` (~L65)
- `'Atualização detectada! ✨'` — `'Seus dados foram atualizados com sucesso.'` (~L70)

**Account Summary:**
- `'Resumo da Conta'` (~L80)
- `'Saldo de Créditos'` / `'Plano Ativo'` / `'Válido até'` (~L85)

**Buttons:**
- `'Começar a Praticar'` (~L90)
- `'Ver Planos e Créditos'` (~L95)
- `'Ir para Perfil'` (~L100)

**Help:** `'Precisa de ajuda? Entre em contato com nosso suporte.'` (~L105)

---

### 30. RewardHistoryPage.tsx (~420 lines)

**Page Title:** `'Histórico - TreinaVagaAI'` (~L30)

**Headers:**
- `'Minha Jornada'` (breadcrumb) (~L35)
- `'Histórico'` (~L38)
- `'Seu progresso e conquistas acumuladas.'` (~L40)

**Stat Labels:**
- `'Ganhos Totais'` / `'Gastos'` (~L50)
- `'Saldo Atual'` / `'Total Ganho'` / `'Total Gasto'` (~L55)

**Weekly Goal:**
- `'Meta Semanal'` (~L65)
- `'Continue completando simulados para desbloquear mais bônus.'` (~L68)
- `'X/5 para o próximo bônus'` (~L70)

**Timeline:**
- `'Linha do Tempo'` — `'Eventos'` count (~L80)

**Reward Titles:**
- `'Nova Conquista'` / `'Plano Ativado'` / `'Pacote Adquirido'` / `'Recompensa'` (~L90)

**Reward Descriptions:**
- `'Completou quizzes gratuitos'` (~L95)
- `'Geração de quiz personalizado'` (~L97)
- `'Geração de flashcards'` (~L99)
- `'Geração de simulação de entrevista'` (~L101)
- `'Jogou quiz de outro usuário'` (~L103)
- `'Indicação de amigo'` (~L105)
- `'Conquista desbloqueada'` (~L107)
- `'Resgate de pacote promocional'` (~L109)
- `'Tokens adicionados'` / `'Tokens gastos'` (~L111)
- `'Upgrade de conta + X tokens'` (~L113)

**Empty:**
- `'Sem registros ainda'` (~L120)
- `'Seus ganhos aparecerão aqui assim que completar simulados.'` (~L122)
- `'COMEÇAR AGORA'` (~L125)

**Toast:** Error messages (~L130)

---

### 31. SearchModal.tsx (~230 lines)

**Title:** `'Pesquisa Rápida'` (~L20)
**Placeholder:** `'Digite sua pesquisa...'` (~L25)

**Filter Label:** `'Pesquisar em:'` (~L30)
**Categories:**
- `'Tudo'` — `'Pesquisar em todo o conteúdo'` (~L35)
- `'Meus Quizzes'` — `'Pesquisar nos seus quizzes'` (~L37)
- `'Explorar'` — `'Pesquisar quizzes gratuitos'` (~L39)
- `'Comunidade'` — `'Pesquisar na comunidade'` (~L41)

**Quick Nav:** `'Navegação rápida:'` (~L50)
- `'Ir para X'` (prefix for destinations) (~L52)

**Footer Hints:**
- `'Pressione Enter para pesquisar'` (~L60)
- `'Pressione Esc para fechar'` (~L62)

---

### 32. UserSearchPage.tsx (~450 lines)

**Header:**
- `'Explorar Comunidade'` (~L30)
- `'Conecte-se com X estudantes incríveis'` (~L32)

**Search:** `'Buscar por nome...'` placeholder (~L40)

**Filter Buttons:** `'Todos'` + niche options (shared list) (~L45)

**Empty:**
- `'Nenhum estudante encontrado'` (~L60)
- `'Não encontramos ninguém com os critérios atuais...'` (~L62)
- `'Limpar Filtros'` (~L65)

**Fallbacks:**
- `'Sem nicho'` (~L70)
- `'Sem descrição disponível para este perfil.'` (~L72)

**Buttons:** `'Deixar de Seguir'` / `'Seguir'` (~L80)

**Toasts:**
- Follow/unfollow success messages (~L85)
- `'Erro ao atualizar. Tente novamente.'` (~L90)
- `'Não foi possível carregar os estudantes.'` (~L92)

---

### 33. PublicProfilePage.tsx (~500 lines)

**Career Time Map:** `'Menos de 1 ano'`, `'1-3 anos'`, `'3-5 anos'`, `'5-10 anos'`, `'Mais de 10 anos'` (~L20)
**Niche Map:** (shared list + `'Jurídico'`, `'Engenharia'`, `'Design'`, `'Produto'`) (~L30)

**Loading:** `'Carregando perfil...'` (~L50)
**Empty:** `'Perfil não encontrado'` — `'Não conseguimos encontrar o perfil que você está procurando.'` — `'Voltar para busca'` (~L55)

**Buttons:** `'Deixar de seguir'` / `'Seguir'` (~L65)

**Sections:**
- `'Sobre'` (~L75)
- `'Tech Stack'` (~L80)

**Stat Labels:** `'Quizzes Completos'` / `'Média Geral'` / `'Melhor Score'` / `'Tempo Total'` (~L85)

**Social:** `'Seguidores'` / `'Seguindo'` (~L95)

**Tabs:** `'Visão Geral'` / `'Seguidores'` / `'Seguindo'` (~L100)

**Content:**
- `'Atividade Recente'` (~L110)
- `'Este usuário ainda não tem atividades registradas.'` (~L115)
- `'Nenhum seguidor ainda'` / `'Não está seguindo ninguém'` (~L120)

**Toasts:**
- Follow/unfollow toasts (~L125)
- `'Erro ao carregar perfil'` (~L130)
- `'Erro ao atualizar seguimento'` (~L132)

---

### 34. SocialConnectionsComponent.tsx (~250 lines)

**Section Title:** `'Conexões'` (~L20)
**Link:** `'Buscar'` (~L22)

**Tabs:** `'Seguindo'` / `'Seguidores'` (~L30)

**Empty:**
- `'Você não segue ninguém ainda.'` (~L40)
- `'Você ainda não tem seguidores.'` (~L42)
- `'Encontrar pessoas'` (~L45)

**Link:** `'Ver todos'` (~L50)
**Loading:** `'Carregando conexões...'` (~L55)
**Title attr:** `'Deixar de seguir'` (~L60)

**Toasts:**
- `'Parou de seguir usuário'` (~L65)
- `'Erro ao carregar conexões'` (~L70)
- `'Erro ao deixar de seguir'` (~L72)

---

### 35. ErrorBoundary.tsx (~110 lines)

**Strings:**
- `'Oops! Algo deu errado'` (~L40)
- `'Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e está trabalhando para resolver o problema.'` (~L45)
- `'Detalhes do Erro (Desenvolvimento):'` (~L50)
- `'Tentar Novamente'` (~L55)
- `'Recarregar Página'` (~L60)
- `'Se o problema persistir, entre em contato com o suporte:'` (~L65)

---

### 36. Loading.tsx (~55 lines)

**Default prop:** `'Carregando...'` (~L10)

---

### 37. PaymentLoadingModal.tsx (~65 lines)

**Strings:**
- `'Direcionando para pagamento'` (~L20)
- `'Aguarde enquanto preparamos sua página de checkout segura...'` (~L25)
- `'Pagamento 100% seguro'` (~L30)

---

### 38. CardHistoryModal.tsx (~250 lines)

**Title:** `'Histórico do Card'` (~L20)

**Difficulty Labels:** `'Fácil'` / `'Normal'` / `'Difícil'` (~L30)

**Interval Labels:**
- `'1 dia'` / `'X dias'` / `'X semana(s)'` / `'X mês(es)'` / `'X ano(s)'` (~L35)

**Stat Labels:**
- `'Estatísticas Atuais'` (~L45)
- `'Vezes Estudado'` / `'Repetições'` / `'Fator de Facilidade'` / `'Próximo Intervalo'` (~L50)
- `'Próxima revisão:'` (~L55)

**History Section:**
- `'Histórico de Revisões (X)'` (~L60)
- `'Nenhuma revisão registrada ainda.'` (~L65)
- `'Intervalo Antes'` / `'Intervalo Depois'` / `'Fator de Facilidade'` (~L70)

**Error:** `'Erro ao carregar dados.'` / `'Erro ao carregar histórico do card.'` (~L75)

---

### 39. Footer.tsx (~225 lines)

**Nav Items:**
- `'Início'` / `'Meus Quizzes'` / `'Criar'` / `'Explorar'` / `'Evolução'` / `'Tokens'` (~L30)

**Brand Description:**
- `'A plataforma utiliza IA para ler os requisitos da vaga e gerar um Quiz de preparação para garantir que você não "trave" na hora do papo com o recrutador.'` (~L50)

**Section Headers:** `'Produto'` / `'Navegação'` / `'Legal'` (~L60)

**Links:**
- `'Planos'` / `'Funcionalidades'` (~L65)
- `'Termos de Uso'` / `'Política de Privacidade'` (~L70)

**Footer:** `'Todos os direitos reservados.'` (~L80)

---

### 40. Toast.tsx (~165 lines)

**sr-only:** `'Fechar'` (~L50)

---

### 41. ActivityHeatmap.tsx (~210 lines)

**Tooltip:** `'X atividades'` + `'em DD/MM'` (~L135)
**Total Label:** `'Total de X atividades no último ano'` (~L185)
**Legend:** `'Menos'` / `'Mais'` (~L190)
**Day Labels:** `'Seg'` / `'Qua'` / `'Sex'` (~L170)
**Month Labels:** Formatted via `toLocaleString('pt-BR', { month: 'short' })` — auto-generates `'Jan'`, `'Fev'`, `'Mar'`, etc. (~L100)

---

### 42. UserDetailsModal.tsx (~794 lines)

**Tab Labels:**
- `'Perfil'` (~L165)
- `'Tokens & Saldo'` (~L172)
- `'Quizzes Criados'` (~L180)
- `'Flashcards'` (~L188)
- `'Entrevistas'` (~L196)

**Loading:** `'Carregando informações...'` (~L210)

**Profile Tab:**
- Section headers: `'Profissional'` / `'Pessoal & Contato'` / `'Stack Técnico'` / `'Sobre'` / `'Administração'` (~L230-310)
- Labels: `'Tempo de Carreira'` / `'Nicho'` / `'Localização'` / `'Celular'` / `'CPF/CNPJ'` (~L240-270)
- `'Não informado'` fallback (~L260)
- `'Cargo Atual'` (~L315)
- Role options: `'Aluno'` / `'Pro / Premium'` / `'Administrador'` (~L330)
- `'Salvando...'` / `'Salvar'` / `'Cancelar'` (~L340)
- `'Editar cargo'` (title attr) (~L365)

**Niche/Career maps:**
- Same shared niche map (~L80)
- Career: `'Menos de 1 ano'`, `'1-3 anos'`, `'3-5 anos'`, `'5-10 anos'`, `'Mais de 10 anos'` (~L90)

**Reason Labels:**
- `'Conclusão de Quiz'` / `'Geração de Quiz'` / `'Jogar Quiz'` / `'Adição Manual'` / `'Compra de Pacote'` (~L100)

**Tokens Tab:**
- `'Adicionar Tokens'` button (~L415)
- Stat cards: `'Saldo Atual'` / `'Total Ganho'` / `'Total Gasto'` (~L425)
- Subtexts: `'Tokens disponíveis'` / `'Accumulado'` / `'Consumido'` (~L430)
- `'Estatísticas de Uso'` (~L445)
- `'Quizzes Gratuitos Completos'` / `'Cota Diária (Gratuito)'` / `'Última Recompensa'` (~L450-465)
- `'Nunca'` fallback (~L468)
- `'Últimas Movimentações'` (~L475)
- `'Nenhuma movimentação registrada.'` (~L480)

**Quizzes Tab:**
- `'Este usuário ainda não criou nenhum quiz.'` (~L525)
- Labels: `'questões'`, `'Gratuito'` / `'Premium'` (~L555)
- Stats: `'Acessos'` / `'Tentativas'` / `'Conclusões'` / `'Média'` (~L575)
- `'Ativo'` / `'Inativo'` (~L545)

**Flashcards Tab:**
- `'Este usuário ainda não criou nenhum flashcard.'` (~L610)
- Labels: `'cards'`, `'Gratuito'` / `'Premium'` (~L640)
- Stats: `'Sessões'` / `'Cards Estudados'` / `'Tempo Médio'` (~L650)

**Interviews Tab:**
- `'Este usuário ainda não criou nenhuma entrevista.'` (~L680)
- `'tentativas'` count (~L710)

**Add Tokens Modal:**
- `'Adicionar Tokens'` (~L720)
- `'Adicionar tokens manualmente à conta de {userName}'` (~L722)
- `'Quantidade de Tokens'` (~L730)
- `'Motivo (opcional)'` (~L735)
- Reason badges: `'Bônus de Boas-vindas'`, `'Reembolso de Token'`, `'Premiação de Concurso'`, `'Ajuste Administrativo'`, `'Teste Interno'`, `'Cortesia'` (~L740)
- `'Ou digite um motivo personalizado...'` placeholder (~L755)
- `'Cancelar'` / `'Adicionar'` (~L770)

**Toasts:**
- `'Erro ao buscar detalhes do usuário.'` (~L56)
- `'Por favor, insira uma quantidade válida de tokens.'` (~L110)
- `'Tokens adicionados com sucesso!'` (~L120)
- `'Erro ao adicionar tokens: ...'` (~L125)
- `'Cargo atualizado com sucesso!'` (~L140)
- `'Erro ao atualizar cargo: ...'` (~L145)

**Role Labels:** `'Administrador'` / `'Pro / Premium'` / `'Aluno'` (~L155)

---

### 43. AppLayout.tsx (~45 lines)

**No hardcoded Portuguese strings.** (Comments in Portuguese: `'Layout principal da aplicação'`, `'Conteúdo principal...'`)

---

### 44. Dashboard.tsx (~8 lines)

**No Portuguese strings.** (Stub component, returns null)

---

### 45. PageTitle.tsx (~25 lines)

**No hardcoded Portuguese strings.** (Receives title as prop)

---

### 46. TermsOfUsePage.tsx (~160 lines)

**Page Title:** `'Termos de Uso - TreinaVagaAI'` (~L70)

**Header:**
- `'Termos de Uso'` (~L90)
- `'Regras e diretrizes para o uso da plataforma TreinaVagaAI.'` (~L95)
- `'Atualizado em {date}'` (~L100)
- `'Voltar'` (~L80)

**Sections (all content is Portuguese legal text):**
1. `'1. Aceitação dos Termos'` — full paragraph (~L20)
2. `'2. Descrição do Serviço'` — full paragraph (~L25)
3. `'3. Conta do Usuário'` — full paragraph (~L30)
4. `'4. Uso Aceitável'` — paragraph + list of 4 items (~L35):
   - `'Tentar violar ou contornar a segurança do sistema ou rede.'`
   - `'Utilizar bots, scrapers ou scripts automatizados para coletar dados.'`
   - `'Praticar qualquer ato de assédio, abuso ou discriminação.'`
   - `'Publicar conteúdo que viole direitos de propriedade intelectual.'`
5. `'5. Propriedade Intelectual'` — full paragraph (~L45)
6. `'6. Isenção de Garantias'` — full paragraph (~L50)
7. `'7. Alterações nos Termos'` — full paragraph (~L55)
8. `'8. Contato'` — full paragraph (~L60)

**Footer:** `'© {year} TreinaVagaAI. Todos os direitos reservados.'` (~L155)

---

### 47. PrivacyPolicyPage.tsx (~155 lines)

**Page Title:** `'Política de Privacidade - TreinaVagaAI'` (~L65)

**Header:**
- `'Política de Privacidade'` (~L85)
- `'Transparência sobre como tratamos seus dados pessoais.'` (~L90)
- `'Atualizado em {date}'` (~L95)
- `'Voltar'` (~L80)

**Sections (all content is Portuguese legal text):**
1. `'1. Introdução'` — full paragraph (~L15)
2. `'2. Coleta de Informações'` — paragraph + 3-item list (~L20):
   - `'Informações Pessoais: Nome completo, email e foto (via login social).'`
   - `'Dados de Uso: Estatísticas de quizzes, progresso e interações.'`
   - `'Dados Técnicos: Endereço IP, dispositivo e navegador.'`
3. `'3. Uso das Informações'` — paragraph + 4-item list (~L30):
   - `'Operar e manter os serviços da plataforma.'`
   - `'Personalizar recomendações de estudo baseadas no desempenho.'`
   - `'Análises estatísticas para aprimoramento da IA.'`
   - `'Envio de comunicados importantes e suporte.'`
4. `'4. Compartilhamento'` — full paragraph (~L40)
5. `'5. Segurança de Dados'` — full paragraph (~L45)
6. `'6. Seus Direitos'` — full paragraph (~L50)
7. `'7. Cookies'` — full paragraph (~L55)

**Footer:** `'© {year} TreinaVagaAI. Todos os direitos reservados.'` (~L150)

---

### 48. BottomNav.tsx (Sidebar/Navigation)

**Note:** This file ALREADY uses `react-i18next` with `useTranslation()` and `LanguageSwitcher`. Nav items use `t('nav.home')`, `t('nav.quizzes')`, `t('nav.simulations')`, etc. **Already partially internationalized.**

---

## UTILITY FILES

### 49. api.ts (~1033 lines)

**Portuguese enum values (used as data, may need translation in display):**
```typescript
QuizLevel.INICIANTE = 'INICIANTE'     (~L173)
QuizLevel.MEDIO = 'MEDIO'             (~L174)
QuizLevel.DIFICIL = 'DIFÍCIL'         (~L175)
QuizLevel.EXPERT = 'EXPERT'           (~L176)
```
No other hardcoded Portuguese display text. Mostly type definitions and API calls.

### 50. socialApi.ts (~85 lines)

**No Portuguese strings.** Pure API wrapper with TypeScript interfaces.

### 51. nicheIcons.tsx (~50 lines)

**No Portuguese strings.** Pure icon mapping (niche key → Lucide icon component).

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Files with Portuguese strings | ~42 |
| Files with no Portuguese strings | ~8 (Dashboard, PageTitle, AppLayout, socialApi, nicheIcons, + partial BottomNav) |
| Total unique Portuguese strings (approx) | ~600+ |
| Shared/recurring strings | ~50 |
| Toast messages | ~80+ |
| Form labels | ~60+ |
| Section headers | ~70+ |
| Empty state messages | ~25+ |
| Legal page paragraphs | ~15 sections |
| Button labels | ~40+ |

---

## NOTES FOR IMPLEMENTATION

1. **BottomNav.tsx** already uses `react-i18next` — extend this pattern to all other files.
2. **Shared strings** (niche options, career times, difficulty labels) should be centralized in translation files, not duplicated per component.
3. **VideoTimelineAnalysisPage.tsx** is mostly English — needs Portuguese translation too.
4. **Legal pages** (TermsOfUse, PrivacyPolicy) have large blocks of text — consider loading from translation files or separate documents.
5. **Date formatting** uses `toLocaleDateString('pt-BR')` and `toLocaleString('pt-BR')` — will need locale-aware formatting.
6. **Relative dates** (`'Agora mesmo'`, `'há X min'`) — consider using a library like `date-fns` with locale support.
7. The `QuizLevel` enum in `api.ts` has Portuguese values (`'DIFÍCIL'`) — these may need to remain as-is for API compatibility but display labels should be translated.
