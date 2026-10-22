'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
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
import type { DocumentSummary } from '@/data/simulado'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Documento em processamento a ser retomado */
  resumeDoc: DocumentSummary | null
  /** Arquivo pré-selecionado via drag & drop */
  initialFile: File | null
  onCompleted: () => void
}

type Step = 'form' | 'uploading' | 'generating' | 'done' | 'error'

export function UploadDialog({ open, onOpenChange, resumeDoc, initialFile, onCompleted }: UploadDialogProps) {
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('form')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState<'multipla' | 'certo_errado'>('multipla')
  const [docId, setDocId] = useState<string | null>(null)
  const [chunksDone, setChunksDone] = useState(0)
  const [chunksTotal, setChunksTotal] = useState(0)
  const [pages, setPages] = useState<number | null>(null)
  const [charCount, setCharCount] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const cancelled = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset ao abrir
  useEffect(() => {
    if (!open) return
    cancelled.current = false
    if (resumeDoc) {
      setFile(null)
      setStep('generating')
      setDocId(resumeDoc.id)
      setChunksDone(resumeDoc.chunksDone)
      setChunksTotal(resumeDoc.chunksTotal)
      setPages(resumeDoc.pages)
      setCharCount(resumeDoc.charCount)
      setErrorMsg('')
      void runGeneration(resumeDoc.id)
    } else {
      setFile(initialFile)
      setTitle(initialFile ? initialFile.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ') : '')
      setStep(initialFile ? 'form' : 'form')
      setDocId(null)
      setChunksDone(0)
      setChunksTotal(0)
      setPages(null)
      setCharCount(null)
      setErrorMsg('')
    }
  }, [open, resumeDoc, initialFile])


  // Encerra polling quando o dialog fecha
  useEffect(() => {
    if (!open) cancelled.current = true
  }, [open])

  const runGeneration = useCallback(
    async (id: string) => {
      setStep('generating')
      try {
        while (!cancelled.current) {
          const res = await fetch(`/api/documents/${id}/generate`, { method: 'POST' })
          if (!res.ok) throw new Error('Falha ao gerar questões')
          const data = (await res.json()) as {
            status: string
            chunksDone: number
            chunksTotal: number
            error?: string
          }
          setChunksDone(data.chunksDone)
          setChunksTotal(data.chunksTotal)
          if (data.status === 'ready') {
            setStep('done')
            onCompleted()
            toast({
              title: 'Simulado pronto!',
              description: 'As questões foram geradas a partir do seu PDF.',
            })
            return
          }
          if (data.status === 'error') {
            setStep('error')
            setErrorMsg(data.error ?? 'Falha na geração de questões')
            return
          }
        }
      } catch (err) {
        if (!cancelled.current) {
          setStep('error')
          setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado na geração')
        }
      }
    },
    [onCompleted, toast]
  )

  const handleUpload = async () => {
    if (!file) return
    setStep('uploading')
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('style', style)
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      const data = (await res.json()) as {
        id?: string
        pages?: number
        charCount?: number
        chunksTotal?: number
        error?: string
      }
      if (!res.ok || !data.id) {
        setStep('error')
        setErrorMsg(data.error ?? 'Falha no upload do PDF')
        return
      }
      setDocId(data.id)
      setPages(data.pages ?? null)
      setCharCount(data.charCount ?? null)
      setChunksDone(0)
      setChunksTotal(data.chunksTotal ?? 0)
      onCompleted()
      await runGeneration(data.id)
    } catch (err) {
      setStep('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado no upload')
    }
  }

  const chooseFile = () => {
    fileInputRef.current?.click()
  }

  const stepIcon = (current: Step, target: Step) => {
    const order: Step[] = ['form', 'uploading', 'generating', 'done']
    const done = order.indexOf(current) > order.indexOf(target) || current === 'done'
    if (done) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    if (current === target)
      return <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
    return <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
  }

  const busy = step === 'uploading' || step === 'generating'

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
              setFile(f)
              setTitle(f.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '))
            }
            e.target.value = ''
          }}
        />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {resumeDoc ? 'Processando simulado' : 'Transformar PDF em simulado'}
          </DialogTitle>
          <DialogDescription>
            {resumeDoc
              ? 'A geração de questões foi retomada.'
              : 'A IA lê o conteúdo do PDF e cria questões inéditas com gabarito comentado.'}
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
                <span className="text-xs text-slate-400">Editais, apostilas, resumos • até 25 MB</span>
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

            <Button
              onClick={handleUpload}
              disabled={!file}
              className="h-12 w-full bg-amber-500 text-base font-bold text-slate-950 hover:bg-amber-400"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Gerar simulado
            </Button>
          </div>
        )}

        {(step === 'uploading' || step === 'generating' || step === 'done') && (
          <div className="space-y-4 py-2">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                {stepIcon(step, 'uploading')}
                <span className={step === 'uploading' ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  Enviando e extraindo texto do PDF
                  {pages !== null && step !== 'uploading' && (
                    <span className="text-xs text-slate-400"> • {pages} páginas • {((charCount ?? 0) / 1000).toFixed(0)} mil caracteres</span>
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
                  grandes. Você pode fechar esta janela; o processamento continua e aparecerá na biblioteca.
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
                  onClick={() => void runGeneration(docId)}
                  className="flex-1 bg-slate-900 font-bold text-white hover:bg-slate-800"
                >
                  Tentar novamente
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
