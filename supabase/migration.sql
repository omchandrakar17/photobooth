-- Run this in your Supabase SQL editor to create the photostrips table

create table if not exists photostrips (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  image_url text not null,
  filter_type text not null check (filter_type in ('bw', 'color')),
  caption text,
  frame_style text default 'classic'
);

-- Enable Row Level Security (read-only for anonymous users)
alter table photostrips enable row level security;

-- Allow anyone to read any strip (for share page)
create policy "Public read access"
  on photostrips for select
  using (true);

-- Allow anyone to insert a strip (no auth required)
create policy "Public insert access"
  on photostrips for insert
  with check (true);


