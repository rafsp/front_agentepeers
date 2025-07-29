import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  acceptedTypes?: string
  maxSize?: number
  multiple?: boolean
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedTypes = '.pdf,.doc,.docx,.txt,.md',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  className
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize,
    multiple
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      <Card 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
      >
        <CardContent className="p-6 text-center">
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, DOC, DOCX, TXT, MD (máx. 10MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Arquivos selecionados:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}