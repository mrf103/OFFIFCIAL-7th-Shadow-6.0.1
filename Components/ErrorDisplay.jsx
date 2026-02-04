import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/Components/ui/button'

export default function ErrorDisplay({ 
  title = 'حدث خطأ',
  message = 'عذراً، حدث خطأ أثناء تحميل البيانات',
  onRetry,
  showRetry = true
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-red-500/10 border border-red-500/20">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-shadow-text mb-2">
        {title}
      </h3>
      
      <p className="text-shadow-text/60 max-w-md mb-6">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  )
}
