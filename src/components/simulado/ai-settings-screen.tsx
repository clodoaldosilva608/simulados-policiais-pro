'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import {
  AI_COMMENT_DETAILS,
  AI_MODELS,
  AI_PERSONAS,
  clearApiKey,
  getAiSettings,
  maskApiKey,
  saveAiSettings,
  type AiCommentDetail,
  type AiPersona,
  type AiSettings,
} from '@/lib/ai-settings'

const AI_STUDIO_URL = 'https://aistudio.google.com/apikey'

type KeyTestState = { status: 'idle' | 'testing' | 'ok' | 'error'; message?: string }

/** Aba "Configurações da IA": comportamento da IA + chave de API do aluno. */
export function AiSettingsScreen({ onBack }: { onBack: () => void }) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AiSettings | null>(null)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [test, setTest] = useState<KeyTestState>({ status: 'idle' })

  // Leitura do localStorage adiada pós-pintura (evita mismatch de hidratação)
  useEffect(() => {
    const id = window.setTimeout(() => setSettings(getAiSettings()), 0)
    return () => window.clearTimeout(id)
  }, [])

  if (!settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm">Abrindo configurações...</p>
      </div>
    )
  }

  const hasKey = Boolean(settings.apiKey)

  const patch = (p: Partial<AiSettings>) => setSettings(saveAiSettings(p))

  const handleSaveKey = () => {
    const key = keyInput.trim()
    if (!key) {
      setTest({ status: 'error', message: 'Cole a chave antes de salvar.' })
      return
    }
    setSavingKey(true)
    try {
      setSettings(saveAiSettings({ apiKey: key }))
      setKeyInput('')
      setTest({ status: 'idle' })
      toast({
        title: 'Chave salva!',
        description: 'Sua chave do Google AI Studio ficará salva apenas neste aparelho.',
      })
    } finally {
      setSavingKey(false)
    }
  }

  const handleTestKey = async () => {
    const key = keyInput.trim() || settings.apiKey
    if (!key) {
      setTest({ status: 'error', message: 'Cole a sua chave para testar (ou crie uma no botão acima).' })
      return
    }
    setTest({ status: 'testing' })
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key, model: settings.model }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        // Testou uma chave nova que ainda não estava salva? Salva automaticamente.
        if (keyInput.trim() && keyInput.trim() !== settings.apiKey) {
          setSettings(saveAiSettings({ apiKey: keyInput.trim() }))
          setKeyInput('')
        }
        setTest({ status: 'ok', message: 'Chave funcionando! A IA está pronta para gerar simulados.' })
      } else {
        setTest({ status: 'error', message: data.error ?? 'Não foi possível validar a chave agora.' })
      }
    } catch {
      setTest({ status: 'error', message: 'Falha de conexão ao testar a chave. Tente novamente.' })
    }
  }

  const handleRemoveKey = () => {
    setSettings(clearApiKey())
    setKeyInput('')
    setTest({ status: 'idle' })
    toast({ title: 'Chave removida', description: 'Você pode colar outra chave quando quiser.' })
  }

  const modelLabel = AI_MODELS.find((m) => m.id === settings.model)?.label ?? settings.model

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar para a biblioteca"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight">Configurações da IA</p>
            <p className="truncate text-xs text-slate-400">Comportamento e chave de API para gerar simulados</p>
          </div>
          <Sparkles className="ml-auto h-5 w-5 shrink-0 text-amber-400" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-6">
        {/* Status da IA */}
        <section
          aria-label="Status da IA"
          className={`rounded-2xl border p-5 shadow-sm ${
            hasKey ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {hasKey ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className={`text-base font-bold ${hasKey ? 'text-emerald-900' : 'text-amber-900'}`}>
                {hasKey ? 'IA pronta para gerar simulados' : 'IA sem chave própria'}
              </p>
              <p className={`mt-0.5 text-sm leading-relaxed ${hasKey ? 'text-emerald-800' : 'text-amber-800'}`}>
                {hasKey
                  ? `Usando a SUA chave do Google AI Studio • ${modelLabel}. A geração de questões e a leitura de PDFs escaneados usam a sua cota gratuita — sem depender do serviço do app.`
                  : 'A geração de questões depende do serviço do app e pode ficar indisponível. Crie a sua chave gratuita no Google AI Studio (leva 2 minutos) e cole abaixo para gerar sempre.'}
              </p>
            </div>
          </div>
        </section>

        {/* Chave de API */}
        <section aria-label="Chave de API" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900">Chave de API</h2>
              <p className="text-xs text-slate-500">Grátis no Google AI Studio • salva apenas neste aparelho</p>
            </div>
            {hasKey && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Chave configurada
              </span>
            )}
          </div>

          {/* Passo a passo + botão para o AI Studio */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Como criar a sua chave (2 minutos):</p>
            <ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-sm text-slate-600">
              <li>Toque no botão abaixo e entre com sua conta Google;</li>
              <li>Toque em “Create API key” e copie a chave (começa com “AIza”);</li>
              <li>Cole no campo aqui embaixo e toque em “Salvar chave”.</li>
            </ol>
            <Button
              onClick={() => window.open(AI_STUDIO_URL, '_blank', 'noopener,noreferrer')}
              className="mt-3 h-11 w-full bg-slate-900 font-bold text-white hover:bg-slate-800 sm:w-auto"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Criar chave no Google AI Studio
            </Button>
            <p className="mt-1.5 text-[11px] text-slate-400">{AI_STUDIO_URL}</p>
          </div>

          {/* Chave salva (mascarada) */}
          {hasKey && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <KeyRound className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Chave atual</p>
                <p className="truncate font-mono text-sm font-bold text-emerald-900">{maskApiKey(settings.apiKey)}</p>
              </div>
              <Button
                onClick={handleRemoveKey}
                variant="outline"
                size="sm"
                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Remover
              </Button>
            </div>
          )}

          {/* Colar a chave */}
          <div className="mt-4 space-y-2">
            <Label htmlFor="ai-api-key" className="text-sm font-semibold text-slate-700">
              {hasKey ? 'Trocar a chave' : 'Colar a chave'}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="ai-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIza..."
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="h-11 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleSaveKey}
                disabled={savingKey || !keyInput.trim()}
                className="h-11 flex-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Salvar chave
              </Button>
              <Button
                onClick={() => void handleTestKey()}
                disabled={test.status === 'testing'}
                variant="outline"
                className="h-11 flex-1 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {test.status === 'testing' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Testar chave
              </Button>
            </div>

            {/* Resultado do teste */}
            {test.status === 'ok' && (
              <p className="flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {test.message}
              </p>
            )}
            {test.status === 'error' && test.message && (
              <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {test.message}
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-slate-400">
              Privacidade: a chave fica guardada só neste aparelho e é usada apenas para gerar os seus simulados.
              Ela nunca aparece para outros usuários.
            </p>
          </div>
        </section>

        {/* Modelo */}
        <section aria-label="Modelo de IA" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Modelo da IA</h2>
              <p className="text-xs text-slate-500">Usado para gerar questões e ler PDFs escaneados</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {AI_MODELS.map((m) => {
              const selected = settings.model === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patch({ model: m.id })}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-800'}`}>{m.label}</p>
                  <p className={`mt-0.5 text-xs ${selected ? 'text-slate-300' : 'text-slate-500'}`}>{m.hint}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Comportamento */}
        <section
          aria-label="Comportamento da IA"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Como a IA deve se comportar</h2>
              <p className="text-xs text-slate-500">Estilo dos comentários das questões geradas</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {AI_PERSONAS.map((p) => {
              const selected = settings.persona === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patch({ persona: p.id as AiPersona })}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-amber-300' : 'border-slate-300'
                    }`}
                  >
                    {selected && <div className="h-2 w-2 rounded-full bg-amber-300" />}
                  </div>
                  <span className="min-w-0">
                    <span className={`block text-sm font-bold ${selected ? 'text-white' : 'text-slate-800'}`}>
                      {p.label}
                    </span>
                    <span className={`mt-0.5 block text-xs ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Detalhamento dos comentários */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-700">Tamanho dos comentários</p>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-200/70 p-0.5">
              {AI_COMMENT_DETAILS.map((c) => {
                const selected = settings.commentDetail === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => patch({ commentDetail: c.id as AiCommentDetail })}
                    className={`flex h-9 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                      selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {settings.commentDetail === 'resumido'
                ? 'Uma frase curta e direta com o essencial da resposta.'
                : settings.commentDetail === 'detalhado'
                  ? 'Explicação completa: por que a correta é correta e as erradas estão erradas.'
                  : 'Explicação equilibrada da resposta, citando a base do conteúdo.'}
            </p>
          </div>
        </section>

        {/* Instruções personalizadas */}
        <section
          aria-label="Instruções personalizadas"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900">Instruções para a IA</h2>
              <p className="text-xs text-slate-500">Personalize como as questões devem ser criadas</p>
            </div>
          </div>
          <Textarea
            value={settings.instructions}
            onChange={(e) => patch({ instructions: e.target.value.slice(0, 600) })}
            rows={4}
            className="mt-3 resize-none"
            placeholder="Ex.: Foque no que cai em prova; sempre cite o artigo da lei; use linguagem simples; crie pegadinhas no estilo CEBRASPE..."
          />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Aplicado a todos os novos simulados gerados dos seus PDFs.</span>
            <span>{settings.instructions.length}/600</span>
          </div>
        </section>

        {/* Criatividade */}
        <section aria-label="Criatividade da IA" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Criatividade</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Menos criativa = questões mais fiéis ao PDF • mais criativa = questões mais variadas
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-black text-amber-300">
              {settings.temperature.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[settings.temperature]}
            onValueChange={(v) => patch({ temperature: v[0] ?? 0.4 })}
            min={0}
            max={1}
            step={0.05}
            className="mt-4"
            aria-label="Nível de criatividade da IA"
          />
          <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
            <span>Previsível (0)</span>
            <span>Criativa (1)</span>
          </div>
        </section>

        <p className="pb-4 text-center text-[11px] text-slate-400">
          Alterações salvas automaticamente neste aparelho.
        </p>
      </main>
    </div>
  )
}
