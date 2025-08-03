// src/lib/brand-system.ts - Sistema de Brand da Empresa

// 🎨 Paleta de Cores da Empresa Peers
export const BRAND_COLORS = {
  // Cores Primárias
  primary: {
    50: '#eff6ff',   // Azul muito claro
    100: '#dbeafe',  // Azul claro
    200: '#bfdbfe',  // Azul claro médio
    300: '#93c5fd',  // Azul médio
    400: '#60a5fa',  // Azul médio escuro
    500: '#3b82f6',  // Azul principal (Primary)
    600: '#2563eb',  // Azul escuro
    700: '#1d4ed8',  // Azul escuro médio
    800: '#1e40af',  // Azul escuro forte
    900: '#1e3a8a',  // Azul muito escuro
    950: '#172554'   // Azul ultra escuro
  },

  // Cores Secundárias - Roxo/Violeta para contraste
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Roxo principal
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },

  // Tons de Cinza para UI
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },

  // Cores de Status
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },

  // Cores especiais para gradientes
  gradient: {
    from: '#3b82f6',      // primary-500
    via: '#8b5cf6',       // violet-500
    to: '#a855f7'         // secondary-500
  }
} as const

// 🖼️ Gradientes da Marca
export const BRAND_GRADIENTS = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
  secondary: 'bg-gradient-to-r from-purple-500 to-purple-600',
  hero: 'bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600',
  card: 'bg-gradient-to-br from-blue-50 to-purple-50',
  dark: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  subtle: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
} as const

// 📏 Espaçamentos e Tamanhos
export const BRAND_SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem'     // 128px
} as const

// 🔤 Tipografia da Marca
export const BRAND_TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }]
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
} as const

// 🌗 Temas da Aplicação
export const BRAND_THEMES = {
  light: {
    background: BRAND_COLORS.gray[50],
    foreground: BRAND_COLORS.gray[900],
    card: '#ffffff',
    cardForeground: BRAND_COLORS.gray[900],
    popover: '#ffffff',
    popoverForeground: BRAND_COLORS.gray[900],
    primary: BRAND_COLORS.primary[500],
    primaryForeground: '#ffffff',
    secondary: BRAND_COLORS.gray[100],
    secondaryForeground: BRAND_COLORS.gray[900],
    muted: BRAND_COLORS.gray[100],
    mutedForeground: BRAND_COLORS.gray[500],
    accent: BRAND_COLORS.primary[100],
    accentForeground: BRAND_COLORS.primary[700],
    destructive: BRAND_COLORS.error[500],
    destructiveForeground: '#ffffff',
    border: BRAND_COLORS.gray[200],
    input: BRAND_COLORS.gray[200],
    ring: BRAND_COLORS.primary[500]
  },
  dark: {
    background: BRAND_COLORS.gray[950],
    foreground: BRAND_COLORS.gray[50],
    card: BRAND_COLORS.gray[900],
    cardForeground: BRAND_COLORS.gray[50],
    popover: BRAND_COLORS.gray[900],
    popoverForeground: BRAND_COLORS.gray[50],
    primary: BRAND_COLORS.primary[500],
    primaryForeground: '#ffffff',
    secondary: BRAND_COLORS.gray[800],
    secondaryForeground: BRAND_COLORS.gray[50],
    muted: BRAND_COLORS.gray[800],
    mutedForeground: BRAND_COLORS.gray[400],
    accent: BRAND_COLORS.primary[900],
    accentForeground: BRAND_COLORS.primary[100],
    destructive: BRAND_COLORS.error[500],
    destructiveForeground: '#ffffff',
    border: BRAND_COLORS.gray[800],
    input: BRAND_COLORS.gray[800],
    ring: BRAND_COLORS.primary[400]
  }
} as const

// 🎭 Animações e Transições
export const BRAND_ANIMATIONS = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  },
  spring: {
    fast: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    normal: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: 'cubic-bezier(0.23, 1, 0.32, 1)'
  }
} as const

// 📦 Utilitários para usar as cores
export const brandUtils = {
  // Obter cor por nome e intensidade
  getColor: (colorName: keyof typeof BRAND_COLORS, intensity: number = 500) => {
    const colorGroup = BRAND_COLORS[colorName]
    if (typeof colorGroup === 'object') {
      return colorGroup[intensity as keyof typeof colorGroup] || colorGroup[500]
    }
    return colorGroup
  },

  // Gerar classes CSS dinâmicas
  getPrimaryClass: (type: 'bg' | 'text' | 'border' = 'bg', intensity: number = 500) => {
    return `${type}-blue-${intensity}`
  },

  getSecondaryClass: (type: 'bg' | 'text' | 'border' = 'bg', intensity: number = 500) => {
    return `${type}-purple-${intensity}`
  },

  // Classes de gradiente
  getGradientClass: (gradientName: keyof typeof BRAND_GRADIENTS) => {
    return BRAND_GRADIENTS[gradientName]
  },

  // Gerar sombras com cores da marca
  getShadow: (color: 'primary' | 'secondary' = 'primary', intensity: 'sm' | 'md' | 'lg' = 'md') => {
    const shadows = {
      primary: {
        sm: 'shadow-sm shadow-blue-500/25',
        md: 'shadow-md shadow-blue-500/25',
        lg: 'shadow-lg shadow-blue-500/25'
      },
      secondary: {
        sm: 'shadow-sm shadow-purple-500/25',
        md: 'shadow-md shadow-purple-500/25',
        lg: 'shadow-lg shadow-purple-500/25'
      }
    }
    return shadows[color][intensity]
  }
}

// 🏢 Configurações específicas da empresa
export const COMPANY_BRAND = {
  name: 'Peers',
  tagline: 'AI Code Analysis Platform',
  description: 'Plataforma inteligente para análise de código com IA multi-agentes',
  
  // URLs e Links
  website: 'https://peers.tech',
  github: 'https://github.com/peers-tech',
  linkedin: 'https://linkedin.com/company/peers-tech',
  
  // Configurações visuais
  logo: {
    width: 120,
    height: 40
  },
  
  // Meta dados
  meta: {
    keywords: ['AI', 'Code Analysis', 'Automated Testing', 'Code Review', 'Development Tools'],
    author: 'Peers Technology Team'
  }
} as const

// 🎨 Componentes visuais pré-definidos
export const BRAND_COMPONENTS = {
  // Botões
  button: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200',
    secondary: 'bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200',
    ghost: 'text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200'
  },
  
  // Cards
  card: {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg shadow-blue-500/10',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg'
  },
  
  // Badges
  badge: {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border border-purple-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200'
  }
} as const

export default {
  BRAND_COLORS,
  BRAND_GRADIENTS,
  BRAND_SPACING,
  BRAND_TYPOGRAPHY,
  BRAND_THEMES,
  BRAND_ANIMATIONS,
  COMPANY_BRAND,
  BRAND_COMPONENTS,
  brandUtils
}