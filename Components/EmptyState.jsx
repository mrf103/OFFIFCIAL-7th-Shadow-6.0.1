import { Button } from '@/Components/ui/button'

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  children 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-shadow-surface border border-shadow-primary/20">
          <Icon className="h-12 w-12 text-shadow-text/40" />
        </div>
      )}
      
      {title && (
        <h3 className="text-xl font-semibold text-shadow-text mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-shadow-text/60 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <Button onClick={action} className="cyber-button">
          {actionLabel}
        </Button>
      )}
      
      {children}
    </div>
  )
}
