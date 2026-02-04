import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UploadPage from '@/Pages/UploadPage';
import ToastProvider from '@/Components/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const UploadPageWithRouter = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ToastProvider>
        <UploadPage />
      </ToastProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Upload Page', () => {
  it('يجب أن يعرض منطقة رفع الملفات', () => {
    render(<UploadPageWithRouter />);
    expect(screen.getByText(/ارفع مخطوطتك|Upload|اسحب|Drop/i)).toBeInTheDocument();
  });

  it('يجب أن يعرض أنواع الملفات المدعومة', () => {
    render(<UploadPageWithRouter />);
    expect(screen.getByText(/TXT|PDF|DOC|DOCX/i)).toBeInTheDocument();
  });

  it('يجب أن يعرض حد الحجم المسموح', () => {
    render(<UploadPageWithRouter />);
    expect(screen.getByText(/50|MB/i)).toBeInTheDocument();
  });

  it('يجب أن تحتوي على منطقة للنقر أو سحب الملفات', () => {
    const { container } = render(<UploadPageWithRouter />);
    // التحقق من وجود منطقة تفاعلية للرفع
    const uploadArea = container.querySelector('[class*="cursor-pointer"], [class*="drag"]');
    expect(uploadArea).toBeInTheDocument();
  });

  it('يجب أن يحتوي على input للملفات', () => {
    const { container } = render(<UploadPageWithRouter />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('يجب أن يعرض معلومات عن الرفع', () => {
    render(<UploadPageWithRouter />);
    // التحقق من وجود نص يشير إلى رفع الملفات
    const texts = screen.getAllByText(/رفع|اسحب|انقر|ملف/i);
    expect(texts.length).toBeGreaterThan(0);
  });
});
