import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { deleteMaterial, listMaterials, upsertMaterial } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/materials — CRUD de materiais de estudo.
 *
 * • multipart/form-data com "file" → UPLOAD do PDF/apostila (limite ~4,5 MB
 *   do body em serverless; arquivos maiores: hospede externamente e cadastre
 *   como link). Campos textuais complementares opcionais.
 * • application/json {action:'save', material} → cria/EDITA registro (link externo)
 * • {action:'delete', id} | {action:'toggle', id}
 */

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB (folga p/ limite de body da Vercel)

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const materials = await listMaterials()
  return NextResponse.json({ ok: true, materials })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  const contentType = req.headers.get('content-type') ?? ''

  try {
    /* ---------------- UPLOAD (multipart) ---------------- */
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!file || typeof file === 'string') {
        return NextResponse.json({ ok: false, error: 'Arquivo ausente.' }, { status: 400 })
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { ok: false, error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Limite de upload: 4 MB — use link externo para arquivos maiores.` },
          { status: 400 },
        )
      }
      const kind = String(form.get('kind') ?? 'pdf')
      const id = crypto.randomUUID()
      const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
      const pathname = `materials/${id}.${ext}`
      const blob = await put(pathname, file, {
        access: 'public', // PDFs de estudo são entregues ao aluno logado
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      const result = await upsertMaterial({
        id,
        title: String(form.get('title') ?? file.name.replace(/\.[a-z0-9]+$/i, '')),
        description: String(form.get('description') ?? ''),
        kind,
        materia: String(form.get('materia') ?? ''),
        concurso: String(form.get('concurso') ?? ''),
        banca: String(form.get('banca') ?? ''),
        ano: Number(form.get('ano')) || undefined,
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
      })
      if ('error' in result) {
        await del(pathname).catch(() => {})
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      }
      void appendEvent({ type: 'admin_material_uploaded', message: `Material "${result.title}" enviado (${(file.size / 1024).toFixed(0)} KB)`, source: 'admin' })
      return NextResponse.json({ ok: true, material: result })
    }

    /* ---------------- Ações JSON ---------------- */
    const body = (await req.json()) as { action?: string; material?: Record<string, unknown>; id?: string }

    if (body.action === 'save') {
      const result = await upsertMaterial(body.material ?? {})
      if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      void appendEvent({ type: 'admin_material_saved', message: `Material "${result.title}" salvo`, source: 'admin' })
      return NextResponse.json({ ok: true, material: result })
    }

    if (body.action === 'delete') {
      if (!body.id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
      const removed = await deleteMaterial(body.id)
      if (removed?.url?.includes('/materials/')) {
        // remove o blob do storage (links externos ficam intocados)
        const path = new URL(removed.url).pathname.replace(/^\//, '')
        await del(path).catch(() => {})
      }
      void appendEvent({ type: 'admin_material_deleted', message: `Material "${removed?.title ?? body.id}" excluído`, source: 'admin' })
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'toggle') {
      if (!body.id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
      const all = await listMaterials()
      const target = all.find((m) => m.id === body.id)
      if (!target) return NextResponse.json({ ok: false, error: 'material-nao-encontrado' }, { status: 404 })
      const result = await upsertMaterial({ ...target, active: !target.active })
      if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      return NextResponse.json({ ok: true, material: result })
    }

    return NextResponse.json({ ok: false, error: 'acao-desconhecida' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Falha ao processar material.' }, { status: 400 })
  }
}
