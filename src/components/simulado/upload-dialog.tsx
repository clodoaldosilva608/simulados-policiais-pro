'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ExternalLink,
  FileText,
  KeyRound,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { extractPdfText, chunkText } from '@/lib/pdf-text'
import { openPdfForRender, renderPdfPageToJpegDataUrl } from '@/lib/pdf-ocr'
import {
  putLocalDocument,
  getLocalDocument,
  type LocalDocument,
  type LocalDocStyle,
} from '@/lib/local-db'
import { questionsPerChunk, type GeneratedQuestion } from '@/lib/question-gen'
import { getAiSettings, type AiSettings } from '@/lib/ai-settings'
import type { Question, TextBlock } from '@/data/types'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Documento em processamento a ser retomado (id) */
  resumeDocId: string | null
  /** Arquivo pré-selecionado via drag & drop */
  initialFile: File | null
  onCompleted: () => void
  /** Abre a aba Configurações da IA (colar/criar a chave) */
  onOpenAiSettings?: () => void
}

type Step = 'form' | 'extracting' | 'ocr' | 'generating' | 'done' | 'error'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function UploadDialog({ open, onOpenChange, resumeDocId, initialFile, onCompleted, onOpenAiSettings }: UploadDialogProps) {
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('form')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState<LocalDocStyle>('multipla')
  const [docId, setDocId] = useState<string | null>(null)
  const [chunksDone, setChunksDone] = useState(0)
  const [chunksTotal, setChunksTotal] = useState(0)
  const [pages, setPages] = useState<number | null>(null)
  const [charCount, setCharCount] = useState<number | null>(null)
  const [ocrPagesDone, setOcrPagesDone] = useState(0)
  const [ocrPagesTotal, setOcrPagesTotal] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const cancelled = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Configurações da IA lidas quando o dialog abre (snapshot para o processamento)
  const aiSettingsRef = useRef<AiSettings | null>(null)
  const [hasAiKey, setHasAiKey] = useState<boolean | null>(null)

  /** Converte questões geradas pela IA no formato do app e acumula no doc */
  const mergeGenerated = useCallback(
    (doc: LocalDocument, chunkIndex: number, generated: GeneratedQuestion[]): LocalDocument => {
      const questions: Question[] = [...doc.questions]
      const textBlocks: Record<string, TextBlock> = { ...doc.textBlocks }
      let created = 0
      for (const g of generated) {
        let textRef: string | undefined
        if (g.textBlock) {
          textRef = `t${chunkIndex + 1}-${created + 1}`
          textBlocks[textRef] = {
            id: textRef,
            title: g.textBlock.title,
            paragraphs: g.textBlock.paragraphs,
            source: g.textBlock.source,
          }
        }
        questions.push({
          id: questions.length + 1,
          subjectId: g.topic,
          textRef,
          statement: g.statement,
          options: g.options.map((o) => ({ key: o.key as Question['options'][number]['key'], html: o.html })),
          answer: g.answer as Question['answer'],
          comment: g.comment,
        })
        created++
      }
      return { ...doc, questions, textBlocks }
    },
    [],
  )

  /** Loop de geração: 1 chamada por bloco, salvando progresso no banco local */
  const runGeneration = useCallback(
    async (doc: LocalDocument) => {
      setStep('generating')
      setDocId(doc.id)
      setChunksTotal(doc.chunksTotal)
      setChunksDone(doc.chunksDone)
      setPages(doc.pages)
      setCharCount(doc.charCount)

      let current = { ...doc }
      const style = doc.style
      const count = questionsPerChunk(style)
      const ai = aiSettingsRef.current
      // Campos da IA do aluno enviados ao servidor (BYOK — nunca fica no servidor)
      const aiPayload = ai?.apiKey
        ? {
            apiKey: ai.apiKey,
            model: ai.model,
            temperature: ai.temperature,
            persona: ai.persona,
            commentDetail: ai.commentDetail,
            instructions: ai.instructions,
          }
        : {}
      const licenseCode =
        typeof window !== 'undefined' ? window.localStorage.getItem('spp-license-v1') : null
      let accessHeader: Record<string, string> = {}
      try {
        if (licenseCode) {
          const parsed = JSON.parse(licenseCode) as { code?: string }
          if (parsed.code) accessHeader = { 'x-access-code': parsed.code }
        }
      } catch {
        /* sem código */
      }

      let firstServerError = ''
      while (!cancelled.current && current.chunksDone < current.chunksTotal) {
        const index = current.chunksDone
        const chunk = current.chunks[index]
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...accessHeader },
            body: JSON.stringify({ chunk, style, count, ...aiPayload }),
          })
          const data = (await res.json()) as { questions?: GeneratedQuestion[]; error?: string }
          if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
            current = mergeGenerated(current, index, data.questions)
          } else if (data?.error) {
            // Guarda o primeiro erro real do servidor (ex.: chave recusada) para
            // mostrar uma mensagem acionável em vez de "falha genérica".
            if (!firstServerError) firstServerError = data.error
          }
          // Bloco com falha é pulado e o fluxo continua
        } catch {
          /* rede falhou: pula bloco */
        }

        current = {
          ...current,
          chunksDone: index + 1,
          status: index + 1 >= current.chunksTotal ? 'ready' : 'processing',
        }
        setChunksDone(current.chunksDone)
        try {
          await putLocalDocument(current)
        } catch {
          /* segue em memória */
        }
      }

      if (cancelled.current) return

      if (current.questions.length === 0) {
        const failed: LocalDocument = {
          ...current,
          status: 'error',
          error:
            firstServerError ||
            'Não foi possível gerar questões com a IA neste momento. Verifique sua conexão e tente novamente em alguns minutos.',
        }
        try {
          await putLocalDocument(failed)
        } catch {
          /* noop */
        }
        setStep('error')
        setErrorMsg(failed.error ?? '')
        return
      }

      setStep('done')
      onCompleted()
      toast({
        title: 'Simulado pronto!',
        description: `${current.questions.length} questões geradas e salvas neste aparelho.`,
      })
    },
    [mergeGenerated, onCompleted, toast],
  )

  /** Retoma a geração de um documento salvo como "processing" */
  const resumeGeneration = useCallback(
    async (id: string) => {
      const doc = await getLocalDocument(id)
      if (!doc) {
        setStep('error')
        setErrorMsg('Simulado não encontrado no armazenamento local.')
        return
      }
      if (doc.status === 'ready') {
        setStep('done')
        return
      }
      if (doc.ocrPagesTotal && doc.chunksTotal === 0 && doc.questions.length === 0) {
        // OCR interrompido no meio (o arquivo original não fica salvo no aparelho)
        setStep('error')
        setErrorMsg(
          'A leitura por IA deste PDF ficou incompleta. Envie o arquivo novamente para gerar o simulado do zero.',
        )
        return
      }
      await runGeneration(doc)
    },
    [runGeneration],
  )

  // Reset ao abrir (adiado para evitar setState síncrono no effect)
  useEffect(() => {
    if (!open) {
      cancelled.current = true
      return
    }
    cancelled.current = false
    const timer = window.setTimeout(() => {
      aiSettingsRef.current = getAiSettings()
      setHasAiKey(Boolean(aiSettingsRef.current.apiKey))
      setErrorMsg('')
      if (resumeDocId) {
        setFile(null)
        setStep('generating')
        void resumeGeneration(resumeDocId)
      } else if (initialFile && initialFile.size > MAX_FILE_SIZE) {
        // Arquivo vindo do drag & drop não passa pelo input — valida aqui também
        setFile(null)
        setStep('error')
        setErrorMsg('Arquivo muito grande (máximo 50 MB).')
      } else {
        setFile(initialFile)
        setTitle(initialFile ? initialFile.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ') : '')
        setStep('form')
        setDocId(null)
        setChunksDone(0)
        setChunksTotal(0)
        setPages(null)
        setCharCount(null)
        setOcrPagesDone(0)
        setOcrPagesTotal(null)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, resumeDocId, initialFile, resumeGeneration])

  /** Header de acesso (código/assinatura) para as chamadas de IA */
  const buildAccessHeader = useCallback((): Record<string, string> => {
    try {
      const raw = window.localStorage.getItem('spp-license-v1')
      if (raw) {
        const parsed = JSON.parse(raw) as { code?: string }
        if (parsed.code) return { 'x-access-code': parsed.code }
      }
    } catch {
      /* sem código */
    }
    return {}
  }, [])

  /**
   * Leitura por IA (OCR) de PDF em imagem: renderiza as páginas no navegador e
   * envia lotes de 3 para /api/transcribe. Devolve o texto + total de páginas,
   * ou null se cancelado.
   */
  const runOcr = useCallback(
    async (
      buffer: Uint8Array,
      baseDoc: LocalDocument,
      accessHeader: Record<string, string>,
    ): Promise<{ text: string; totalPages: number; unavailable: boolean; serverError: string } | null> => {
      setStep('ocr')
      const pdf = await openPdfForRender(buffer)
      const totalPages = pdf.numPages
      setPages(totalPages)
      setOcrPagesTotal(totalPages)
      setOcrPagesDone(0)

      const BATCH = 3
      let ocrText = ''
      let unavailable = false
      let ocrServerError = ''
      for (let start = 1; start <= totalPages; start += BATCH) {
        if (cancelled.current) return null
        const end = Math.min(start + BATCH - 1, totalPages)
        const dataUrls: string[] = []
        for (let p = start; p <= end; p++) {
          if (cancelled.current) return null
          dataUrls.push(await renderPdfPageToJpegDataUrl(pdf, p))
        }
        let batchText = ''
        for (let attempt = 0; attempt < 2 && !batchText; attempt++) {
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...accessHeader },
              body: JSON.stringify({
                images: dataUrls,
                ...(aiSettingsRef.current?.apiKey
                  ? { apiKey: aiSettingsRef.current.apiKey, model: aiSettingsRef.current.model }
                  : {}),
              }),
            })
            const data = (await res.json()) as { text?: string; error?: string }
            if (res.ok && typeof data.text === 'string' && data.text.trim()) batchText = data.text
            else {
              if (res.status === 503 || res.status === 401 || res.status === 403 || res.status === 429)
                unavailable = true
              if (!ocrServerError && data?.error) ocrServerError = data.error
            }
          } catch {
            /* rede falhou: tenta de novo */
          }
        }
        if (batchText) ocrText = ocrText ? `${ocrText}\n\n${batchText}` : batchText
        setOcrPagesDone(end)
        try {
          await putLocalDocument({ ...baseDoc, ocrText, ocrPagesDone: end })
        } catch {
          /* segue em memória */
        }
        if (!batchText && start === 1) break // 1ª leva falhou (ex.: IA indisponível): não insiste nas demais
      }
      return { text: ocrText.trim(), totalPages, unavailable, serverError: ocrServerError }
    },
    [],
  )

  const handleGenerate = async () => {
    if (!file) return
    setErrorMsg('')
    setStep('extracting')
    try {
      const baseTitle = (title.trim() || file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ') || 'Simulado de PDF').slice(0, 120)
      const accessHeader = buildAccessHeader()

      let text = ''
      let pagesCount: number | null = null
      try {
        // buffer próprio: o pdf.js desanexa o ArrayBuffer após abrir o documento
        const extraction = await extractPdfText(new Uint8Array(await file.arrayBuffer()))
        text = extraction.text
        pagesCount = extraction.pages
      } catch {
        /* PDF sem texto aproveitável (imagem/scan) — cai para a leitura por IA */
      }

      // 2) Sem texto suficiente → leitura por IA das páginas (OCR)
      if (text.trim().length < 200) {
        const baseDoc: LocalDocument = {
          id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: baseTitle,
          fileName: file.name,
          fileSize: file.size,
          pages: 0,
          charCount: 0,
          style,
          status: 'processing',
          error: null,
          chunks: [],
          chunksDone: 0,
          chunksTotal: 0,
          createdAt: new Date().toISOString(),
          questions: [],
          textBlocks: {},
          ocrUsed: true,
          ocrText: '',
          ocrPagesDone: 0,
          ocrPagesTotal: 0,
        }
        try {
          await putLocalDocument(baseDoc)
        } catch {
          /* segue em memória */
        }
        setDocId(baseDoc.id)
        onCompleted()

        const ocr = await runOcr(new Uint8Array(await file.arrayBuffer()), baseDoc, accessHeader)
        if (cancelled.current || ocr === null) return
        if (!ocr.text || ocr.text.length < 200) {
          const failed: LocalDocument = {
            ...baseDoc,
            status: 'error',
            error:
              ocr.serverError ||
              (ocr.unavailable
                ? 'O serviço de leitura por IA está temporariamente indisponível. Tente novamente em alguns minutos.'
                : 'Não foi possível ler o conteúdo deste PDF nem com a leitura por IA. Verifique se o arquivo contém texto legível e tente novamente.'),
          }
          try {
            await putLocalDocument(failed)
          } catch {
            /* noop */
          }
          setStep('error')
          setErrorMsg(failed.error ?? '')
          return
        }
        text = ocr.text

        const chunks = chunkText(text)
        const finalDoc: LocalDocument = {
          ...baseDoc,
          pages: ocr.totalPages,
          charCount: text.length,
          ocrText: text,
          ocrPagesDone: ocr.totalPages,
          chunks,
          chunksTotal: chunks.length,
        }
        try {
          await putLocalDocument(finalDoc)
        } catch {
          /* segue em memória */
        }
        setCharCount(text.length)
        setChunksTotal(chunks.length)
        setChunksDone(0)
        await runGeneration(finalDoc)
        return
      }

      // 3) Fluxo normal — texto extraído com sucesso
      const chunks = chunkText(text)
      if (chunks.length === 0) {
        setStep('error')
        setErrorMsg('O PDF não possui conteúdo de texto aproveitável.')
        return
      }

      setPages(pagesCount)
      setCharCount(text.length)
      setChunksTotal(chunks.length)
      setChunksDone(0)

      // 4) Salva o documento no banco LOCAL e inicia a geração
      const doc: LocalDocument = {
        id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: baseTitle,
        fileName: file.name,
        fileSize: file.size,
        pages: pagesCount ?? 0,
        charCount: text.length,
        style,
        status: 'processing',
        error: null,
        chunks,
        chunksDone: 0,
        chunksTotal: chunks.length,
        createdAt: new Date().toISOString(),
        questions: [],
        textBlocks: {},
      }
      try {
        await putLocalDocument(doc)
      } catch {
        /* segue em memória mesmo sem storage */
      }
      setDocId(doc.id)
      onCompleted()
      await runGeneration(doc)
    } catch (err) {
      setStep('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado ao processar o PDF')
    }
  }

  const chooseFile = () => {
    fileInputRef.current?.click()
  }

  const stepIcon = (current: Step, target: Step) => {
    const order: Step[] = ['form', 'extracting', 'ocr', 'generating', 'done']
    const done = order.indexOf(current) > order.indexOf(target) || current === 'done'
    if (done) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    if (current === target) return <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
    return <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
  }

  const busy = step === 'extracting' || step === 'ocr' || step === 'generating'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          aria-label="Selecionar arquivo PDF"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              if (f.size > MAX_FILE_SIZE) {
                setStep('error')
                setErrorMsg('Arquivo muito grande (máximo 50 MB).')
                e.target.value = ''
                return
              }
              setFile(f)
              setTitle(f.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '))
              setStep('form')
            }
            e.target.value = ''
          }}
        />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {resumeDocId ? 'Processando simulado' : 'Transformar PDF em simulado'}
          </DialogTitle>
          <DialogDescription>
            {resumeDocId
              ? 'A geração de questões foi retomada.'
              : 'A IA lê o conteúdo do PDF e cria questões inéditas com gabarito comentado. O arquivo fica salvo apenas no seu aparelho.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-5">
            {/* Zona de arquivo */}
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <FileText className="h-8 w-8 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remover arquivo">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={chooseFile}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-amber-400 hover:bg-amber-50/50"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Clique para escolher um PDF</span>
                <span className="text-xs text-slate-400">Editais, apostilas, resumos • até 50 MB</span>
              </button>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="doc-title" className="text-sm font-medium text-slate-700">
                Título do simulado
              </Label>
              <Input
                id="doc-title"
                placeholder="Ex.: Direito Administrativo — Capítulo 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Estilo das questões</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStyle('multipla')}
                  aria-pressed={style === 'multipla'}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    style === 'multipla'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Múltipla escolha</p>
                  <p className="mt-0.5 text-xs text-slate-500">5 alternativas (a–e), uma correta</p>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle('certo_errado')}
                  aria-pressed={style === 'certo_errado'}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    style === 'certo_errado'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Certo / Errado</p>
                  <p className="mt-0.5 text-xs text-slate-500">Estilo CEBRASPE — julgue o item</p>
                </button>
              </div>
            </div>

            {/* Banner sem chave de IA: orienta criar/colar a chave gratuita */}
            {hasAiKey === false && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2.5">
                  <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-900">Conecte a sua chave de IA (grátis)</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                      Para transformar este PDF em questões, use a sua chave gratuita do Google AI Studio — leva 2
                      minutos e fica salva apenas neste aparelho.
                    </p>
                    <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open('https://aistudio.google.com/apikey', '_blank', 'noopener,noreferrer')
                        }
                        className="bg-slate-900 font-bold text-white hover:bg-slate-800"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Criar chave grátis
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onOpenChange(false)
                          onOpenAiSettings?.()
                        }}
                        className="border-amber-300 bg-white font-bold text-amber-900 hover:bg-amber-100"
                      >
                        <Bot className="mr-1.5 h-3.5 w-3.5" /> Colar minha chave
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {hasAiKey === true && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> IA pronta usando a sua chave do Google AI Studio
              </p>
            )}

            <Button
              onClick={() => void handleGenerate()}
              disabled={!file || busy}
              className="h-12 w-full bg-amber-500 text-base font-bold text-slate-950 hover:bg-amber-400"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Gerar simulado
            </Button>
          </div>
        )}

        {(step === 'extracting' || step === 'ocr' || step === 'generating' || step === 'done') && (
          <div className="space-y-4 py-2">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                {stepIcon(step, 'extracting')}
                <span className={step === 'extracting' ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  Lendo o PDF e extraindo texto no seu aparelho
                  {pages !== null && step !== 'extracting' && (
                    <span className="text-xs text-slate-400">
                      {' '}
                      • {pages} páginas
                    </span>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                {stepIcon(step, 'ocr')}
                <span className={step === 'ocr' ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  Lendo as páginas com IA (PDF em imagem)
                  {ocrPagesTotal !== null && step !== 'ocr' && (
                    <span className="text-xs text-slate-400">
                      {' '}
                      • {ocrPagesTotal} páginas • {((charCount ?? 0) / 1000).toFixed(0)} mil caracteres
                    </span>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                {stepIcon(step, 'generating')}
                <span className={step === 'generating' ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  Gerando questões com IA
                  {chunksTotal > 0 && (
                    <span className="ml-1 text-xs text-slate-400">
                      (bloco {Math.min(chunksDone + 1, chunksTotal)}/{chunksTotal})
                    </span>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                {stepIcon(step, 'done')}
                <span className={step === 'done' ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  Simulado pronto para estudar
                </span>
              </li>
            </ul>

            {step === 'ocr' && ocrPagesTotal !== null && ocrPagesTotal > 0 && (
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                  <span>Progresso da leitura por IA</span>
                  <span className="tabular-nums">
                    {ocrPagesDone}/{ocrPagesTotal} páginas
                  </span>
                </div>
                <Progress value={(ocrPagesDone / ocrPagesTotal) * 100} className="h-2.5" />
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Este PDF não tem texto embutido (é uma imagem), então a IA está lendo página por página — pode
                  levar alguns minutos. Feche o aplicativo sem medo: ao reabrir, envie o PDF novamente para
                  continuar.
                </p>
              </div>
            )}

            {chunksTotal > 0 && (
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                  <span>Progresso da geração</span>
                  <span className="tabular-nums">
                    {chunksDone}/{chunksTotal} blocos
                  </span>
                </div>
                <Progress value={(chunksDone / chunksTotal) * 100} className="h-2.5" />
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Cada bloco analisa um trecho do PDF e cria novas questões — pode levar alguns minutos em PDFs
                  grandes. O progresso é salvo no seu aparelho: se sair do app, dá para retomar depois na biblioteca.
                </p>
              </div>
            )}

            {step === 'done' && (
              <Button
                onClick={() => onOpenChange(false)}
                className="h-11 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Concluir
              </Button>
            )}
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4 py-1">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">Não foi possível concluir</p>
                <p className="mt-0.5 text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {docId && (
                <Button
                  onClick={() => void resumeGeneration(docId)}
                  className="flex-1 bg-slate-900 font-bold text-white hover:bg-slate-800"
                >
                  Tentar novamente
                </Button>
              )}
              {(errorMsg.toLowerCase().includes('chave') || hasAiKey === false) && (
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    onOpenAiSettings?.()
                  }}
                  variant="outline"
                  className="flex-1 border-amber-300 font-bold text-amber-900 hover:bg-amber-50"
                >
                  <Bot className="mr-1.5 h-4 w-4" /> Configurações da IA
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-slate-300">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
