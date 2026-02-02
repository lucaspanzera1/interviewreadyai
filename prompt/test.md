[
  {
    "id": "quiz_system_design_senior_01",
    "categoria": "Arquitetura de Software",
    "titulo": "System Design: Escalonamento e Alta Disponibilidade",
    "descricao": "Questões baseadas em cenários de arquitetura distribuída, Teorema CAP e estratégias de cache.",
    "tags": "system-design, arquitetura, microservices, escalabilidade, cap-theorem",
    "quantidade_questoes": 10,
    "nivel": "Difícil",
    "contexto": "Atue como um Arquiteto de Software entrevistando um Engenheiro Sênior. As perguntas devem focar em **trade-offs** de decisões arquiteturais. Aborde: Teorema CAP (consistência eventual vs forte), estratégias de particionamento de banco de dados (Sharding), tipos de Load Balancers (L4 vs L7), padrões de resiliência (Circuit Breaker, Retry, Bulkhead) e estratégias de Cache (Write-through, Write-back, Cache Aside). Evite definições simples; apresente cenários onde a escolha errada causa gargalos."
  },
  {
    "id": "quiz_nodejs_advanced_01",
    "categoria": "Backend Development",
    "titulo": "Node.js Avançado: Performance e Internals",
    "descricao": "Mergulhe no funcionamento interno da V8, gerenciamento de memória e multithreading no Node.",
    "tags": "nodejs, v8, performance, streams, worker-threads",
    "quantidade_questoes": 10,
    "nivel": "Expert",
    "contexto": "O foco é performance e debugging em produção. Pergunte sobre: Fases do Event Loop em detalhes (diferença entre process.nextTick, setImmediate e setTimeout), diagnóstico de Memory Leaks, uso correto de Streams para manipular grandes volumes de dados (Backpressure), e quando utilizar Worker Threads ou o módulo Cluster para contornar a limitação da single-thread. Inclua questões sobre bloqueio do Event Loop por operações síncronas pesadas (ReDoS, JSON.parse grande)."
  },
  {
    "id": "quiz_react_senior_01",
    "categoria": "Frontend Avançado",
    "titulo": "React: Performance e Arquitetura de Componentes",
    "descricao": "Otimização de renderização, gerenciamento de estado complexo e padrões de design avançados.",
    "tags": "react, performance, hooks, state-management, design-patterns",
    "quantidade_questoes": 10,
    "nivel": "Difícil",
    "contexto": "Teste o conhecimento profundo do ciclo de vida e reconciliação do React. Pergunte sobre: Otimização de re-renders (quando usar e quando NÃO usar useMemo/useCallback - custo de memória vs custo de processamento), Virtual DOM diffing algorithm, padrões de composição (HOCs vs Render Props vs Hooks), gerenciamento de estado global em escala (Context API performance pitfalls vs Redux/Zustand) e estratégias de Code Splitting e Lazy Loading."
  },
  {
    "id": "quiz_db_optimization_01",
    "categoria": "Engenharia de Dados",
    "titulo": "Banco de Dados: Otimização e Indexação",
    "descricao": "Estratégias avançadas de SQL, Explain Plans, isolamento de transações e modelagem para performance.",
    "tags": "sql, database, tuning, indexes, acid",
    "quantidade_questoes": 10,
    "nivel": "Difícil",
    "contexto": "Foque em performance de banco de dados relacional (PostgreSQL/MySQL). Pergunte sobre: Como ler um 'Explain Analyze', tipos de índices (B-Tree, Hash, GIN) e quando eles NÃO funcionam (ex: funções na coluna indexada), Níveis de Isolamento de Transação (Read Committed, Repeatable Read, Serializable) e problemas de concorrência (Dirty Reads, Phantom Reads). Aborde Normalização vs Desnormalização em cenários de alta leitura."
  },
  {
    "id": "quiz_kubernetes_senior_01",
    "categoria": "DevOps / Infra",
    "titulo": "Kubernetes e Orquestração em Escala",
    "descricao": "Gerenciamento de clusters, segurança de contêineres e padrões de deploy avançados.",
    "tags": "kubernetes, k8s, docker, devops, segurança",
    "quantidade_questoes": 10,
    "nivel": "Difícil",
    "contexto": "Não pergunte comandos básicos do kubectl. Foque em conceitos de arquitetura e operação. Pergunte sobre: Ciclo de vida de Pods e Probes (Liveness vs Readiness vs Startup), gerenciamento de recursos (Requests vs Limits e QoS classes), padrões de Deploy (Blue/Green, Canary, Rolling Update), Ingress Controllers, Network Policies para segurança entre pods, e Sidecar Pattern (ex: Service Mesh). Aborde persistência de dados (PV/PVC) e StatefulSets."
  }
]