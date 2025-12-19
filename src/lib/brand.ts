// src/lib/brand.ts
// Constantes de marca PEERS - Centralizado para todo o projeto
// Baseado no PEERS Brandbook 2025

// ============================================================================
// CORES PRINCIPAIS
// ============================================================================

export const PEERS_BRAND = {
  // Cores Primárias (do Brandbook)
  primary: '#011334',      // PEERS Neue Blue - Azul escuro institucional
  secondary: '#E1FF00',    // PEERS Neue Lime - Verde limão vibrante
  accent: '#D8E8EE',       // Serene Blue - Azul claro suave
  white: '#FFFFFF',
  
  // Variações do Primary
  primaryLight: '#022558',
  primaryDark: '#000d24',
  
  // Variações do Secondary  
  secondaryLight: '#EEFF66',
  secondaryDark: '#C8E600',
  
  // Background padrão
  background: '#f8fafc',   // Slate 50
  surface: '#FFFFFF',
  
  // Texto
  textPrimary: '#0f172a',  // Slate 900
  textSecondary: '#64748b', // Slate 500
  textMuted: '#94a3b8',    // Slate 400
  
  // Bordas
  border: '#e2e8f0',       // Slate 200
  borderLight: '#f1f5f9',  // Slate 100
  
  // Status
  success: '#10b981',      // Emerald 500
  successLight: '#d1fae5', // Emerald 100
  warning: '#f59e0b',      // Amber 500
  warningLight: '#fef3c7', // Amber 100
  error: '#ef4444',        // Red 500
  errorLight: '#fee2e2',   // Red 100
  info: '#6366f1',         // Indigo 500
  infoLight: '#e0e7ff',    // Indigo 100
} as const

// ============================================================================
// GRADIENTES
// ============================================================================

export const PEERS_GRADIENTS = {
  primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
  secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
  mixed: 'linear-gradient(135deg, #011334 0%, #022558 50%, #033670 100%)',
  subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)',
  accent: 'linear-gradient(135deg, #D8E8EE 0%, #b8d4e3 100%)',
  
  // Para headers
  header: 'linear-gradient(to right, #011334, #022558)',
  
  // Para progress bars (escala de progresso baseada em azul PEERS)
  progress: 'linear-gradient(to right, hsl(219, 100%, 95%), #011334)',
} as const

// ============================================================================
// SOMBRAS
// ============================================================================

export const PEERS_SHADOWS = {
  sm: '0 1px 2px 0 rgba(1, 19, 52, 0.05)',
  md: '0 4px 6px -1px rgba(1, 19, 52, 0.1), 0 2px 4px -1px rgba(1, 19, 52, 0.06)',
  lg: '0 10px 15px -3px rgba(1, 19, 52, 0.1), 0 4px 6px -2px rgba(1, 19, 52, 0.05)',
  xl: '0 20px 25px -5px rgba(1, 19, 52, 0.1), 0 10px 10px -5px rgba(1, 19, 52, 0.04)',
  
  // Sombra com cor primária (para hover states)
  primaryGlow: '0 0 20px rgba(1, 19, 52, 0.3)',
  
  // Sombra com cor secondary (para CTAs)
  secondaryGlow: '0 0 20px rgba(225, 255, 0, 0.4)',
} as const

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const PEERS_TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  
  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Font sizes
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

// ============================================================================
// ESPAÇAMENTO
// ============================================================================

export const PEERS_SPACING = {
  page: {
    maxWidth: '98%',
    paddingX: '1.5rem',  // 24px
    paddingY: '2rem',    // 32px
  },
  
  card: {
    padding: '1.5rem',   // 24px
    gap: '1.5rem',       // 24px
  },
  
  header: {
    height: '5rem',      // 80px
  },
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const PEERS_RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',
} as const

// ============================================================================
// TRANSIÇÕES
// ============================================================================

export const PEERS_TRANSITIONS = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
} as const

// ============================================================================
// ASSETS
// ============================================================================

export const PEERS_ASSETS = {
  logo: 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg',
  logoFallback: {
    text: 'PEERS',
    subtext: 'Consulting + Technology',
  },
} as const

// ============================================================================
// CLASSES CSS UTILITÁRIAS (para uso com Tailwind)
// ============================================================================

export const PEERS_CLASSES = {
  // Backgrounds
  bgPrimary: 'bg-[#011334]',
  bgSecondary: 'bg-[#E1FF00]',
  bgAccent: 'bg-[#D8E8EE]',
  
  // Textos
  textPrimary: 'text-[#011334]',
  textSecondary: 'text-[#E1FF00]',
  
  // Bordas
  borderPrimary: 'border-[#011334]',
  borderSecondary: 'border-[#E1FF00]',
  
  // Hover states
  hoverPrimary: 'hover:bg-[#022558]',
  hoverSecondary: 'hover:bg-[#C8E600]',
} as const

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  brand: PEERS_BRAND,
  gradients: PEERS_GRADIENTS,
  shadows: PEERS_SHADOWS,
  typography: PEERS_TYPOGRAPHY,
  spacing: PEERS_SPACING,
  radius: PEERS_RADIUS,
  transitions: PEERS_TRANSITIONS,
  assets: PEERS_ASSETS,
  classes: PEERS_CLASSES,
}