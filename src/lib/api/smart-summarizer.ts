// src/lib/api/smart-summarizer.ts
// Resumo inteligente via PEERS Brain (brain.peers.com.br/api)
// Testado: POST /chat com X-API-Key funciona direto, sem /auth/token
// Fallback: truncagem inteligente se Brain estiver fora

const MAX_COMMENT_CHARS = 25000
const BRAIN_URL = 'https://brain.peers.com.br/api'

// Token CODE.IA — expira em 2028
const DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjU3ZjA3YS01MGZiLTQ4NGMtODFmYS1kN2IxYTExMjJjMDQiLCJlbWFpbCI6InJhZmFlbC5wZXJlaXJhQHBlZXJzLmNvbS5iciIsImdpdmVuX25hbWUiOiJSYWZhZWwiLCJkaXNwbGF5X25hbWUiOiJSYWZhZWwgU2FudG9zIE5vdm8gUGVyZWlyYSIsInRva2VuX2lkIjoiNzQyOGU2YjktZTRmMy00MmZlLTk3ZjctYmJkYmZlMTM0ODYyIiwidG9rZW5fbmFtZSI6IkNPREUuSUEiLCJleHAiOjE4MzU4NDIzMDV9.8QI0zuqC7rqMkLiG4Mx_2YhGC-QM2gdwQ_wha2cg2pQ'

function getToken(): string {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('peers_brain_token')
    if (stored) return stored
  }
  return process.env.NEXT_PUBLIC_PEERS_BRAIN_TOKEN || DEFAULT_TOKEN
}

// ── Tipos ─────────────────────────────────────────────────────────────────

export interface SummarizeResult {
  text: string
  wasReduced: boolean
  method: 'original' | 'brain_summary' | 'truncated'
  originalLength: number
  finalLength: number
}

// ── Funções públicas ──────────────────────────────────────────────────────

export function needsSummarization(text: string): boolean {
  return text.length > MAX_COMMENT_CHARS
}

/**
 * Resumo inteligente: PEERS Brain → fallback truncagem
 */
export async function smartSummarize(
  text: string,
  userInstructions?: string,
  projectContext?: string
): Promise<SummarizeResult> {
  const originalLength = text.length

  if (!needsSummarization(text)) {
    return { text, wasReduced: false, method: 'original', originalLength, finalLength: text.length }
  }

  console.log(`📄 Texto grande: ${originalLength} chars (limite: ${MAX_COMMENT_CHARS}). Resumindo via PEERS Brain...`)

  try {
    const summary = await callPeersBrain(text, userInstructions, projectContext)
    if (summary && summary.length > 100 && summary.length < MAX_COMMENT_CHARS) {
      console.log(`✅ PEERS Brain resumiu: ${originalLength} → ${summary.length} chars`)
      return { text: summary, wasReduced: true, method: 'brain_summary', originalLength, finalLength: summary.length }
    }
  } catch (e) {
    console.warn('⚠️ PEERS Brain falhou, usando truncagem:', e)
  }

  const truncated = smartTruncate(text, MAX_COMMENT_CHARS)
  console.log(`✂️ Truncado: ${originalLength} → ${truncated.length} chars`)
  return { text: truncated, wasReduced: true, method: 'truncated', originalLength, finalLength: truncated.length }
}

// ── PEERS Brain /chat ─────────────────────────────────────────────────────

async function callPeersBrain(
  text: string,
  userInstructions?: string,
  projectContext?: string
): Promise<string> {
  const systemPrompt = `Você é um assistente especializado em análise de documentos técnicos para planejamento de software.
Resuma o documento abaixo de forma estruturada, mantendo TODAS as informações relevantes para:
- Geração de épicos e features de software
- Definição de timeline e cronograma
- Identificação de riscos e premissas
- Criação de protótipos de interface

Mantenha obrigatoriamente:
- Requisitos funcionais e não-funcionais
- Regras de negócio principais
- Integrações e dependências técnicas
- Stakeholders, usuários e perfis de acesso
- KPIs, métricas e critérios de aceite
- Restrições de prazo e orçamento
- Arquitetura e infraestrutura mencionadas
${projectContext ? `\nContexto do projeto: ${projectContext}` : ''}
${userInstructions ? `\nInstruções do usuário: ${userInstructions}` : ''}

IMPORTANTE: O resumo deve ser conciso mas COMPLETO. Não perca informações que impactem o escopo.
Limite máximo: 20.000 caracteres.`

  const response = await fetch(`${BRAIN_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getToken(),
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Resuma o seguinte documento para planejamento de software:\n\n${text}` },
      ],
      agent_call: 'summarizer',
      stream: false,
      show_history: false,
    }),
    signal: AbortSignal.timeout(120000),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`PEERS Brain (${response.status}): ${err}`)
  }

  const data = await response.json()
  const content = data.response || ''
  if (!content) throw new Error('PEERS Brain retornou resposta vazia')

  return String(content).trim()
}

// ── Truncagem inteligente (fallback) ──────────────────────────────────────

function smartTruncate(text: string, maxChars: number): string {
  const warning = `\n\n[⚠️ DOCUMENTO TRUNCADO — original: ${text.length} chars. Seções mais relevantes preservadas.]`
  const available = maxChars - warning.length - 200

  const sections = text.split(/\n(?=#{1,4}\s)|(?:\n\s*\n){2,}/)
  const keywords = [
    'requisit', 'funcional', 'negócio', 'integra', 'técnic', 'escopo',
    'objetivo', 'restrição', 'stakeholder', 'kpi', 'métrica', 'prazo',
    'risco', 'premissa', 'arquitetura', 'infraestrutura', 'usuário',
    'interface', 'api', 'banco', 'dados', 'segurança', 'performance',
    'mvp', 'entrega', 'sprint', 'backlog', 'épico', 'feature',
  ]

  const scored = sections.map((section, idx) => {
    const lower = section.toLowerCase()
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 10 : 0), 0)
      + (idx === 0 ? 20 : 0) + (idx < 3 ? 5 : 0) + Math.min(section.length / 100, 5)
    return { section, score, idx }
  }).sort((a, b) => b.score - a.score)

  const usedIndexes: number[] = []
  let totalLen = 0
  for (const item of scored) {
    if (totalLen + item.section.length > available) break
    usedIndexes.push(item.idx)
    totalLen += item.section.length
  }

  usedIndexes.sort((a, b) => a - b)
  return usedIndexes.map(idx => scored.find(s => s.idx === idx)!.section).join('\n\n').substring(0, available) + warning
}