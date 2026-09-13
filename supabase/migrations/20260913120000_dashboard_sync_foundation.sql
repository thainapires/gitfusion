-- Dashboard sync foundation.
-- Keeps the existing overview cache as a temporary response cache while adding
-- durable daily aggregates and sync observability.

alter table public.connected_accounts
  add column if not exists access_token_encrypted text,
  add column if not exists refresh_token_encrypted text;

alter table public.connected_accounts
  drop column if exists access_token,
  drop column if exists refresh_token;

alter table public.connected_accounts
  alter column access_token_encrypted set not null;

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text check (provider in ('github', 'gitlab')),
  status text not null check (status in ('running', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  items_synced integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sync_runs enable row level security;

drop policy if exists "Users can read their own sync runs" on public.sync_runs;
create policy "Users can read their own sync runs"
  on public.sync_runs for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists sync_runs_user_id_started_at_idx on public.sync_runs(user_id, started_at desc);
create index if not exists sync_runs_status_idx on public.sync_runs(status);

create table if not exists public.contribution_daily_totals (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  github_count integer not null default 0 check (github_count >= 0),
  gitlab_count integer not null default 0 check (gitlab_count >= 0),
  total_count integer generated always as (github_count + gitlab_count) stored,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.contribution_daily_totals enable row level security;

drop policy if exists "Users can read their own contribution daily totals" on public.contribution_daily_totals;
create policy "Users can read their own contribution daily totals"
  on public.contribution_daily_totals for select
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists contribution_daily_totals_set_updated_at on public.contribution_daily_totals;
create trigger contribution_daily_totals_set_updated_at
  before update on public.contribution_daily_totals
  for each row execute function public.set_updated_at();

create index if not exists contribution_daily_totals_user_date_idx on public.contribution_daily_totals(user_id, date desc);

grant select on public.sync_runs to authenticated;
grant all on public.sync_runs to service_role;
grant select on public.contribution_daily_totals to authenticated;
grant all on public.contribution_daily_totals to service_role;

notify pgrst, 'reload schema';
