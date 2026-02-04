import { cn } from '@/lib/utils'

export default function StatCard({ icon, label, value, color = 'default' }) {
  const colorClasses = {
    default: 'text-shadow-accent bg-shadow-accent/10',
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10',
  }

  return (
    <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-shadow-text/60">{label}</p>
          <p className="text-2xl font-bold text-shadow-text">{value}</p>
        </div>
      </div>
    </div>
  )
}
