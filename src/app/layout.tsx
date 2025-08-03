import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Peers - AI Code Analysis Platform',
  description: 'Plataforma inteligente para análise de código com IA multi-agentes',
  keywords: ['AI', 'Code Analysis', 'Automated Testing', 'Code Review', 'Development Tools'],
  authors: [{ name: 'Peers Technology Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
  robots: 'index, follow',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://peers.tech',
    title: 'Peers - AI Code Analysis Platform',
    description: 'Plataforma inteligente para análise de código com IA multi-agentes',
    siteName: 'Peers',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Peers - AI Code Analysis Platform',
    description: 'Plataforma inteligente para análise de código com IA multi-agentes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">
          {children}
        </div>
        
        {/* Script para detecção de tema */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </body>
    </html>
  )
}