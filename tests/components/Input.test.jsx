import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/Components/ui/input';

describe('Input Component', () => {
  it('يجب أن يعرض input بشكل صحيح', () => {
    render(<Input placeholder="أدخل النص هنا" />);
    expect(screen.getByPlaceholderText('أدخل النص هنا')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع onChange', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'نص جديد' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('يجب أن يكون معطلاً عند تمرير disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('يجب أن يقبل type مختلف', () => {
    render(<Input type="email" placeholder="البريد الإلكتروني" />);
    const input = screen.getByPlaceholderText('البريد الإلكتروني');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('يجب أن يحدث القيمة بشكل صحيح', () => {
    render(<Input defaultValue="قيمة افتراضية" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('قيمة افتراضية');
  });

  it('يجب أن يطبق className مخصص', () => {
    const { container } = render(<Input className="custom-input" />);
    expect(container.querySelector('.custom-input')).toBeInTheDocument();
  });

  it('يجب أن يدعم RTL', () => {
    render(<Input dir="rtl" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('dir', 'rtl');
  });
});
