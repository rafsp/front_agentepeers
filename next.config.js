/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'appDir' - não é mais necessário no Next.js 13.4+
  experimental: {
    // Outras configurações experimentais podem ir aqui se necessário
  },
  // Configurações para desenvolvimento
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações para imagens (se necessário)
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      // Adicione outros domínios conforme necessário
    ],
  },
  
  // Configurações para CORS durante desenvolvimento
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig