import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce Hook', () => {
  it('يجب أن يرجع القيمة الأولية فوراً', () => {
    const { result } = renderHook(() => useDebounce('قيمة أولية', 500));
    expect(result.current).toBe('قيمة أولية');
  });

  it('يجب أن يؤخر تحديث القيمة', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'قيمة 1', delay: 500 } }
    );

    expect(result.current).toBe('قيمة 1');

    rerender({ value: 'قيمة 2', delay: 500 });
    expect(result.current).toBe('قيمة 1');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('قيمة 2');
    vi.useRealTimers();
  });

  it('يجب أن يلغي التحديثات السابقة', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'قيمة 1' } }
    );

    rerender({ value: 'قيمة 2' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    rerender({ value: 'قيمة 3' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('قيمة 3');
    vi.useRealTimers();
  });

  it('يجب أن يعمل مع delay مختلف', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'أولى' } }
    );

    rerender({ value: 'ثانية' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('أولى');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('ثانية');
    vi.useRealTimers();
  });
});
