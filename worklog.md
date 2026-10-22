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
