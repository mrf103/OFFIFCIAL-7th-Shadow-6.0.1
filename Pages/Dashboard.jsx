import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Progress } from '@/Components/ui/progress'
import { Link } from 'react-router-dom'
import { apiClient } from '@/api'
import LoadingSpinner from '@/Components/LoadingSpinner'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  const statCards = [
    {
      title: 'إجمالي المخطوطات',
      value: stats?.totalManuscripts || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'قيد المعالجة',
      value: stats?.processing || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'منتهي',
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'يحتاج مراجعة',
      value: stats?.needsReview || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text="جاري التحميل..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في Shadow Seven - Agency in a Box</p>
        </div>
        <Link to="/upload">
          <Button>
            <BookOpen className="ml-2 h-4 w-4" />
            رفع مخطوط جديد
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.value > 0 && (
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 ml-1" />
                    +12% من الشهر الماضي
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Manuscripts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>المخطوطات الأخيرة</CardTitle>
            <CardDescription>آخر المخطوطات التي تم رفعها أو تحديثها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentManuscripts?.map((manuscript) => (
                <div
                  key={manuscript.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{manuscript.title}</h3>
                      <p className="text-sm text-muted-foreground">{manuscript.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        manuscript.status === 'completed'
                          ? 'success'
                          : manuscript.status === 'processing'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {manuscript.status === 'completed' && 'منتهي'}
                      {manuscript.status === 'processing' && 'قيد المعالجة'}
                      {manuscript.status === 'draft' && 'مسودة'}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/manuscripts/${manuscript.id}`}>عرض</Link>
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مخطوطات حتى الآن</p>
                  <Link to="/upload">
                    <Button variant="link" className="mt-2">
                      ابدأ برفع أول مخطوط
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processing Jobs */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>مهام المعالجة</CardTitle>
            <CardDescription>المهام الجارية حالياً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.processingJobs?.map((job) => (
                <div key={job.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{job.title}</span>
                    <span className="text-xs text-muted-foreground">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} />
                  <p className="text-xs text-muted-foreground">{job.currentStep}</p>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مهام قيد المعالجة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>الخدمات الأكثر استخداماً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/elite-editor">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <div className="p-3 rounded-lg bg-accent">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">المحرر النخبوي</div>
                  <div className="text-xs text-muted-foreground">تحرير احترافي بالذكاء الاصطناعي</div>
                </div>
              </Button>
            </Link>
            <Link to="/book-merger">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <div className="p-3 rounded-lg bg-accent">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">دمج الكتب</div>
                  <div className="text-xs text-muted-foreground">دمج عدة مخطوطات في كتاب واحد</div>
                </div>
              </Button>
            </Link>
            <Link to="/cover-designer">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <div className="p-3 rounded-lg bg-accent">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">تصميم الغلاف</div>
                  <div className="text-xs text-muted-foreground">إنشاء غلاف جذاب بالذكاء الاصطناعي</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
