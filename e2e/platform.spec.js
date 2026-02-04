import { test, expect } from '@playwright/test';

test.describe('Shadow Seven Platform E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('يجب أن تحمل الصفحة الرئيسية بنجاح', async ({ page }) => {
    await expect(page).toHaveTitle(/Shadow Seven|سيادي/);
  });

  test('يجب أن يعرض Dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /لوحة التحكم|Dashboard/i })).toBeVisible();
  });

  test('يجب أن ينتقل إلى صفحة Upload', async ({ page }) => {
    await page.click('text=/رفع|Upload/i');
    await expect(page).toHaveURL(/.*upload/);
  });

  test('يجب أن ينتقل إلى صفحة Manuscripts', async ({ page }) => {
    await page.click('text=/المخطوطات|Manuscripts/i');
    await expect(page).toHaveURL(/.*manuscripts/);
  });

  test('يجب أن ينتقل إلى صفحة Elite Editor', async ({ page }) => {
    await page.click('text=/المحرر|Editor/i');
    await expect(page).toHaveURL(/.*elite-editor/);
  });

  test('يجب أن يعرض Navigation بشكل صحيح', async ({ page }) => {
    const nav = page.locator('nav, aside, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('يجب أن يدعم RTL', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Upload Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('يجب أن يعرض منطقة رفع الملفات', async ({ page }) => {
    await expect(page.getByText(/ارفع|Upload|اسحب|Drop/i)).toBeVisible();
  });

  test('يجب أن يعرض أنواع الملفات المدعومة', async ({ page }) => {
    await expect(page.getByText(/TXT|PDF|DOC/i)).toBeVisible();
  });

  test('يجب أن يحتوي على input للملفات', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});

test.describe('Manuscripts Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manuscripts');
  });

  test('يجب أن يعرض صفحة المخطوطات', async ({ page }) => {
    await expect(page.getByText(/المخطوطات|Manuscripts/i)).toBeVisible();
  });

  test('يجب أن يحتوي على أزرار للإجراءات', async ({ page }) => {
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });
});

test.describe('Elite Editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/elite-editor');
  });

  test('يجب أن يعرض المحرر', async ({ page }) => {
    await expect(page.getByText(/المحرر|Editor/i)).toBeVisible();
  });

  test('يجب أن يحتوي على أدوات التنسيق', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"], .toolbar, .editor-toolbar');
    await expect(toolbar).toBeVisible();
  });
});

test.describe('Export Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/export');
  });

  test('يجب أن يعرض خيارات التصدير', async ({ page }) => {
    await expect(page.getByText(/تصدير|Export|PDF|EPUB|DOCX/i)).toBeVisible();
  });
});

test.describe('Settings Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('يجب أن يعرض صفحة الإعدادات', async ({ page }) => {
    await expect(page.getByText(/الإعدادات|Settings/i)).toBeVisible();
  });

  test('يجب أن يحتوي على أقسام متعددة', async ({ page }) => {
    await expect(page.getByText(/الحساب|Account|المظهر|Appearance/i)).toBeVisible();
  });
});
