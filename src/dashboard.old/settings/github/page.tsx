'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Github, ExternalLink, RefreshCw, Check, X, Key } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { githubService, GitHubRepository, GitHubUser } from '@/lib/services/github-service'
import { useToast } from '@/components/ui/use-toast'

export default function GitHubSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { githubToken, setGithubToken } = useAuth()
  
  const [tokenInput, setTokenInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)

  useEffect(() => {
    if (githubToken) {
      setTokenInput(githubToken)
      validateAndLoadData(githubToken)
    }
  }, [githubToken])

  const validateAndLoadData = async (token: string) => {
    setIsValidating(true)
    try {
      const isValid = await githubService.validateToken(token)
      setIsTokenValid(isValid)
      
      if (isValid) {
        const [user, repos] = await Promise.all([
          githubService.getUser(token),
          githubService.getUserRepositories(token)
        ])
        setGithubUser(user)
        setRepositories(repos)
      }
    } catch (error) {
      setIsTokenValid(false)
      toast({
        title: 'Erro ao validar token',
        description: 'Verifique se o token está correto e possui as permissões necessárias.',
        variant: 'destructive'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast({
        title: 'Token obrigatório',
        description: 'Por favor, insira um token do GitHub.',
        variant: 'destructive'
      })
      return
    }

    await validateAndLoadData(tokenInput)
    
    if (isTokenValid) {
      setGithubToken(tokenInput)
      toast({
        title: 'Token salvo',
        description: 'Token do GitHub salvo com sucesso!',
      })
    }
  }

  const handleRemoveToken = () => {
    setGithubToken('')
    setTokenInput('')
    setIsTokenValid(null)
    setGithubUser(null)
    setRepositories([])
    localStorage.removeItem('github_token')
    
    toast({
      title: 'Token removido',
      description: 'Token do GitHub foi removido.',
    })
  }

  const handleRefreshRepos = async () => {
    if (!githubToken) return
    
    setIsLoadingRepos(true)
    try {
      const repos = await githubService.getUserRepositories(githubToken)
      setRepositories(repos)
      toast({
        title: 'Repositórios atualizados',
        description: `${repos.length} repositórios encontrados.`,
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar repositórios',
        description: 'Não foi possível atualizar a lista de repositórios.',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const getTokenInstructions = () => (
    <div className="text-sm text-muted-foreground space-y-2">
      <p><strong>Como obter um token do GitHub:</strong></p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Acesse <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Settings → Personal Access Tokens</a></li>
        <li>Clique em "Generate new token (classic)"</li>
        <li>Selecione as permissões: <code>repo</code>, <code>user:email</code></li>
        <li>Defina um prazo de expiração</li>
        <li>Copie o token gerado e cole aqui</li>
      </ol>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Configurações
          </Button>
          
          <div className="flex items-center gap-2 mb-4">
            <Github className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Configuração do GitHub</h1>
          </div>
          <p className="text-muted-foreground">
            Configure sua integração com o GitHub para acessar repositórios
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Token Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Token de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveToken}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Validando
                    </>
                  ) : (
                    'Salvar Token'
                  )}
                </Button>
                {githubToken && (
                  <Button 
                    variant="outline"
                    onClick={handleRemoveToken}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>

              {/* Token Status */}
              {isTokenValid !== null && (
                <div className="flex items-center gap-2">
                  {isTokenValid ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Token válido</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Token inválido</span>
                    </>
                  )}
                </div>
              )}

              {getTokenInstructions()}
            </CardContent>
          </Card>

          {/* GitHub User Info */}
          {githubUser && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img 
                    src={githubUser.avatar_url} 
                    alt={githubUser.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{githubUser.name}</h3>
                    <p className="text-muted-foreground">@{githubUser.login}</p>
                    <p className="text-sm text-muted-foreground">{githubUser.email}</p>
                    <a 
                      href={githubUser.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver perfil no GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repositories */}
          {repositories.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Repositórios Disponíveis ({repositories.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshRepos}
                  disabled={isLoadingRepos}
                >
                  {isLoadingRepos ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Atualizando
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {repositories.map((repo) => (
                    <div 
                      key={repo.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{repo.name}</h4>
                          {repo.private && (
                            <Badge variant="secondary" className="text-xs">
                              Privado
                            </Badge>
                          )}
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {repo.description || 'Sem descrição'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Atualizado: {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/new-analysis?repo=${repo.full_name}`)}
                        >
                          Analisar
                        </Button>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}