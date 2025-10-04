import { BlobServiceClient } from '@azure/storage-blob'

// Configurações do Azure Storage
const STORAGE_ACCOUNT = 'reportsagentpeers'
const CONTAINER_NAME = 'reports'

// Use SAS token para acesso público ou configure com chave
const SAS_TOKEN = process.env.NEXT_PUBLIC_AZURE_SAS_TOKEN || ''
const CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING

export interface AzureProject {
  id: string
  name: string
  path: string
  lastModified: Date
  size: number
  metadata?: any
}

class AzureBlobService {
  private blobServiceClient: BlobServiceClient

  constructor() {
    // Inicializar cliente do Azure
    if (CONNECTION_STRING) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING)
    } else {
      // Usar URL pública com SAS token
      const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net${SAS_TOKEN}`
      this.blobServiceClient = new BlobServiceClient(blobUrl)
    }
  }

  async listProjects(): Promise<AzureProject[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(CONTAINER_NAME)
      const projects: AzureProject[] = []
      
      // Listar todos os blobs no container
      for await (const blob of containerClient.listBlobsFlat()) {
        // Considerar apenas diretórios/pastas como projetos
        // Ou filtrar por padrão específico
        if (blob.name && !blob.name.includes('.')) {
          projects.push({
            id: blob.name,
            name: blob.name.replace(/_/g, ' ').replace(/-/g, ' '),
            path: blob.name,
            lastModified: blob.properties.lastModified || new Date(),
            size: blob.properties.contentLength || 0,
            metadata: blob.metadata
          })
        }
      }
      
      return projects
    } catch (error) {
      console.error('Erro ao listar projetos do Azure:', error)
      return []
    }
  }

  async getProjectDetails(projectPath: string): Promise<any> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(CONTAINER_NAME)
      const blobClient = containerClient.getBlobClient(projectPath)
      
      const properties = await blobClient.getProperties()
      
      return {
        path: projectPath,
        metadata: properties.metadata,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        size: properties.contentLength
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do projeto:', error)
      return null
    }
  }

  async downloadProject(projectPath: string): Promise<string | null> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(CONTAINER_NAME)
      const blobClient = containerClient.getBlobClient(projectPath)
      
      const downloadResponse = await blobClient.download()
      const downloaded = await this.streamToString(downloadResponse.readableStreamBody!)
      
      return downloaded
    } catch (error) {
      console.error('Erro ao baixar projeto:', error)
      return null
    }
  }

  private async streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = []
      readableStream.on('data', (data) => {
        chunks.push(data.toString())
      })
      readableStream.on('end', () => {
        resolve(chunks.join(''))
      })
      readableStream.on('error', reject)
    })
  }
}

export const azureBlobService = new AzureBlobService()