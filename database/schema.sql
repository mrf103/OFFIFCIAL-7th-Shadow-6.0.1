-- Shadow Seven - Database Schema
-- Comprehensive Supabase Schema for Publishing Platform
-- Version: 4.0.0

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'author', -- author, publisher, editor, admin
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  subscription_status TEXT DEFAULT 'active', -- active, cancelled, expired
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('author', 'publisher', 'editor', 'admin')),
  CONSTRAINT valid_subscription CHECK (subscription_tier IN ('free', 'pro', 'enterprise'))
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'ar', -- ar, en
  theme TEXT DEFAULT 'dark', -- light, dark
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. MANUSCRIPTS
-- ============================================================================

-- Manuscripts Table
CREATE TABLE IF NOT EXISTS manuscripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Full manuscript content
  language TEXT DEFAULT 'ar', -- ar, en
  genre TEXT, -- fiction, non-fiction, poetry, etc.
  status TEXT DEFAULT 'draft', -- draft, review, approved, published, archived
  word_count INTEGER DEFAULT 0,
  chapter_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  
  -- Metadata
  cover_image_url TEXT,
  thumbnail_url TEXT,
  isbn TEXT UNIQUE,
  publisher_name TEXT,
  publication_date DATE,
  
  -- AI Analysis Results
  nlp_analysis JSONB, -- Results from NLP system
  content_quality_score FLOAT DEFAULT 0,
  readability_score FLOAT DEFAULT 0,
  plagiarism_percentage FLOAT DEFAULT 0,
  
  -- Collaboration
  collaborators UUID[] DEFAULT '{}',
  is_collaborative BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived'))
);

-- Manuscript Versions (for version control)
CREATE TABLE IF NOT EXISTS manuscript_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manuscript_id, version_number)
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manuscript_id, chapter_number)
);

-- ============================================================================
-- 3. EDITING & COLLABORATION
-- ============================================================================

-- Editing Suggestions
CREATE TABLE IF NOT EXISTS editing_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- grammar, style, clarity, tone, etc.
  original_text TEXT NOT NULL,
  suggested_text TEXT NOT NULL,
  position INTEGER NOT NULL,
  severity TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_by TEXT DEFAULT 'ai', -- ai, editor, collaborator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Comments & Notes
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration Access
CREATE TABLE IF NOT EXISTS collaboration_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL, -- view, comment, edit, admin
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(manuscript_id, collaborator_id),
  CONSTRAINT valid_access CHECK (access_level IN ('view', 'comment', 'edit', 'admin'))
);

-- ============================================================================
-- 4. COVER DESIGN
-- ============================================================================

-- Cover Designs
CREATE TABLE IF NOT EXISTS cover_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  title TEXT,
  design_data JSONB NOT NULL, -- Design configuration
  image_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, approved, published
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'approved', 'published'))
);

-- ============================================================================
-- 5. EXPORTS & PUBLISHING
-- ============================================================================

-- Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL, -- pdf, epub, docx, zip
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress FLOAT DEFAULT 0,
  file_url TEXT,
  file_size_bytes INTEGER,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_format CHECK (export_format IN ('pdf', 'epub', 'docx', 'zip')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Published Books
CREATE TABLE IF NOT EXISTS published_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES user_profiles(id),
  isbn TEXT UNIQUE,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  cover_image_url TEXT,
  pdf_url TEXT,
  epub_url TEXT,
  docx_url TEXT,
  status TEXT DEFAULT 'published', -- published, unpublished, archived
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. ANALYTICS & TRACKING
-- ============================================================================

-- Manuscript Analytics
CREATE TABLE IF NOT EXISTS manuscript_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  average_reading_time_seconds INTEGER DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  engagement_score FLOAT DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manuscript_id)
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- create, edit, delete, publish, export, etc.
  resource_type TEXT, -- manuscript, chapter, cover, etc.
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. COMPLIANCE & RULES
-- ============================================================================

-- Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  rule_type TEXT NOT NULL, -- content, format, metadata, etc.
  rule_json JSONB NOT NULL,
  severity TEXT DEFAULT 'warning', -- info, warning, error
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Checks
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES compliance_rules(id),
  status TEXT DEFAULT 'passed', -- passed, failed, warning
  message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PROCESSING JOBS
-- ============================================================================

-- Processing Jobs
CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- nlp_analysis, export, cover_design, etc.
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress FLOAT DEFAULT 0,
  result_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- info, success, warning, error
  related_resource_type TEXT,
  related_resource_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier);

-- Manuscripts Indexes
CREATE INDEX idx_manuscripts_user_id ON manuscripts(user_id);
CREATE INDEX idx_manuscripts_status ON manuscripts(status);
CREATE INDEX idx_manuscripts_genre ON manuscripts(genre);
CREATE INDEX idx_manuscripts_created_at ON manuscripts(created_at DESC);
CREATE INDEX idx_manuscripts_language ON manuscripts(language);

-- Chapters Indexes
CREATE INDEX idx_chapters_manuscript_id ON chapters(manuscript_id);
CREATE INDEX idx_chapters_chapter_number ON chapters(manuscript_id, chapter_number);

-- Editing Suggestions Indexes
CREATE INDEX idx_editing_suggestions_manuscript ON editing_suggestions(manuscript_id);
CREATE INDEX idx_editing_suggestions_status ON editing_suggestions(status);

-- Comments Indexes
CREATE INDEX idx_comments_manuscript ON comments(manuscript_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Export Jobs Indexes
CREATE INDEX idx_export_jobs_manuscript ON export_jobs(manuscript_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_export_jobs_user ON export_jobs(user_id);

-- Published Books Indexes
CREATE INDEX idx_published_books_author ON published_books(author_id);
CREATE INDEX idx_published_books_isbn ON published_books(isbn);
CREATE INDEX idx_published_books_status ON published_books(status);

-- Activity Logs Indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Notifications Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(user_id, created_at DESC);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE editing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Manuscripts RLS
CREATE POLICY "Users can view their own manuscripts" ON manuscripts
  FOR SELECT USING (auth.uid() = user_id OR is_collaborative = TRUE);

CREATE POLICY "Users can create manuscripts" ON manuscripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manuscripts" ON manuscripts
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications RLS
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuscripts_updated_at
  BEFORE UPDATE ON manuscripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_designs_updated_at
  BEFORE UPDATE ON cover_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update manuscript stats
CREATE OR REPLACE FUNCTION update_manuscript_stats(manuscript_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE manuscripts
  SET
    chapter_count = (SELECT COUNT(*) FROM chapters WHERE manuscript_id = $1),
    word_count = (SELECT COALESCE(SUM(word_count), 0) FROM chapters WHERE manuscript_id = $1),
    reading_time_minutes = (SELECT COALESCE(SUM(reading_time_minutes), 0) FROM chapters WHERE manuscript_id = $1)
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets (via Supabase Dashboard or API)
-- - manuscripts (private)
-- - covers (public)
-- - exports (private)
-- - avatars (public)
