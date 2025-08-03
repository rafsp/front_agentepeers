import React from 'react'
import { Code } from 'lucide-react'

interface PeersLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function PeersLogo({ size = 'md', showText = true, className = '' }: PeersLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  const logoSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
        alt="Peers IA Logo" 
        className={`${logoSize} object-contain`}
        onError={(e) => {
          // Fallback para o ícone padrão se a imagem não carregar
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
          const fallbackDiv = target.nextElementSibling as HTMLElement
          if (fallbackDiv) {
            fallbackDiv.classList.remove('hidden')
            fallbackDiv.classList.add('flex')
          }
        }}
      />
      <div className={`${logoSize} bg-blue-600 rounded-lg items-center justify-center hidden`}>
        <Code className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'} text-white`} />
      </div>
      {showText && (
        <div>
          <h1 className={`font-bold ${textSize} text-gray-800`}>Peers IA</h1>
          <p className="text-xs text-gray-500">AI Code Analysis</p>
        </div>
      )}
    </div>
  )
}

// Hook para usar o logo em qualquer lugar
export function usePeersLogo() {
  return {
    logoUrl: 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg',
    companyName: 'Peers IA',
    tagline: 'AI Code Analysis'
  }
}