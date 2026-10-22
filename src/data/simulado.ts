import type { ExamResult, OptionKey, Question, SimuladoPack, Subject, TextBlock } from './types'
import { PART1 } from './questions-part1'
import { PART2 } from './questions-part2'
import { PART3 } from './questions-part3'

export * from './types'

export const EXAM_META = {
  title: 'Simulado PC PE – Agente',
  subtitle: 'Pós-Edital • Banca CEBRASPE',
  reference: 'Simulado Final PC PE – Agente • 13/01/2024',
  durationMinutes: 330, // 5h30 — janela original das 8h00 às 13h30
  passPct: 70,
} as const

/** Identificador do simulado embutido no app */
export const STATIC_DOC_ID = 'pcpe-agente'

export const SUBJECTS: Subject[] = [
  { id: 'leg-estadual', name: 'Legislação Estadual', professor: 'Ronaldo Paiva' },
  { id: 'dir-constitucional', name: 'Direito Constitucional', professor: 'Fabio Ramos' },
  { id: 'dir-administrativo', name: 'Direito Administrativo', professor: 'Thállius Moraes' },
  { id: 'dir-penal', name: 'Direito Penal', professor: 'Priscila Silveira' },
  { id: 'leg-extravagante', name: 'Legislação Extravagante', professor: 'Antônio Pequeno' },
  { id: 'dir-processual', name: 'Direito Processual Penal', professor: 'Renan Araújo' },
  { id: 'portugues', name: 'Língua Portuguesa', professor: 'Janaina Arruda' },
  { id: 'informatica', name: 'Informática', professor: 'Emannuelle Gouveia' },
  { id: 'rac-logico', name: 'Raciocínio Lógico', professor: 'Eduardo Mocellin' },
  { id: 'contabilidade', name: 'Contabilidade Geral', professor: 'Silvio Sande' },
  { id: 'estatistica', name: 'Estatística', professor: 'Carlos Henrique' },
]

export const TEXT_BLOCKS: Record<string, TextBlock> = {
  'texto-fungo': {
    id: 'texto-fungo',
    title: 'Fungo da Amazônia se alimenta de plástico',
    paragraphs: [
      'O plástico é um dos principais poluentes no nosso planeta. Embora haja muitos programas para conscientização do seu uso e da sua reutilização, a produção de diferentes tipos de plásticos para atender ao consumo da população mundial aumentou muito na última década (aproximadamente 300 milhões de toneladas desde 2006) e possivelmente continuará aumentando nas próximas. O resultado de produzir algo tão difícil de ser reciclado é a grande quantidade de resíduos depositada não só nos lixões ou aterros sanitários, mas nos rios, lagos, mares e florestas.',
      'Uma saída para esse tipo de poluição é a biorremediação, processo tecnológico que utiliza organismos vivos para remover ou reduzir resíduos poluentes ou tóxicos no ambiente. Os fungos, juntamente com bactérias e outros micro-organismos, são ótimos modelos para estudos sobre biorremediação, pois produzem um grande número de enzimas capazes de decompor quase tudo ao seu redor.',
      'Uma equipe de pesquisadores da Universidade de Yale, nos EUA, vem testando diferentes espécies de fungos com potencial de decomposição de diferentes tipos de plástico. Uma das espécies testadas sobreviveu se alimentando exclusivamente do plástico. Essa espécie de fungo, encontrada em árvores da Amazônia Equatoriana, produz uma enzima capaz de degradar o poliuretano, tipo de plástico até então considerado não biodegradável. O resultado é incrível, na medida em que nos dá esperanças reais de biorremediação desse tipo de poluição.',
    ],
    source: '(Adaptado de: DRECHSLER-SANTOS, Elisandro Ricardo. Disponível em: cientistasdescobriramque.wordpress.com/2016/05/10)',
  },
  'texto-ferias': {
    id: 'texto-ferias',
    title: 'Quando as crianças saírem de férias',
    paragraphs: [
      'Tenho certeza absoluta de que em nenhum fim de junho passou pela cabeça da minha mãe o que ela faria com cinco crianças de férias dentro de casa, durante um mês. Férias eram sagradas, de 01 a 31 de julho, todos os anos. Lembro-me bem dela recolhendo os nossos uniformes do colégio e levando para lavar quando o primeiro dia de férias chegava. Só isso. As férias, propriamente ditas, eram por nossa conta.',
      'Quando vejo, nos telejornais, matérias e mais matérias que só faltam dizer que as férias de julho em casa com as crianças correm o risco de ser um verdadeiro inferno, penso na minha mãe. Os repórteres dão mil sugestões para preencher as vinte e quatro horas diárias das crianças, durante o mês inteirinho.',
      'As mães de hoje, descabeladas, começam a planejar: uma semana no acampamento, depois um dia vão ao cinema, no outro ao teatrinho, no terceiro à lanchonete, no quarto ao clube, no quinto ao parque, no sexto à casa dos avós, no sétimo ao shopping... mas, pensando bem, ainda faltam duas semanas inteirinhas para preencher.',
      'Nossas férias começavam cedo. Acordávamos às seis da manhã, comíamos um pão com manteiga, bebíamos um copo de leite e descíamos para o quintal. Era um espaço em que havia galinhas, coelhos, porquinhos-da-índia, cachorro, pombos, passarinhos, caixotes, carrinhos, cordas, árvores, tijolos, muros e muito mais.',
      'Nenhuma preocupação passava pela cabeça da minha mãe naqueles trinta e um dias de julho. De vez em quando ela entrava em ação quando um chegava com o joelho ralado, o cotovelo esfolado ou uma picada de abelha. Ela lavava o ferimento com água e sabão, passava mercúrio cromo e pronto, estávamos novinhos em folha.',
      'No dia 01 de agosto a cortina das férias se fechava. Na noite de 31 de julho, minha mãe abria o armário e tirava o uniforme de cada um, limpinho, cheirando a novo. E a vida continuava.',
    ],
    source: '(Adaptado de: VILLAS, Alberto. Disponível em: cartacapital.com.br/cultura/quando-as-criancas-sairem-de-ferias)',
  },
}

export const QUESTIONS: Question[] = [...PART1, ...PART2, ...PART3]

export const TOTAL_QUESTIONS = QUESTIONS.length

export const OPTION_KEYS: OptionKey[] = ['a', 'b', 'c', 'd', 'e']

export function getSubject(id: string): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? { id, name: id, professor: '' }
}

/** Busca a disciplina dentro de um pack (sem professora quando dinâmico) */
export function getPackSubject(pack: SimuladoPack, id: string): Subject {
  return pack.subjects.find((s) => s.id === id) ?? { id, name: id, professor: '' }
}

/** Calcula o resultado de um simulado a partir de um pack (estático ou de PDF) */
export function computePackResults(pack: SimuladoPack, answers: Record<number, OptionKey>): ExamResult {
  let correct = 0
  let answered = 0

  // Agrupa questões por disciplina presente no pack
  const subjectIds: string[] = []
  for (const q of pack.questions) {
    if (!subjectIds.includes(q.subjectId)) subjectIds.push(q.subjectId)
  }

  const bySubject = subjectIds.map((sid) => {
    const subject = getPackSubject(pack, sid)
    const questions = pack.questions.filter((q) => q.subjectId === sid)
    const hits = questions.filter((q) => answers[q.id] === q.answer).length
    correct += hits
    answered += questions.filter((q) => answers[q.id]).length
    return {
      subject,
      correct: hits,
      total: questions.length,
      pct: questions.length > 0 ? Math.round((hits / questions.length) * 100) : 0,
    }
  })

  const total = pack.questions.length

  return {
    correct,
    total,
    pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    answered,
    unanswered: total - answered,
    bySubject,
  }
}

export function computeResults(answers: Record<number, OptionKey>): ExamResult {
  return computePackResults(STATIC_PACK, answers)
}

/** Simulado embutido no aplicativo (PC PE – Agente, 60 questões) */
export const STATIC_PACK: SimuladoPack = {
  id: STATIC_DOC_ID,
  title: EXAM_META.title,
  subtitle: EXAM_META.subtitle,
  footer: `Conteúdo original: simulado inédito “PC PE – Agente, Pós-Edital • BANCA: CEBRASPE” (${EXAM_META.reference}). Aplicação de estudo sem vínculo com a banca ou com o órgão organizador.`,
  durationMinutes: EXAM_META.durationMinutes,
  passPct: EXAM_META.passPct,
  subjects: SUBJECTS,
  textBlocks: TEXT_BLOCKS,
  questions: QUESTIONS,
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Formata minutos em rótulo amigável (ex.: 330 → "5h30", 90 → "1h30", 45 → "45min") */
export function formatDurationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`
  if (h > 0) return `${h}h`
  return `${m}min`
}
