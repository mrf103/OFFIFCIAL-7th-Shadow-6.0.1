# Supabase Database Setup Guide

## Prerequisites

1. Supabase account and project created
2. Project URL and Anon Key from Supabase dashboard
3. SQL editor access in Supabase dashboard

## Setup Steps

### 1. Create Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire content from `schema.sql`
4. Execute the query

This will create:
- 13 tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps
- Helper functions

### 2. Enable Storage Buckets

In Supabase Dashboard → Storage:

Create these buckets:
- `manuscripts` (Private)
- `covers` (Public)
- `exports` (Private)
- `avatars` (Public)

### 3. Configure Authentication

In Supabase Dashboard → Authentication:

1. Enable Email/Password provider
2. Set up email templates
3. Configure redirect URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4. Update Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_key
```

### 5. Initialize Database Client

The `api/supabaseClient.js` already includes all necessary helpers.

## Database Schema Overview

### Tables (13 total)

| Table | Purpose | Records |
|-------|---------|---------|
| `user_profiles` | User accounts and metadata | 1 per user |
| `user_settings` | User preferences | 1 per user |
| `manuscripts` | Main manuscript records | Multiple per user |
| `manuscript_versions` | Version history | Multiple per manuscript |
| `chapters` | Book chapters | Multiple per manuscript |
| `editing_suggestions` | AI suggestions | Multiple per chapter |
| `comments` | User comments | Multiple per manuscript |
| `collaboration_access` | Shared access | Multiple per manuscript |
| `cover_designs` | Cover designs | Multiple per manuscript |
| `export_jobs` | Export tasks | Multiple per manuscript |
| `published_books` | Published records | 1 per manuscript |
| `manuscript_analytics` | Usage statistics | 1 per manuscript |
| `activity_logs` | User actions | Multiple per user |
| `compliance_rules` | Publishing rules | System-wide |
| `compliance_checks` | Rule checks | Multiple per manuscript |
| `processing_jobs` | Background jobs | Multiple per manuscript |
| `notifications` | User notifications | Multiple per user |

### Key Features

**Row Level Security (RLS)**
- Users can only access their own data
- Collaborative manuscripts visible to all collaborators
- Admin users have full access

**Automatic Timestamps**
- `created_at` - Set on insert
- `updated_at` - Updated on every change

**Performance Indexes**
- 20+ indexes on frequently queried columns
- Optimized for common queries

**Referential Integrity**
- Foreign keys with cascade delete
- Check constraints for valid values

## API Usage Examples

### Create Manuscript

```javascript
import { db } from '@/api/supabaseClient'

const manuscript = await db.manuscripts.create({
  title: 'My Book',
  description: 'Book description',
  language: 'ar',
  genre: 'fiction'
})
```

### Get Manuscripts

```javascript
const manuscripts = await db.manuscripts.list('-created_at', 10)
```

### Update Manuscript

```javascript
await db.manuscripts.update(manuscriptId, {
  status: 'approved',
  word_count: 50000
})
```

### Filter Manuscripts

```javascript
const drafts = await db.manuscripts.filter({
  status: 'draft',
  user_id: userId
})
```

## Backup & Recovery

### Backup

1. Supabase Dashboard → Backups
2. Enable automatic daily backups
3. Manual backup: Export → SQL dump

### Recovery

1. Supabase Dashboard → Backups
2. Select backup date
3. Click "Restore"

## Monitoring

### Query Performance

Supabase Dashboard → SQL Editor:

```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Storage Usage

Supabase Dashboard → Storage → Usage

### Database Size

Supabase Dashboard → Database → Usage

## Troubleshooting

### RLS Blocking Access

**Problem**: Getting "row level security policy" error

**Solution**:
1. Check RLS policies in Supabase Dashboard
2. Verify user is authenticated
3. Check user ID matches record owner

### Foreign Key Violations

**Problem**: Cannot delete record due to foreign key

**Solution**:
1. Delete dependent records first
2. Or enable CASCADE delete (already configured)

### Performance Issues

**Problem**: Slow queries

**Solution**:
1. Check if indexes exist
2. Use EXPLAIN ANALYZE
3. Optimize query structure

## Migration from Old System

If migrating from old database:

```sql
-- Copy data from old tables
INSERT INTO manuscripts (id, user_id, title, content, status, created_at)
SELECT id, user_id, title, content, status, created_at
FROM old_manuscripts;

-- Update sequences
SELECT setval('manuscripts_id_seq', (SELECT MAX(id) FROM manuscripts));
```

## Next Steps

1. ✅ Schema created
2. ✅ Storage buckets configured
3. ⏳ Authentication UI (Phase 2)
4. ⏳ Export functions (Phase 3)
5. ⏳ AI Agents (Phase 4)
6. ⏳ Deployment (Phase 5)
