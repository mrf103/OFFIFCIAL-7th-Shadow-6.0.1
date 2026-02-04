import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/Components/Layout'
import ErrorBoundary from '@/Components/ErrorBoundary'
import ToastProvider from '@/Components/ToastProvider'
import CollaborationProvider from '@/contexts/CollaborationContext'

// Lazy loading للصفحات الثقيلة
const Dashboard = lazy(() => import('@/Pages/Dashboard'))
const ExportPage = lazy(() => import('@/Pages/ExportPage'))
const UploadPage = lazy(() => import('@/Pages/UploadPage'))
const ManuscriptsPage = lazy(() => import('@/Pages/ManuscriptsPage'))
const EliteEditorPage = lazy(() => import('@/Pages/EliteEditorPage'))
const BookMergerPage = lazy(() => import('@/Pages/BookMergerPage'))
const CoverDesignerPage = lazy(() => import('@/Pages/CoverDesignerPage'))
const SettingsPage = lazy(() => import('@/Pages/SettingsPage'))
const AnalyticsDashboardPage = lazy(() => import('@/Pages/AnalyticsDashboardPage'))

import LoadingSpinner from '@/Components/LoadingSpinner'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-shadow-bg flex items-center justify-center">
    <LoadingSpinner size="md" text="جاري التحميل..." />
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CollaborationProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/manuscripts" element={<ManuscriptsPage />} />
                <Route path="/elite-editor/:id" element={<EliteEditorPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/book-merger" element={<BookMergerPage />} />
                <Route path="/cover-designer" element={<CoverDesignerPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              </Route>
            </Routes>
          </Suspense>
        </CollaborationProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
