-- Enable RLS on all tables
alter table profiles           enable row level security;
alter table attendance         enable row level security;
alter table leave_requests     enable row level security;
alter table wfh_requests       enable row level security;
alter table correction_requests enable row level security;
alter table holidays           enable row level security;
alter table audit_logs         enable row level security;
alter table notifications      enable row level security;
alter table company_settings   enable row level security;

-- Helper function: check if caller is admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

create policy "profiles: admin read all"
  on profiles for select using (is_admin());

create policy "profiles: admin insert"
  on profiles for insert with check (is_admin());

create policy "profiles: admin update all"
  on profiles for update using (is_admin());

create policy "profiles: own update limited"
  on profiles for update using (auth.uid() = id);

-- ── attendance ────────────────────────────────────────────────────────────────
create policy "attendance: own read"
  on attendance for select using (employee_id = auth.uid());

create policy "attendance: admin read all"
  on attendance for select using (is_admin());

create policy "attendance: own insert"
  on attendance for insert with check (employee_id = auth.uid());

create policy "attendance: admin update"
  on attendance for update using (is_admin());

-- ── leave_requests ────────────────────────────────────────────────────────────
create policy "leave: own read"
  on leave_requests for select using (employee_id = auth.uid());

create policy "leave: admin read all"
  on leave_requests for select using (is_admin());

create policy "leave: own insert"
  on leave_requests for insert with check (employee_id = auth.uid());

create policy "leave: admin update"
  on leave_requests for update using (is_admin());

-- ── wfh_requests ──────────────────────────────────────────────────────────────
create policy "wfh: own read"
  on wfh_requests for select using (employee_id = auth.uid());

create policy "wfh: admin read all"
  on wfh_requests for select using (is_admin());

create policy "wfh: own insert"
  on wfh_requests for insert with check (employee_id = auth.uid());

create policy "wfh: admin update"
  on wfh_requests for update using (is_admin());

-- ── correction_requests ──────────────────────────────────────────────────────────
create policy "correction: own read"
  on correction_requests for select using (employee_id = auth.uid());

create policy "correction: admin read all"
  on correction_requests for select using (is_admin());

create policy "correction: own insert"
  on correction_requests for insert with check (employee_id = auth.uid());

create policy "correction: admin update"
  on correction_requests for update using (is_admin());

-- ── holidays ──────────────────────────────────────────────────────────────────
create policy "holidays: all authenticated read"
  on holidays for select using (auth.role() = 'authenticated');

create policy "holidays: admin insert"
  on holidays for insert with check (is_admin());

create policy "holidays: admin delete"
  on holidays for delete using (is_admin());

-- ── audit_logs ──────────────────────────────────────────────────────────────────
create policy "audit: admin read"
  on audit_logs for select using (is_admin());

-- INSERT only via service role key (from API routes) — no client insert policy

-- ── notifications ──────────────────────────────────────────────────────────────
create policy "notifications: own read"
  on notifications for select using (user_id = auth.uid());

create policy "notifications: own update (mark read)"
  on notifications for update using (user_id = auth.uid());

-- INSERT only via service role key

-- ── company_settings ────────────────────────────────────────────────────────────
create policy "settings: all authenticated read"
  on company_settings for select using (auth.role() = 'authenticated');

create policy "settings: admin update"
  on company_settings for update using (is_admin());
