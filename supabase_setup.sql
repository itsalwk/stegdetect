-- Supabase Setup for StegDETECT

-- 1. Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. Stego History table
create table public.stego_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  filename text not null,
  type text not null, -- 'Steganography' or 'Steganalysis'
  status text not null, -- 'Success', 'Safe', 'Detected', 'Error'
  carrier_url text,
  result_url text,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for history
alter table public.stego_history enable row level security;

create policy "Users can view their own history." on public.stego_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own history." on public.stego_history
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own history." on public.stego_history
  for update using (auth.uid() = user_id);

create policy "Users can delete their own history." on public.stego_history
  for delete using (auth.uid() = user_id);

-- 3. Storage Buckets
-- Run these in your Supabase Dashboard or via API
-- insert into storage.buckets (id, name, public) values ('stego-uploads', 'stego-uploads', true);

-- Storage Policies for 'stego-uploads'
-- Policy to allow public access to files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'stego-uploads' );

-- Policy to allow authenticated users to upload
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'stego-uploads' AND
  auth.role() = 'authenticated'
);

-- 4. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
