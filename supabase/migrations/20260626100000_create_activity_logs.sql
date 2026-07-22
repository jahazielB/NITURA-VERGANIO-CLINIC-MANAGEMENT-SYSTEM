create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.user_profiles(id),
  action text not null,
  description text not null,
  severity text not null default 'info',
  created_at timestamptz not null default now(),
  constraint activity_logs_severity_check check (severity in ('info', 'success', 'warning', 'error'))
);

create index if not exists idx_activity_logs_created_at
  on public.activity_logs(created_at desc);

alter table public.activity_logs enable row level security;

create policy "Staff can read activity logs"
  on public.activity_logs
  for select
  to authenticated
  using (true);

create or replace function public.log_activity(
  p_user_id uuid,
  p_action text,
  p_description text,
  p_severity text default 'info'
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.activity_logs (user_id, action, description, severity)
  values (p_user_id, p_action, p_description, p_severity);
end;
$$;
