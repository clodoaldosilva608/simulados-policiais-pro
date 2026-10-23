# -*- coding: utf-8 -*-
"""Conteúdo do relatório de auditoria — Parte 1 (seções 1-10)."""

SEV_C = '<font color="#a05252"><b>CRÍTICO</b></font>'
SEV_A = '<font color="#a3702a"><b>ALTO</b></font>'
SEV_M = '<font color="#5a7a96"><b>MÉDIO</b></font>'
SEV_B = '<font color="#6a8a6a"><b>BAIXO</b></font>'

PART1 = [
    ('h1', '1. Resumo Executivo'),
    ('quote', 'Se eu fosse responsável por colocar 100.000 usuários neste sistema, minha avaliação seria: '
              '<b>não colocaria na forma atual.</b> A nota de prontidão é <b>3,2/10</b>. O produto funciona '
              'e a experiência local-first é um diferencial real de arquitetura, mas a camada de contas do '
              'servidor não existe como banco de dados, há sete riscos críticos confirmados com arquivo e linha '
              '— três deles acionáveis em produção hoje — e não existe um único teste automatizado, backup ou '
              'alerta de incidente. Com as correções P0 deste relatório (estimadas em 1 a 2 semanas de trabalho), '
              'o sistema passa a suportar crescimento de 10x com segurança razoável.'),
    ('body', 'O Simulados Policiais Pro é uma SPA Next.js executada quase inteiramente no aparelho do aluno: '
             'o PDF nunca sai do dispositivo, a extração de texto acontece no navegador (unpdf) e todo o '
             'progresso de estudo (documentos, tentativas, caderno de erros) vive em IndexedDB. Essa decisão '
             'é o maior ativo arquitetural do projeto: o componente mais caro de escalar — o processamento por '
             'usuário — é, por construção, distribuído nos aparelhos dos próprios usuários. O servidor '
             'responde em 39 ms na homepage e não guarda dados de estudo.'),
    ('body', 'O problema está no que sobrou no servidor. O "banco de dados" de contas e assinaturas é uma '
             'coleção de arquivos JSON no Vercel Blob, varrida sequencialmente com teto de 2.000 usuários '
             '(src/lib/blob-registry.ts:112,139-147), com índices de unicidade reescritos integralmente sem '
             'lock (src/lib/user-auth.ts:205-256) e com um heartbeat que reescreve o JSON completo do usuário '
             'a cada 5 minutos (src/app/api/auth/me/route.ts:41). Em paralelo, o webhook de pagamento aceita '
             'operar sem segredo configurado, sem HMAC e sem idempotência (src/app/api/webhook/cakto/route.ts:47-54, '
             '56-110), o painel administrativo devolve o hash de senha de todos os usuários na resposta HTTP '
             '(src/app/api/admin/overview/route.ts:47-53,103) e as rotas de geração por IA estão abertas sem '
             'sessão nem rate limit — confirmado por probe em produção, que respondeu 400 (validação de conteúdo) '
             'em vez de 401 para uma requisição anônima.'),
    ('callouts', [
        ('3,2/10', 'nota geral de prontidão (100k)'),
        ('7', 'riscos críticos com evidência'),
        ('0', 'testes automatizados / CI'),
        ('2.000', 'teto de usuários visível no admin'),
    ]),
    ('body', 'Os sete riscos críticos (P0), em ordem de urgência: <b>(1)</b> token da API da Vercel hardcoded '
             'em arquivo commitado, a um push do GitHub; <b>(2)</b> webhook da Cakto que vira assinatura paga '
             'sem validação criptográfica e aceita replay; <b>(3)</b> exposição do hash de senha e PII completa '
             'via /api/admin/overview; <b>(4)</b> proxy de IA aberto e sem limite custeado pelo dono do app; '
             '<b>(5)</b> registro central em JSON sem banco, sem índice e sem lock; <b>(6)</b> heartbeat com '
             'amplificação de escrita que, a 100 mil usuários, chega a aproximadamente 1,2 milhão de escritas por '
             'hora; <b>(7)</b> ausência total de conformidade LGPD — o titular não consegue excluir nem exportar '
             'os próprios dados. Nenhum deles exige reescrever o produto; todos exigem decisão imediata.'),

    ('h1', '2. Nota da Engenharia Atual'),
    ('body', 'As notas abaixo avaliam prontidão para 100.000 usuários ativos — não a funcionalidade atual, que '
             'está entregue e operando em produção. O critério é: "este pilar suporta crescimento de 10x a 100x '
             'sem reconstrução de emergência?". Cada nota está ancorada nos achados das seções seguintes, com '
             'arquivo e linha; quando a evidência é um probe de produção, isso está indicado.'),
    ('table', {
        'headers': ['Pilar', 'Nota', 'Justificativa em uma linha'],
        'ratios': [0.20, 0.08, 0.72],
        'rows': [
            ['Arquitetura', '6,0', 'Local-first bem executado no cliente; servidor sem camada de dados real (JSON no Blob).'],
            ['Segurança', '2,5', 'Hash scrypt e sessão HMAC corretos, mas 7 vetores críticos abertos (webhook, overview, IA, secrets).'],
            ['Banco de dados', '2,0', 'Não há banco server: JSON no Blob com varredura O(N), cap 2.000, unicidade sem lock, zero backup.'],
            ['Escalabilidade', '3,5', 'Cliente escala por construção; o registro central colapsa entre 10k e 50k contas.'],
            ['Performance', '5,0', 'TTFB 39 ms (probe); riscos estruturais: bundle 384 KB de dados, PDF na main thread, O(N) no admin.'],
            ['Resiliência', '3,0', 'Timeouts e fallback de IA bem feitos; sem retries/backoff, circuit breaker, idempotência ou DR.'],
            ['Observabilidade', '1,5', '6 console.* sem estrutura, sem request-id, sem error tracking; PII em log de webhook.'],
            ['Testes', '0,5', 'Zero testes automatizados; apenas scripts manuais em tests/; sem CI.'],
            ['Manutenibilidade', '5,0', 'Código legível e comentado, mas telas de 800-1.354 linhas, TS/ESLint desligados, ~18 deps mortas.'],
            ['DevOps/Deploy', '3,0', 'Vercel + GitHub integrados; deploy manual, sem CI, secrets pendentes de rotação, .env commitado.'],
        ],
    }),
    ('img', ('/home/z/my-project/scripts/audit_scores.png',
             'Figura 1 — Notas por pilar (0-10). Linha tracejada: nota geral 3,2.', 250)),
    ('body', '<b>NOTA GERAL: 3,2/10.</b> A média simples dos dez pilares é 3,25. A leitura correta desse número '
             'é assimétrica: os pilares altos (arquitetura 6,0, performance 5,0, manutenibilidade 5,0) mostram '
             'que o design de produto é competentemente executado; os pilares baixos (testes 0,5, observabilidade '
             '1,5, banco 2,0, segurança 2,5) são exatamente os que falham primeiro e mais caro sob crescimento. '
             'Não é uma nota de qualidade de software escrita — é uma nota de risco operacional a 100k usuários.'),

    ('h1', '3. Arquitetura Atual'),
    ('body', 'O sistema real funciona assim: o aluno abre a SPA (uma única rota /, treze telas trocadas por '
             'useState, sem deep-links); o PDF selecionado é processado no próprio aparelho pelo unpdf/pdf.js '
             'e fatiado em blocos de até 7.000 caracteres (máximo 10 blocos por documento); cada bloco vai por '
             'POST a /api/generate com a chave de IA do aluno no corpo (BYOK), e as questões geradas voltam para '
             'o IndexedDB. Conta, trial de 7 dias, assinatura Cakto e perfil (nome, foto em data URL de até '
             '160 KB) vivem no servidor — porém não em um banco: em arquivos JSON no Vercel Blob, um por usuário, '
             'manipulados por src/lib/blob-registry.ts via read-modify-write. O painel /admin (cookie próprio '
             'spp_admin, HMAC 12h) lê todos os JSONs para calcular métricas. Pagamentos entram por webhook '
             'da Cakto ou ativação consultando a API da Cakto em tempo real.'),
    ('table', {
        'headers': ['Tecnologia', 'Onde aparece', 'Função', 'Risco principal'],
        'ratios': [0.18, 0.22, 0.28, 0.32],
        'fs': 8.3,
        'rows': [
            ['Next.js 16 App Router, React 19', 'src/app (68 "use client", 2 server)', 'SPA de 13 telas + 20 rotas API', 'Tudo client-renderizado; sem deep-links; erro de TS ignorado no build.'],
            ['Tailwind CSS 4', 'globals.css', 'Tema claro/escuro próprio (classe .dark)', 'Baixo; overrides manuais exigem disciplina.'],
            ['IndexedDB (API crua, v2)', 'src/lib/local-db.ts', 'documents + attempts + errors', 'Sem migração de schema; QuotaExceededError engolido em silêncio.'],
            ['localStorage (11 chaves)', 'src/lib/license.ts, ai-settings.ts etc.', 'trial, deviceUid, chave de IA, metas', 'Chave de IA em texto plano; deviceUid controlado pelo cliente.'],
            ['unpdf / pdf.js', 'src/lib/pdf-text.ts, pdf-ocr.ts', 'Extração de PDF no aparelho', 'Main thread; pico de RAM com PDFs de 50 MB em iOS.'],
            ['Vercel Serverless (Node)', 'src/app/api/** (20 rotas)', 'Auth, licenças, IA, admin, webhook', 'maxDuration até 150s; estado em memória por instância.'],
            ['Vercel Blob (JSON)', 'src/lib/blob-registry.ts', 'Contas, índices, eventos, códigos', 'Não é banco: O(N), cap 2.000, read-modify-write sem lock.'],
            ['Google Gemini (BYOK + nativo)', 'src/lib/ai-gateway.ts', 'Geração de questões e OCR', 'Chave transita pelo servidor (não é persistida); fallback de modelos bem implementado.'],
            ['Z.ai SDK + gateway OpenAI-compat', 'generate, transcribe, ai/test', 'Provedores custeados pelo app', 'SDK sem timeout; expostos sem rate limit (achado 5).'],
            ['Cakto (checkout + API)', 'src/config/site.ts, src/lib/cakto.ts', 'Assinatura R$ 17,90/mês', 'API sem timeout; webhook com segredo opcional.'],
            ['GitHub + Vercel', 'repo clodoaldosilva608/simulados-policiais-pro', 'Deploy por push', 'Sem CI/testes; token Vercel commitado (achado 1).'],
            ['Vercel Edge (headers)', 'probe de produção', 'TLS + HSTS padrão', 'Sem CSP, X-Frame-Options, X-Content-Type-Options.'],
        ],
    }),
    ('body', '<b>FATO OBSERVADO estrutural:</b> o Prisma existe no package.json e em prisma/schema.prisma '
             '(provider sqlite), mas não há um único import de @prisma/client em src/ — o schema é um fóssil '
             'de uma fase anterior (e incompatível com serverless: SQLite exige filesystem local). Da mesma '
             'forma, next-auth está instalado e não é usado. A autenticação real é artesanal e correta no '
             'essencial: scrypt + salt + timingSafeEqual para senhas (src/lib/user-auth.ts:41-58) e token '
             'HMAC-SHA256 em cookie httpOnly/Secure/SameSite=Lax de 30 dias (:71-122).'),

    ('h1', '4. Diagrama do Sistema'),
    ('body', 'O diagrama abaixo reconstrói o fluxo real — usuário, aparelho, serverless, persistência e '
             'serviços externos — a partir do código, não da intenção de design. As setas vermelhas marcam os '
             'dois fluxos críticos confirmados: a geração de IA custeada pelo app (aberta a anônimos) e o '
             'webhook de pagamento forjável/replayável.'),
    ('img', ('/home/z/my-project/scripts/audit_diagram.png',
             'Figura 2 — Arquitetura real do Simulados Policiais Pro (reconstruída do código). Vermelho: fluxos críticos. Tracejado: lacunas estruturais.', 300)),
    ('body', 'Três leituras importantes do diagrama. Primeira: nenhuma seta sai do aparelho levando dado de '
             'estudo — o conteúdo de estudo nunca deixa o dispositivo, o que torna o isolamento entre '
             'usuários de estudo trivialmente correto (seção 8). Segunda: todas as rotas do serverless convergem '
             'para o mesmo ponto único — o Vercel Blob de JSONs — que é ao mesmo tempo banco, índice e fila de '
             'eventos; qualquer gargalo ali é gargalo de tudo (seções 9, 10 e 15). Terceira: a chave BYOK do '
             'aluno entra no corpo do POST e atravessa a função serverless antes de chegar ao Google; ela não é '
             'persistida (grep confirma zero escritas), mas transita pela plataforma — correto, porém exige '
             'disciplina permanente de não logar o corpo da requisição.'),

    ('h1', '5. Top 20 Problemas'),
    ('body', 'Consolidação dos achados verificados, ordenada por severidade e prioridade. "Evidência" cita '
             'arquivo e linha; probes de produção estão marcados. P0 = corrigir imediatamente; P1 = antes de '
             'crescer; P2 = manutenção programada.'),
    ('table', {
        'headers': ['#', 'Severidade', 'Problema', 'Evidência', 'Impacto', 'Prio.'],
        'ratios': [0.04, 0.11, 0.32, 0.24, 0.22, 0.07],
        'fs': 7.6,
        'rows': [
            ['1', SEV_C, 'Token da API Vercel (vcp_) hardcoded em arquivo commitado; branch a 17 commits do push', 'scripts/set-vercel-ai-env.py:5; git ls-files; git status (ahead 17)', 'Comprometimento total da infra de deploy', 'P0'],
            ['2', SEV_C, 'Webhook Cakto fica totalmente aberto se CAKTO_WEBHOOK_SECRET não estiver configurada', 'api/webhook/cakto/route.ts:47-54', 'Assinatura "pro" forjável por POST anônimo', 'P0'],
            ['3', SEV_C, 'Webhook sem HMAC e sem idempotência; replay de purchase_approved reativa assinatura cancelada', 'route.ts:56-110 (upsert em :67-80)', 'Receita contornável; estados inconsistentes', 'P0'],
            ['4', SEV_C, '/api/admin/overview retorna passwordHash, foto base64, notas e códigos da env de todos os usuários', 'admin/overview/route.ts:47-53,103,113-116', 'Vazamento de credenciais offline-quebráveis e PII', 'P0'],
            ['5', SEV_C, '/api/generate e /api/transcribe sem sessão nem rate limit; ACCESS_CODES ausente em produção (probe: 400, não 401)', 'generate/route.ts:21-31,136 + probe', 'Proxy de IA aberto custeado pelo dono', 'P0'],
            ['6', SEV_C, 'Registro central em JSON no Blob: listUsers cap 2.000, leitura sequencial, findUserByEmail O(N)', 'blob-registry.ts:112,139-154', 'Latência/custo explosivos; truncamento silencioso', 'P0'],
            ['7', SEV_C, 'Heartbeat reescreve o JSON completo do usuário a cada 5 min, sem lock (corrida com webhook/admin)', 'auth/me/route.ts:41; blob-registry.ts:168-218', '~1,2M escritas/h a 100k; perda de status de assinatura', 'P0'],
            ['8', SEV_C, 'LGPD: nenhum endpoint de exclusão ou exportação pelo titular (busca sem resultados)', 'src/app/api (grep "delete")', 'Risco regulatório direto (LGPD art. 18)', 'P0'],
            ['9', SEV_A, 'Anti-fraude do trial baseado em deviceUid gerado e guardado no localStorage', 'src/lib/license.ts:32-47; register/route.ts:49', 'Trial de 7 dias renovável indefinidamente', 'P1'],
            ['10', SEV_A, 'Questões oficiais (~384 KB de TS) embutidas no bundle do cliente; gate de telas é cosmético', 'src/data/*.ts; page.tsx:19', 'Conteúdo pago extraível; TTI degradado', 'P1'],
            ['11', SEV_A, 'Sem backup/DR de contas e assinaturas (busca sem resultados em scripts/docs)', 'repo (grep backup/restore)', 'Perda de MRR e de contas em incidente único', 'P1'],
            ['12', SEV_A, 'Segredo do webhook em query string e comparação com !== (não timing-safe)', 'webhook/cakto/route.ts:11-14,51', 'Segredo vaza em logs de acesso/CDN', 'P1'],
            ['13', SEV_A, 'Sem recuperação de senha e sem verificação de e-mail (busca sem resultados)', 'src/lib/user-auth.ts (grep reset/verify)', 'Contas irrecuperáveis; cadastro com e-mail alheio', 'P1'],
            ['14', SEV_A, 'Rate limits em Map na memória da instância serverless', 'user-auth.ts:379-390; admin-auth.ts:125', 'Brute force multiplicado pelo número de instâncias', 'P1'],
            ['15', SEV_A, 'Sem CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (probe confirma)', 'next.config.ts:1-12 + probe de headers', 'Clickjacking, sniffing, XSS amplificado', 'P1'],
            ['16', SEV_A, 'Delete admin permanente sem soft-delete nem trilha de auditoria de quem agiu', 'admin/users/route.ts:123-133', 'Destruição em massa com um cookie roubado', 'P1'],
            ['17', SEV_A, 'Sessões aceitas também via header Authorization: Bearer (token portador, sem escopo)', 'user-auth.ts:104-111; admin-auth.ts:97-104', 'Token em log de proxy reutiliza sessão de 30d', 'P1'],
            ['18', SEV_M, '.env e worklog.md commitados; PAT do GitHub embutido na URL do remote', 'git ls-files; git remote -v', 'Padrão que garante vazamento futuro de secrets', 'P2'],
            ['19', SEV_M, 'ignoreBuildErrors:true + ESLint quase desligado + noImplicitAny:false', 'next.config.ts:6-8; eslint.config.mjs', 'Bugs de tipo e regressões passam silenciosas', 'P2'],
            ['20', SEV_M, 'Zero testes automatizados, zero CI, zero error tracking (Sentry etc.)', 'repo (grep test/spec/jest)', 'Regressões invisíveis; incidentes sem alerta', 'P2'],
        ],
    }),

    ('h1', '6. Buracos Encontrados'),
    ('body', 'Além dos problemas pontuais, a varredura revelou lacunas estruturais — coisas que simplesmente '
             'não existem e cuja ausência cobra preço assim que o sistema cresce. Elas estão listadas sem '
             'diplomacia, cada uma com a consequência concreta de continuar assim.'),
    ('bullet', [
        '<b>Autenticação incompleta:</b> não existe esqueci-minha-senha nem verificação de e-mail. Quem perde a senha depende de suporte manual; quem cadastra e-mail de terceiro trava esse e-mail para sempre (user-auth.ts:281).',
        '<b>LGPD inexistente:</b> sem exclusão de conta pelo titular, sem exportação de dados, sem política de retenção. A única deleção é administrativa e apaga tudo de uma vez (admin/users/route.ts:123-133).',
        '<b>Nenhum backup:</b> o "banco" inteiro (contas, assinaturas, códigos) são JSONs no Blob sem cópia de segurança, sem dump, sem restore documentado. Perda = perda de receita.',
        '<b>Nenhuma observabilidade:</b> sem Sentry, sem métricas, sem alertas, sem request-id; 6 chamadas console.* em todo o servidor, uma delas logando PII de comprador (webhook/cakto/route.ts:60).',
        '<b>Nenhum teste e nenhum CI:</b> zero arquivos *.test.*/*.spec.*, zero workflow .github, zero vercel.json. Todo deploy é uma aposta.',
        '<b>Schema fóssil:</b> prisma/schema.prisma (sqlite, sem modelo User) e next-auth instalados e mortos; scripts db:* com --accept-data-loss prontos para engano.',
        '<b>Anti-fraude cosmético:</b> o trial "1 por aparelho" depende de um deviceUid gerado no localStorage (license.ts:32-47) — limpar o storage cria novo trial; e o conteúdo pago (questões oficiais) viaja no bundle.',
        '<b>Sem service worker:</b> o app é "local-first" mas não funciona offline de forma declarada; o manifesto PWA existe, cache nenhum.',
        '<b>Sem documentação:</b> README e docs/ não existem; a única memória é o worklog.md — que está commitado e documenta segredos (item 18 do Top 20).',
        '<b>Código monolítico no cliente:</b> library-screen.tsx com 1.354 linhas acumulando header, menu, biblioteca e dialogs; zero next/dynamic em toda a app.',
        '<b>~18 dependências mortas:</b> next-auth, next-intl, react-query, react-table, mdxeditor, dnd-kit, zustand, zod, uuid, sharp e componentes ui/ órfãos — superfície de ataque e custo de build gratuitos.',
        '<b>Filas inexistentes:</b> geração de IA (maxDuration 150) e sincronização Cakto (maxDuration 60) rodam dentro da requisição HTTP; a 10k+ isso vira timeout e custo.',
    ]),

    ('h1', '7. Segurança'),
    ('body', 'A auditoria de segurança começou pelos pontos que estão certos — e eles existem: senhas com '
             'scrypt, salt aleatório e comparação timing-safe (user-auth.ts:41-58); sessão HMAC-SHA256 em cookie '
             'httpOnly/Secure/SameSite=Lax (:113-122); status de banimento checado no servidor a cada request '
             '(:162-174); admin falha fechada quando ADMIN_PASSWORD_HASH não está configurada (admin-auth.ts:34-40); '
             'probe em produção confirma 401 correto no overview sem sessão. O problema não é o que foi escrito; '
             'é o que falta ao redor.'),
    ('h2', '7.1 Autenticação e sessão'),
    ('table', {
        'headers': ['Achado', 'Severidade', 'Evidência', 'Por que é perigoso'],
        'ratios': [0.30, 0.11, 0.24, 0.35],
        'fs': 8.0,
        'rows': [
            ['Segredo da sessão do aluno com fallback para o segredo do admin', SEV_M, 'user-auth.ts:72', 'Rotacionar o segredo do painel invalida/afeta todas as sessões de alunos; domínios de confiança acoplados.'],
            ['Tokens aceitos via Bearer (portador)', SEV_A, 'user-auth.ts:104-111', 'Token vazado em log/proxy reutiliza sessão de 30 dias sem as proteções do cookie.'],
            ['Troca de senha não invalida sessões (sem jti/rotação)', SEV_M, 'user-auth.ts:64-84; password/route.ts', 'Conta comprometida continua acessível pelo atacante por até 30 dias.'],
            ['Sem reset de senha e sem verificação de e-mail', SEV_A, 'busca sem resultados', 'Recuperação manual via suporte; cadastro com e-mail de terceiro trava o e-mail.'],
            ['Sem 2FA no admin; brute-force limitado por instância', SEV_M, 'admin-auth.ts:125-141', 'Limite em memória é multiplicado pelas instâncias serverless.'],
        ],
    }),
    ('h2', '7.2 Webhook de pagamento (pior área do projeto)'),
    ('body', 'O webhook da Cakto é o caminho que transforma dinheiro em assinatura — e é o código com menor '
             'resistência a adversário. A validação é opcional: se CAKTO_WEBHOOK_SECRET não existir, nenhuma '
             'checagem é feita (route.ts:47-54); quando existe, viaja em query string (?secret=...) e é comparado '
             'com !== (:49-51), não de forma timing-safe. Não há assinatura HMAC do corpo, não há id de evento, '
             'não há timestamp, não há deduplicação: um replay de purchase_approved depois de um refund '
             'reativa a assinatura (:67-80), e o ramo de cancelamento cria usuários novos com e-mail arbitrário '
             'do payload (:81-95). O corpo da requisição, com PII do comprador, é logado em texto (:60). '
             'Em produção, com o segredo configurado, o risco residual é vazamento do segredo por logs + replay; '
             'sem o segredo, o risco é assinatura gratuita ilimitada.'),
    ('h2', '7.3 Painel administrativo'),
    ('bullet', [
        '<b>Exposição de credenciais (CRÍTICO):</b> o GET /api/admin/overview espalha o objeto completo de cada usuário — incluindo passwordHash scrypt, foto base64, notas administrativas — na resposta JSON (admin/overview/route.ts:47-53,103); hash de senha com mínimo de 6 caracteres (user-auth.ts:276) é offline-quebrável.',
        '<b>Códigos de acesso no corpo da resposta (ALTO):</b> accessCodesEnv devolve os códigos da env ACCESS_CODES (:113-116); vazamento por extensão/print/log permite ativação fraudulenta em /api/license.',
        '<b>Delete permanente (ALTO):</b> action=delete apaga a conta sem soft-delete, sem confirmação adicional e sem registrar quem agiu (admin/users/route.ts:123-133).',
        '<b>Materialização total (ALTO):</b> o overview lê até 2.000 JSONs por request e devolve todos; a milhares de contas, a resposta passa de dezenas de MB e as métricas ficam truncadas sem aviso (blob-registry.ts:112).',
    ]),
    ('h2', '7.4 Superfície de IA e headers'),
    ('body', 'As rotas /api/generate, /api/transcribe e /api/ai/test não exigem sessão; o único gate é o header '
             'estático x-access-code contra a env ACCESS_CODES — e quando a env não existe, hasValidAccess() '
             'retorna true (generate/route.ts:21-31). O probe de produção (POST com corpo vazio) respondeu 400 '
             '"Bloco de texto muito curto" — validação de conteúdo, que roda DEPOIS da checagem de acesso (:136 '
             'antes de :151) — provando que o gate está inativo em produção: qualquer anônimo com texto real '
             'consome os provedores custeados pelo app (cadeia zai → gateway-do-app, :171-172). /api/ai/test, '
             'sem rate limit, funciona como validador anônimo de chaves Gemini. Nos headers, o probe confirmou '
             'apenas HSTS (padrão Vercel); CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e '
             'Permissions-Policy não existem (next.config.ts tem apenas output standalone e ignoreBuildErrors).'),

    ('h1', '8. Multi-Tenancy e Isolamento'),
    ('body', 'O tenant é a conta individual (uid). A identificação chega ao backend pelo cookie spp_user '
             '(HMAC de {uid, deviceUid, exp}, httpOnly) e a cada request o servidor revalida status/banimento '
             'contra o registro central (user-auth.ts:162-174) — correto: o frontend não é camada de segurança '
             'para o status de acesso. A pergunta central da auditoria — "o usuário A consegue acessar, '
             'descobrir, alterar ou excluir dados do usuário B?" — tem resposta em duas partes distintas.'),
    ('body', '<b>Dados de estudo: não.</b> Documentos, tentativas, respostas e caderno de erros nunca saem do '
             'aparelho (IndexedDB); o servidor não possui endpoint que leia conteúdo de estudo de qualquer '
             'usuário — nem o admin acessa respostas de simulados, apenas metadados de conta. O isolamento aqui '
             'é por construção física, não por filtro de query, e por isso resiste a bugs de aplicação.'),
    ('body', '<b>Dados de conta/assinatura: parcialmente.</b> Três vetores quebram o isolamento no plano '
             'server: <b>(a)</b> /api/license ativa a conta logada informando apenas o e-mail declarado da '
             'compra (license/route.ts:103-126) — quem comprou pode ativar a conta de outrem, e uma assinatura '
             'pode alimentar várias contas; <b>(b)</b> /api/registry/track aceita um uid vindo do cliente e cria '
             'blob de usuário (registry/track/route.ts:55-70) — poluição e enumeração possíveis; <b>(c)</b> o '
             'overview admin expõe PII e hash de todos (achado 4). Além disso, o deviceUid do anti-fraude é '
             'escolhido pelo cliente (license.ts:32-47), o que esvazia a garantia "1 trial por aparelho".'),

    ('h1', '9. Banco de Dados e Camada de Dados'),
    ('body', '<b>Do lado do servidor não existe banco de dados.</b> O prisma/schema.prisma declara provider '
             'sqlite (linhas 5-8) com modelos Document/Question/TextBlock/Attempt, sem modelo User e sem '
             'nenhuma @@unique; não há pasta de migrations. Nenhum arquivo de src/ importa @prisma/client '
             '(grep: zero resultados) — e é impossível usar esse schema em Vercel serverless (filesystem efêmero), '
             'o que explica o abandono. O que opera de verdade é src/lib/blob-registry.ts: um arquivo JSON por '
             'usuário no Vercel Blob (users/<id>.json, com foto base64 embutida), mais índices em JSON '
             '(index/auth-emails.json, index/device-trials.json), eventos (cap 250) e configurações.'),
    ('table', {
        'headers': ['Mecanismo', 'Código', 'Comportamento real', 'Consequência em escala'],
        'ratios': [0.20, 0.24, 0.28, 0.28],
        'fs': 8.0,
        'rows': [
            ['listUsers()', 'blob-registry.ts:139-147 (cap 2000 em :112)', 'lista caminhos e lê um JSON por usuário, sequencialmente', 'painel e métricas truncados em 2.000 contas; latência e egress crescem linearmente'],
            ['findUserByEmail()', ':149-154', 'varredura completa O(N) — usada no webhook e no login legado', 'cada compra dispara scan; O(S × U) no sync Cakto'],
            ['claimEmail / markDeviceTrial', 'user-auth.ts:205-211, 251-256', 'lê o índice JSON inteiro, muta, reescreve integralmente, sem lock', 'lost update: e-mail/trial duplicados sob concorrência; índice de 100k contas reescrito a cada signup'],
            ['upsertUser()', 'blob-registry.ts:168-218', 'read-modify-write sem CAS/versão', 'heartbeat + webhook + admin intercalados perdem campos (ex.: banimento sobrescrito)'],
            ['appendEvent()', ':238-259', 'para cada evento, reler todos e podar acima de 250', 'cada append custa centenas de reads; auditoria de compras é descartada'],
            ['heartbeat', 'auth/me/route.ts:41', 'GET do cliente dispara upsertUser completo (incl. foto)', 'a 100k MAU: ~1,2M escritas Blob/hora; corrida com webhook'],
        ],
    }),
    ('body', '<b>Do lado do cliente</b>, o IndexedDB (db simulados-policiais-pro, v2, API crua) guarda documentos '
             'com chunks do PDF, questões, textBlocks e ocrText embutidos no MESMO registro (local-db.ts:20-43) — '
             'reescrito integralmente a cada bloco processado (upload-dialog.tsx:170-177), degradando de forma '
             'quadrática em PDFs grandes. Não existe tratamento de QuotaExceededError: os catch engolem o erro e '
             'o usuário perde o simulado em silêncio (local-db.ts:199,335,404). Tentativas crescem sem limite e '
             'sem virtualização na UI. <b>Backups: NÃO FOI POSSÍVEL DETERMINAR qualquer mecanismo</b> — a busca '
             'por backup/restore/snapshot/dump em scripts, docs e código retornou zero resultados aplicáveis.'),

    ('h1', '10. Escalabilidade (1.000, 10.000, 50.000, 100.000)'),
    ('body', 'A análise por patamar considera usuários ATIVOS no mês (MAU) e o comportamento real do código, '
             'não especulação genérica. O cliente aguenta todos os patamares — o servidor, não.'),
    ('table', {
        'headers': ['Patamar', 'O que acontece', 'Evidência'],
        'ratios': [0.12, 0.58, 0.30],
        'fs': 8.3,
        'rows': [
            ['1.000', 'Operação normal. Homepage 39 ms (probe). Riscos dominantes são os de segurança (seção 7), não de carga. Heartbeat: ~14 mil escritas Blob/dia — tolerável.', 'probe; blob-registry.ts'],
            ['10.000', 'Rate limits em memória perdem eficácia (× instâncias); overview admin começa a ler milhares de JSONs por request; custo de Blob (requests + egress) cresce visível na fatura; heartbeat ~140 mil escritas/dia.', 'user-auth.ts:379-390; admin/overview/route.ts:46'],
            ['50.000', 'findUserByEmail O(N) no caminho do webhook e do login legado: cada compra varre dezenas de milhares de JSONs; cap de 2.000 trunca o painel silenciosamente (métricas erradas); corrida heartbeat × webhook começa a perder campos; egress de ~160 KB/foto por overview.', 'blob-registry.ts:112,149-154; auth/me:41'],
            ['100.000', 'Colapso do registro central: unicidade sem lock duplica contas/trials; upsert read-modify-write perde status de assinatura sob concorrência; Blob rate-limited por ~1,2M escritas/h; admin inutilizável; custo de egress dominante. O app cliente continua funcionando — o que quebra é conta, assinatura e painel.', 'blob-registry.ts:168-218; auth/me:41'],
        ],
    }),
    ('body', 'Conclusão do pilar: o desenho local-first empurrou 95% da carga para o aparelho do usuário — '
             'excelente decisão de escala. O 5% restante (contas, assinaturas, webhooks) concentra 100% do risco, '
             'porque foi construído sobre um storage de objetos usado como banco transacional. A correção não é '
             'mais servidor nem cache: é um banco de verdade para o registro central (seção 17).'),
]
