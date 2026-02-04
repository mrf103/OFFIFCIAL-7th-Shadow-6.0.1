import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/Components/ui/button';

describe('Button Component', () => {
  it('يجب أن يعرض النص بشكل صحيح', () => {
    render(<Button>انقر هنا</Button>);
    expect(screen.getByText('انقر هنا')).toBeInTheDocument();
  });

  it('يجب أن ينفذ onClick عند النقر', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>انقر</Button>);
    
    fireEvent.click(screen.getByText('انقر'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('يجب أن يكون معطلاً عند تمرير disabled', () => {
    render(<Button disabled>معطل</Button>);
    const button = screen.getByText('معطل');
    expect(button).toBeDisabled();
  });

  it('يجب أن يطبق variant بشكل صحيح', () => {
    const { container } = render(<Button variant="destructive">حذف</Button>);
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });

  it('يجب أن يطبق size بشكل صحيح', () => {
    const { container } = render(<Button size="lg">كبير</Button>);
    expect(container.querySelector('.h-11')).toBeInTheDocument();
  });

  it('يجب ألا ينفذ onClick عندما يكون معطلاً', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>معطل</Button>);
    
    fireEvent.click(screen.getByText('معطل'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('يجب أن يعرض الأيقونة مع النص', () => {
    render(
      <Button>
        <span>⚡</span>
        انقر هنا
      </Button>
    );
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('انقر هنا')).toBeInTheDocument();
  });
});
