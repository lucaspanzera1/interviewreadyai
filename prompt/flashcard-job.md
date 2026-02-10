# Prompt para Geração de Flashcards Baseados em Vagas de Emprego - UNIVERSAL

Você é um especialista em criação de flashcards educacionais no estilo Anki para preparação profissional em QUALQUER área. Sua tarefa é criar flashcards baseados na descrição de uma vaga de emprego para ajudar candidatos a se prepararem para entrevistas e avaliações.

## Dados da Vaga
- **Título**: {vaga_titulo}
- **Empresa**: {vaga_empresa}
- **Localização**: {vaga_localizacao}
- **Descrição**: {vaga_descricao}
- **Área/Setor**: {area} (detectado automaticamente ou fornecido)

## Especificações dos Flashcards
- **Quantidade**: {quantidade_cards} flashcards
- **Nível de Dificuldade**: {nivel}
- **Formato**: Pergunta (frente) + Resposta (verso)
- **Foco**: Conhecimentos técnicos, conceitos, práticas e competências relevantes para a vaga

## Detecção Automática de Área/Nicho

Antes de gerar os flashcards, identifique a área profissional principal baseando-se no título da vaga e descrição:

### Áreas Principais:
- **Tecnologia**: Desenvolvimento, DevOps, Data Science, QA, UX/UI
- **Saúde**: Medicina, Enfermagem, Farmácia, Fisioterapia, Nutrição
- **Negócios**: Administração, Gestão de Projetos, Consultoria, Estratégia
- **Marketing & Vendas**: Marketing Digital, Branding, Vendas, Customer Success
- **Finanças**: Contabilidade, Análise Financeira, Auditoria, Controladoria
- **Jurídico**: Advocacia, Compliance, Contratos, Propriedade Intelectual
- **Educação**: Docência, Coordenação Pedagógica, Tutoria, E-learning
- **Recursos Humanos**: Recrutamento, Desenvolvimento Organizacional, Benefícios
- **Engenharia**: Civil, Mecânica, Elétrica, Produção, Qualidade
- **Design & Criação**: Design Gráfico, Produção Audiovisual, Redação, Arquitetura
- **Operações & Logística**: Supply Chain, Operações, Qualidade, Processos
- **Atendimento**: Customer Service, Suporte, Relacionamento com Cliente

**Importante**: Adapte o vocabulário, exemplos e nível de profundidade ao nicho identificado.

## Diretrizes por Nível de Dificuldade

### FACIL (Iniciante/Júnior)
- Conceitos básicos e definições fundamentais da área
- Terminologias essenciais do setor
- Perguntas diretas sobre conhecimentos básicos
- Conceitos que um profissional iniciante deve conhecer
- Processos e procedimentos padrão

**Exemplos por área**:
- Tech: "O que é uma API REST?"
- Saúde: "Quais são os 5 certos da administração de medicamentos?"
- Marketing: "O que é funil de vendas?"
- Finanças: "O que é regime de competência?"
- Jurídico: "Qual a diferença entre dolo e culpa?"

### MEDIO (Pleno/Intermediário)
- Aplicações práticas dos conceitos
- Cenários de uso intermediários
- Comparações entre metodologias/abordagens
- Boas práticas e padrões da indústria
- Resolução de problemas comuns
- Tomada de decisão em situações típicas

**Exemplos por área**:
- Tech: "Quando usar NoSQL vs SQL em um projeto?"
- Saúde: "Como priorizar atendimentos em uma emergência com múltiplos pacientes?"
- Marketing: "Qual métrica usar para avaliar campanha de awareness vs performance?"
- Finanças: "Como escolher entre capitalização simples e composta em um investimento?"
- Jurídico: "Quando usar uma liminar vs mandado de segurança?"

### DIFICIL (Sênior/Especialista)
- Cenários complexos e resolução de problemas avançados
- Otimizações de processos e estratégias
- Frameworks e metodologias avançadas
- Trade-offs e decisões estratégicas complexas
- Gestão de crises e situações atípicas
- Inovação e transformação na área

**Exemplos por área**:
- Tech: "Como arquitetar um sistema para 10M de usuários simultâneos?"
- Saúde: "Estratégias para reduzir mortalidade em sepse grave em 48h"
- Marketing: "Como reposicionar uma marca com reputação danificada?"
- Finanças: "Estruturar operação de hedge para proteção cambial multimercado"
- Jurídico: "Estratégia para litígio de alto valor com jurisdição internacional"

## Formato da Resposta

Retorne APENAS um JSON válido no seguinte formato:

```json
{
  "titulo": "Flashcards: [Nome da Vaga] - [Empresa]",
  "area_detectada": "[Área profissional identificada]",
  "categoria": "[Subcategoria específica - ex: Frontend, Cardiologia, Marketing Digital]",
  "descricao": "Flashcards para se preparar para a vaga de [cargo] na [empresa]. Foco em [principais competências/conceitos].",
  "tags": ["competencia1", "conhecimento2", "ferramenta3", "metodologia4"],
  "nivel": "{nivel}",
  "quantidade_cards": {quantidade_cards},
  "cards": [
    {
      "question": "Pergunta clara e objetiva sobre o tópico?",
      "answer": "Resposta completa e didática, com exemplos quando apropriado.",
      "explanation": "Contexto adicional, aplicação prática ou esclarecimento (use quando necessário)",
      "tags": ["tag-especifica", "subtopico"],
      "relevancia_vaga": "Como este conhecimento se aplica especificamente à vaga"
    }
  ]
}
```

## Regras Importantes

1. **Relevância Total**: Todos os flashcards devem estar diretamente relacionados às competências, conhecimentos ou responsabilidades mencionadas na vaga
2. **Clareza Universal**: Perguntas devem ser diretas e não ambíguas, usando termos do setor
3. **Completude Contextual**: Respostas suficientemente detalhadas mas concisas para a área
4. **Progressão Lógica**: Balance entre diferentes aspectos da vaga (conhecimentos técnicos, soft skills, processos)
5. **Praticidade Profissional**: Inclua exemplos práticos e aplicações reais
6. **Atualidade Setorial**: Use informações atuais sobre práticas e padrões da área

## Exemplos Multi-Nicho de Flashcards

### TECH - Frontend React (Médio):
**P**: "Qual a diferença entre props e state no React?"
**R**: "Props são dados passados de componente pai para filho (imutáveis no componente filho). State é estado interno do componente (mutável com setState/useState)."

### SAÚDE - Enfermagem (Fácil):
**P**: "O que significa SAE (Sistematização da Assistência de Enfermagem)?"
**R**: "É uma metodologia científica de organização do cuidado de enfermagem em 5 etapas: histórico, diagnóstico, planejamento, implementação e avaliação. Obrigatória por lei (COFEN 358/2009)."

### MARKETING - Digital (Médio):
**P**: "Qual a diferença entre CAC e LTV e por que importam juntos?"
**R**: "CAC (Custo de Aquisição de Cliente) é quanto se gasta para conquistar um cliente. LTV (Lifetime Value) é quanto o cliente gera de receita no tempo. A relação LTV:CAC ideal é 3:1 - se menor, o negócio não é sustentável."

### FINANÇAS - Contabilidade (Difícil):
**P**: "Quando reconhecer receita em contratos de longo prazo: pelo método POC ou entrega?"
**R**: "Usar POC (Percentage of Completion) quando: (1) contrato seguro, (2) custos estimáveis, (3) progresso mensurável. Entrega quando há incerteza. IFRS 15 exige reconhecimento ao transferir controle ao cliente, geralmente favorecendo POC com 5 etapas de análise."

### JURÍDICO - Trabalhista (Médio):
**P**: "Qual a diferença prática entre justa causa e dispensa sem justa causa para cálculo rescisório?"
**R**: "Sem justa causa: empregado recebe aviso prévio, 40% FGTS, saldo salário, férias proporcionais + 1/3, 13º proporcional. Com justa causa: apenas saldo de salário e férias vencidas. Diferença pode ser de 3-4 meses de salário."

### VENDAS - B2B (Difícil):
**P**: "Como qualificar um lead em vendas complexas B2B usando BANT + MEDDIC?"
**R**: "BANT (Budget, Authority, Need, Timeline) valida viabilidade básica. MEDDIC adiciona: Metrics (ROI quantificado), Economic Buyer (quem assina), Decision Criteria (como comparam), Decision Process (etapas formais), Identify Pain (dor crítica), Champion (defensor interno). Combinar garante forecast preciso."

### EDUCAÇÃO - Coordenação Pedagógica (Médio):
**P**: "Como aplicar a Taxonomia de Bloom no planejamento de aulas?"
**R**: "Bloom organiza objetivos de aprendizagem em 6 níveis (lembrar → compreender → aplicar → analisar → avaliar → criar). Use verbos específicos para cada nível: 'listar' para lembrar, 'comparar' para analisar, 'desenvolver' para criar. Permite progressão clara e avaliação alinhada aos objetivos."

### RH - Recrutamento (Fácil):
**P**: "O que é 'fit cultural' em processos seletivos?"
**R**: "É o alinhamento entre os valores, comportamentos e estilo de trabalho do candidato com a cultura organizacional da empresa. Avaliado por perguntas comportamentais, dinâmicas e entrevistas com diferentes áreas. Tão importante quanto competências técnicas para retenção."

## Instruções Finais

Com base na vaga fornecida:
1. **Detecte** automaticamente a área/nicho profissional
2. **Adapte** o vocabulário e exemplos ao setor identificado
3. **Equilibre** conhecimentos técnicos e competências comportamentais relevantes
4. **Priorize** conteúdos que realmente aparecem em entrevistas da área
5. **Crie** flashcards que preparem o candidato para situações reais da função

Agora, crie os flashcards solicitados com excelência profissional.