import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        gray: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

// Status-specific badge components
interface StatusBadgeProps {
  status: string
  className?: string
}

export function JobStatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
      case 'rejected':
        return 'destructive'
      case 'pending_approval':
        return 'warning'
      case 'running':
      case 'refactoring_code':
      case 'grouping_commits':
      case 'writing_unit_tests':
      case 'grouping_tests':
      case 'populating_data':
      case 'committing_to_github':
        return 'info'
      default:
        return 'gray'
    }
  }

  const getLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      pending_approval: 'Aguardando',
      approved: 'Aprovado',
      running: 'Executando',
      refactoring_code: 'Refatorando',
      grouping_commits: 'Agrupando',
      writing_unit_tests: 'Testando',
      grouping_tests: 'Organizando',
      populating_data: 'Preparando',
      committing_to_github: 'Enviando',
      completed: 'Concluído',
      failed: 'Falhou',
      rejected: 'Rejeitado',
    }
    return labels[status] || status
  }

  return (
    <Badge variant={getVariant(status)} className={className}>
      {getLabel(status)}
    </Badge>
  )
}

export function ConnectionBadge({ connected, className }: { connected: boolean; className?: string }) {
  return (
    <Badge 
      variant={connected ? 'success' : 'gray'} 
      className={className}
    >
      {connected ? 'Conectado' : 'Desconectado'}
    </Badge>
  )
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null
  
  return (
    <Badge 
      variant={count > 0 ? 'destructive' : 'gray'} 
      size="sm"
      className={cn('ml-auto', className)}
    >
      {count}
    </Badge>
  )
}

export { Badge, badgeVariants }