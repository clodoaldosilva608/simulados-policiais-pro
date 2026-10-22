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
