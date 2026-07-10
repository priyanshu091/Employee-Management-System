-- Enable UUID extension
create extension if not exists "pgcrypto";

-- profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,
  full_name text not null,
  email text unique not null,
  phone text,
  department text,
  designation text,
  joining_date date,
  role text not null default 'employee'
    check (role in ('admin', 'employee')),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  avatar_url text,
  emergency_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- attendance table
create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  type text not null default 'office'
    check (type in ('office', 'wfh')),
  status text not null default 'absent'
    check (status in ('present', 'late', 'absent', 'leave', 'wfh')),
  working_hours numeric(5,2),
  late_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employee_id, date)
);

-- leave_requests table
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- wfh_requests table
create table wfh_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- correction_requests table
create table correction_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  reason text not null,
  requested_check_in time,
  requested_check_out time,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- holidays table
create table holidays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null unique,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

-- audit_logs table (immutable — no update/delete)
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  employee_id uuid not null references profiles(id),
  changed_by uuid not null references profiles(id),
  previous_value jsonb not null,
  new_value jsonb not null,
  reason text not null,
  created_at timestamptz default now()
);

-- notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null
    check (type in ('leave', 'wfh', 'correction', 'reminder')),
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- company_settings table (single row)
create table company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'My Company',
  office_address text not null default '',
  office_lat numeric(10,7) not null default 0,
  office_lng numeric(10,7) not null default 0,
  allowed_radius_km numeric(4,2) not null default 1.0,
  office_start_time time not null default '10:00',
  office_end_time time not null default '19:00',
  grace_period_minutes int not null default 10,
  logo_url text,
  attendance_lock_time time not null default '23:59',
  updated_at timestamptz default now()
);

-- Insert default company settings row
insert into company_settings (company_name) values ('FeelifyEMS Corp');
