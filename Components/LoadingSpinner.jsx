export default function LoadingSpinner({ size = 'md', text = 'جاري التحميل...' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-shadow-accent border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-shadow-text/60">{text}</p>}
    </div>
  )
}
