import { readJson, writeJson, blobConfigured } from '@/lib/blob-registry'

/**
 * CONTEÚDO GERENCIADO PELO ADMIN — banco de questões, materiais de estudo,
 * pop-ups da aplicação, planos customizados e configuração dinâmica do app.
 *
 * Tudo vive em arquivos JSON dedicados no Vercel Blob (padrão do registro
 * central), segregados do users/ para não inflar o registry de contas:
 *   index/questions.json   — banco de questões (estilo Qconcursos)
 *   index/materials.json   — apostilas/PDFs/links de estudo
 *   index/popups.json      — pop-ups exibidos no app
 *   index/plans.json       — planos customizados atribuíveis a usuários
 *   index/app-config.json  — configuração dinâmica (preço, limites etc.)
 */

export const QUESTIONS_PATH = 'index/questions.json'
export const MATERIALS_PATH = 'index/materials.json'
export const POPUPS_PATH = 'index/popups.json'
export const PLANS_PATH = 'index/plans.json'
export const APP_CONFIG_PATH = 'index/app-config.json'

const MAX_QUESTIONS = 20000
const MAX_MATERIALS = 2000
const MAX_POPUPS = 200

/* ------------------------------------------------------------------ */
/* Banco de questões                                                   */
/* ------------------------------------------------------------------ */

export type QuestionType = 'multipla' | 'certo_errado'

export interface BankQuestion {
  id: string
  banca: string
  /** concurso/órgão (ex.: "Polícia Federal — Agente") */
  concurso: string
  nivel: string
  materia: string
  assunto?: string
  ano: number
  tipo: QuestionType
  statement: string
  /** alternativas na ordem (certo_errado → ["Certo","Errado"]) */
  options: string[]
  /** índice da alternativa correta em options */
  answer: number
  comment?: string
  active: boolean
  createdAt: number
  updatedAt: number
}

interface QuestionsFile {
  questions: BankQuestion[]
}

const norm = (s: unknown): string => (typeof s === 'string' ? s.trim() : '')
const clampInt = (n: unknown, min: number, max: number, fallback: number): number => {
  const v = Math.floor(Number(n))
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
}

/** Valida + normaliza uma questão vinda do admin (criação/edição/import). */
export function sanitizeQuestion(input: Record<string, unknown>, existing?: BankQuestion): BankQuestion | { error: string } {
  const banca = norm(input.banca).slice(0, 60)
  const concurso = norm(input.concurso).slice(0, 120)
  const materia = norm(input.materia).slice(0, 80)
  const statement = typeof input.statement === 'string' ? input.statement.trim() : ''
  const tipo = input.tipo === 'certo_errado' ? 'certo_errado' : 'multipla'
  const rawOptions = Array.isArray(input.options) ? input.options.map((o) => norm(o)) : []
  const options = rawOptions.filter(Boolean).slice(0, 5)
  const answer = clampInt(input.answer, 0, Math.max(0, options.length - 1), 0)

  if (!banca) return { error: 'Banca obrigatória' }
  if (!materia) return { error: 'Matéria obrigatória' }
  if (statement.length < 10) return { error: 'Enunciado muito curto (mín. 10 caracteres)' }
  if (tipo === 'certo_errado') {
    if (options.length !== 2 || options[0].toLowerCase() !== 'certo' || options[1].toLowerCase() !== 'errado') {
      return { error: 'Tipo Certo/Errado exige alternativas "Certo" e "Errado"' }
    }
  } else if (options.length < 2) {
    return { error: 'Informe ao menos 2 alternativas' }
  }
  if (answer >= options.length) return { error: 'Gabarito fora do intervalo de alternativas' }

  const now = Date.now()
  return {
    id: existing?.id ?? (norm(input.id) || crypto.randomUUID()),
    banca,
    concurso: concurso || 'Não informado',
    nivel: norm(input.nivel) || 'Superior',
    materia,
    assunto: norm(input.assunto).slice(0, 120) || undefined,
    ano: clampInt(input.ano, 1990, 2100, new Date().getFullYear()),
    tipo,
    statement: statement.slice(0, 8000),
    options,
    answer: Math.min(answer, options.length - 1),
    comment: norm(input.comment).slice(0, 8000) || undefined,
    active: input.active === false ? false : true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export async function listQuestions(): Promise<BankQuestion[]> {
  const file = await readJson<QuestionsFile>(QUESTIONS_PATH)
  return file?.questions ?? []
}

export async function saveQuestions(questions: BankQuestion[]): Promise<void> {
  await writeJson(QUESTIONS_PATH, { questions: questions.slice(0, MAX_QUESTIONS) })
}

export async function upsertQuestion(input: Record<string, unknown>): Promise<BankQuestion | { error: string }> {
  const id = norm(input.id)
  const existing = id ? (await listQuestions()).find((q) => q.id === id) : undefined
  const clean = sanitizeQuestion(input, existing)
  if ('error' in clean) return clean
  const all = await listQuestions()
  const idx = existing ? all.findIndex((q) => q.id === existing.id) : -1
  if (idx >= 0) all[idx] = clean
  else all.push(clean)
  await saveQuestions(all)
  return clean
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const all = await listQuestions()
  const next = all.filter((q) => q.id !== id)
  if (next.length === all.length) return false
  await saveQuestions(next)
  return true
}

export async function bulkInsertQuestions(inputs: Record<string, unknown>[]): Promise<{ inserted: number; errors: string[] }> {
  const all = await listQuestions()
  const errors: string[] = []
  let inserted = 0
  for (const raw of inputs.slice(0, 500)) {
    const clean = sanitizeQuestion(raw)
    if ('error' in clean) {
      if (errors.length < 10) errors.push(clean.error)
      continue
    }
    all.push(clean)
    inserted++
  }
  await saveQuestions(all)
  return { inserted, errors }
}

/* ------------------------------------------------------------------ */
/* Materiais de estudo (apostilas, PDFs, links)                        */
/* ------------------------------------------------------------------ */

export interface StudyMaterial {
  id: string
  title: string
  description?: string
  /** 'pdf' | 'apostila' | 'link' (categoria de exibição) */
  kind: string
  materia?: string
  concurso?: string
  banca?: string
  ano?: number
  /** URL pública (blob do upload ou link externo colado pelo admin) */
  url: string
  fileName?: string
  fileSize?: number
  active: boolean
  createdAt: number
  updatedAt: number
}

interface MaterialsFile {
  materials: StudyMaterial[]
}

export async function listMaterials(): Promise<StudyMaterial[]> {
  const file = await readJson<MaterialsFile>(MATERIALS_PATH)
  return file?.materials ?? []
}

export async function upsertMaterial(input: Record<string, unknown>): Promise<StudyMaterial | { error: string }> {
  const title = norm(input.title).slice(0, 160)
  const url = norm(input.url)
  if (title.length < 3) return { error: 'Título obrigatório (mín. 3 caracteres)' }
  if (!/^https?:\/\//i.test(url)) return { error: 'URL inválida (deve começar com http(s)://)' }

  const id = norm(input.id)
  const all = await listMaterials()
  const existing = id ? all.find((m) => m.id === id) : undefined
  const now = Date.now()
  const clean: StudyMaterial = {
    id: existing?.id ?? crypto.randomUUID(),
    title,
    description: norm(input.description).slice(0, 600) || undefined,
    kind: norm(input.kind) || 'pdf',
    materia: norm(input.materia).slice(0, 80) || undefined,
    concurso: norm(input.concurso).slice(0, 120) || undefined,
    banca: norm(input.banca).slice(0, 60) || undefined,
    ano: clampInt(input.ano, 1990, 2100, 0) || undefined,
    url,
    fileName: existing?.fileName,
    fileSize: existing?.fileSize,
    active: input.active === false ? false : true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const idx = existing ? all.findIndex((m) => m.id === existing.id) : -1
  if (idx >= 0) all[idx] = clean
  else all.push(clean)
  await writeJson(MATERIALS_PATH, { materials: all.slice(0, MAX_MATERIALS) })
  return clean
}

export async function deleteMaterial(id: string): Promise<StudyMaterial | null> {
  const all = await listMaterials()
  const target = all.find((m) => m.id === id) ?? null
  const next = all.filter((m) => m.id !== id)
  await writeJson(MATERIALS_PATH, { materials: next })
  return target
}

/* ------------------------------------------------------------------ */
/* Pop-ups da aplicação                                                */
/* ------------------------------------------------------------------ */

export type PopupFrequency = 'once' | 'session' | 'daily' | 'always'

export interface AppPopup {
  id: string
  title: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  /** telas onde pode aparecer (fases do app + 'landing') */
  screens: string[]
  /** janela de exibição (epoch ms; ausente = sempre) */
  startsAt?: number
  endsAt?: number
  frequency: PopupFrequency
  /** atraso em segundos após entrar na tela */
  delaySec?: number
  /** cor do destaque: 'amber' | 'emerald' | 'sky' */
  tone?: string
  active: boolean
  createdAt: number
  updatedAt: number
}

interface PopupsFile {
  popups: AppPopup[]
}

const SCREENS_ALLOWED = [
  'landing', 'library', 'banco', 'welcome', 'exam', 'results', 'review',
  'desempenho', 'erros', 'pomodoro', 'conta', 'suporte', 'ia',
]

export function popupScreens(): string[] {
  return SCREENS_ALLOWED
}

export async function listPopups(): Promise<AppPopup[]> {
  const file = await readJson<PopupsFile>(POPUPS_PATH)
  return file?.popups ?? []
}

export async function upsertPopup(input: Record<string, unknown>): Promise<AppPopup | { error: string }> {
  const title = norm(input.title).slice(0, 120)
  const body = norm(input.body)
  if (title.length < 2) return { error: 'Título obrigatório' }
  if (body.length < 5) return { error: 'Mensagem muito curta' }
  const screens = Array.isArray(input.screens)
    ? input.screens.map((s) => norm(s)).filter((s) => SCREENS_ALLOWED.includes(s))
    : []
  if (screens.length === 0) return { error: 'Selecione ao menos uma tela' }

  const frequency = ['once', 'session', 'daily', 'always'].includes(String(input.frequency))
    ? (input.frequency as PopupFrequency)
    : 'once'

  const id = norm(input.id)
  const all = await listPopups()
  const existing = id ? all.find((p) => p.id === id) : undefined
  const now = Date.now()
  const clean: AppPopup = {
    id: existing?.id ?? crypto.randomUUID(),
    title,
    body: body.slice(0, 4000),
    ctaLabel: norm(input.ctaLabel).slice(0, 40) || undefined,
    ctaUrl: norm(input.ctaUrl).slice(0, 500) || undefined,
    screens,
    startsAt: input.startsAt ? clampInt(input.startsAt, 0, 4102444800000, 0) || undefined : undefined,
    endsAt: input.endsAt ? clampInt(input.endsAt, 0, 4102444800000, 0) || undefined : undefined,
    frequency,
    delaySec: clampInt(input.delaySec, 0, 600, 0) || 0,
    tone: ['amber', 'emerald', 'sky'].includes(String(input.tone)) ? String(input.tone) : 'amber',
    active: input.active === false ? false : true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const idx = existing ? all.findIndex((p) => p.id === existing.id) : -1
  if (idx >= 0) all[idx] = clean
  else all.push(clean)
  await writeJson(POPUPS_PATH, { popups: all.slice(0, MAX_POPUPS) })
  return clean
}

export async function deletePopup(id: string): Promise<boolean> {
  const all = await listPopups()
  const next = all.filter((p) => p.id !== id)
  if (next.length === all.length) return false
  await writeJson(POPUPS_PATH, { popups: next })
  return true
}

/** Pop-ups elegíveis para exibir AGORA numa tela (app do aluno + landing). */
export function popupsForScreen(popups: AppPopup[], screen: string): AppPopup[] {
  const now = Date.now()
  return popups.filter(
    (p) =>
      p.active &&
      p.screens.includes(screen) &&
      (!p.startsAt || now >= p.startsAt) &&
      (!p.endsAt || now <= p.endsAt),
  )
}

/* ------------------------------------------------------------------ */
/* Planos customizados + configuração dinâmica do app                  */
/* ------------------------------------------------------------------ */

export interface CustomPlan {
  id: string
  name: string
  price: string
  simuladosPerMonth: number
  questionsPerDay: number
  comments: boolean
  active: boolean
  createdAt: number
  updatedAt: number
}

interface PlansFile {
  plans: CustomPlan[]
}

export async function listCustomPlans(): Promise<CustomPlan[]> {
  const file = await readJson<PlansFile>(PLANS_PATH)
  return file?.plans ?? []
}

export async function upsertCustomPlan(input: Record<string, unknown>): Promise<CustomPlan | { error: string }> {
  const name = norm(input.name).slice(0, 60)
  if (name.length < 2) return { error: 'Nome do plano obrigatório' }
  const id = norm(input.id)
  const all = await listCustomPlans()
  const existing = id ? all.find((p) => p.id === id) : undefined
  const now = Date.now()
  const clean: CustomPlan = {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    price: norm(input.price).slice(0, 20) || 'R$ 0',
    simuladosPerMonth: clampInt(input.simuladosPerMonth, 0, 999, 5),
    questionsPerDay: clampInt(input.questionsPerDay, 0, 999, 15),
    comments: input.comments === true,
    active: input.active === false ? false : true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const idx = existing ? all.findIndex((p) => p.id === existing.id) : -1
  if (idx >= 0) all[idx] = clean
  else all.push(clean)
  await writeJson(PLANS_PATH, { plans: all })
  return clean
}

export async function deleteCustomPlan(id: string): Promise<boolean> {
  const all = await listCustomPlans()
  const next = all.filter((p) => p.id !== id)
  if (next.length === all.length) return false
  await writeJson(PLANS_PATH, { plans: next })
  return true
}

/* ---------------- Configuração dinâmica ---------------- */

export interface AppConfig {
  price: string
  trialDays: number
  freeSimuladosPerMonth: number
  freeQuestionsPerDay: number
  freeComments: boolean
  checkoutUrl: string
  supportEmail: string
  updatedAt: number
}

export function defaultAppConfig(): AppConfig {
  return {
    price: 'R$ 17,90',
    trialDays: 7,
    freeSimuladosPerMonth: 5,
    freeQuestionsPerDay: 15,
    freeComments: false,
    checkoutUrl: process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL || 'https://pay.cakto.com.br/v5zisya',
    supportEmail: 'suportesimuladospoliciais@gmail.com',
    updatedAt: 0,
  }
}

export async function getAppConfig(): Promise<AppConfig> {
  const file = await readJson<Partial<AppConfig>>(APP_CONFIG_PATH)
  if (!file) return defaultAppConfig()
  const base = defaultAppConfig()
  return {
    price: norm(file.price) || base.price,
    trialDays: clampInt(file.trialDays, 1, 90, base.trialDays),
    freeSimuladosPerMonth: clampInt(file.freeSimuladosPerMonth, 0, 999, base.freeSimuladosPerMonth),
    freeQuestionsPerDay: clampInt(file.freeQuestionsPerDay, 0, 999, base.freeQuestionsPerDay),
    freeComments: file.freeComments === true,
    checkoutUrl: norm(file.checkoutUrl) || base.checkoutUrl,
    supportEmail: norm(file.supportEmail) || base.supportEmail,
    updatedAt: clampInt(file.updatedAt, 0, 4102444800000, 0),
  }
}

export async function saveAppConfig(input: Record<string, unknown>): Promise<AppConfig> {
  const base = await getAppConfig()
  const next: AppConfig = {
    price: norm(input.price) || base.price,
    trialDays: clampInt(input.trialDays, 1, 90, base.trialDays),
    freeSimuladosPerMonth: clampInt(input.freeSimuladosPerMonth, 0, 999, base.freeSimuladosPerMonth),
    freeQuestionsPerDay: clampInt(input.freeQuestionsPerDay, 0, 999, base.freeQuestionsPerDay),
    freeComments: input.freeComments === true,
    checkoutUrl: norm(input.checkoutUrl) || base.checkoutUrl,
    supportEmail: norm(input.supportEmail) || base.supportEmail,
    updatedAt: Date.now(),
  }
  await writeJson(APP_CONFIG_PATH, next)
  return next
}

/** Limites efetivos de um usuário (plano custom > config dinâmica > padrão). */
export async function planLimitsFor(customPlanId?: string): Promise<AppConfig & { planName?: string }> {
  const cfg = await getAppConfig()
  if (customPlanId) {
    const plans = await listCustomPlans()
    const plan = plans.find((p) => p.id === customPlanId && p.active)
    if (plan) {
      return {
        ...cfg,
        freeSimuladosPerMonth: plan.simuladosPerMonth,
        freeQuestionsPerDay: plan.questionsPerDay,
        freeComments: plan.comments,
        planName: plan.name,
      }
    }
  }
  return cfg
}

export function contentConfigured(): boolean {
  return blobConfigured()
}
