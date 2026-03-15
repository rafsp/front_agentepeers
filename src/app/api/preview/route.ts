// src/app/api/preview/route.ts
// POST: Salva o HTML do protótipo para compartilhamento público
// Armazena em memória (Map) — persiste enquanto o servidor estiver rodando

import { NextRequest, NextResponse } from 'next/server'

// In-memory store — em produção usar Redis/DB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const global = globalThis as any
if (!global.__previewStore) global.__previewStore = new Map<string, { html: string; name: string; createdAt: string; createdBy: string }>()
const store: Map<string, { html: string; name: string; createdAt: string; createdBy: string }> = global.__previewStore

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, html, projectName, createdBy } = body

    if (!projectId || !html) {
      return NextResponse.json({ error: 'projectId and html are required' }, { status: 400 })
    }

    store.set(projectId, {
      html,
      name: projectName || 'Protótipo',
      createdAt: new Date().toISOString(),
      createdBy: createdBy || 'unknown',
    })

    const previewUrl = `/preview/${projectId}`

    return NextResponse.json({ success: true, url: previewUrl, projectId })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  // List all stored previews (for debugging)
  const list = Array.from(store.entries()).map(([id, data]) => ({
    projectId: id,
    name: data.name,
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    htmlSize: data.html.length,
  }))
  return NextResponse.json({ count: list.length, previews: list })
}