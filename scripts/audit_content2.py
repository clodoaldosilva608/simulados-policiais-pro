# -*- coding: utf-8 -*-
"""Conteúdo do relatório de auditoria — Parte 2 (seções 11-20)."""

SEV_C = '<font color="#a05252"><b>CRÍTICO</b></font>'
SEV_A = '<font color="#a3702a"><b>ALTO</b></font>'
SEV_M = '<font color="#5a7a96"><b>MÉDIO</b></font>'
SEV_B = '<font color="#6a8a6a"><b>BAIXO</b></font>'

PART2 = [
    ('h1', '11. Performance'),
    ('h2', '11.1 Frontend'),
    ('bullet', [
        '<b>Bundle:</b> zero next/dynamic/React.lazy em toda a app — as 13 telas + framer-motion (importado em 11 telas) + ~384 KB de questões oficiais (src/data/, maior arquivo 80 KB) entram no pacote inicial. Não medido em gzip (sem build no modo leitura); estruturalmente, o TTI degrada a cada questão adicionada ao catálogo.',
        '<b>Pipeline de PDF na main thread:</b> unpdf roda sem Web Worker (pdf-text.ts:72); um PDF de 50 MB vira ArrayBuffer + cópia Uint8Array + estruturas do pdf.js simultaneamente — risco real de crash no Safari iOS em aparelhos modestos. No caminho OCR, o buffer é lido duas vezes (:369, :407).',
        '<b>Listas sem virtualização:</b> o histórico renderiza filteredAttempts.map() completo (performance-screen.tsx:524) com allAttempts inteiro em state (page.tsx:266,316-317) — usuários intensos acumulam milhares de registros.',
        '<b>Re-renderização:</b> todo o app vive no orquestrador page.tsx (792 linhas); cada resposta no simulado re-renderiza o orquestrador e serializa o estado para localStorage (:291-298). Tolerável hoje; gargalo estrutural amanhã.',
        '<b>Sem service worker:</b> manifesto PWA presente, cache offline inexistente — o "local-first" não sobrevive a modo avião.',
    ]),
    ('h2', '11.2 Backend'),
    ('bullet', [
        '<b>Funções longas:</b> /api/generate e /api/transcribe com maxDuration 150 — processamento de IA dentro da request; a 10k+ usuários simultâneos, isso consome concorrência da plataforma e multiplica custo.',
        '<b>N+1 no admin:</b> o overview dispara até 2.000 leituras de Blob por request (blob-registry.ts:139-147) e devolve tudo no corpo.',
        '<b>Heartbeat caro:</b> cada GET /api/auth/me reescreve o JSON do usuário incluindo foto base64 de até 160 KB (auth/me/route.ts:41) — tráfego e escrita amortizados a cada 5 min por usuário ativo.',
        '<b>O que já é bom:</b> timeouts de 55/58 s com AbortController no gateway de IA (ai-gateway.ts:90-99,367,391) e cadeia de fallback de modelos com deadline global de 130 s (:170-205,272) — o melhor trecho de engenharia do servidor.',
    ]),
    ('body', 'O que degrada primeiro em performance: com 10k MAU, o painel admin e o egress do Blob; com 50k, '
             'as funções de IA sob concorrência e o scan O(N) do webhook; com 100k, o heartbeat e o próprio Blob. '
             'A experiência do aluno final — a parte que gera receita — permanece estável porque roda no aparelho.'),

    ('h1', '12. Resiliência'),
    ('body', 'A matriz abaixo simula a falha de cada dependência e compara a proteção existente com a lacuna. '
             'Padrão geral: o gateway de IA está bem protegido; todo o resto reage por acidente, não por design.'),
    ('table', {
        'headers': ['Se falhar...', 'O que acontece hoje', 'Proteção existente', 'Lacuna'],
        'ratios': [0.17, 0.31, 0.26, 0.26],
        'fs': 8.0,
        'rows': [
            ['Vercel Blob fica lento/fora', 'login/registro/webhook falham; heartbeat engolido por catch vazio', 'try/catch pontual (auth/me:42-44)', 'sem fallback, sem fila, sem alerta; lastSeen e eventos perdidos'],
            ['Gemini fica lento', 'geração pendurada até o limite', 'AbortController 55/58s + cadeia de 3 modelos + retry (ai-gateway.ts:170-205)', 'sem circuit breaker (requisições seguem para provedor doente)'],
            ['Z.ai SDK fica lento', 'request pendurada', '2 tentativas na rota (generate:96-113)', 'sem timeout explícito no SDK'],
            ['Cakto API fica lenta', '/api/license presa até maxDuration', 'limites de plataforma (60s/30s)', 'sem timeout no cliente HTTP (cakto.ts:22-27,82-85)'],
            ['Webhook chega 2x (retry da Cakto)', 'usuário duplicado / assinatura reativada', 'nenhum', 'sem idempotência nem dedupe de evento'],
            ['Instância serverless reinicia', 'rate maps zerados; limites reiniciam', 'nenhum', 'limites efetivos multiplicados por N instâncias'],
            ['Usuário recarrega no meio da geração', 'chunk re-enviável sem perder progresso', 'geração resumível por chunk (upload-dialog:148-181)', 'sem dedupe de custo (o chunk re-pago é invisível)'],
        ],
    }),

    ('h1', '13. Observabilidade'),
    ('body', 'Resposta direta às duas perguntas do roteiro. <b>"Se o sistema parar para 5.000 usuários às 3h '
             'da manhã, saberíamos?" Não.</b> Não existe error tracking (Sentry/Datadog: zero resultados em '
             'package.json e src/), não existe métrica, não existe alerta, não existe health check consumido. '
             '<b>"Saberíamos qual componente causou?" Também não.</b> São 6 chamadas console.* em todo o '
             'servidor, sem log estruturado, sem request-id, sem correlation-id; a única linha que loga payload '
             '(webhook/cakto/route.ts:60) registra PII do comprador em texto plano — o pior dos dois mundos: '
             'pouca visibilidade e vazamento onde existe.'),
    ('bullet', [
        '<b>O que existe:</b> logs de plataforma da Vercel (duração/erros de função), 6 console.*, trilha de eventos no Blob (appendEvent cap 250).',
        '<b>O que falta para operar profissionalmente:</b> error tracking com source maps; log estruturado JSON com request-id; métricas por rota (p95, taxa de erro, custo por chamada de IA); alerta em falha de webhook e em erro 5xx sustentado; trilha de auditoria de ações admin (quem, quando, o que).',
        '<b>Risco de negócio associado:</b> fraude no webhook e abuso de IA são invisíveis até aparecerem na fatura ou na reclamação de usuário — hoje não há como detectar nem delimitar um incidente.',
    ]),

    ('h1', '14. Custos'),
    ('body', '<b>NÃO FOI POSSÍVEL DETERMINAR o custo absoluto</b> — sem acesso ao plano da Vercel, às métricas '
             'de uso atuais e aos volumes de IA consumidos, qualquer número seria inventado. O que a auditoria '
             'identifica são os vetores de explosão de custo, todos ligados a achados já citados, e as métricas '
             'que precisam começar a ser coletadas agora para viabilizar estimativa futura.'),
    ('bullet', [
        '<b>IA custeada pelo app:</b> com /api/generate e /api/transcribe abertos (achado 5), cada request anônimo custa dinheiro real (zai → gateway). Este é o único vetor capaz de gerar prejuízo em dias, não meses.',
        '<b>Escritas e egress do Blob:</b> heartbeat + appendEvent + overview multiplicam requests de escrita/leitura; fotos base64 de 160 KB dentro dos JSONs inflacionam o egress a cada leitura admin.',
        '<b>Funções de 150 s:</b> concorrência e duração de /api/generate consomem o limite de execução do plano e viram timeout pago sem retorno.',
        '<b>Logs:</b> sem retenção/política, o volume cresce sem controle (e hoje já carrega PII).',
    ]),
    ('body', '<b>Métricas a coletar (pré-requisito de qualquer estimativa):</b> MAU; chamadas/dia em /api/generate '
             'e /api/transcribe (por chave BYOK vs custeada); tokens médios por geração; GB-mês e operações do '
             'Blob por prefixo; duração p95 das funções; egress do overview admin. Com 30 dias dessas séries, a '
             'estimativa de custo por usuário ativo sai direto dos dados.'),

    ('h1', '15. O Que Quebra Primeiro'),
    ('body', 'Previsão técnica baseada exclusivamente na arquitetura encontrada — sem especulação genérica.'),
    ('num', [
        '<b>1º — O registro central (Blob JSON).</b> É o único componente no caminho de TODAS as operações com conta. Com dezenas de milhares de contas: findUserByEmail O(N) no webhook estoura maxDuration (compras deixam de ativar assinatura), unicidade sem lock duplica registros, o cap de 2.000 esconde usuários do admin. É aqui que o negócio para de funcionar antes de o site cair.',
        '<b>2º — O custo e os provedores de IA.</b> Rotas abertas sem sessão nem rate limit (confirmado em produção): abuso automatizado converte o produto em proxy gratuito e a fatura de IA em passivo. Pode preceder o item 1 se o tráfego crescer mais rápido que a base de contas.',
        '<b>3º — O limite de escrita do Blob via heartbeat.</b> ~1,2M escritas/hora a 100k MAU aciona rate limiting da plataforma; efeito colateral pior: a corrida heartbeat × webhook × admin com read-modify-write sem lock perde status de assinatura — alunos pagantes bloqueados sem motivo aparente.',
        '<b>4º — O painel administrativo.</b> O overview materializa até 2.000 JSONs + fotos base64 por request: dezenas de MB, timeout, métricas truncadas — o dono perde visibilidade exatamente quando mais precisa dela.',
        '<b>5º — A operação/suporte.</b> Sem observabilidade, sem reset de senha, sem LGPD, sem testes: cada incidente vira crise manual e cada reclamação vira ticket de engenharia. Não derruba o sistema; derruba quem o opera.',
    ]),

    ('h1', '16. Roadmap de Escala'),
    ('h2', 'AGORA (esta semana — P0)'),
    ('bullet', [
        'Revogar e rotacionar os três segredos expostos (Vercel vcp_, GitHub ghp_, Cakto client_secret); remover scripts/set-vercel-ai-env.py do git (git rm --cached) e purgar .env/worklog do rastreamento.',
        'Webhook Cakto fail-closed: exigir segredo sempre + idempotência mínima por (email, evento, timestamp) + remover o log do corpo.',
        'Projetar AdminUserView explícita: overview SEM passwordHash, SEM foto, SEM notes, SEM accessCodesEnv.',
        'Gate de sessão + status em /api/generate, /api/transcribe e /api/ai/test (validateUserSession + accessOf) + rate limit por uid.',
        'Heartbeat sem escrita (ou throttled para 1x/dia).',
    ]),
    ('h2', 'ANTES DE 1.000 USUÁRIOS'),
    ('bullet', [
        'Migrar o registro central para Postgres gerenciado (Neon/Supabase) com modelo User real, unique(email), upsert atômico e pooling (directUrl/pgbouncer).',
        'Backup diário automático do banco + teste de restore.',
        'Sentry + log estruturado com request-id; alerta em 5xx sustentado e falha de webhook.',
        'Reset de senha + verificação de e-mail; endpoints LGPD de exclusão e exportação.',
        'CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy; ignoreBuildErrors:false; ESLint mínimo ativo.',
    ]),
    ('h2', 'ANTES DE 10.000 USUÁRIOS'),
    ('bullet', [
        'Fila serverless (QStash/Inngest) para geração de IA + quota diária por usuário; tirar o processamento da request.',
        'Rate limit distribuído (Upstash Redis) substituindo os Maps em memória.',
        'CI (lint + typecheck + build) e primeira suíte de testes: autenticação, webhook (replay/forgery) e licença.',
        'vercel.json com maxDuration e regiões explícitos; dashboard de métricas de custo (métricas da seção 14).',
    ]),
    ('h2', 'ANTES DE 50.000 USUÁRIOS'),
    ('bullet', [
        'Read replica/cache para leituras do painel; paginação real no overview.',
        'Code-splitting (next/dynamic por tela), Web Worker para PDF, virtualização do histórico.',
        'Split de library-screen.tsx (1.354 linhas) e extração de módulos compartilhados; remoção das ~18 deps mortas.',
        'Revisão de custo por usuário ativo contra a série coletada desde 10k.',
    ]),
    ('h2', 'ANTES DE 100.000 USUÁRIOS'),
    ('bullet', [
        'DR drills com RTO/RPO definidos; SLOs formais e error budget.',
        'WAF/edge rules na Vercel; pentest externo focado em auth/webhook/licença.',
        'Multi-região e sharding apenas se as métricas de latência exigirem — não antes.',
        'Conformidade LGPD formal: política de retenção, responsável nomeado, registro de operações.',
    ]),

    ('h1', '17. Arquitetura Recomendada'),
    ('body', 'A arquitetura-alvo é a <b>mais simples capaz de suportar 100.000 usuários</b>, não a mais '
             'sofisticada. O monolito modular atual é mantido; o que muda é a troca do pseudo-banco (Blob JSON) '
             'por um banco transacional gerenciado, e a saída do processamento pesado da request. Tabela de '
             'decisão componente a componente:'),
    ('table', {
        'headers': ['Componente', 'Decisão', 'Quando', 'Justificativa'],
        'ratios': [0.22, 0.13, 0.15, 0.50],
        'fs': 8.3,
        'rows': [
            ['Monolito modular Next.js (atual)', 'MANTER', 'Já é', 'Suficiente até 100k se a camada de dados for corrigida; o acoplamento real está nos dados, não no código.'],
            ['Postgres gerenciado (Neon/Supabase)', 'ADOTAR', 'AGORA', 'Substitui o Blob de contas: unique(email), upsert atômico, transações, backups nativos, pooling.'],
            ['Vercel Blob', 'REDUZIR', 'AGORA', 'Manter apenas se surgir upload server-side; hoje não precisa guardar nada essencial.'],
            ['Fila serverless p/ IA (QStash/Inngest)', 'ADOTAR', 'Antes de 10k', 'Tira o maxDuration 150 da request; permite retry, quota e dedupe de custo.'],
            ['Redis (Upstash) p/ rate limit', 'ADOTAR', 'Antes de 10k', 'Limites efetivos em multi-instância; contador por uid/IP compartilhado.'],
            ['Sentry + logs estruturados', 'ADOTAR', 'AGORA (1k)', 'Custo mínimo, e é a diferença entre incidente de 5 min e de 5 h.'],
            ['Load balancer / Kubernetes', 'NÃO', 'n/a', 'A Vercel já entrega escala horizontal; K8s aqui é overengineering puro.'],
            ['Microserviços', 'NÃO', 'n/a', 'Não há domínio que justifique; o acoplamento atual é de dados, e o Postgres resolve.'],
            ['CDN/edge cache', 'JÁ INCLUIDO', 'n/a', 'Vercel Edge entrega hoje (probe: 39 ms); nada a construir.'],
            ['WAF + pentest', 'ADOTAR', 'Antes de 50k', 'Superfície de pagamento + IA justifica camada gerenciada de filtro.'],
        ],
    }),
    ('body', 'Com essa mudança, os achados 6 e 7 (Blob O(N) e heartbeat) desaparecem por construção — upsert '
             'atômico com unique(email) substitui o lock manual; o heartbeat vira UPDATE de uma coluna last_seen, '
             'ou deixa de existir. Os achados 2-5 se tornam regras de aplicação sobre uma base confiável, e o '
             'backup/DR passa a ser um recurso do banco, não um projeto.'),

    ('h1', '18. Overengineering a Evitar'),
    ('body', 'O roteiro pede explicitamente o que NÃO construir. Esta lista é tão importante quanto o roadmap: '
             'cada item abaixo gastaria semanas que os riscos P0 exigem para si.'),
    ('bullet', [
        '<b>Microserviços:</b> o produto tem 1 domínio, 1 equipe e 20 rotas. Nenhuma fronteira de negócio justifica rede interna, tracing distribuído ou contratos entre serviços.',
        '<b>Kubernetes/self-hosting:</b> a Vercel já resolve escala, TLS, edge e rollback. Migrar só aumentaria superfície operacional sem ganho de escala visível até 100k.',
        '<b>Arquitetura event-driven completa:</b> a fila recomendada (seção 17) é pontual — para IA. Transformar todo o fluxo em eventos agora seria complexidade sem demanda.',
        '<b>Cache distribuído antes de 10k:</b> com o Postgres no lugar, as leituras quentes (sessão/status) são queries de chave primária; o Redis entra quando as métricas mostrarem, não antes.',
        '<b>Multi-região:</b> usuários brasileiros, app client-heavy; a latência percebida é dominada pelo aparelho. Só com métricas provando necessidade.',
        '<b>GraphQL/CQRS/Kafka:</b> zero indicação nos dados atuais.',
        '<b>Reescrever o cliente:</b> a SPA local-first é o maior ativo do projeto — refatorar por estética (em vez de dividir page.tsx/library-screen com critério) seria queimar o diferencial.',
    ]),

    ('h1', '19. Plano de Ação'),
    ('h2', 'FAZER IMEDIATAMENTE'),
    ('num', [
        'Revogar/rotacionar Vercel vcp_, GitHub ghp_ e Cakto client_secret; git rm --cached dos arquivos com segredos e limpeza de histórico. (complexidade: baixa; horas)',
        'Webhook Cakto fail-closed + idempotência por (email, evento, timestamp) + remover PII do log. (baixa-média; 1-2 dias)',
        'Overview admin projetado (sem passwordHash/foto/notes/accessCodesEnv) + soft-delete e auditoria de ações admin. (baixa; 1 dia)',
        'Sessão + status + rate limit em /api/generate, /api/transcribe, /api/ai/test. (média; 1-2 dias)',
        'Heartbeat sem escrita de Blob (ou throttle 24h). (baixa; horas)',
    ]),
    ('h2', 'FAZER EM SEGUIDA'),
    ('num', [
        'Migração do registro central para Postgres gerenciado (User real, unique email, upsert atômico) com cutover testado. (média-alta; 1 semana)',
        'Backup diário + restore ensaiado. (baixa; 1 dia)',
        'Sentry + log estruturado + alertas básicos. (baixa; 1-2 dias)',
        'Reset de senha, verificação de e-mail e endpoints LGPD (excluir/exportar). (média; 3-4 dias)',
        'Headers de segurança + ignoreBuildErrors:false + ESLint essencial + CI mínimo (lint, typecheck, build). (baixa; 1-2 dias)',
    ]),
    ('h2', 'PODE ESPERAR'),
    ('num', [
        'Fila para IA + quota diária por usuário (antes de 10k).',
        'Rate limit distribuído em Redis (antes de 10k).',
        'Code-splitting, Web Worker de PDF, virtualização do histórico, split de telas gigantes.',
        'Remoção das ~18 dependências mortas e do fóssil Prisma/next-auth.',
    ]),
    ('h2', 'NÃO MEXER AGORA'),
    ('num', [
        'BYOK: o design (chave local, não persistida, testável) é válido — manter, apenas nunca logar o corpo.',
        'Extração client-side de PDF: diferencial de custo e privacidade; evoluir com Web Worker, não substituir.',
        'Monolito: não fragmentar em serviços; dividir arquivos grandes com critério, não com arquitetura.',
        'Dark theme e cronômetro do trial: já corrigidos no commit 4efac13 (contraste das questões e unificação floor/ceil) — reabrir apenas se houver regressão.',
    ]),

    ('h1', '20. Veredito Final'),
    ('h3', 'PERGUNTA 1 — O sistema está tecnicamente preparado para crescer 10x?'),
    ('body', '<b>Não, na forma atual.</b> 10x aciona simultaneamente os itens 1, 2, 3 e 5 do Top 20: o scan '
             'O(N) do webhook estoura maxDuration, o gate aberto de IA converte crescimento em prejuízo, o '
             'heartbeat amplifica escrita, e o painel perde visibilidade. Porém, este é o cenário de '
             'recuperação mais barato de toda a auditoria: com os cinco itens de "FAZER IMEDIATAMENTE" '
             'concluídos, 10x passa a ser suportável com folga — o cliente local-first faz o trabalho pesado.'),
    ('h3', 'PERGUNTA 2 — Está preparado para 100.000 usuários?'),
    ('body', '<b>Não. Com modificações, sim.</b> A condição necessária e suficiente é a migração do registro '
             'central para um banco transacional gerenciado (seção 17) mais o roadmap das seções 16 e 19. A '
             'arquitetura de cliente não precisa mudar; a de servidor precisa deixar de usar storage de objetos '
             'como banco. Nada aqui exige reconstruir o produto — exige corrigir a fundação da conta.'),
    ('h3', 'PERGUNTA 3 — Os 5 maiores riscos para o negócio'),
    ('num', [
        '<b>Fraude de assinatura:</b> webhook forjável/replayável transforma receita recorrente em opcional para quem souber o endpoint.',
        '<b>Custo de IA sem freio:</b> proxy aberto custeado pelo app — prejuízo em escala de dias, sem telemetria para detectar.',
        '<b>Vazamento de hash de senha e PII via admin:</b> dano reputacional e exposição LGPD imediata.',
        '<b>Perda de contas/assinaturas sem backup:</b> incidente único no Blob apaga a base de MRR sem caminho de volta.',
        '<b>Segredos a um push do vazamento:</b> token Vercel commitado (branch a 17 commits do GitHub) pode comprometer toda a infraestrutura de deploy; e, no plano de produto, o trial infinito via deviceUid corrói a conversão.',
    ]),
    ('h3', 'PERGUNTA 4 — O menor conjunto de mudanças para reduzir drasticamente os riscos'),
    ('body', 'Sete itens, todos da seção 19, em ordem: (1) rotacionar os três segredos e limpar o git; '
             '(2) webhook fail-closed com idempotência; (3) overview sem hash/PII/códigos; (4) sessão e rate '
             'limit nas rotas de IA; (5) heartbeat sem escrita; (6) backup diário com restore testado; '
             '(7) Sentry com alerta básico. Nenhuma dessas mudanças altera a experiência do usuário; juntas, '
             'eliminam quatro dos cinco riscos de negócio acima e tornam o quinto (trial) visível e gerenciável '
             'até a migração de banco.'),
    ('h3', 'Resposta final às duas perguntas do roteiro'),
    ('body', '<b>"Se o sistema crescer 10x nos próximos meses, quais são os 5 problemas que mais podem colocar '
             'o negócio em risco?"</b> Os cinco riscos da PERGUNTA 3, nesta ordem de probabilidade: custo de IA '
             'aberto, fraude de webhook, perda de status de assinatura por corrida de escrita, truncamento do '
             'painel (cegueira operacional) e vazamento de segredos. <b>"Qual é o menor conjunto de mudanças '
             'que devemos fazer AGORA?"</b> Os sete itens da PERGUNTA 4 — entre 1 e 2 semanas de trabalho '
             'concentrado, sem overengineering, sem reescrever nada que já funciona.'),
]
