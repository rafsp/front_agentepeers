// src/lib/azure-direct.ts
export async function fetchAzureProjects(sasToken: string) {
  const storageAccount = 'reportsagentpeers'
  const containerName = 'reports'
  
  // URL com SAS token
  const baseUrl = `https://${storageAccount}.blob.core.windows.net/${containerName}`
  const url = `${baseUrl}?restype=container&comp=list&${sasToken.replace('?', '')}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-ms-version': '2020-04-08',
        'Accept': 'application/xml'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')
    
    const blobs = xml.getElementsByTagName('Blob')
    const projects = []
    
    for (let i = 0; i < blobs.length; i++) {
      const nameElement = blobs[i].getElementsByTagName('Name')[0]
      if (nameElement) {
        const name = nameElement.textContent || ''
        // Filtra apenas pastas (sem extensão)
        if (!name.includes('.')) {
          projects.push({
            id: name,
            name: name.replace(/_/g, ' ').replace(/-/g, ' '),
            source: 'azure'
          })
        }
      }
    }
    
    return projects
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    throw error
  }
}