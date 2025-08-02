// test-connection.js - SCRIPT PARA TESTAR CONECTIVIDADE

const BACKEND_URL = 'http://localhost:8000'

async function testBackend() {
  console.log('🧪 TESTANDO CONECTIVIDADE FRONTEND ↔ BACKEND')
  console.log('=' * 50)
  
  const tests = [
    {
      name: 'Health Check',
      url: '/health',
      method: 'GET'
    },
    {
      name: 'Start Analysis',
      url: '/start-analysis',
      method: 'POST',
      body: {
        repo_name: 'test/repo',
        analysis_type: 'design',
        branch_name: 'main'
      }
    }
  ]

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testando: ${test.name}`)
      console.log(`📡 ${test.method} ${BACKEND_URL}${test.url}`)
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (test.body) {
        options.body = JSON.stringify(test.body)
      }

      const response = await fetch(`${BACKEND_URL}${test.url}`, options)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ SUCESSO: ${response.status}`)
        console.log('📄 Resposta:', JSON.stringify(data, null, 2))
        
        // Se for start-analysis, testar status também
        if (test.name === 'Start Analysis' && data.job_id) {
          console.log(`\n🔍 Testando: Get Job Status`)
          console.log(`📡 GET ${BACKEND_URL}/status/${data.job_id}`)
          
          const statusResponse = await fetch(`${BACKEND_URL}/status/${data.job_id}`)
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            console.log(`✅ SUCESSO: ${statusResponse.status}`)
            console.log('📄 Status:', JSON.stringify(statusData, null, 2))
          } else {
            console.log(`❌ ERRO: ${statusResponse.status} ${statusResponse.statusText}`)
          }
        }
        
      } else {
        console.log(`❌ ERRO: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.log('📄 Erro:', errorText)
      }
      
    } catch (error) {
      console.log(`❌ ERRO DE CONEXÃO: ${error.message}`)
      
      if (error.message.includes('fetch')) {
        console.log('💡 DICA: Verifique se o backend está rodando em http://localhost:8000')
      }
    }
  }

  console.log('\n' + '=' * 50)
  console.log('✅ TESTE CONCLUÍDO')
  console.log('💡 Para iniciar o backend: python main.py')
  console.log('💡 Para iniciar o frontend: npm run dev')
}

// Executar apenas se chamado diretamente
if (typeof window === 'undefined') {
  testBackend()
}

// Exportar para usar no navegador
if (typeof window !== 'undefined') {
  window.testBackend = testBackend
}