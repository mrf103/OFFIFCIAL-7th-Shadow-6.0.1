import { cn } from '@/lib/utils'

export default function Card({ children, className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-shadow-surface border-shadow-primary/20',
    glass: 'bg-shadow-surface/50 backdrop-blur-sm border-shadow-primary/30',
    solid: 'bg-shadow-card border-shadow-border',
  }

  return (
    <div 
      className={cn(
        'cyber-card rounded-lg border p-6 transition-all hover:shadow-glow',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-xl font-bold text-shadow-text', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-shadow-border', className)} {...props}>
      {children}
    </div>
  )
}
