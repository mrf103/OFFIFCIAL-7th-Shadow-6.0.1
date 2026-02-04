export default function PageContainer({ children, centered = false, className = '' }) {
  const baseClass = centered 
    ? 'min-h-screen bg-shadow-bg flex items-center justify-center'
    : 'min-h-screen bg-shadow-bg'
  
  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}

export function PageContent({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-4xl font-bold text-shadow-text cyber-text">
          {title}
        </h1>
        {subtitle && (
          <p className="text-shadow-text/60 mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {action || children}
    </div>
  )
}
