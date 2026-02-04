#!/bin/bash

# ===========================================
# Railway Deployment Verification Script
# ===========================================

echo "🔍 فحص جاهزية النشر على Railway..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Checklist
ERRORS=0
WARNINGS=0

# 1. Check required files
echo "📄 التحقق من الملفات المطلوبة..."

required_files=("package.json" "vite.config.js" "railway.json" "nixpacks.toml" "Dockerfile" ".dockerignore" ".env.example")

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file موجود"
  else
    echo -e "${RED}✗${NC} $file مفقود"
    ((ERRORS++))
  fi
done

echo ""

# 2. Check package.json scripts
echo "📦 التحقق من scripts في package.json..."

if grep -q '"build":' package.json; then
  echo -e "${GREEN}✓${NC} build script موجود"
else
  echo -e "${RED}✗${NC} build script مفقود"
  ((ERRORS++))
fi

if grep -q '"preview":' package.json; then
  echo -e "${GREEN}✓${NC} preview script موجود"
else
  echo -e "${YELLOW}⚠${NC} preview script مفقود (سيتم استخدام serve)"
  ((WARNINGS++))
fi

echo ""

# 3. Check environment variables template
echo "🔐 التحقق من المتغيرات البيئية..."

if [ -f ".env.example" ]; then
  required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_GOOGLE_AI_API_KEY")
  
  for var in "${required_vars[@]}"; do
    if grep -q "$var" .env.example; then
      echo -e "${GREEN}✓${NC} $var محدد في .env.example"
    else
      echo -e "${RED}✗${NC} $var مفقود في .env.example"
      ((ERRORS++))
    fi
  done
else
  echo -e "${RED}✗${NC} .env.example مفقود"
  ((ERRORS++))
fi

echo ""

# 4. Check if .env is in .gitignore
echo "🔒 التحقق من الأمان..."

if [ -f ".gitignore" ]; then
  if grep -q "^\.env$" .gitignore || grep -q "^\.env\.local$" .gitignore; then
    echo -e "${GREEN}✓${NC} .env في .gitignore"
  else
    echo -e "${YELLOW}⚠${NC} .env ليس في .gitignore - خطر أمني محتمل"
    ((WARNINGS++))
  fi
else
  echo -e "${YELLOW}⚠${NC} .gitignore مفقود"
  ((WARNINGS++))
fi

echo ""

# 5. Test build
echo "🔨 اختبار البناء..."

if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} البناء نجح"
  
  # Check dist folder
  if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} مجلد dist تم إنشاؤه"
    
    # Check index.html
    if [ -f "dist/index.html" ]; then
      echo -e "${GREEN}✓${NC} index.html موجود في dist"
    else
      echo -e "${RED}✗${NC} index.html مفقود في dist"
      ((ERRORS++))
    fi
  else
    echo -e "${RED}✗${NC} مجلد dist لم يُنشأ"
    ((ERRORS++))
  fi
else
  echo -e "${RED}✗${NC} فشل البناء"
  ((ERRORS++))
  echo "تشغيل npm run build للمزيد من التفاصيل"
fi

echo ""

# 6. Check for large files
echo "📦 التحقق من حجم الملفات..."

if [ -d "dist" ]; then
  large_files=$(find dist -type f -size +5M)
  
  if [ -z "$large_files" ]; then
    echo -e "${GREEN}✓${NC} لا توجد ملفات كبيرة جداً"
  else
    echo -e "${YELLOW}⚠${NC} ملفات كبيرة مكتشفة:"
    echo "$large_files"
    ((WARNINGS++))
  fi
fi

echo ""

# 7. Check dependencies
echo "📚 التحقق من Dependencies..."

if [ -f "package-lock.json" ]; then
  echo -e "${GREEN}✓${NC} package-lock.json موجود"
else
  echo -e "${YELLOW}⚠${NC} package-lock.json مفقود - قد يسبب مشاكل في النشر"
  ((WARNINGS++))
fi

# Check for vulnerabilities
echo "🔍 فحص الثغرات الأمنية..."
npm audit --production > /dev/null 2>&1
AUDIT_RESULT=$?

if [ $AUDIT_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓${NC} لا توجد ثغرات أمنية"
else
  echo -e "${YELLOW}⚠${NC} توجد ثغرات أمنية - قم بتشغيل: npm audit fix"
  ((WARNINGS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 رائع! المشروع جاهز 100% للنشر على Railway${NC}"
  echo ""
  echo "الخطوات التالية:"
  echo "1. git add . && git commit -m 'Ready for deployment'"
  echo "2. git push origin main"
  echo "3. اذهب إلى Railway Dashboard وانشر من GitHub"
  echo "4. أضف المتغيرات البيئية من .env.example"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ المشروع جاهز للنشر مع $WARNINGS تحذير(ات)${NC}"
  echo ""
  echo "يُنصح بمعالجة التحذيرات قبل النشر"
  exit 0
else
  echo -e "${RED}✗ توجد $ERRORS خطأ(أخطاء) و $WARNINGS تحذير(ات)${NC}"
  echo ""
  echo "يجب إصلاح الأخطاء قبل النشر!"
  exit 1
fi
