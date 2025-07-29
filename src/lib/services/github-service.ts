// src/lib/services/github-service.ts

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  default_branch: string
  language: string | null
  updated_at: string
  html_url: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubUser {
  login: string
  name: string
  email: string
  avatar_url: string
  html_url: string
}

class GitHubService {
  private baseUrl = 'https://api.github.com'
  
  private async makeRequest<T>(endpoint: string, token: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async getUser(token: string): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>('/user', token)
  }

  async getUserRepositories(token: string, page = 1, perPage = 50): Promise<GitHubRepository[]> {
    return this.makeRequest<GitHubRepository[]>(
      `/user/repos?page=${page}&per_page=${perPage}&sort=updated&type=all`,
      token
    )
  }

  async getRepositoryBranches(token: string, owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.makeRequest<GitHubBranch[]>(
      `/repos/${owner}/${repo}/branches`,
      token
    )
  }

  async getOrganizationRepositories(token: string, org: string, page = 1, perPage = 50): Promise<GitHubRepository[]> {
    return this.makeRequest<GitHubRepository[]>(
      `/orgs/${org}/repos?page=${page}&per_page=${perPage}&sort=updated`,
      token
    )
  }

  // Método para validar se o token é válido
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.getUser(token)
      return true
    } catch {
      return false
    }
  }

  // URL para OAuth do GitHub
  getAuthUrl(clientId: string, scopes = ['repo', 'user:email'], state?: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      scope: scopes.join(' '),
      redirect_uri: `${window.location.origin}/auth/github/callback`
    })
    
    if (state) {
      params.append('state', state)
    }
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }
}

export const githubService = new GitHubService()