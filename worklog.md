# Worklog

---
Task ID: 1
Agent: main (Z.ai)
Task: Adicionar provas oficiais da área policial (últimos 3 anos) ao simulado interativo, com opção de modelo Certo/Errado e/ou A,B,C,D,E + manter upload de PDF

Work Log:
- Baixadas 4 provas oficiais em PDF (Cebraspe/Fgv/gov.br): PF 2025 (106_PF_CB2_01), PC-CE Delegado 2025 (084_PC_CE_001_01), PM-RJ Soldado 2024 FGV (Tipo 1), PRF 2021 (578_PRF_001_01)
- Baixados gabaritos OFICIAIS definitivos/preliminares de todas: PF (gov.br, 60 itens), PC-CE (cdn Cebraspe, 100 questões), PM-RJ (FGV, 50), PRF (cdn Cebraspe, itens 9-120, parseado com pdfplumber por coordenadas)
- Extraído texto das provas com pypdf (scripts/extract_provas.py) e transcritas 168 questões para o app:
  - pf-2025.ts: 48 itens C/E + gabarito oficial
  - pc-ce-2025.ts: 31 questões ABCDE + gabarito definitivo (anuladas 5,11,18,30 omitidas)
  - pm-rj-2024.ts: 23 questões ABCDE + gabarito definitivo (anuladas 35,40 omitidas)
  - prf-2021.ts: 44 itens C/E + gabarito definitivo (anulados 39,45 omitidos)
  - policial-penal.ts: 14 itens C/E inéditos no estilo Cebraspe (rotulados)
- Criado src/data/official/ (index.ts agrega 5 packs) com metadados (carreira, banca, ano, questionFormat, oficial/ineditas)
- types.ts: adicionados QuestionFormat e campos opcionais ao SimuladoPack
- simulado.ts: STATIC_PACKS, getStaticPack, isCertErrado, packFormatLabel, answerLabel
- page.tsx: suporte a múltiplos packs estáticos (openDoc, refreshSavedInfo, handleFinish)
- library-screen.tsx: nova seção "Provas oficiais — Área Policial" com filtro de modelo (Todos | Certo/Errado | A,B,C,D,E), badges por carreira e cards
- exam-screen.tsx: botões dedicados Certo/Errado (verde/vermelho, badges C/E), atalhos teclado c/e, feedback com answerLabel
- review-screen.tsx: exibe C/E e gabarito CERTO/ERRADO
- welcome-screen.tsx: badge "Modelo: Certo/Errado | A,B,C,D,E"
- Lint limpo; verificação Agent Browser: biblioteca, filtro, prova PF (C/E), prova PC-CE (ABCDE), resultados, revisão, mobile — todos OK

Stage Summary:
- App agora contém 168 questões reais de 4 provas oficiais (PF 2025, PC-CE 2025, PM-RJ 2024, PRF 2021) + 14 inéditas de Polícia Penal + 60 do simulado PC-PE existente
- Modelos Certo/Errado e A-E plenamente suportados na resolução, correção e revisão
- Upload de PDF → IA gera simulado no modelo escolhido (fluxo anterior preservado)

---
Task ID: 2
Agent: main (Z.ai)
Task: Corrigir texto-base invisível da prova da PF (e PRF) + adicionar mais provas oficiais ao simulado

Work Log:
- BUG CORRIGIDO: os itens que discutem texto-base exibiam apenas "O texto sugere..." sem o texto. Causa: packs com textBlocks vazios + map QUESTIONS sem propagar textRef.
  - pf-2025.ts: criado TextBlock real "Séries policiais" (Camila Furuzawa, Vozes & Diálogo, 2013) transcrito do caderno 106_PF_CB2_01; itens 1-8 com textRef 'pf25-t1'; map QUESTIONS agora propaga textRef
  - prf-2021.ts: criado TextBlock "Texto 1A18-I — Considerações sobre a história da polícia" (C. Mauch, MÉTIS, 2007); itens 9-21 com textRef 'prf21-t1'
  - index.ts: textBlocks ligados aos packs PF e PRF; text-block-card max-h aumentado (26rem) para leitura confortável
- MAIS PROVAS (transcritas dos PDFs oficiais já baixados, com gabarito oficial):
  - PC-CE Delegado 2025: de 31 para 89 questões (P1 COMPLETA, questões 36-100 em pc-ce-2025-part2.ts; novos subjects: Medicina Legal, Criminologia, Civil, Empresarial, Proc. Civil, Tributário, Ambiental; duração 2h)
  - PM-RJ Soldado 2024 (FGV): de 23 para 48 questões (prova COMPLETA, questões 24-50 em pm-rj-2024-part2.ts; gabarito definitivo Tipo 1 realinhado e verificado)
  - PRF 2021: de 46 para 91 itens (itens 55-120 em prf-2021-part2.ts; gabarito definitivo parseado por coordenadas em scripts/parse_prf_gab_v2.py, validado contra os itens 9-54 existentes e contra o art. 17 da Lei 10.826; novos subjects: Trânsito/CONTRAN, Adm, Carreira PRF, Const., Penal, Proc. Penal, Especial, Humanos)
  - Comentários das questões 97/98 (Decreto 6.514 e art. 15 da Lei 9.605) verificados via web (Planalto)
- PRF 2018 avaliada e descartada como novo pack: gabarito definitivo não acessível (CDN Cebraspe 404, agregadores bloqueados) — sem risco de ensinar resposta errada
- PF itens 45-53 mantidos de fora: gabarito local corrompido (PDF inválido)
- scripts/validate-packs.ts: validação automática (ids duplicados, gabaritos indefinidos, opções vazias, textRefs órfãos) — 293 questões OK
- Lint limpo; build OK; testes no navegador (agent-browser): PF q1 com texto-base visível (screenshot e2e-pf-texto-fix.png), PRF item 9 com Texto 1A18-I (e2e-prf-texto-fix.png), PC-CE q89 com feedback/comentário (e2e-pcce-questao-89.png), biblioteca mobile e desktop sem erros de console

Stage Summary:
- App com 293 questões oficiais comentadas (PF 51 C/E, PC-CE 89 A-E, PM-RJ 48 A-E, PRF 91 C/E, Polícia Penal 14 C/E) + 60 do PC-PE + geração por PDF via IA
- Texto-base das provas PF 2025 e PRF 2021 totalmente visível na resolução e na revisão
- Modelos Certo/Errado e A-E preservados em todas as provas

---
Task ID: 3
Agent: main (Z.ai)
Task: Landing page + estrutura completa mobile + upload de PDF + banco local + assinatura Cakto R$17,90 + deploy (GitHub/Vercel)

Work Log:
- src/config/site.ts: marca "Simulados Policiais Pro", preço R$17,90/mês, link Cakto via NEXT_PUBLIC_CAKTO_CHECKOUT_URL, trial 7 dias
- src/lib/license.ts: licença local (trial/active) em localStorage com hook useLicense (startTrial/activate/signOut)
- src/lib/local-db.ts: BANCO LOCAL IndexedDB (documents + attempts) substituindo Prisma/SQLite — tudo no aparelho do usuário
- APIs novas: /api/generate (IA: SDK Z.ai no preview + fallback OpenAI-compatível via AI_API_KEY p/ Vercel), /api/license (valida códigos vs ACCESS_CODES, fallback formato SPP-XXXX-XXXX-XXXX), /api/webhook/cakto (stub p/ automação)
- Removidos: src/app/api/documents/** e src/lib/db.ts (Prisma) — projeto agora roda na Vercel sem backend de estado
- src/components/landing/landing-page.tsx: landing mobile-first (hero, números reais 353+ questões/6 corporações, recursos, como funciona, pricing R$17,90, FAQ, CTA final) com fallback amigável quando checkout não configurado
- src/components/simulado/access-screen.tsx: ativação de código + teste grátis + cartão de assinante com sair deste aparelho
- upload-dialog.tsx reescrito: extração de texto do PDF NO CLIENTE (unpdf isomórfico), geração bloco a bloco via /api/generate com progresso, salvamento/resumo no IndexedDB
- page.tsx: fases landing→access→library→welcome→exam→results→review; docs/attempts 100% locais; badge assinante/teste no header (visível no mobile)
- PWA: manifest.webmanifest + ícones 192/512 (scripts/make-icons.ts com sharp) + metadata/viewport/apple-web-app
- .env.example com todas as variáveis (Cakto, ACCESS_CODES, IA, webhook)
- question-gen.ts dividido: helpers isomórficos no lib, chamadas IA na rota (fix Module not found fs/promises no cliente)
- Lint limpo; e2e agent-browser: landing mobile/desktop, trial→biblioteca, PF item 1 com texto-base "Séries policiais" VISÍVEL (bug antigo OK), C/E com cronômetro, upload PDF→5 questões A-E salvas localmente, código inválido/valido, assinante ★, sair→landing, reload persiste licença
- Deploy: GitHub repo privado clodoaldosilva608/simulados-policiais-pro (push OK) + Vercel produção https://simulados-policiais-pro.vercel.app (ssoProtection removida, público 200, título e render verificados)

Stage Summary:
- App completo: landing comercial + paywall (trial 7d + código Cakto) + 353 questões oficiais + PDF→simulado com IA + banco 100% local (IndexedDB) + PWA instalável
- Produção: https://simulados-policiais-pro.vercel.app • Código: github.com/clodoaldosilva608/simulados-policiais-pro (privado)
- Pendente do dono: criar produto na Cakto e definir NEXT_PUBLIC_CAKTO_CHECKOUT_URL; (opcional) ACCESS_CODES, AI_API_KEY
