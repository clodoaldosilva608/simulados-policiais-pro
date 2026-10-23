import type { SimuladoPack } from '../types'
import { QUESTIONS as PF_QUESTIONS, PF_SUBJECTS, PF_TEXT_BLOCKS } from './pf-2025'
import { QUESTIONS as PC_CE_QUESTIONS, PC_CE_SUBJECTS } from './pc-ce-2025'
import { QUESTIONS as PM_RJ_QUESTIONS, PM_RJ_SUBJECTS } from './pm-rj-2024'
import { QUESTIONS as PRF_QUESTIONS, PRF_SUBJECTS, PRF_TEXT_BLOCKS } from './prf-2021'
import { QUESTIONS as PP_QUESTIONS, PP_SUBJECTS } from './policial-penal'

const OFICIAL_FOOTER =
  'Questões transcritas da prova oficial e gabarito oficial da banca. Aplicação de estudo sem vínculo com a banca ou com o órgão organizador. Sempre confira com o documento oficial do concurso.'

const INEDITAS_FOOTER =
  'Questões inéditas elaboradas no estilo da banca (não são questões oficiais), com base na legislação e na jurisprudência aplicáveis à carreira.'

/** Prova oficial — Polícia Federal 2025 (Cebraspe, Certo/Errado) */
export const PF_2025_PACK: SimuladoPack = {
  id: 'oficial-pf-2025',
  title: 'Polícia Federal 2025 — Conhecimentos Básicos',
  subtitle: 'Prova oficial • Agente, Escrivão e Papiloscopista • Banca CEBRASPE',
  footer: OFICIAL_FOOTER,
  durationMinutes: 90,
  passPct: 70,
  subjects: PF_SUBJECTS,
  textBlocks: PF_TEXT_BLOCKS,
  questions: PF_QUESTIONS,
  questionFormat: 'certo_errado',
  carreira: 'PF',
  banca: 'Cebraspe',
  ano: 2025,
  oficial: true,
}

/** Prova oficial — Delegado da Polícia Civil do Ceará 2025 (Cebraspe, A–E) */
export const PC_CE_2025_PACK: SimuladoPack = {
  id: 'oficial-pc-ce-2025',
  title: 'Polícia Civil do Ceará 2025 — Delegado (P1)',
  subtitle: 'Prova oficial • Delegado de Polícia Civil • Banca CEBRASPE • P1 completa',
  footer: OFICIAL_FOOTER,
  durationMinutes: 120,
  passPct: 70,
  subjects: PC_CE_SUBJECTS,
  textBlocks: {},
  questions: PC_CE_QUESTIONS,
  questionFormat: 'multipla_escolha',
  carreira: 'PC',
  banca: 'Cebraspe',
  ano: 2025,
  oficial: true,
}

/** Prova oficial — Soldado da Polícia Militar do RJ 2024 (FGV, A–E) */
export const PM_RJ_2024_PACK: SimuladoPack = {
  id: 'oficial-pm-rj-2024',
  title: 'Polícia Militar do RJ 2024 — Soldado (Tipo 1)',
  subtitle: 'Prova oficial • Soldado PM Classe C • Banca FGV • Prova completa',
  footer: OFICIAL_FOOTER,
  durationMinutes: 90,
  passPct: 70,
  subjects: PM_RJ_SUBJECTS,
  textBlocks: {},
  questions: PM_RJ_QUESTIONS,
  questionFormat: 'multipla_escolha',
  carreira: 'PM',
  banca: 'FGV',
  ano: 2024,
  oficial: true,
}

/** Prova oficial — Policial Rodoviário Federal 2021 (Cebraspe, Certo/Errado) */
export const PRF_2021_PACK: SimuladoPack = {
  id: 'oficial-prf-2021',
  title: 'Polícia Rodoviária Federal 2021 — Prova Objetiva',
  subtitle: 'Prova oficial • Policial Rodoviário Federal • Banca CEBRASPE • Itens 9-120',
  footer: `${OFICIAL_FOOTER} Última prova objetiva da PRF realizada até o momento (novo certame previsto para 2026).`,
  durationMinutes: 120,
  passPct: 70,
  subjects: PRF_SUBJECTS,
  textBlocks: PRF_TEXT_BLOCKS,
  questions: PRF_QUESTIONS,
  questionFormat: 'certo_errado',
  carreira: 'PRF',
  banca: 'Cebraspe',
  ano: 2021,
  oficial: true,
}

/** Simulado inédito no estilo Cebraspe — Polícia Penal (Certo/Errado) */
export const POLICIAL_PENAL_PACK: SimuladoPack = {
  id: 'oficial-policial-penal',
  title: 'Polícia Penal — Simulado estilo Cebraspe',
  subtitle: 'Agente/Policial Penal (estadual e federal) • Certo/Errado inédito',
  footer: INEDITAS_FOOTER,
  durationMinutes: 40,
  passPct: 70,
  subjects: PP_SUBJECTS,
  textBlocks: {},
  questions: PP_QUESTIONS,
  questionFormat: 'certo_errado',
  carreira: 'Polícia Penal',
  banca: 'Estilo Cebraspe',
  ano: 2025,
  ineditas: true,
}

/** Todas as provas oficiais da área policial incluídas no app */
export const OFFICIAL_PACKS: SimuladoPack[] = [
  PF_2025_PACK,
  PC_CE_2025_PACK,
  PM_RJ_2024_PACK,
  PRF_2021_PACK,
  POLICIAL_PENAL_PACK,
]
