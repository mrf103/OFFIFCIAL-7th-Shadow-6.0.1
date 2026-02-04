import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/Pages/Dashboard';

// Mock API client
vi.mock('@/api', () => ({
  apiClient: {
    getDashboardStats: vi.fn().mockResolvedValue({
      totalManuscripts: 5,
      processing: 2,
      completed: 3,
      needsReview: 0,
      recentManuscripts: [],
      processingJobs: []
    })
  }
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const DashboardWithRouter = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Dashboard Page', () => {
  it('يجب أن يعرض عنوان لوحة التحكم أو حالة التحميل', async () => {
    render(<DashboardWithRouter />);
    // Dashboard يظهر loading spinner أثناء تحميل البيانات
    await waitFor(() => {
      const hasTitle = screen.queryByText(/لوحة التحكم|Dashboard/i);
      const hasLoader = screen.queryByText(/جاري التحميل|Loading/i);
      expect(hasTitle || hasLoader).toBeTruthy();
    });
  });

  it('يجب أن يعرض بطاقات الإحصائيات', () => {
    render(<DashboardWithRouter />);
    
    // البحث عن عناوين الإحصائيات
    const statCards = screen.getAllByRole('heading', { level: 3 });
    expect(statCards.length).toBeGreaterThan(0);
  });

  it('يجب أن يعرض المخطوطات الأخيرة', () => {
    render(<DashboardWithRouter />);
    expect(screen.getByText(/المخطوطات الأخيرة|Recent Manuscripts/i)).toBeInTheDocument();
  });

  it('يجب أن يعرض أزرار الإجراءات السريعة', () => {
    render(<DashboardWithRouter />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('يجب أن يعرض المكونات الأساسية', () => {
    const { container } = render(<DashboardWithRouter />);
    
    // التحقق من وجود الحاويات الرئيسية
    expect(container.querySelector('.grid, .flex')).toBeInTheDocument();
  });
});
