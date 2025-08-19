// src/lib/api/analysis-service.ts

export interface StartAnalysisRequest {
  repo_name: string;
  analysis_type: 'design' | 'relatorio_teste_unitario' | 'security' | 'performance';
  branch_name?: string;
  instrucoes_extras?: string;
}

export interface StartAnalysisResponse {
  job_id: string;
  report: string;
}

export interface UpdateJobRequest {
  job_id: string;
  action: 'approve' | 'reject';
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending_approval' | 'workflow_started' | 'refactoring_code' | 'grouping_commits' | 'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github' | 'completed' | 'failed' | 'rejected';
  error_details?: string;
}

class AnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net';
  }

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/start-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao iniciar análise');
    }

    return response.json();
  }

  async updateJobStatus(request: UpdateJobRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/update-job-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao atualizar status do job');
    }

    return response.json();
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status/${jobId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao obter status do job');
    }

    return response.json();
  }

  // Método para polling de status
  async pollJobStatus(jobId: string, onUpdate: (status: JobStatusResponse) => void): Promise<void> {
    const poll = async () => {
      try {
        const status = await this.getJobStatus(jobId);
        onUpdate(status);

        // Continue polling se o job ainda estiver em progresso
        if (!['completed', 'failed', 'rejected'].includes(status.status)) {
          setTimeout(poll, 2000); // Poll a cada 2 segundos
        }
      } catch (error) {
        console.error('Erro ao fazer polling do status:', error);
        // Retry em caso de erro
        setTimeout(poll, 5000);
      }
    };

    poll();
  }
}

export const analysisService = new AnalysisService();