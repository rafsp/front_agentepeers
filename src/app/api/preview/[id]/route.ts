// src/app/api/preview/[id]/route.ts
// GET: Retorna o HTML do prototipo — SEM AUTENTICACAO
// Qualquer pessoa com o link acessa

import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const global = globalThis as any
if (!global.__previewStore) global.__previewStore = new Map()
const store: Map<string, { html: string; name: string; createdAt: string; createdBy: string }> = global.__previewStore

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  const data = store.get(id)

  if (!data) {
    return NextResponse.json(
      { error: 'Preview not found', projectId: id },
      { status: 404 }
    )
  }

  // Return JSON with html and metadata
  return NextResponse.json({
    projectId: id,
    projectName: data.name,
    html: data.html,
    createdAt: data.createdAt,
  })
}