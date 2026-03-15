// src/lib/utils/file-extractor.ts
// Extrai texto de DOCX, PDF e TXT no browser
// Requer: npm i mammoth pdfjs-dist

export interface ExtractedFile {
  name: string
  size: number
  type: string
  text: string
  error?: string
}

/**
 * Extrai texto de um arquivo (DOCX, PDF ou TXT)
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFile> {
  const result: ExtractedFile = { name: file.name, size: file.size, type: file.type, text: '' }
  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  try {
    if (ext === 'txt' || file.type === 'text/plain') {
      result.text = await readAsText(file)
    } else if (ext === 'docx' || file.type.includes('wordprocessingml')) {
      result.text = await extractFromDocx(file)
    } else if (ext === 'pdf' || file.type === 'application/pdf') {
      result.text = await extractFromPdf(file)
    } else {
      result.error = `Formato não suportado: .${ext}`
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Erro na extração'
    console.error(`Erro extraindo ${file.name}:`, err)
  }

  return result
}

/**
 * Extrai texto de múltiplos arquivos e combina
 */
export async function extractTextFromFiles(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<{ combinedText: string; results: ExtractedFile[] }> {
  const results: ExtractedFile[] = []

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length, files[i].name)
    const extracted = await extractTextFromFile(files[i])
    results.push(extracted)
  }

  // Combinar todo o texto com separadores claros
  const parts = results
    .filter(r => r.text.trim().length > 0)
    .map(r => `=== DOCUMENTO: ${r.name} ===\n${r.text.trim()}`)

  const combinedText = parts.join('\n\n')

  return { combinedText, results }
}

/**
 * Monta o comentario_extra final combinando texto extraído + instruções do usuário
 */
export function buildCommentExtra(extractedText: string, userInstructions: string): string {
  const parts: string[] = []

  if (extractedText.trim()) {
    parts.push('[CONTEÚDO DOS DOCUMENTOS ANEXADOS]\n' + extractedText.trim())
  }

  if (userInstructions.trim()) {
    parts.push('[INSTRUÇÕES DO USUÁRIO]\n' + userInstructions.trim())
  }

  return parts.join('\n\n---\n\n')
}

// ── Extractors ────────────────────────────────────────────────────────────

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsText(file, 'utf-8')
  })
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

async function extractFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const buffer = await readAsArrayBuffer(file)
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value || ''
  } catch {
    // Fallback: try to read as text (some .docx have readable XML)
    console.warn('mammoth not available, trying raw read for', file.name)
    try {
      const text = await readAsText(file)
      // Strip XML tags if any
      return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    } catch {
      throw new Error('Instale mammoth: npm i mammoth')
    }
  }
}

async function extractFromPdf(file: File): Promise<string> {
  try {
    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist')

    // Set worker (use CDN for simplicity)
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }

    const buffer = await readAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const pages: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = content.items.map((item: any) => item.str || '').join(' ')
      if (text.trim()) pages.push(text.trim())
    }

    return pages.join('\n\n')
  } catch {
    console.warn('pdfjs-dist not available for', file.name)
    throw new Error('Instale pdfjs-dist: npm i pdfjs-dist')
  }
}