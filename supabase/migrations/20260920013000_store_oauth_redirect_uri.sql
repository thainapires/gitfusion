alter table public.connected_accounts
  add column if not exists oauth_redirect_uri text;

notify pgrst, 'reload schema';
