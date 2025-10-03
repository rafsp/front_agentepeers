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
  CheckSquare
} from 'lucide-react'

interface GitHubFile {
  path: string
  type: 'file' | 'dir'
  size?: number
  children?: GitHubFile[]
}

interface GitHubFilePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: string[]) => void
  repository: string
  branch: string
}

export function GitHubFilePicker({ 
  isOpen, 
  onClose, 
  onSelect, 
  repository, 
  branch 
}: GitHubFilePickerProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Dados de exemplo para teste (substitua pela chamada real da API depois)
  const mockFiles: GitHubFile[] = [
    {
      path: 'src',
      type: 'dir',
      children: [
        { path: 'src/components/Header.tsx', type: 'file', size: 2048 },
        { path: 'src/components/Footer.tsx', type: 'file', size: 1024 },
        { path: 'src/pages/Home.tsx', type: 'file', size: 4096 }
      ]
    },
    {
      path: 'public',
      type: 'dir',
      children: [
        { path: 'public/index.html', type: 'file', size: 512 },
        { path: 'public/favicon.ico', type: 'file', size: 256 }
      ]
    },
    { path: 'package.json', type: 'file', size: 1024 },
    { path: 'README.md', type: 'file', size: 2048 }
  ]

  const toggleFileSelection = (path: string) => {
    setSelectedFiles(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const handleConfirm = () => {
    onSelect(selectedFiles)
    setSelectedFiles([])
    onClose()
  }

  // Se não estiver aberto, não renderiza nada
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

            {/* Lista de arquivos */}
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-1">
                {/* Arquivos mockados para teste */}
                {mockFiles.map(file => (
                  <div key={file.path}>
                    {file.type === 'dir' ? (
                      <div className="py-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FolderOpen className="h-4 w-4 text-yellow-600" />
                          <span>{file.path}/</span>
                        </div>
                        {file.children && (
                          <div className="ml-6 mt-1 space-y-1">
                            {file.children.map(child => (
                              <div
                                key={child.path}
                                onClick={() => toggleFileSelection(child.path)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                  selectedFiles.includes(child.path) ? 'bg-blue-50' : ''
                                }`}
                              >
                                {selectedFiles.includes(child.path) ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                                <FileCode className="h-4 w-4 text-blue-600" />
                                <span className="text-sm flex-1">
                                  {child.path.split('/').pop()}
                                </span>
                                {child.size && (
                                  <span className="text-xs text-gray-500">
                                    {(child.size / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => toggleFileSelection(file.path)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedFiles.includes(file.path) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {selectedFiles.includes(file.path) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                        <FileCode className="h-4 w-4 text-blue-600" />
                        <span className="text-sm flex-1">{file.path}</span>
                        {file.size && (
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
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