# CLAUDE.md — Employee Attendance Management System

> This file is the single source of truth for the entire project.
> Read this fully before making any change, adding any feature, or writing any code.
> Every decision — naming, structure, logic, UI — must align with what is written here.

---

## 1. Project Overview

A web-based Employee Attendance Management System built for a startup.
Simple, transparent, secure, and scalable.

**Two roles only:** Admin and Employee.
**Auth method:** Email OTP only. No passwords.
**Version 1.0** — intentionally lightweight. No biometrics, no QR codes, no face recognition, no HR module, no manager roles.

---

## 2. Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + lucide-react | latest |
| Database | Supabase (PostgreSQL) | latest |
| Auth | Supabase Auth (OTP via email) | latest |
| Email | Resend | latest |
| File Storage | Supabase Storage | latest |
| Deployment | Vercel | — |
| PDF Export | jsPDF | latest |
| Excel Export | SheetJS (xlsx) | latest |

**No other libraries without explicit approval.**
Do not add Framer Motion, React Query, Zustand, Redux, or any animation library.
State management: React `useState` + `useContext` only.
Data fetching: native `fetch` in Server Components or Route Handlers.

> **Version note:** Actually scaffolded with Next.js 16 + Tailwind CSS 4 (the tooling available at project start), not the 14.x/3.x originally specified. Key implications for later phases:
> - Tailwind config lives in `app/globals.css` via `@theme { ... }` (CSS-first config), not `tailwind.config.ts`. There is no `tailwind.config.ts` file.
> - `middleware.ts` is renamed to `proxy.ts` in Next.js 16 (exports a `proxy` function instead of `middleware`). Functionality and `matcher` config are unchanged — treat every future reference to "middleware.ts" in this doc as `proxy.ts`.
> - Route groups `(employee)` and `(admin)` still do not affect URL paths — both cannot define the same route (e.g. `/dashboard`). Admin routes live under `/admin/**` (e.g. `app/(admin)/admin/dashboard/page.tsx` → `/admin/dashboard`); employee routes stay at the bare path (e.g. `app/(employee)/dashboard/page.tsx` → `/dashboard`).

---

## 3. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` to the client.
These are server-only — used only in API Route Handlers.

---

## 4. Folder Structure

```
attendance-system/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── verify/page.tsx
│   ├── (employee)/
│   │   ├── layout.tsx                 ← sidebar + topbar for employee
│   │   ├── dashboard/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── leave/page.tsx
│   │   ├── wfh/page.tsx
│   │   ├── correction/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── profile/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                 ← sidebar + topbar for admin
│   │   ├── dashboard/page.tsx
│   │   ├── employees/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── requests/page.tsx
│   │   ├── holidays/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── audit/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp/route.ts
│   │   │   └── verify-otp/route.ts
│   │   ├── employees/
│   │   │   ├── route.ts               ← GET list, POST create
│   │   │   └── [id]/route.ts          ← PATCH update
│   │   ├── attendance/
│   │   │   ├── route.ts               ← GET list
│   │   │   ├── checkin/route.ts       ← POST
│   │   │   ├── checkout/route.ts      ← POST
│   │   │   └── [id]/route.ts          ← PATCH admin edit
│   │   ├── leave/
│   │   │   ├── route.ts               ← GET list, POST create
│   │   │   └── [id]/review/route.ts   ← PATCH approve/reject
│   │   ├── wfh/
│   │   │   ├── route.ts
│   │   │   └── [id]/review/route.ts
│   │   ├── correction/
│   │   │   ├── route.ts
│   │   │   └── [id]/review/route.ts
│   │   ├── holidays/
│   │   │   ├── route.ts               ← GET list, POST create
│   │   │   └── [id]/route.ts          ← DELETE
│   │   ├── notifications/
│   │   │   ├── route.ts               ← GET list
│   │   │   └── read/route.ts          ← PATCH mark read
│   │   ├── reports/
│   │   │   └── [type]/route.ts        ← GET with filters
│   │   ├── audit/route.ts             ← GET only
│   │   └── settings/route.ts          ← GET + PATCH
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       ← redirects to /auth/login
├── components/
│   ├── auth/
│   │   ├── OTPInput.tsx
│   │   └── ResendTimer.tsx
│   ├── shared/
│   │   ├── StatusBadge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PageHeader.tsx
│   │   └── SkeletonRow.tsx
│   ├── employee/
│   │   ├── CheckInCard.tsx
│   │   ├── CheckInModal.tsx
│   │   ├── AttendanceCalendar.tsx
│   │   ├── DayDetailModal.tsx
│   │   ├── RequestCard.tsx
│   │   ├── LeaveApplyModal.tsx
│   │   ├── WFHApplyModal.tsx
│   │   └── CorrectionApplyModal.tsx
│   └── admin/
│       ├── StatsCard.tsx
│       ├── WhoIsInOffice.tsx
│       ├── PendingRequestCard.tsx
│       ├── RejectReasonModal.tsx
│       ├── EmployeeTable.tsx
│       ├── AddEmployeeDrawer.tsx
│       ├── AdminAttendanceTable.tsx
│       ├── AdminFilterBar.tsx
│       ├── HolidayCard.tsx
│       ├── ReportConfigPanel.tsx
│       └── AuditTable.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← browser client
│   │   ├── server.ts                  ← server client (cookies)
│   │   └── admin.ts                   ← service role client (API routes only)
│   ├── utils/
│   │   ├── geo.ts                     ← haversine distance calculation
│   │   ├── time.ts                    ← working hours, late check, formatting
│   │   ├── employee-id.ts             ← EMP-001 auto-generation
│   │   └── cn.ts                      ← clsx utility
│   └── email/
│       ├── send-otp.ts
│       └── send-notification.ts
├── types/
│   └── index.ts                       ← all TypeScript interfaces + enums
└── middleware.ts                       ← route protection + role redirect
```

---

## 5. TypeScript Types

All types live in `types/index.ts`. Import from here everywhere. Never define inline types for domain objects.

```ts
// ── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee'
export type EmployeeStatus = 'active' | 'inactive'
export type AttendanceType = 'office' | 'wfh'
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'wfh'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type NotificationType = 'leave' | 'wfh' | 'correction' | 'reminder'
export type ReportType =
  | 'daily'
  | 'monthly'
  | 'employee'
  | 'leave'
  | 'wfh'
  | 'late'

// ── Database Row Types ──────────────────────────────────────────────────────

export interface Profile {
  id: string
  employee_id: string
  full_name: string
  email: string
  phone: string | null
  department: string | null
  designation: string | null
  joining_date: string | null
  role: UserRole
  status: EmployeeStatus
  avatar_url: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  type: AttendanceType
  status: AttendanceStatus
  working_hours: number | null
  late_reason: string | null
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface WFHRequest {
  id: string
  employee_id: string
  date: string
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface CorrectionRequest {
  id: string
  employee_id: string
  date: string
  reason: string
  requested_check_in: string | null
  requested_check_out: string | null
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  created_by: string
  created_at: string
}

export interface AuditLog {
  id: string
  target_type: string
  target_id: string
  employee_id: string
  changed_by: string
  previous_value: Record<string, unknown>
  new_value: Record<string, unknown>
  reason: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface CompanySettings {
  id: string
  company_name: string
  office_address: string
  office_lat: number
  office_lng: number
  allowed_radius_km: number
  office_start_time: string
  office_end_time: string
  grace_period_minutes: number
  logo_url: string | null
  attendance_lock_time: string
  updated_at: string
}

// ── API Response Types ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Joined / Extended Types ─────────────────────────────────────────────────

export interface AttendanceWithProfile extends Attendance {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'department' | 'avatar_url'>
}

export interface LeaveRequestWithProfile extends LeaveRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface WFHRequestWithProfile extends WFHRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface CorrectionRequestWithProfile extends CorrectionRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface AuditLogWithProfiles extends AuditLog {
  affected: Pick<Profile, 'full_name' | 'employee_id'>
  changer: Pick<Profile, 'full_name'>
}
```

---

## 6. Database Schema (PostgreSQL via Supabase)

### Table: `profiles`
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,           -- EMP-001, EMP-002 ...
  full_name text not null,
  email text unique not null,
  phone text,
  department text,
  designation text,
  joining_date date,
  role text not null default 'employee'       -- 'admin' | 'employee'
    check (role in ('admin', 'employee')),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  avatar_url text,
  emergency_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table: `attendance`
```sql
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
  working_hours numeric(5,2),                 -- computed on checkout
  late_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employee_id, date)                   -- one record per employee per day
);
```

### Table: `leave_requests`
```sql
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles(id) on delete cascade,
  leave_type text not null,                   -- casual, sick, earned, emergency
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
```

### Table: `wfh_requests`
```sql
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
```

### Table: `correction_requests`
```sql
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
```

### Table: `holidays`
```sql
create table holidays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null unique,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);
```

### Table: `audit_logs`
```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,                  -- 'attendance' | 'leave' | 'wfh' | 'correction'
  target_id uuid not null,
  employee_id uuid not null references profiles(id),
  changed_by uuid not null references profiles(id),
  previous_value jsonb not null,
  new_value jsonb not null,
  reason text not null,
  created_at timestamptz default now()
  -- NO updated_at — this table is immutable
);
-- No UPDATE or DELETE policies on this table ever.
```

### Table: `notifications`
```sql
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
```

### Table: `company_settings`
```sql
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
  -- Single row only — enforce via app logic
);
```

---

## 7. Supabase Row Level Security (RLS)

Enable RLS on every table. These are the policies.

### `profiles`
```sql
-- Anyone can read their own profile
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

-- Admin can read all profiles
create policy "profiles_select_admin" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admin can insert new profiles (employee creation)
create policy "profiles_insert_admin" on profiles
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admin can update any profile; employee can update only their own non-sensitive fields
create policy "profiles_update_admin" on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id)
  with check (
    -- employees cannot change role, status, email, employee_id, department, designation, joining_date
    auth.uid() = id
  );
```

### `attendance`
```sql
create policy "attendance_select_own" on attendance
  for select using (employee_id = auth.uid());

create policy "attendance_select_admin" on attendance
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "attendance_insert_own" on attendance
  for insert with check (employee_id = auth.uid());

create policy "attendance_update_admin" on attendance
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
-- Employees cannot update attendance directly — must use correction_requests
```

### `leave_requests`, `wfh_requests`, `correction_requests`
```sql
-- Same pattern for all three:
-- SELECT: own rows OR admin
-- INSERT: own rows only (employee_id = auth.uid())
-- UPDATE: admin only (for review)
-- DELETE: none
```

### `holidays`
```sql
-- SELECT: all authenticated users
-- INSERT/DELETE: admin only
```

### `notifications`
```sql
-- SELECT: own notifications only (user_id = auth.uid())
-- INSERT: via service role only (from API routes)
-- UPDATE (is_read): own notifications only
```

### `audit_logs`
```sql
-- SELECT: admin only
-- INSERT: via service role only (from API routes)
-- UPDATE: nobody
-- DELETE: nobody
```

### `company_settings`
```sql
-- SELECT: all authenticated users
-- UPDATE: admin only
```

---

## 8. Supabase Client Setup

### `lib/supabase/client.ts` — browser client
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts` — server client (Server Components + Route Handlers)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### `lib/supabase/admin.ts` — service role client (API routes only — server-side only)
```ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
// Use ONLY in /app/api/** route handlers. Never import in components or pages.
```

---

## 9. Middleware (Route Protection)

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/verify']
const EMPLOYEE_PATHS = ['/dashboard', '/attendance', '/leave', '/wfh', '/correction', '/notifications', '/profile']
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Get role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Employee trying to access admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin accessing root employee routes — redirect to admin dashboard
  if (pathname === '/dashboard' && role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 10. API Route Conventions

Every Route Handler follows this exact pattern:

```ts
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Always verify session first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // Get caller's profile + role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, employee_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }

    // ... business logic

    return NextResponse.json({ data: result, error: null }, { status: 200 })
  } catch (err) {
    console.error('[API Error]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
```

**Rules:**
- Always check auth first — never trust the client.
- Use `createClient()` (anon key) for RLS-enforced queries.
- Use `createAdminClient()` (service role) only when bypassing RLS is needed (e.g., creating notifications for other users, writing audit logs).
- Return `{ data, error }` shape always — never raw data.
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.
- All PATCH/POST requests must validate the request body before hitting DB.

---

## 11. Core Business Logic

### 11a. Check-In Flow

```
Employee clicks "Check In"
  → Modal opens: select Office or WFH

IF Office selected:
  → Browser requests GPS (navigator.geolocation.getCurrentPosition)
  → Calculate distance using Haversine formula:
      distance = haversine(user_lat, user_lng, office_lat, office_lng)
  → IF distance <= allowed_radius_km:
      → POST /api/attendance/checkin with { type: 'office' }
      → Server: create attendance row { date: today, check_in: now(), type: 'office', status: 'present' or 'late' }
      → Late check: if check_in_time > (office_start_time + grace_period_minutes) → status = 'late'
      → If late: prompt optional late reason input
  → IF distance > allowed_radius_km:
      → Show error: "You are X km from the office. Move closer to check in."
      → Offer "Request WFH Instead" button

IF WFH selected:
  → POST /api/wfh (create WFH request, status: pending)
  → Employee sees "WFH request sent. Waiting for admin approval."
  → On admin approval: POST /api/attendance with { type: 'wfh', status: 'wfh' }

Duplicate protection: if attendance row exists for today → do not allow another check-in.
Attendance lock: if current time > attendance_lock_time → check-in not allowed (must use correction).
```

### 11b. Check-Out Flow

```
Employee clicks "Check Out"
  → POST /api/attendance/checkout
  → Server:
      attendance.check_out = now()
      attendance.working_hours = (check_out - check_in) in hours (decimal, 2 places)
      Example: 10:05 AM → 7:12 PM = 9.12 hours
  → Employee sees total working hours on dashboard
```

### 11c. Working Hours Calculation

```ts
// lib/utils/time.ts
export function calcWorkingHours(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round((ms / 1000 / 60 / 60) * 100) / 100  // round to 2 decimals
}

export function isLate(checkInTime: Date, officeStart: string, graceMinutes: number): boolean {
  const [h, m] = officeStart.split(':').map(Number)
  const start = new Date(checkInTime)
  start.setHours(h, m + graceMinutes, 0, 0)
  return checkInTime > start
}
```

### 11d. Haversine Distance

```ts
// lib/utils/geo.ts
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

### 11e. Employee ID Generation

```ts
// lib/utils/employee-id.ts
// Server-side only — call from API route
export async function generateEmployeeId(supabase: SupabaseClient): Promise<string> {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const next = (count ?? 0) + 1
  return `EMP-${String(next).padStart(3, '0')}`  // EMP-001, EMP-002 ...
}
```

### 11f. Audit Log Creation

```ts
// Always called from API routes using adminClient, never from client
export async function writeAuditLog(adminClient, {
  target_type,
  target_id,
  employee_id,
  changed_by,
  previous_value,
  new_value,
  reason,
}) {
  await adminClient.from('audit_logs').insert({
    target_type, target_id, employee_id,
    changed_by, previous_value, new_value, reason,
  })
}
// Called on: admin edits attendance, admin approves/rejects requests
```

### 11g. Notification Creation

```ts
// Server-side only — called after admin actions
export async function createNotification(adminClient, {
  user_id, title, message, type
}) {
  await adminClient.from('notifications').insert({
    user_id, title, message, type, is_read: false
  })
}
// Also send email via Resend for approve/reject actions
```

### 11h. Leave Approval Side Effects

When admin approves a leave request:
1. Update `leave_requests.status = 'approved'`
2. For each date in (start_date → end_date), upsert `attendance` row with `status = 'leave'`
3. Create notification for employee
4. Send email via Resend
5. Write audit log

When admin rejects a leave request:
1. Update `leave_requests.status = 'rejected'`
2. Create notification for employee
3. Send email via Resend

### 11i. WFH Approval Side Effects

When admin approves a WFH request:
1. Update `wfh_requests.status = 'approved'`
2. Upsert `attendance` row: `{ date, type: 'wfh', status: 'wfh', check_in: now() }` — or leave check_in null if not yet checked in
3. Create notification
4. Send email

### 11j. Correction Approval Side Effects

When admin approves a correction request:
1. Read existing `attendance` row for that date
2. Save `previous_value` as JSON
3. Update `attendance` with requested check_in/check_out (if provided), recalculate working_hours
4. Update `correction_requests.status = 'approved'`
5. Write audit log (with previous_value and new_value)
6. Create notification
7. Send email

---

## 12. Email via Resend

### OTP Email
```ts
// lib/email/send-otp.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmail(email: string, otp: string) {
  await resend.emails.send({
    from: 'AttendEase <noreply@yourdomain.com>',
    to: email,
    subject: 'Your login code',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="font-size:18px;font-weight:600;color:#111827;margin-bottom:8px">AttendEase</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">Your one-time login code:</p>
        <div style="background:#EEF2FF;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4F46E5">${otp}</span>
        </div>
        <p style="color:#6B7280;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  })
}
```

### Notification Email
```ts
// lib/email/send-notification.ts
export async function sendNotificationEmail(
  email: string,
  subject: string,
  title: string,
  message: string
) {
  await resend.emails.send({
    from: 'AttendEase <noreply@yourdomain.com>',
    to: email,
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="font-size:16px;font-weight:600;color:#111827">${title}</h2>
        <p style="color:#374151;font-size:14px;margin-top:8px">${message}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications"
           style="display:inline-block;margin-top:20px;background:#4F46E5;color:white;
                  padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px">
          View in AttendEase
        </a>
      </div>
    `,
  })
}
```

---

## 13. Design System

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| Page background | `#F3F4F6` | `bg-[#F3F4F6]` on body and content areas |
| Card / Panel | `#FFFFFF` | All white cards, sidebar, modals |
| Accent | `#4F46E5` | Primary buttons, active nav, links, focus rings |
| Accent hover | `#4338CA` | Hover state on accent elements |
| Accent light | `#EEF2FF` | Active nav bg, badge bg, modal option selected |
| Text primary | `#111827` | Headings, values, names |
| Text secondary | `#374151` | Form labels |
| Text muted | `#6B7280` | Sub-labels, meta info, placeholders |
| Text hint | `#9CA3AF` | Timestamps, disabled text |
| Border | `#E5E7EB` | All card borders, dividers, input borders |
| Border strong | `#D1D5DB` | Table row hover, strong dividers |
| Success | `#16A34A` / bg `#F0FDF4` | Present, approved, active status |
| Warning | `#D97706` / bg `#FFFBEB` | Late, pending |
| Danger | `#DC2626` / bg `#FEF2F2` | Absent, rejected, errors |
| WFH blue | `#2563EB` / bg `#EFF6FF` | WFH status |
| Leave purple | `#7C3AED` / bg `#F5F3FF` | Leave status |

### Typography

```
Font family: Inter (Google Fonts, weights 400 + 500 + 600)
Font smoothing: antialiased

Scale:
  22px / 500   → Dashboard stat numbers
  18px / 600   → Page headings, card headings
  15px / 600   → Topbar title, section titles
  14px / 500   → Modal titles, table data names
  13px / 400   → Body text, form inputs, button labels
  12px / 400   → Badges, sub-labels, date strings
  11px / 400   → Metadata, timestamps, table headers (uppercase)
  10px / 500   → Status pills, tiny labels
```

### Spacing

```
Page content padding:   p-5 (20px)
Card padding:           p-4 or p-5 (16–20px)
Card gap:               gap-4 (16px) between cards
Section gap:            gap-3 (12px) between items in a section
Input padding:          px-3 py-2.5
Button padding:         px-4 py-2 (normal), px-5 py-2.5 (large)
```

### Border Radius

```
Cards, panels, modals, drawers:   rounded-xl (12px)
Buttons:                          rounded-lg (8px)
Inputs, selects:                  rounded-md (6px)
Status pills, badges:             rounded-full
Avatar circles:                   rounded-full
Small icon squares:               rounded-lg (8px)
```

### Shadows

**None.** Elevation is communicated by border only: `border border-[#E5E7EB]`.
Do not use `shadow-*` classes. Do not add box-shadow.

### Animations

Only CSS transitions. No Framer Motion. No keyframe animations except:
- `animate-spin` for loading spinners
- `animate-pulse` for the green "working" dot on check-in card

All transitions: `transition-colors duration-150`
Do not use `transition-all` — only transition specific properties.

### Component Patterns

**Cards:**
```
bg-white border border-[#E5E7EB] rounded-xl p-4
```

**Primary Button:**
```
bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] font-medium
transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2
```

**Outline Button:**
```
border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg px-4 py-2 text-[13px]
transition-colors duration-150
```

**Ghost Button:**
```
text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg px-3 py-1.5 text-[13px]
transition-colors duration-150
```

**Input / Select / Textarea:**
```
w-full border border-[#E5E7EB] rounded-md px-3 py-2.5 text-[13px] text-[#111827]
placeholder:text-[#9CA3AF] bg-white
focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none
transition-colors duration-150
```

**Label:**
```
block text-[12px] font-medium text-[#374151] mb-1.5
```

**Status Pills:**
```
Present:  bg-[#F0FDF4] text-[#16A34A]
Late:     bg-[#FFFBEB] text-[#D97706]
Absent:   bg-[#FEF2F2] text-[#DC2626]
WFH:      bg-[#EFF6FF] text-[#2563EB]
Leave:    bg-[#F5F3FF] text-[#7C3AED]
Pending:  bg-[#FFFBEB] text-[#D97706]
Approved: bg-[#F0FDF4] text-[#16A34A]
Rejected: bg-[#FEF2F2] text-[#DC2626]

Size: px-2.5 py-0.5 rounded-full text-[10px] font-medium
```

**Loading Spinner:**
```
w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin
```

**Toast:**
```
Fixed bottom-right, p-4
Card: bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center gap-2
Auto-dismiss: 3000ms
Max 3 toasts at once (remove oldest if exceeded)
```

**Overlay (Modals/Drawers):**
```
fixed inset-0 bg-black/40 z-40
```

**Modal container:**
```
fixed inset-0 flex items-center justify-center z-50 px-4
Card: bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-md
```

**Drawer (right side panel):**
```
fixed right-0 top-0 h-full w-[420px] bg-white border-l border-[#E5E7EB] z-50
CSS transition: translate-x-full → translate-x-0, 200ms ease
```

**Skeleton loaders:**
```
bg-[#F3F4F6] animate-pulse rounded-md
Use on all data-dependent sections while loading
```

**Empty states:**
```
flex flex-col items-center justify-center py-16 text-center
Icon: 40px lucide icon text-[#D1D5DB]
Heading: text-[14px] font-medium text-[#374151] mt-3
Sub: text-[13px] text-[#6B7280] mt-1
CTA: outline button mt-4
```

---

## 14. Layout System

### Sidebar (shared — 200px wide, fixed)

```
w-[200px] bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0
```

**Logo area** (p-4, border-b):
- "AttendEase" — 15px, font-semibold, #111827
- "Startup Edition" or "Admin Panel" — 11px, #6B7280

**Nav items:**
```
Default:  flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#6B7280]
          hover:bg-[#F3F4F6] transition-colors duration-150
Active:   bg-[#EEF2FF] text-[#4F46E5]
Badge:    ml-auto bg-[#DC2626] text-white text-[10px] px-1.5 py-0.5 rounded-full
```

**Employee nav items:** Dashboard, Attendance, Leave, Work from home, Corrections, Notifications

**Admin nav items:** Dashboard, Employees, Attendance, Requests, (divider: MANAGE), Holidays, Reports, Audit log, Settings

**Avatar row** (p-3, border-t):
- Avatar circle: w-8 h-8 rounded-full, initials, bg-[#EEF2FF] text-[#4F46E5]
- Name: 12px font-medium
- Role: 10px text-muted

### Main area

```
ml-[200px] flex flex-col min-h-screen
```

**Topbar** (h-[52px], sticky, bg-white, border-b, px-5, flex items-center justify-between):
- Left: page title (15px font-semibold)
- Right: date chip + notification bell (employee) OR date chip + primary action button (admin)

**Content area:**
```
flex-1 overflow-y-auto p-5 bg-[#F3F4F6]
```

---

## 15. Page Specifications

### Employee: Dashboard (`/dashboard`)

Sections (top to bottom):
1. **CheckInCard** — full-width, 3 states: idle / working / done
2. **Stats row** — 4 cards: Present days, Late days, Leaves taken, WFH days (current month)
3. **Bottom grid** (2 columns): Attendance calendar (left) + My requests panel (right)

CheckInCard states:
- `idle`: "Not checked in yet" + Check In button (indigo)
- `working`: green dot + "In Office" / "Working from home" + live timer + Check Out button (red outline)
- `done`: "Day complete" + total hours + status badge

CheckInModal flow:
- Open on Check In click
- Select Office or WFH cards
- If Office: → location verifying → success/error
- If WFH: → submit WFH request → modal closes

### Employee: Attendance (`/attendance`)

Layout: FilterBar on top, then grid-cols-[380px_1fr]
- Left: large calendar with clickable days
- Right: attendance table (date, type, check-in, check-out, hours, status)
- Clicking calendar day with data → DayDetailModal

### Employee: Leave, WFH, Correction

All 3 pages: PageHeader + list of RequestCards + Apply modal
RequestCard: icon + type + dates + reason (truncated) + status pill

### Admin: Dashboard (`/admin/dashboard`)

1. Stats row (6 cards): Total, Present, Absent, Late, WFH, Leave
2. Main grid (2 cols):
   - Left: Pending requests with tabs (Leave / WFH / Correction) + inline approve/reject
   - Right: Who's in office now (live employee list)
3. Quick actions row (3 cards): Add employee, Generate report, Add holiday

### Admin: Employees (`/admin/employees`)

SearchFilterBar + EmployeeTable + AddEmployeeDrawer (right slide-in panel)
Table columns: Employee (avatar+name+email), ID, Department, Designation, Joining Date, Status, Actions
Add/Edit: drawer with all fields, read-only Employee ID field (auto-generated)

### Admin: Requests (`/admin/requests`)

Tabbed page: Leave | WFH | Correction
Each tab: list of pending requests with inline Approve + Reject buttons
Reject → RejectReasonModal → reason required → confirm

### Admin: Attendance (`/admin/attendance`)

AdminFilterBar (employee, dept, month, status, export button)
Summary strip: Present X · Late X · Absent X · WFH X · Leave X
AdminAttendanceTable: Employee, Date, Type, Check In, Check Out, Hours, Status, Edit
Edit → inline modal with old/new values + reason + audit trail warning

### Admin: Reports (`/admin/reports`)

2-column layout:
- Left config panel: report type selector (card-based) + dynamic filters + Generate button
- Right preview: empty state → table → Export PDF/Excel buttons

### Admin: Audit Log (`/admin/audit`)

Warning banner at top (immutable notice)
FilterBar: date range + employee
AuditTable: Date & Time, Employee Affected, Changed By, Change Type, Previous → Updated, Reason
No edit/delete anywhere on this page

### Admin: Settings (`/admin/settings`)

4 section cards:
1. Company Info (name, address, logo)
2. Office Location (lat, lng, radius slider)
3. Working Hours (start, end, grace period)
4. Attendance Lock (lock time)
Sticky save bar: appears when form is dirty, "Discard" + "Save changes"

---

## 16. Non-Negotiable UX Rules

1. No full-page navigation for quick actions — add employee, apply leave, approve request → modals or drawers
2. Check In = one prominent full-width card at top of employee dashboard
3. GPS flow is silent — show spinner + plain message, never show lat/lng to user
4. Skeleton loaders on all data-heavy pages — never blank screens
5. Toast for every action — success and error both — auto-dismiss 3s
6. Status badges always colored — never plain text
7. Empty states always have a CTA: "No leave requests yet. Apply for leave →"
8. Admin request list: pending first, newest at top
9. Calendar day click → detail modal — no separate page navigation
10. Destructive actions always need confirmation dialog: deactivate employee, delete holiday, reject request
11. All modals close on: overlay click, Escape key, Cancel button
12. All forms validate before submit — show inline errors, not alerts
13. Disabled buttons on loading — no double-submit possible
14. Pagination: 20 rows per page on all tables

---

## 17. What NOT to Do

- Do not use Framer Motion or any animation library
- Do not add `shadow-*` classes (no box shadows)
- Do not use `transition-all` — only `transition-colors`
- Do not fetch data in client components without loading states
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` to the browser
- Do not use `localStorage` for session management — Supabase handles cookies
- Do not add new npm packages without checking this file first
- Do not skip audit log creation when admin modifies attendance
- Do not allow employees to modify other employees' data — RLS enforces this
- Do not use `<form>` with default submit behavior — always `e.preventDefault()`
- Do not add `console.log` in production code
- Do not use `any` TypeScript type — use proper types from `types/index.ts`
- Do not hardcode company settings (office lat/lng, timings) — always read from `company_settings` table

---

## 18. Development Phases Summary

| Phase | Scope |
|---|---|
| 1 | Project setup + Login + OTP verify pages |
| 2 | Employee layout + Employee dashboard (check-in card, calendar, stats) |
| 3 | GPS check-in modal flow + Attendance history page |
| 4 | Leave + WFH + Correction pages (employee) |
| 5 | Admin layout + Admin dashboard + Requests approval |
| 6 | Admin employee management + Admin attendance page |
| 7 | Holidays + Notifications + Profile + Settings |
| 8 | Reports + Audit log |
| 9 | Supabase integration (replace all mock data with real API calls) |
| 10 | Resend email integration + GPS integration + Testing + Deploy |

Phases 1–8: pure UI with mock data, no real API calls.
Phase 9–10: connect everything to Supabase + Resend + deploy to Vercel.
