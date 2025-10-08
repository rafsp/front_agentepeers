import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FolderOpen, 
  FileCode, 
  ChevronRight, 
  ChevronDown,
  Search,
  GitBranch,
  Check,
  X,
  Square,
  CheckSquare,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface GitHubFile {
  path: string
  type: 'file' | 'dir'
  size?: number
  sha?: string
  url?: string
}

interface GitHubFilePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: string[]) => void
  repository: string
  branch: string
  type?: string  // ADICIONAR
}

export function GitHubFilePicker({ 
  isOpen, 
  onClose, 
  onSelect, 
  repository,
  branch,
  type 
}: GitHubFilePickerProps) {
  const [files, setFiles] = useState<GitHubFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [folderContents, setFolderContents] = useState<Record<string, GitHubFile[]>>({})

  // Buscar estrutura de arquivos do GitHub
  useEffect(() => {
    if (isOpen && repository && branch) {
      if(type === 'azure')
      {

          fetchAzureFiles();
      }
      else
      {
        fetchGitHubFiles()
      }
    }
  }, [isOpen, repository, branch])

  const fetchGitHubFiles = async (path: string = '') => {
    if (!repository || repository === 'custom') return
    
    setLoading(true)
    setError(null)
    
    try {
      // Parse do repositório (pode ser owner/repo ou URL completa)
      let owner, repo
      if (repository.includes('github.com')) {
        const match = repository.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (match) {
          owner = match[1]
          repo = match[2]
        }
      } else if (repository.includes('/')) {
        [owner, repo] = repository.split('/')
      } else {
        throw new Error('Formato de repositório inválido')
      }

      // URL da API do GitHub
      const apiUrl = path 
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
        : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Se você tiver um token do GitHub, adicione aqui:
          // 'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repositório ou branch não encontrado')
        } else if (response.status === 403) {
          throw new Error('Limite de requisições da API excedido. Tente novamente mais tarde.')
        }
        throw new Error(`Erro ao buscar arquivos: ${response.status}`)
      }

      const data = await response.json()
      
      if (path) {
        // Se estamos buscando conteúdo de uma pasta específica
        setFolderContents(prev => ({
          ...prev,
          [path]: data.map((item: any) => ({
            path: item.path,
            type: item.type === 'dir' ? 'dir' : 'file',
            size: item.size,
            sha: item.sha,
            url: item.download_url
          }))
        }))
      } else {
        // Arquivos da raiz
        const formattedFiles = data.map((item: any) => ({
          path: item.path,
          type: item.type === 'dir' ? 'dir' : 'file',
          size: item.size,
          sha: item.sha,
          url: item.download_url
        }))
        setFiles(formattedFiles)
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const AZURE_PAT = 'BT3PJ864DfM50NQsV9AfP2s5rlN1vXd1jmpiMey5SocpLNsHICGyJQQJ99BJACAAAAAyS9tVAAASAZDO20q4' // SUBSTITUA PELO SEU TOKEN


  // Dentro do componente, adicionar função para buscar arquivos do Azure
const fetchAzureFiles = async (path: string = '') => {
  try {
    const parts = repository.split('/')
    if (parts.length < 3) {
      console.error('Formato inválido do repositório Azure:', repository)
      return []
    }
    
    const organization = parts[0]
    const project = encodeURIComponent(parts[1])
    const repoName = encodeURIComponent(parts[2])
    
    const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repoName}/items?recursionLevel=Full&versionDescriptor.version=${branch}&api-version=6.0`
    
    console.log('Buscando arquivos Azure de:', url)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`:${AZURE_PAT}`)}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Erro na resposta do Azure:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log('Dados recebidos do Azure:', data)
    
    if (!data.value) {
      console.error('Resposta do Azure não contém "value"')
      return []
    }


    
    // Formatar os arquivos no mesmo formato que o GitHub
    const formattedFiles = data.value
      .filter((item: any) => !item.isFolder)
      .map((item: any) => ({
        path: item.path.startsWith('/') ? item.path.substring(1) : item.path,
        type: 'file',  // Importante: deve ser 'file' não 'dir'
        size: item.size || 0,
        sha: item.objectId,
        url: item.url,
        name: item.path.split('/').pop()
      }))
    
    console.log(`Formatados ${formattedFiles.length} arquivos do Azure`)
    
    // IMPORTANTE: Retornar os arquivos formatados
    setFiles(formattedFiles)  // Setar diretamente aqui
    return formattedFiles
    
  } catch (error) {
    console.error('Erro ao buscar arquivos do Azure Repos:', error)
    return []
  }
}

  // Alternar seleção de arquivo
  const toggleFileSelection = (path: string) => {
    setSelectedFiles(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  // Expandir/colapsar pasta
  const toggleFolder = async (path: string) => {
    if (expandedFolders.has(path)) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev)
        newSet.delete(path)
        return newSet
      })
    } else {
        setExpandedFolders(prev => {
            const newSet = new Set(prev)
            newSet.add(path)
            return newSet
            })
      
      // Se ainda não temos o conteúdo desta pasta, buscar
      if (!folderContents[path]) {
        await fetchGitHubFiles(path)
      }
    }
  }

  // Filtrar arquivos baseado na busca
  const filterFiles = (items: GitHubFile[]): GitHubFile[] => {
    if (!searchQuery) return items
    
    return items.filter(item => 
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Renderizar item da árvore
  const renderTreeItem = (item: GitHubFile, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.path)
    const isSelected = selectedFiles.includes(item.path)
    
    return (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            if (item.type === 'dir') {
              toggleFolder(item.path)
            } else {
              toggleFileSelection(item.path)
            }
          }}
        >
          {item.type === 'dir' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FolderOpen className="h-4 w-4 text-yellow-600" />
            </>
          ) : (
            <>
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
              <FileCode className="h-4 w-4 text-blue-600" />
            </>
          )}
          
          <span className="text-sm flex-1">{item.path.split('/').pop()}</span>
          
          {item.type === 'file' && item.size && (
            <span className="text-xs text-gray-500">
              {(item.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
        
        {/* Renderizar subpastas se expandido */}
        {item.type === 'dir' && isExpanded && folderContents[item.path] && (
          <div>
            {filterFiles(folderContents[item.path]).map(child => 
              renderTreeItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const handleConfirm = () => {
    onSelect(selectedFiles)
    setSelectedFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl p-4">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Selecionar Arquivos do Repositório
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Info do repositório */}
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-mono">{repository}</span>
              <span className="mx-2">/</span>
              <span className="font-mono">{branch}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contador de selecionados */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </p>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Lista de arquivos */}
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Carregando arquivos...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Não foi possível carregar os arquivos.
                    <br />
                    Verifique o repositório e a branch.
                  </p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Nenhum arquivo encontrado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filterFiles(files).map(file => renderTreeItem(file))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Adicionar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}