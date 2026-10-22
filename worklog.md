# Worklog

---
Task ID: 1
Agent: Z.ai (main agent)
Task: Transformar o PDF "Simulado Final PC PE - Agente – Pós Edital (CEBRASPE, 13/01/2024)" em um simulado interativo web (Type 3 — Next.js fullstack).

Work Log:
- Inicializado ambiente fullstack (init-fullstack.sh) em /home/z/my-project (Next.js 16 + Tailwind 4 + shadcn/ui).
- Validação de gabaritos jurídicos sensíveis via WebSearch/WebFetch com fontes oficiais:
  * Q02 = b — Lei 6.425/72 prevê "sessão secreta" (não "aberta") e exclusão "até a nomeação" (não "posse") [policiacivil.pe.gov.br/estatuto.pdf].
  * Q03 = d — Lei 6.123/68 lista nomeação, promoção, reintegração, aproveitamento e reversão; readaptação não consta como ato de provimento [resolvido por eliminação com texto ALEPE].
  * Q04 = c — Glossário da LC 137/2008: Matriz(IV), Nível(III), Classe(II), Função Policial Civil(I) [texto literal via carreirapublica.com.br].
  * Q05 = e — EC 61/2009: composição do CNJ tem DOIS membros do MP (MPU + MP estadual); Corregedor é do STJ (art. 103-B, §5º); 15 membros; controle administrativo/financeiro sem "jurisdicional" [texto CF via ALERJ].
  * Q17 = b — Tema 1006 STF (ADIs 6298/6299/6300/6305): juiz das garantias não se aplica ao Júri, violência doméstica e familiar, menor potencial e competência originária STF/STJ [STF portal + TJRJ].
  * Q20 = c — CPP art. 158-C, §2º (verdadeira); prioridade do art. 158, parágrafo único é só para violência DOMÉSTICA contra mulher e vulneráveis [texto CPP via Projuris].
  * Q06 (alternativa c) corrigida para "três quintos" (art. 5º, §3º CF) — o PDF original continha "unanimidade", que tornaria a questão sem gabarito.
  * Q53: tabela estava em imagem no PDF; reconstruída (X=1..5, fi=20/40/80/40/20, n=200) — coerente com a resposta 27 (M0×Md×Me = 3×3×3).
- Estruturados 60 dados de questões em src/data/ (types, 3 partes, índice com disciplinas, textos de apoio e computeResults).
- Implementadas telas: Welcome (capa/instruções/modos), Exam (cronômetro 5h30 prova/estudo, grade de navegação, sinalização, atalhos de teclado, feedback imediato no modo estudo), Results (nota, meta 70%, desempenho por disciplina, chips de estatísticas) e Review (filtros, gabarito, comentários).
- Persistência localStorage (retomar simulado, auto-save), responsividade mobile com Sheet, footer/scrollbar styling.
- Corrigidos erros de lint (react-hooks/set-state-in-effect) reestruturando finalização sem efeito.
- Verificação E2E com agent-browser: capa, início, resposta, sinalização, navegação, persistência + reload, finalização, resultado (3% = 2/60 corretas, batendo com gabarito), revisão com filtros, modo estudo com feedback imediato, mobile (390px) + sheet. Sem erros de console; dev.log limpo; lint limpo.

Stage Summary:
- App entregue em /home/z/my-project (rota /), pronta e verificada no browser.
- Arquivos principais: src/data/{types,simulado,questions-part1..3}.ts, src/components/simulado/{welcome-screen,exam-screen,results-screen,review-screen,text-block-card,html-content}.tsx, src/app/{page,layout}.tsx.
- Gabarito curado: 01-a, 02-b, 03-d, 04-c, 05-e, 06-c, 07-b, 08-b, 09-b, 10-e, 11-e, 12-d, 13-a, 14-b, 15-b, 16-d, 17-b, 18-d, 19-c, 20-c, 21-d, 22-e, 23-d, 24-d, 25-b, 26-a, 27-b, 28-e, 29-c, 30-b, 31-d, 32-c, 33-d, 34-a, 35-b, 36-e, 37-b, 38-d, 39-b, 40-a, 41-d, 42-e, 43-e, 44-c, 45-b, 46-a, 47-b, 48-d, 49-c, 50-b, 51-b, 52-e, 53-b, 54-c, 55-e, 56-e, 57-d, 58-d, 59-e, 60-c.
- Prints de evidência em /home/z/my-project/scripts/e2e-*.png.

---
Task ID: 2
Agent: Z.ai (main agent)
Task: Evoluir o simulado PC PE em uma plataforma "Simulados Interativos" com upload de PDFs — cada PDF é transformado pela IA em um simulado interativo (Type 3 — Next.js fullstack).

Work Log:
- Instalado unpdf@1.9.1 para extração de texto de PDF no servidor (suporta PDFs multi-página via pdf.js).
- Novo schema Prisma (SQLite): Document (status processing/ready/error, chunks em Json, style multipla|certo_errado), Question (number autoincrement, topic, options JSON, answer, comment, textRef), TextBlock (trechos de apoio) e Attempt (histórico). Cascade delete. db:push ok.
- Refatorado o data layer: novo tipo SimuladoPack (id, title, subtitle, footer, durationMinutes, passPct, subjects, textBlocks, questions) em src/data/types.ts; STATIC_PACK (PC PE 60 questões) e funções genéricas computePackResults/getPackSubject/formatDurationLabel em src/data/simulado.ts.
- Refatoradas as 4 telas para aceitar pack dinâmico: welcome-screen (pack + tentativas anteriores + voltar à biblioteca), exam-screen (pack, atalhos de teclado limitados às alternativas existentes, NavigationGrid com questions), results-screen (pack, professor oculto quando vazio), review-screen (pack).
- Novas libs servidor: src/lib/pdf-text.ts (extração unpdf, limpeza de texto com desfaz-hifenização, chunking por parágrafos com amostragem uniforme máx. 10 blocos × ~7k chars) e src/lib/question-gen.ts (prompt PT-BR para elaboração de questões inéditas, JSON estrito, sanitização HTML, validação de alternativas/gabarito, retry 2x; suporta múltipla escolha a–e e Certo/Errado).
- Novas APIs: POST/GET /api/documents (upload multipart + extração + chunking; listagem), GET/DELETE /api/documents/[id] (pack completo / exclusão), POST /api/documents/[id]/generate (processa 1 bloco por chamada — loop do cliente com barra de progresso; blocos que falham são pulados graciosamente; status error apenas se nenhuma questão for gerada), GET/POST /api/documents/[id]/attempts.
- Nova UI: library-screen.tsx (cabeçalho, dropzone com drag&drop, card do simulado embutido, grid de cards com status/badges/progresso/exclusão, footer sticky) e upload-dialog.tsx (form com input de arquivo real, título e estilo; etapas envio→extração→geração com progresso por blocos; retomada de processamento; erro com retry).
- page.tsx reescrito como shell de navegação (biblioteca → welcome → exam → results → review) com packs estáticos e dinâmicos, localStorage por documento (simulado-<docId>), auto-save em useEffect, salvamento de tentativas no servidor e refresh de savedInfo.
- Corrigidos: duplicate useEffect de auto-save movido acima dos returns condicionais (regras de hooks); input de arquivo oculto real no dialog (acessibilidade + testabilidade); layout metadata atualizado para a plataforma.
- E2E via agent-browser: upload do PDF real (20 pág, 6 blocos, 25 questões geradas — 1 bloco pulado por falha da IA e fluxo seguiu), progresso em tempo real, welcome com duração calculada (25×3min=1h15), prova com cronômetro/sinalização, resultado (1/25 batendo com gabarito), revisão com comentários da IA, modo estudo com feedback imediato, exclusão via dialog, mobile 390px (biblioteca + prova), tentativas persistidas. Upload UI completo testado com PDF de teste gerado (scripts/make-test-pdf.py → teste-direito-administrativo.pdf). Sem erros de console; lint limpo.

Stage Summary:
- Plataforma entregue em /home/z/my-project (rota /): biblioteca com simulado PC PE embutido + simulados gerados de PDFs via IA.
- Fluxo: upload → extração de texto → geração incremental por blocos (IA) → simulado interativo completo (prova/estudo, timer, sinalização, resultado por assunto, revisão comentada, tentativas no banco).
- Arquivos novos: src/lib/{pdf-text,question-gen}.ts, src/app/api/documents/**, src/components/simulado/{library-screen,upload-dialog}.tsx; modificados: prisma/schema.prisma, src/data/{types,simulado}.ts, src/components/simulado/{welcome,exam,results,review}-screen.tsx, src/app/{page,layout}.tsx.
- Print de evidência: scripts/e2e-*.png.
