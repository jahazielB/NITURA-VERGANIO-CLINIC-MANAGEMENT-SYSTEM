drop policy if exists "Staff can read activity logs" on public.activity_logs;

create policy "Admins can read activity logs"
  on public.activity_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'Admin'
    )
  );
