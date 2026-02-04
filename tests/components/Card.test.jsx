import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';

describe('Card Component', () => {
  it('يجب أن يعرض البطاقة الكاملة', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>عنوان البطاقة</CardTitle>
          <CardDescription>وصف البطاقة</CardDescription>
        </CardHeader>
        <CardContent>محتوى البطاقة</CardContent>
        <CardFooter>تذييل البطاقة</CardFooter>
      </Card>
    );

    expect(screen.getByText('عنوان البطاقة')).toBeInTheDocument();
    expect(screen.getByText('وصف البطاقة')).toBeInTheDocument();
    expect(screen.getByText('محتوى البطاقة')).toBeInTheDocument();
    expect(screen.getByText('تذييل البطاقة')).toBeInTheDocument();
  });

  it('يجب أن يعرض بطاقة بسيطة بدون header و footer', () => {
    render(
      <Card>
        <CardContent>محتوى فقط</CardContent>
      </Card>
    );

    expect(screen.getByText('محتوى فقط')).toBeInTheDocument();
  });

  it('يجب أن يطبق className مخصص', () => {
    const { container } = render(
      <Card className="custom-class">
        <CardContent>محتوى</CardContent>
      </Card>
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('يجب أن يعرض CardTitle بدون CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>عنوان فقط</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('عنوان فقط')).toBeInTheDocument();
  });

  it('يجب أن يحتوي على العناصر الأساسية', () => {
    const { container } = render(
      <Card>
        <CardContent>محتوى</CardContent>
      </Card>
    );

    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });
});
