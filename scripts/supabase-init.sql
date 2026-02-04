-- Supabase bootstrap for "الظل السابع"

-- Extensions
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists public.manuscripts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text,
  content text,
  chapters jsonb,
  word_count integer,
  status text default 'draft',
  file_path text,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id)
);

create table if not exists public.compliance_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  rule_type text,
  severity text,
  created_at timestamptz default now()
);

create table if not exists public.cover_designs (
  id uuid primary key default uuid_generate_v4(),
  manuscript_id uuid references public.manuscripts(id) on delete cascade,
  image_url text,
  prompt text,
  style text,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id)
);

create table if not exists public.processing_jobs (
  id uuid primary key default uuid_generate_v4(),
  manuscript_id uuid references public.manuscripts(id) on delete cascade,
  status text default 'pending',
  progress integer default 0,
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table public.manuscripts enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.cover_designs enable row level security;
alter table public.processing_jobs enable row level security;

-- Policies (idempotent, owner-based; dev-only public read)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'manuscripts_owner_read') then
    create policy "manuscripts_owner_read" on public.manuscripts
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'manuscripts_owner_write') then
    create policy "manuscripts_owner_write" on public.manuscripts
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'manuscripts_public_read') then
    create policy "manuscripts_public_read" on public.manuscripts
      for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'compliance_public_read') then
    create policy "compliance_public_read" on public.compliance_rules
      for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'covers_owner_read') then
    create policy "covers_owner_read" on public.cover_designs
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'covers_owner_write') then
    create policy "covers_owner_write" on public.cover_designs
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'jobs_owner_read') then
    create policy "jobs_owner_read" on public.processing_jobs
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'jobs_owner_write') then
    create policy "jobs_owner_write" on public.processing_jobs
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Indexes
create index if not exists idx_manuscripts_user on public.manuscripts(user_id);
create index if not exists idx_manuscripts_status on public.manuscripts(status);
create index if not exists idx_processing_jobs_status on public.processing_jobs(status);
