// src/lib/api/code-generation-service.ts

export interface CodeGenerationFromReportRequest {
  analysis_name: string
}

export interface CodeGenerationFromReportResponse {
  job_id: string
  message?: string
  status?: string
}

export class CodeGenerationAPI {
  private apiUrl: string
  
  constructor() {
    this.apiUrl = 'https://poc-agent-revisor-teste-c8c2cucda0hcdxbj.centralus-01.azurewebsites.net'
  }

  // Novo método para gerar código a partir do relatório
  async startCodeGenerationFromReport(analysisName: string): Promise<CodeGenerationFromReportResponse> {
    const url = `${this.apiUrl}/start-code-generation-from-report/${analysisName}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao gerar código:', error)
      throw error
    }
  }
}

export const codeGenerationAPI = new CodeGenerationAPI()