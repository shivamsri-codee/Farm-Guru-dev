-- Enable pgvector extension for vector similarity search
create extension if not exists vector;

-- Docs table for retrieval corpus with embeddings
create table if not exists docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source_url text,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Users table for farmer profiles
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  state text,
  village text,
  crops jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Queries table for history and audit
create table if not exists queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  question text not null,
  agent text,
  response jsonb,
  confidence real,
  flagged boolean default false,
  created_at timestamptz default now()
);

-- Images metadata table
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  filename text not null,
  storage_path text,
  label text,
  confidence real,
  created_at timestamptz default now()
);

-- Weather cache table
create table if not exists weather (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district text not null,
  forecast_date date not null,
  json_payload jsonb not null,
  created_at timestamptz default now()
);

-- Market prices time-series table
create table if not exists market_prices (
  id uuid primary key default gen_random_uuid(),
  commodity text not null,
  mandi text not null,
  date date not null,
  modal_price numeric not null,
  created_at timestamptz default now()
);

-- Schemes table for PM-KISAN/PMFBY metadata
create table if not exists schemes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  applicable_states text[] default '{}',
  applicable_crops text[] default '{}',
  url text,
  created_at timestamptz default now()
);

-- Community posts table
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  title text not null,
  body text not null,
  tags text[] default '{}',
  moderated boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table docs enable row level security;
alter table users enable row level security;
alter table queries enable row level security;
alter table images enable row level security;
alter table weather enable row level security;
alter table market_prices enable row level security;
alter table schemes enable row level security;
alter table community_posts enable row level security;

-- RLS Policies for public read access on docs, weather, market_prices, schemes
create policy "Docs are viewable by everyone" on docs for select using (true);
create policy "Weather is viewable by everyone" on weather for select using (true);
create policy "Market prices are viewable by everyone" on market_prices for select using (true);
create policy "Schemes are viewable by everyone" on schemes for select using (true);

-- RLS Policies for users (users can view and update their own data)
create policy "Users can view their own profile" on users for select using (auth.uid() = id);
create policy "Users can update their own profile" on users for update using (auth.uid() = id);
create policy "Users can insert their own profile" on users for insert with check (auth.uid() = id);

-- RLS Policies for queries (users can view their own queries)
create policy "Users can view their own queries" on queries for select using (auth.uid() = user_id);
create policy "Users can insert their own queries" on queries for insert with check (auth.uid() = user_id);

-- RLS Policies for images (users can view and insert their own images)
create policy "Users can view their own images" on images for select using (auth.uid() = user_id);
create policy "Users can insert their own images" on images for insert with check (auth.uid() = user_id);

-- RLS Policies for community posts (public read, users can manage their own posts)
create policy "Community posts are viewable by everyone" on community_posts for select using (true);
create policy "Users can insert their own posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on community_posts for update using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists docs_embedding_idx on docs using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists weather_state_district_date_idx on weather (state, district, forecast_date);
create index if not exists market_prices_commodity_mandi_date_idx on market_prices (commodity, mandi, date);
create index if not exists queries_user_id_created_at_idx on queries (user_id, created_at);
create index if not exists community_posts_created_at_idx on community_posts (created_at);

-- Create storage bucket for images
insert into storage.buckets (id, name, public) values ('farm-images', 'farm-images', true);

-- Storage policies for farm images
create policy "Farm images are publicly accessible" on storage.objects for select using (bucket_id = 'farm-images');
create policy "Users can upload farm images" on storage.objects for insert with check (bucket_id = 'farm-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own farm images" on storage.objects for update using (bucket_id = 'farm-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their own farm images" on storage.objects for delete using (bucket_id = 'farm-images' and auth.uid()::text = (storage.foldername(name))[1]);