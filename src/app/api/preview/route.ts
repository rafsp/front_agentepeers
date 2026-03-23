// src/app/api/preview/route.ts
// POST: Salva HTML do protótipo para compartilhamento público
// Suporta: protótipo do projeto OU protótipo por épico
// Key: projectId (geral) ou projectId::epicId (por épico)

import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any
if (!g.__previewStore) g.__previewStore = new Map<string, { html: string; name: string; epicId?: string; createdAt: string; createdBy: string }>()
const store: Map<string, { html: string; name: string; epicId?: string; createdAt: string; createdBy: string }> = g.__previewStore

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, html, projectName, createdBy, epicId } = body

    if (!projectId || !html) {
      return NextResponse.json({ error: 'projectId and html are required' }, { status: 400 })
    }

    // Key: "projectId" para geral, "projectId::epicId" para épico
    const key = epicId ? `${projectId}::${epicId}` : projectId

    store.set(key, {
      html,
      name: epicId ? `${projectName || 'Projeto'} — ${epicId}` : (projectName || 'Protótipo'),
      epicId: epicId || undefined,
      createdAt: new Date().toISOString(),
      createdBy: createdBy || 'unknown',
    })

    const previewUrl = epicId
      ? `/preview/${projectId}?epic=${encodeURIComponent(epicId)}`
      : `/preview/${projectId}`

    return NextResponse.json({ success: true, url: previewUrl, projectId, epicId })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  const list = Array.from(store.entries()).map(([id, data]) => ({
    key: id,
    name: data.name,
    epicId: data.epicId,
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    htmlSize: data.html.length,
  }))
  return NextResponse.json({ count: list.length, previews: list })
}