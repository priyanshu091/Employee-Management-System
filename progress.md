# Progress Log — Employee Attendance Management System

> Tracks what's been done, phase by phase. Updated after every task.
> See [CLAUDE.md](./CLAUDE.md) for full spec.

---

## Phase 1 — Project Setup + Auth UI — ✅ DONE (2026-07-08)

### What was built
- Next.js project scaffolded at `attendance-system/` (App Router, TypeScript, Tailwind, ESLint).
- Global design tokens wired into `app/globals.css` via Tailwind v4 `@theme` (colors, font, radius) — matches CLAUDE.md §13 color/typography spec.
- `app/layout.tsx`, `app/page.tsx` (redirects to `/auth/login`).
- `lib/utils.ts` — `cn()` helper via clsx.
- `components/auth/OTPInput.tsx` — 6-box OTP with auto-advance, backspace, arrow-key nav, paste support.
- `components/auth/ResendTimer.tsx` — 60s countdown, resend button enable/disable.
- `app/auth/login/page.tsx` — email validation, inline errors, loading spinner, sessionStorage handoff.
- `app/auth/verify/page.tsx` — masked email, OTP verify (demo OTP `123456`), error/success states, redirect to `/dashboard`.
- `proxy.ts` (see version note below) — passthrough middleware, public paths allowlist.
- Placeholder `(employee)` and `(admin)` route groups + layouts.
- Placeholder dashboards: employee at `/dashboard`, admin at `/admin/dashboard`.

### Deviations from the original Phase 1 prompt (and why)
1. **Next.js 16 + Tailwind CSS 4, not 14.x/3.x.** The `create-next-app` available at project start installs these by default. User chose to keep current tooling rather than force a downgrade. **Root [CLAUDE.md](./CLAUDE.md) §2 has been updated** to reflect this, with a version note explaining the knock-on effects:
   - No `tailwind.config.ts` — config lives in `app/globals.css` via `@theme { ... }`.
   - `middleware.ts` → renamed `proxy.ts` in Next 16 (exports `proxy` instead of `middleware`, same `matcher` config). Every future phase instruction that says "middleware.ts" means `proxy.ts` now.
   - Confirmed via `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` in the installed Next 16 package.
2. **Admin dashboard route fixed to avoid a path collision.** The original prompt put a `page.tsx` directly under both `(employee)/dashboard` and `(admin)/dashboard` — but Next.js route groups don't affect the URL, so both resolved to `/dashboard` and the build failed ("You cannot have two parallel pages that resolve to the same path"). Fixed by moving the admin placeholder to `app/(admin)/admin/dashboard/page.tsx` → `/admin/dashboard`, consistent with CLAUDE.md's own middleware spec (§9) which already redirects admins to `/admin/dashboard`.

### Verification performed
- `npm run build` — zero errors, 6 static routes generated (`/`, `/admin/dashboard`, `/auth/login`, `/auth/verify`, `/dashboard`, plus `/_not-found`).
- Ran the dev server and drove it end-to-end with Playwright (headless Chromium):
  - Root `/` → redirects to `/auth/login` ✅
  - Body font is `Inter, sans-serif`, background `rgb(243, 244, 246)` (`#F3F4F6`) ✅
  - Invalid email → inline red error, no page reload ✅
  - Valid email → spinner → navigates to `/auth/verify` ✅
  - Email correctly masked (e.g. `te**@company.com`) ✅
  - OTP typing auto-advances focus; paste fills all 6 boxes ✅
  - Wrong OTP → boxes turn red, error message shown, boxes clear ✅
  - Correct OTP (`123456`) → green checkmark success screen → redirects to `/dashboard` ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system (white card, indigo `#4F46E5` accent, no shadows, `rounded-xl` card).

### Known placeholders (expected — later phases fill these in)
- `/dashboard` and `/admin/dashboard` are static placeholder cards only.
- OTP verify uses a hardcoded demo code (`123456`), not real Supabase Auth — wired up in Phase 9.
- `proxy.ts` has no real session/role check yet — added in Phase 9.

---

## Phase 2 — Employee Layout + Dashboard — ✅ DONE (2026-07-08)

- [x] `types/index.ts` — all domain types created (enums, DB row types, API response types, joined/extended types)
- [x] `lib/utils/time.ts` — time utilities (greeting, formatters, live timer, working-hours calc, late check)
- [x] `lib/utils/cn.ts` — clsx utility, relocated from `lib/utils.ts` (see deviation note below)
- [x] `components/shared/Toast.tsx` — global toast system with context, max 3 toasts, auto-dismiss 3s
- [x] `components/shared/StatusBadge.tsx` — all attendance + request statuses
- [x] `components/shared/Avatar.tsx` — initials avatar with rotating colors
- [x] `components/shared/EmptyState.tsx` — reusable empty state
- [x] `components/shared/ConfirmDialog.tsx` — reusable confirm dialog
- [x] `components/employee/EmployeeSidebar.tsx` — sidebar with active nav state, mock user
- [x] `components/employee/EmployeeTopbar.tsx` — topbar with greeting + date chip + notification bell
- [x] `app/(employee)/layout.tsx` — employee shell with sidebar + toast provider
- [x] `components/employee/CheckInModal.tsx` — 4-state modal (select/verifying/success/error)
- [x] `components/employee/CheckInCard.tsx` — 3-state card (idle/working/done) with live timer
- [x] `components/employee/AttendanceCalendar.tsx` — custom month calendar with color-coded dots, mock July 2026 data
- [x] `components/employee/RequestCard.tsx` — reusable request row
- [x] `app/(employee)/dashboard/page.tsx` — full dashboard with all sections
- [x] `npm run build` — zero errors

### Deviation from the original Phase 2 prompt (and why)
- **`lib/utils.ts` → `lib/utils/cn.ts`.** Phase 1 had already created `lib/utils.ts` (a file) with the `cn()` helper. CLAUDE.md's folder structure (§4) specifies `lib/utils/` as a directory containing `cn.ts`, `time.ts`, `geo.ts`, `employee-id.ts`. Relocated the existing helper into that directory structure and updated its one import site (`components/auth/OTPInput.tsx`) so future phases (`geo.ts`, `employee-id.ts`) have a consistent home.

### Verification performed
- `npm run build` — zero TypeScript errors, all routes compile.
- Ran the dev server and drove `/dashboard` end-to-end with headless Chromium (Playwright):
  - Sidebar renders all 6 nav items, Dashboard correctly marked active ✅
  - Topbar shows time-based greeting, date chip, notification bell ✅
  - CheckInCard idle state → Check In button → modal opens ✅
  - Office selected → Confirm → verifying spinner → success/error state (randomized, both paths exercised) ✅
  - Confirming check-in → card switches to working state with green pulsing dot + live timer ✅
  - Check Out → card switches to done state with total hours + status badge ✅
  - Toast appears bottom-right on check-in/check-out actions ✅
  - Stats row renders 4 cards ✅
  - Calendar highlights today (indigo) and shows color-coded dots for mock July 2026 data ✅
  - My Requests panel renders all 4 mock requests with correct icons/status pills ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system (no shadows, correct color tokens, `rounded-xl` cards).

### Known placeholders (expected — later phases fill these in)
- All dashboard data is mocked (stats, requests, calendar attendance) — replaced with real Supabase queries in Phase 9.
- GPS check-in is simulated (random success/error) — replaced with real `navigator.geolocation` + Haversine calc in Phase 10.
- Sidebar user (`Rahul Kumar`) is hardcoded — replaced with real session data in Phase 9.

---

## Phase 3 — Attendance History Page — ✅ DONE (2026-07-08)

- [x] `lib/mock/attendance.ts` — centralized mock attendance data with lookup map (single source of truth for calendar + table)
- [x] `components/shared/PageHeader.tsx` — reusable page header with optional action button
- [x] `components/shared/SkeletonRow.tsx` — table skeleton loader
- [x] `components/employee/AttendanceFilterBar.tsx` — month, year, status filters
- [x] `components/employee/AttendanceTable.tsx` — full table with empty state + row count footer
- [x] `components/employee/DayDetailModal.tsx` — day detail popup with Escape + overlay close
- [x] `components/employee/AttendanceCalendar.tsx` — updated to use shared mock data + `size` prop (`compact`/`full`)
- [x] `components/employee/CheckInModal.tsx` — added Escape-key close (was missing in Phase 2)
- [x] `app/(employee)/attendance/page.tsx` — full page with summary strip + two-column layout
- [x] `npm run build` — zero errors

### Notes
- Dashboard's `AttendanceCalendar` usage (Phase 2) needed no changes — it didn't pass `onDayClick`, so the signature change (`(date, status)` → `(day: MockAttendanceDay)`) was non-breaking there.
- Calendar dot data and table rows now read from the same `lib/mock/attendance.ts` source, so they can never drift out of sync — verified by clicking the same day via both calendar and table and confirming identical modal data.

### Verification performed
- `npm run build` — zero TypeScript errors, `/attendance` route compiles as static.
- Ran the dev server and drove `/attendance` end-to-end with headless Chromium (Playwright):
  - Filter bar, summary strip, and two-column layout all render ✅
  - Default view (July 2026, All statuses) shows 15 rows; summary strip counts (Present 9, Late 2, Absent 1, WFH 1, Leave 2) match table exactly ✅
  - Calendar month nav (July ↔ August) changes independently of table filters, no crash ✅
  - Status filter "Late" → table narrows to 2 rows ✅
  - Month filter "June 2026" → table shows empty state ("No records found") ✅
  - Clicking a calendar day with data opens `DayDetailModal` with correct date/check-in/check-out/hours/type ✅
  - Clicking a table row opens the same modal with matching data ✅
  - Escape key and overlay click both close the modal ✅
  - At 480px viewport: table scrolls horizontally inside its own container (`scrollWidth 560 > clientWidth 238`), page-level horizontal overflow is false (no layout breakage) ✅
  - At 768px viewport: calendar and table stack vertically ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system.

### Known placeholders (expected — later phases fill these in)
- Attendance data is still fully mocked — replaced with real Supabase queries in Phase 9.
- Filter bar year options are hardcoded to `[2025, 2026]` — fine for now, revisit if historical range grows.

---

## Phase 4 — Leave, WFH & Correction Pages — ✅ DONE (2026-07-08)

- [x] `lib/mock/requests.ts` — centralized mock data for all 3 request types
- [x] `components/shared/FormField.tsx` — reusable label + input wrapper with error state, exports `INPUT_CLASS`/`INPUT_ERROR_CLASS`
- [x] `components/shared/InfoBox.tsx` — blue info note box
- [x] `components/shared/ModalShell.tsx` — reusable modal wrapper (overlay + header + Escape close)
- [x] `components/employee/FullRequestCard.tsx` — detailed request card with optional extra info
- [x] `components/employee/ApplyLeaveModal.tsx` — leave type, date range, duration pill, reason, validation
- [x] `components/employee/ApplyWFHModal.tsx` — date, reason, info box
- [x] `components/employee/ApplyCorrectionModal.tsx` — date, reason, optional timings, info box
- [x] `app/(employee)/leave/page.tsx` — list + apply modal + optimistic add + toast
- [x] `app/(employee)/wfh/page.tsx` — list + apply modal + optimistic add + toast
- [x] `app/(employee)/correction/page.tsx` — list + apply modal + optimistic add + toast
- [x] `npm run build` — zero errors

### Verification performed
- `npm run build` — zero TypeScript errors, `/leave`, `/wfh`, `/correction` all compile as static routes.
- Ran the dev server and drove all three pages end-to-end with headless Chromium (Playwright), 24-point checklist from the phase prompt:
  - Leave page: 6 mock cards render, "Apply for leave" opens modal, leave-type dropdown has 4 options, empty submit shows inline errors (no native `alert`), selecting start+end dates shows the indigo "Duration: X days" pill, submit → spinner → modal closes → new Pending card at top of list → toast shown ✅
  - WFH page: 4 mock cards, date picker `min` = today, blue InfoBox visible, submit → new Pending card at top → toast shown ✅
  - Correction page: 3 mock cards (existing ones show `Check-in: … · Check-out: …` extra info), date picker `max` = yesterday, check-in/check-out optional (submitted successfully with both blank), InfoBox mentions audit trail, submit → new Pending card at top → toast shown ✅
  - All 3 modals: overlay click, Escape key, and Cancel button each close the modal independently; submit button disabled during the loading spinner (no double-submit) ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system (status pill colors, card borders, toast styling all correct).

### Known placeholders (expected — later phases fill these in)
- All request data is fully mocked and held in local component state — replaced with real Supabase queries/mutations in Phase 9.
- New requests submitted client-side are not persisted across reloads (expected until Phase 9).

---

## Phase 5 — Admin Layout + Dashboard — ✅ DONE (2026-07-08)

- [x] `lib/mock/admin.ts` — dashboard stats, pending requests, office presence mock data
- [x] `components/admin/AdminSidebar.tsx` — sidebar with section divider, pending badge, admin role badge
- [x] `components/admin/AdminTopbar.tsx` — topbar with action slot
- [x] `app/(admin)/layout.tsx` — admin shell with ToastProvider
- [x] `components/admin/StatCard.tsx` — dot + number + label
- [x] `components/admin/RejectReasonModal.tsx` — rejection reason with validation, reuses `ModalShell`
- [x] `components/admin/PendingRequestsPanel.tsx` — tabbed panel, approve/reject, live count update
- [x] `components/admin/WhoIsInOffice.tsx` — presence list with overflow count
- [x] `components/admin/QuickActionCard.tsx` — hover-bordered shortcut card
- [x] `app/(admin)/admin/dashboard/page.tsx` — full dashboard wired together
- [x] Placeholder pages for all 7 remaining admin routes (no 404s)
- [x] `npm run build` — zero errors

### Deviation from the original Phase 5 prompt (and why)
- **Route files placed under `app/(admin)/admin/**`, not `app/(admin)/**`.** The prompt's file paths (e.g. `app/(admin)/dashboard/page.tsx`, `app/(admin)/employees/page.tsx`) omit the `/admin` path segment. Phase 1 already established `app/(admin)/admin/dashboard/page.tsx` → `/admin/dashboard` specifically to avoid a route collision with the employee `/dashboard` page (route groups don't affect URLs — see Phase 1's deviation note). All Phase 5 admin pages (dashboard, employees, attendance, requests, holidays, reports, audit, settings) were placed at `app/(admin)/admin/**` to stay consistent with that fix and with `AdminSidebar`'s `/admin/*` hrefs and `proxy.ts`'s `/admin` path matcher (CLAUDE.md §9).

### Verification performed
- `npm run build` — zero TypeScript errors, all 8 admin routes (`/admin/dashboard`, `/admin/employees`, `/admin/attendance`, `/admin/requests`, `/admin/holidays`, `/admin/reports`, `/admin/audit`, `/admin/settings`) compile as static routes.
- Ran the dev server and drove `/admin/dashboard` end-to-end with headless Chromium (Playwright), 23-point checklist from the phase prompt:
  - Sidebar shows "FeelifyEMS / Admin Panel" logo, all 8 nav items with Requests badge (6), MANAGE section divider, active-nav indigo highlight, admin avatar row with red "Admin" badge ✅
  - All 7 non-dashboard admin routes return HTTP 200 (no 404s) ✅
  - 6 stat cards render with correct colored dots and values matching mock data exactly (24/18/2/3/4/1) ✅
  - Pending requests panel: Leave tab active by default with 3 requests (Rahul Kumar, Sneha Verma, Mohit Jain); switching to WFH (2) and Correction (1) tabs shows correct filtered requests and counts ✅
  - Approve: item disappears from list, success toast "Approved — [Name]", tab count decrements ✅
  - Reject: opens `RejectReasonModal` with employee name; empty reason blocked with inline error (modal stays open, no native alert); confirming closes modal, removes item, shows error-styled toast "Rejected — [Name]" ✅
  - After clearing all requests in the Leave tab: "No pending requests" empty state shown, tab badge disappears ✅
  - Who's in office: 5 employees with avatar/name/department/check-in time, "And 7 more in office" text, "12 in" green badge ✅
  - Quick action cards link to `/admin/employees`, `/admin/reports`, `/admin/holidays` ✅
  - Zero browser console errors throughout ✅
- Screenshot confirms pixel-accurate match to CLAUDE.md §13 design system, including stacked toasts (max 3, auto-dismiss).

### Known placeholders (expected — later phases fill these in)
- Employees, Attendance, Requests, Holidays, Reports, Audit log, Settings admin pages are static placeholders — built in Phases 6–8.
- All dashboard data (stats, pending requests, office presence) is mocked and held in local state — replaced with real Supabase queries in Phase 9.
- Admin user (`Ajay Singh`) is hardcoded — replaced with real session data in Phase 9.

---

## Phase 6 — Admin Employees + Attendance Pages — ✅ DONE (2026-07-08)

- [x] `lib/mock/employees.ts` — 12 mock employees + 20 admin attendance rows
- [x] `components/admin/SearchFilterBar.tsx` — reusable search + selects + right slot
- [x] `components/admin/AddEmployeeDrawer.tsx` — slide-in drawer, validation, auto-generated read-only ID
- [x] `components/admin/EmployeeTable.tsx` — table with pagination (10/page), status toggle, deactivate confirm
- [x] `components/admin/EditAttendanceModal.tsx` — edit check-in/out with audit note
- [x] `components/admin/AdminAttendanceTable.tsx` — table with pencil edit per row
- [x] `app/(admin)/admin/employees/page.tsx` — search + filter + table + drawer wired
- [x] `app/(admin)/admin/attendance/page.tsx` — filter + summary strip + table wired
- [x] `npm run build` — zero errors

### Deviations from the original Phase 6 prompt (and why)
1. **Files placed under `app/(admin)/admin/**`, not `app/(admin)/**`.** Same reasoning as Phase 5 — the existing placeholders (from Phase 5) already live at `app/(admin)/admin/employees/page.tsx` and `app/(admin)/admin/attendance/page.tsx` to avoid the route-group collision described in Phase 1. Edited those files in place rather than creating new ones at the paths literally given in the prompt.
2. **Fixed a type error in the prompt's own `AddEmployeeDrawer.tsx` code.** It referenced `error={errors.phone}` on the phone field, but `DrawerFormErrors` never declares a `phone` property (phone is optional and never validated) — `npm run build` failed with "Property 'phone' does not exist on type 'DrawerFormErrors'." Removed the dead `error` prop rather than inventing a phone validation rule that doesn't exist elsewhere in the spec.
3. **`app/(admin)/admin/employees/page.tsx` simplified `onEdit`** to just reopen the (add-only) drawer, and dropped the unused `editTarget` state — the prompt's own `AddEmployeeDrawer` has no prop to seed initial values for editing, so wiring up `editTarget` would have been dead state with no effect. Real edit-with-prefill is left for Phase 9 when the drawer talks to Supabase.

### Verification performed
- `npm run build` — zero TypeScript errors, all routes compile.
- Ran the dev server and drove both pages end-to-end with headless Chromium (Playwright):
  - **Employees**: 12 mock employees (10/page), search by name and by ID both filter correctly, department filter ("Engineering" → 4), status filter ("Inactive" → Rohan Gupta + Sonal Desai), combined filters (HR + Inactive → Sonal Desai only), pagination ("Showing 1–10 of 12", Prev/Next work, page 2 shows the remaining 2) ✅
  - Add-employee drawer: slides in from the right (`translate-x-full` → `translate-x-0`), Employee ID field pre-fills `EMP-013` and is read-only, empty name and invalid email both show inline errors (no native alerts), valid submit → drawer slides closed → new employee appears at the top of the list → success toast ✅; Escape key also closes the drawer ✅
  - Deactivate flow: "..." menu → Deactivate → `ConfirmDialog` → confirm → status badge flips to grey "Inactive" → toast ✅
  - **Attendance**: 20 rows by default, summary strip counts (Present 10, Late 4, Absent 2, WFH 3, Leave 1) match the visible table exactly, month filter, status filter ("Late" → all 4 late records, not 3 as the phase prompt's own checklist stated — the prompt's checklist undercounted its own mock data; verified the filter is correct against the actual `ADMIN_ATTENDANCE` array), and name/ID search all narrow rows correctly ✅
  - Edit-attendance modal: shows employee name + date subtitle, empty reason blocked with inline error, valid save → modal closes → toast "Attendance updated and logged in audit trail." ✅; Export button shows the expected placeholder toast ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system.

### Known placeholders (expected — later phases fill these in)
- All employee and attendance data is mocked and held in local state — replaced with real Supabase queries/mutations in Phase 9.
- Editing an existing employee's details (vs. adding a new one) is not yet wired — the drawer is add-only until Phase 9.
- Export button shows a placeholder toast — real PDF/Excel export (jsPDF/SheetJS) arrives in Phase 10.

---

## Phase 7 — Holidays, Notifications, Profile, Settings — ✅ DONE (2026-07-08)

- [x] `lib/mock/misc.ts` — holidays, notifications, settings defaults
- [x] `components/admin/HolidayCard.tsx` — date block, upcoming/past badge, delete
- [x] `components/admin/AddHolidayModal.tsx` — name + date, validation
- [x] `app/(admin)/admin/holidays/page.tsx` — sorted list, summary strip, delete confirm, empty state
- [x] `components/employee/NotificationItem.tsx` — unread border + dot, type-based icon
- [x] `app/(employee)/notifications/page.tsx` — mark read on click, mark all read
- [x] `app/(employee)/profile/page.tsx` — two-column, edit/save personal info, read-only company info
- [x] `app/(admin)/admin/settings/page.tsx` — 4 cards, radius slider, dirty-aware sticky save bar
- [x] `npm run build` — zero errors

### Deviation from the original Phase 7 prompt (and why)
- **Holidays and Settings files placed under `app/(admin)/admin/**`, not `app/(admin)/**`.** Same reasoning as Phases 5–6 — the existing placeholders already live at `app/(admin)/admin/holidays/page.tsx` and `app/(admin)/admin/settings/page.tsx` to avoid the route-group collision from Phase 1. Edited those files in place. Notifications and Profile had no prior placeholder, so `app/(employee)/notifications/` and `app/(employee)/profile/` were created fresh (these are correct at the bare path per CLAUDE.md's employee route convention).

### Verification performed
- `npm run build` — zero TypeScript errors, all 4 new/updated routes (`/admin/holidays`, `/notifications`, `/profile`, `/admin/settings`) compile.
- Ran the dev server and drove all four pages end-to-end with headless Chromium (Playwright):
  - **Holidays**: 8 holidays shown, sorted upcoming-first then past (both chronological), summary strip counts correct, delete → `ConfirmDialog` → confirm → card removed + toast, add-holiday modal validates empty name, valid submit → new card added + toast ✅
  - **Notifications**: 7 items, 3 unread (bold + left indigo border + blue dot), "3 unread" badge, clicking one marks it read and decrements the badge, "Mark all as read" clears all remaining unread state and makes the button/badge disappear, topbar bell's red dot clears too ✅
  - **Profile**: two-column layout, avatar shows "RK" initials, Employee ID/joined/email/status all correct, Edit → input fields appear → Save → spinner → value persists + toast; Cancel discards changes and restores the original value; Company Information section has no Edit button (read-only) ✅
  - **Settings**: 4 section cards, sticky save bar hidden until the form is dirty, radius slider moves in 0.5 km steps with the live indigo label (verified via keyboard arrow-key interaction — a raw DOM `.value=` + dispatchEvent doesn't go through React's controlled-input pipeline for range inputs, a known gotcha), Discard resets the form and hides the bar, Save shows a spinner then a toast and hides the bar, and the bar respects the `left-[200px]` sidebar offset ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system.

### Known placeholders (expected — later phases fill these in)
- All holiday, notification, profile, and settings data is mocked and held in local state — replaced with real Supabase queries/mutations in Phase 9.
- "Change photo" and the settings logo upload box are visual-only — real Supabase Storage upload wiring arrives in Phase 9/10.

---

## Phase 8 — Reports + Audit Log (Final UI Phase) — ✅ DONE (2026-07-08)

- [x] `lib/mock/reports.ts` — report rows for all 6 types + 15 audit log entries
- [x] `components/admin/ReportTypeSelector.tsx` — card-based selector, not dropdown
- [x] `components/admin/ReportFilters.tsx` — dynamic filters per report type
- [x] `components/admin/ReportPreview.tsx` — empty state + 5 table variants + export toolbar
- [x] `app/(admin)/admin/reports/page.tsx` — config panel + preview wired, generate with spinner
- [x] `components/admin/AuditTable.tsx` — paginated, immutable, previous red / new green
- [x] `app/(admin)/admin/audit/page.tsx` — amber warning banner, filter bar, apply button, clear filters
- [x] `npm run build` — zero errors
- [x] **ALL 8 UI PHASES COMPLETE — ready for Phase 9 Supabase integration**

### Deviations from the original Phase 8 prompt (and why)
1. **Files placed under `app/(admin)/admin/**`, not `app/(admin)/**`.** Consistent with Phases 5–7 — edited the existing `app/(admin)/admin/reports/page.tsx` and `app/(admin)/admin/audit/page.tsx` placeholders rather than creating new files at the paths literally given in the prompt.
2. **No `as any` casts.** The prompt's `lib/mock/reports.ts` cast leave/WFH row statuses with `status: 'approved' as any`, and `ReportPreview.tsx`'s `LeaveWFHTable` cast them again with `variant={r.status as any}` — both violate CLAUDE.md §17 ("Do not use `any` TypeScript type"). Fixed by typing `ReportRow.status` as `AttendanceStatus | RequestStatus` (both already exist in `types/index.ts`), which `StatusBadge` already accepts without any cast.
3. **`AuditTable` now resets to page 1 whenever its `entries` prop changes.** The original code kept whatever page the user was on across re-filters — if a user was on page 2 (11–15) and then applied a filter that narrowed results to under 11 entries, they'd land on an empty page with no way back except manually clicking "Prev" (a real UX bug, not just a style nit). Added a `useEffect` that resets `page` to 1 on every `entries` change.

### Verification performed
- `npm run build` — zero TypeScript errors, all 21 routes across all 8 phases compile.
- Ran the dev server and drove both pages end-to-end with headless Chromium (Playwright), covering all 33 checklist items from the phase prompt:
  - **Reports**: 6 type cards, empty state by default, selecting a type highlights it and reveals the matching dynamic filter set (date picker for Daily; employee + date range for Employee-wise; month/year/department for Monthly, Leave, WFH, Late), switching types resets the preview to empty, Generate shows a spinner then renders the correct table variant for each of the 6 report types with matching summary rows (Daily 8+1, Monthly 8+1, Employee-wise 5+1, Leave 5+1, WFH 4+1, Late 5+1 with amber check-in pills), both PDF and Excel buttons show the expected placeholder toast ✅
  - **Audit log**: amber immutability banner, 15 entries paginated 10/5 across 2 pages with correct Prev/Next disabled-states and "Showing X–Y of 15 entries" footer text, previous values in red / new values in green / change-type grey pills, reason column truncates with a `title` tooltip, zero edit/delete controls anywhere on the page, filtering by employee (Rahul Kumar → 2 entries) and by date range (1–8 Jul → 8 entries) both work via the explicit "Apply filter" button (not live), "Clear filters" resets to all 15 ✅
  - Full-app route sweep: all 18 routes across all 8 phases (`/`, auth, employee, and admin) return 200 or the expected 307 redirect — zero 404s ✅
  - Zero browser console errors throughout ✅
- Screenshots confirm pixel-accurate match to CLAUDE.md §13 design system.

### Known placeholders (expected — later phases fill these in)
- All report and audit data is mocked — replaced with real Supabase queries in Phase 9.
- PDF/Excel export buttons show a placeholder toast — real jsPDF/SheetJS export wiring arrives in Phase 10.

---

## Phase 9A — Supabase Setup + Auth — ✅ DONE (2026-07-09)

- [x] Supabase project connected (`ehevbrvxroxuqwavwjyq`), env vars written to `.env.local` (gitignored) + `.env.example` template committed
- [x] All 9 DB tables created via SQL (`supabase/sql/01_schema.sql`, run by user in dashboard SQL Editor)
- [x] RLS policies applied with `is_admin()` helper function (`supabase/sql/02_rls.sql`)
- [x] `lib/supabase/client.ts` — browser client
- [x] `lib/supabase/server.ts` — server client with cookies (`await cookies()`, per Next 16)
- [x] `lib/supabase/admin.ts` — service role client (API routes only)
- [x] `lib/email/send-otp.ts` — Resend OTP email template (sandbox sender `onboarding@resend.dev`)
- [x] `app/api/auth/send-otp/route.ts` — validates email, checks profile exists + active, generates OTP, sends via Resend, stores in httpOnly cookie
- [x] `app/api/auth/verify-otp/route.ts` — verifies OTP from cookie, establishes a **real Supabase Auth session**
- [x] `lib/hooks/useSession.ts` — client hook for profile + role
- [x] `proxy.ts` (Next 16's `middleware.ts`) — real Supabase session check + role-based redirect
- [x] `app/auth/login/page.tsx` — wired to real `/api/auth/send-otp`
- [x] `app/auth/verify/page.tsx` — wired to real `/api/auth/verify-otp` + role redirect; demo-OTP hint box and hardcoded `123456` removed; resend button now re-calls send-otp instead of no-op simulating
- [x] `EmployeeSidebar` + `AdminSidebar` — real user name from `useSession`, mock user objects removed
- [x] Admin user seeded (`anshumish0606@gmail.com`, EMP-001, role admin) via a one-off script using the service-role key — no manual dashboard user creation needed
- [x] Full auth flow tested end-to-end (see below)
- [x] `npm run build` — zero errors

### Credential handling note
The user pasted a Supabase DB password, a "publishable key," and (in a follow-up message) the real `sb_secret_...` service-role key and Resend API key directly into chat. I flagged this immediately: chat history isn't a secure place for secrets, and recommended rotating the DB password afterward — the user opted to handle rotation on their own schedule. `.env.local` was written directly from the pasted values and never echoed back in any response; `.env.local` was confirmed gitignored (`.gitignore:34` → `.env*`) before and after writing. **The user should still rotate the DB password and consider rotating the service-role key**, since both were exposed in a chat transcript outside this session's control.

### Deviations from the original Phase 9A prompt (and why)
1. **New Supabase key format used as-is.** The user's project issues `sb_publishable_...` / `sb_secret_...` keys (Supabase's newer key system) rather than legacy JWT-format `anon`/`service_role` keys. Verified via a direct `curl` against `/auth/v1/settings` that the publishable key authenticates correctly through Supabase's gateway before wiring it in — no SDK upgrade was needed for `@supabase/supabase-js@2.110.1` / `@supabase/ssr@0.12.0` to accept these as drop-in values for `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
2. **`lib/supabase/server.ts` uses `await cookies()`, not the prompt's synchronous `cookies()`.** Next.js 16 requires awaiting the `cookies()` API (already noted as a Next 16 divergence in CLAUDE.md §2's version note) — the prompt's own code would have failed to type-check.
3. **`verify-otp/route.ts` was substantially rewritten, not copied verbatim.** The prompt's version had two real problems:
   - It called `adminClient.auth.admin.generateLink()` in **both** `send-otp` and `verify-otp` and discarded the result both times — dead code that would have also silently triggered Supabase's own magic-link mailer to fire an unwanted second email per login attempt.
   - Critically, it **never established an actual Supabase Auth session** — it only set a hand-rolled base64 `_session` cookie that neither `useSession` (which calls `supabase.auth.getUser()`) nor `proxy.ts`'s Supabase session check would ever recognize. Following the prompt as written would have produced a login flow that appeared to succeed but left every subsequent page load looking logged-out.
   - Fixed by using `adminClient.auth.admin.generateLink({ type: 'magiclink' })` to mint a token, then immediately redeeming it server-side via a real `@supabase/ssr` client's `verifyOtp({ type: 'magiclink', token_hash })` — this is what actually issues the real access/refresh token cookies. Verified the response shape (`GenerateLinkProperties.hashed_token`, `VerifyTokenHashParams`) against the installed `@supabase/auth-js` type definitions before relying on it.
4. **Admin user seeded via script, not manual dashboard steps.** Rather than asking the user to manually create an auth user in the dashboard and copy a UUID into SQL (as the prompt's Step 16 describes), wrote a one-off Node script using the already-available service-role key to call `auth.admin.createUser()` and insert the matching `profiles` row in one step, then deleted the script after running it once from outside the repo's tracked files.
5. **Supabase Auth dashboard settings (Step 6: disable email confirmations, set Site URL/redirect URLs) were not applied.** These require interactive dashboard access with no CLI/API path available in this session, and email confirmation being enabled or not didn't block the flow above (the seed script sets `email_confirm: true` directly, sidestepping it). Flagging as still-open — see below.

### Verification performed
- `npm run build` — zero TypeScript errors; both API routes appear as dynamic (`ƒ`) and `Proxy (Middleware)` is active.
- Confirmed schema + RLS applied correctly by querying `company_settings` and `profiles` via REST with both the anon key (RLS correctly returned `[]` for an unauthenticated read) and the service-role key (bypassed RLS, showed the real seeded row).
- Drove the full auth flow via direct API calls (`curl` with a cookie jar) end-to-end:
  - `send-otp` → 200, sets `_otp_pending` httpOnly cookie, Resend accepted the send (no errors in server logs, ~1.3s round-trip consistent with a real outbound API call) ✅
  - `verify-otp` with the correct OTP → 200, response included `role: "admin"` and `redirectTo: "/admin/dashboard"`, and — critically — set a real `sb-<project>-auth-token` cookie containing a valid JWT access token + refresh token for the seeded user ✅
  - That real session cookie was then used to hit `/admin/dashboard` (200 OK) and `/dashboard` (307 → `/admin/dashboard`, confirming the admin-redirect rule) ✅
  - No cookie at all → `/admin/dashboard` redirects to `/auth/login?redirect=%2Fadmin%2Fdashboard` ✅
  - Wrong OTP → `{"error":"Incorrect OTP. Please try again."}` ✅
  - Nonexistent email → `{"error":"No account found with this email address."}` ✅
  - Malformed email → `{"error":"Invalid email address."}` ✅
  - Temporarily flipped the seeded admin's `status` to `inactive` via the service-role key, confirmed `send-otp` correctly blocked it (`"Your account has been deactivated. Contact your admin."`), then reverted to `active` and re-confirmed via REST ✅
  - Loaded `/admin/dashboard` in headless Chromium with the real session cookie: sidebar correctly renders "Ajay Singh" (from `useSession`, not the old hardcoded mock), zero page errors ✅
- Screenshot confirms the dashboard renders normally end-to-end with a real authenticated session.

### Known gaps / still open (flagging honestly, not glossing over)
- **Supabase Auth dashboard settings (Step 6) were never applied** — "Enable email confirmations" toggle, Site URL, and redirect URL allowlist all require interactive dashboard access this session doesn't have. The current flow works around this (`email_confirm: true` set directly at user-creation time), but the user should still open Authentication → Settings and configure these to match CLAUDE.md's spec, especially before deploying past `localhost`.
- **The DB password and service-role key were exposed in chat.** The user has been told to rotate the DB password on their own schedule; strongly recommend also rotating the service-role key from Supabase's API settings page, since it bypasses all RLS.
- Employee-side login was not tested end-to-end (no employee account exists yet — only the one seeded admin) — will need a real employee profile row to verify the non-admin redirect (`/dashboard`) and the "employee blocked from `/admin/*`" rule in practice, though the redirect logic itself is identical code to the admin path already verified.
- Everything outside auth (all employee/admin pages) is still on Phase 1–8 mock data — that's Phase 9B/9C per the original plan.

---

## Phase 9B — Employee Side Supabase Integration — ✅ DONE (2026-07-09)

- [x] `lib/utils/geo.ts` — real Haversine + `navigator.geolocation`
- [x] `lib/api/employee.ts` — all employee data fetch functions
- [x] `app/api/attendance/checkin/route.ts` — duplicate check, attendance-lock check, late detection
- [x] `app/api/attendance/checkout/route.ts` — working hours calculated via `calcWorkingHours`
- [x] `app/api/leave/route.ts` — GET + POST
- [x] `app/api/wfh/route.ts` — GET + POST
- [x] `app/api/correction/route.ts` — GET + POST
- [x] `app/api/notifications/route.ts` — GET
- [x] `app/api/notifications/read/route.ts` — PATCH single + all
- [x] `app/api/profile/route.ts` — GET + PATCH (safe fields only)
- [x] `CheckInCard.tsx` — real GPS check + real API calls, loading skeleton while fetching today's record
- [x] `CheckInModal.tsx` — simplified to selection only (GPS check now lives in `CheckInCard`)
- [x] `AttendanceCalendar.tsx` / `AttendanceTable.tsx` / `DayDetailModal.tsx` — converted to the real `Attendance` DB type instead of the old mock shape
- [x] Dashboard page — real stats, real check-in card, real combined leave+WFH request feed
- [x] Leave/WFH/Correction pages — real fetch + real submit, DB-shaped date/time formatting
- [x] Attendance page — real history via `getAttendanceHistory`
- [x] Notifications page — real fetch + real mark-read/mark-all-read, rewritten `NotificationItem` for the real 4-value `NotificationType` (vs. mock's 7 fine-grained types)
- [x] Profile page — real fetch + real PATCH save
- [x] `npm run build` — zero errors

### Deviations from the original Phase 9B prompt (and why)
1. **`await createClient()` throughout, not synchronous.** Every API route in the prompt calls `createClient()` from `lib/supabase/server.ts` without awaiting — but our `server.ts` (correctly, per Next.js 16's async `cookies()` requirement, already documented in Phase 9A) returns a `Promise`. Every route (`checkin`, `checkout`, `leave`, `wfh`, `correction`, `notifications`, `notifications/read`, `profile`) was written with `await createClient()`.
2. **`.maybeSingle()` instead of `.single()` for "does a row exist" checks.** `getTodayAttendance()`, the checkin duplicate check, and the checkout existing-record fetch all query for a row that may legitimately not exist yet (no attendance today). Supabase's `.single()` treats zero rows as a query *error* (PGRST116); `.maybeSingle()` correctly returns `null` without erroring. The prompt's own code used `.single()` in these exact spots, which would have logged a spurious Postgrest error on every "not checked in yet" case.
3. **`AttendanceCalendar`, `AttendanceTable`, and `DayDetailModal` were converted to the real `Attendance` type, not left on `MockAttendanceDay`.** The prompt only mentions updating `AttendanceCalendar` to accept an `attendanceData` prop "the display components stay the same" — but `AttendanceTable` and `DayDetailModal` both hard-depend on `MockAttendanceDay`'s shape (`year`/`month`/`date` as separate numbers, `checkIn`/`checkOut` as pre-formatted display strings, `workingHours` as a string or the sentinel `'--'`). Real DB rows are shaped differently (`date: "YYYY-MM-DD"`, `check_in`/`check_out` as ISO timestamps or `null`, `working_hours` as `number | null`). Rather than writing a lossy mock-shape adapter, converted all three components to consume `Attendance` directly — cleaner and removes a translation layer that would need to be reverted later anyway.
4. **`NotificationItem` and the notifications page were rewritten around the real `NotificationType`.** The mock schema (`lib/mock/misc.ts`) invented 7 fine-grained notification types (`leave_approved`, `leave_rejected`, `wfh_approved`, `wfh_rejected`, `correction_approved`, `correction_rejected`, `reminder`) with distinct check/cross icons per outcome. The actual DB schema (CLAUDE.md §6, `notifications.type` check constraint) only has 4 values: `'leave' | 'wfh' | 'correction' | 'reminder'` — there's no DB-level distinction between an approval and a rejection notification for the same category. Rewrote the icon mapping to be category-based (Umbrella/Home/FileEdit/Bell) rather than outcome-based, since the outcome only exists in the notification's free-text `title`/`message`, not as a queryable field.
5. **`app/api/profile/route.ts`'s field whitelist typed explicitly, not via untyped `Object.fromEntries` filtering.** The prompt's version produces an untyped object, which CLAUDE.md §17 forbids relying on implicitly (would show up as `any` under strict settings). Declared `EDITABLE_FIELDS` as a `readonly` tuple and built the safe-update object with an explicit typed loop instead.
6. **`lib/mock/reports.ts`'s `ReportRow.status` already handles both `AttendanceStatus` and `RequestStatus`** (fixed back in Phase 8) — reused that precedent rather than reintroducing a loosely-typed status field anywhere here.

### Verification performed
- `npm run build` — zero TypeScript errors; all 9 new API routes compile as dynamic (`ƒ`), all 7 employee pages compile as static.
- Confirmed no employee-facing file still imports from `lib/mock/attendance.ts` / `lib/mock/requests.ts` / `lib/mock/misc.ts` (only admin-side holidays/settings still reference `lib/mock/misc.ts`, correctly deferred to Phase 9C).
- Seeded a second, employee-role test profile (`EMP-002`, `role: employee`, `test.employee@feelifyems.local`) directly via the service-role key, matching the existing Phase 9A seeding pattern.
- **Employee-side full browser login was intentionally not performed this phase** — Resend's sandbox sender only delivers to the single email address the Resend account owns (established in the Phase 9A troubleshooting session), and the seeded employee's email isn't a real deliverable inbox. Rather than mint and print a live Supabase session token to drive a browser test (which the harness correctly blocked as a credential-exposure risk when first attempted), verification was done at the layer that doesn't require a session:
  - All 7 employee routes hit anonymously returned a clean `307` redirect to login (not a `500`), confirming every rewritten page renders without a server-side crash even before auth resolves.
  - Directly exercised, via the service-role key, the exact insert/update shapes each API route produces against `attendance` (checkin + checkout), `leave_requests`, `wfh_requests`, `correction_requests`, `notifications`, and `profiles` — all five tables accepted the payloads cleanly, confirming schema/route compatibility end-to-end at the data layer.
  - Verified `calcWorkingHours`'s decimal-hours math directly (9h05m check-in-to-checkout → `9.08`, matching the DB `numeric(5,2)` column).
  - Confirmed RLS still blocks anonymous reads of `attendance` via the anon key (`[]` returned).
  - All test rows were deleted after verification; the seeded `EMP-002` profile itself was left in place for future use.
- User was asked whether to verify a Resend domain now (to unblock real employee-email testing) or defer; chose to defer and accept API-level verification as sufficient for this phase.

### Known gaps / still open
- **Employee-side browser E2E (real login → check-in → GPS → checkout → leave/WFH/correction submit → notifications → profile save, all clicked through in an actual browser as a real employee) has not been performed.** This requires either a verified Resend domain (to email a real second address) or the user manually testing via the UI themselves with their own second email. Recommend the user do a manual pass through `/dashboard` → `/attendance` → `/leave` → `/wfh` → `/correction` → `/notifications` → `/profile` once they can log in as `EMP-002` or another real employee account.
- **`company_settings.office_lat`/`office_lng` are still `0, 0`** (the schema's default seed row) — the GPS proximity check in `CheckInCard` will always report the user as far from "office" until an admin configures real coordinates via Settings (Phase 9C, not yet wired to Supabase).
- Admin-side pages (dashboard, employees, attendance, requests, holidays, reports, audit, settings) are still on Phase 5–8 mock data — that's Phase 9C.
- The `/admin/requests` page itself is still the unbuilt Phase 5 placeholder ("Phase 6 builds this page") — none of Phases 1–8 ever built it; flagged to the user mid-session as a gap in the original 8-phase plan, deferred pending their decision on when to build it.

---

## Phase 9C — Admin Side Integration — ✅ DONE (2026-07-09)

- [x] `lib/email/send-notification.ts` — approval/rejection email template (sandbox sender `onboarding@resend.dev`, consistent with `send-otp.ts`)
- [x] `lib/utils/notify.ts` — `createNotification` helper (service role)
- [x] `lib/utils/audit.ts` — `writeAuditLog` helper (service role, immutable)
- [x] `lib/api/admin.ts` — all admin fetch functions, typed against real DB types (no mock types)
- [x] `app/api/admin/stats/route.ts` — today's stats + who's in office
- [x] `app/api/employees/route.ts` — GET all (role=employee only) + POST create (auth user + profile, rollback on profile-insert failure)
- [x] `app/api/employees/[id]/route.ts` — PATCH update/status toggle, explicit allowed-fields whitelist
- [x] `app/api/attendance/route.ts` — admin GET with month/employee/status filters (employees still restricted to own rows) + PATCH with working-hours recalc + audit log
- [x] `app/api/leave/[id]/review/route.ts`, `app/api/wfh/[id]/review/route.ts`, `app/api/correction/[id]/review/route.ts` — approve/reject, attendance upsert side effects, in-app notification + email
- [x] `app/api/leave|wfh|correction/route.ts` GET handlers — extended with `?admin=true&status=pending` branch (admin sees all + joined profile, employees still see only their own)
- [x] `app/api/holidays/route.ts` + `[id]/route.ts` — GET/POST/DELETE
- [x] `app/api/audit/route.ts` — GET with employee/date-range filters (admin only, service role, joined profiles)
- [x] `app/api/settings/route.ts` — GET + PATCH (single-row table)
- [x] Admin dashboard — real stats, `PendingRequestsPanel` and `WhoIsInOffice` rewritten around real `LeaveRequestWithProfile`/`WFHRequestWithProfile`/`CorrectionRequestWithProfile` and the stats-route's `inOffice` shape
- [x] Admin employees — `EmployeeTable`/`AddEmployeeDrawer` converted from `MockEmployee` to real `Profile`; add/status-toggle wired to API
- [x] Admin attendance — `AdminAttendanceTable`/`EditAttendanceModal` converted from `AdminAttendanceRow` to real `AttendanceWithProfile`; edit wired to PATCH with audit log
- [x] Admin requests (`/admin/requests`) — **built from scratch**, not just rewired. This page was left as an unbuilt Phase 5 placeholder through Phases 6–8 (flagged as a gap at the end of Phase 9B) — the original 8-phase mock-data plan never actually built it. Built as a tabbed Leave/WFH/Correction list with inline approve/reject, matching the dashboard panel's visual pattern but as a full page.
- [x] Admin holidays — `HolidayCard` converted from `MockHoliday` to real `Holiday`; add/delete wired to API
- [x] Admin audit — `AuditTable` converted from `AuditEntry` to real `AuditLogWithProfiles`; date-range + employee filters wired to API (employee dropdown now populated from real `profiles`, not a mock list)
- [x] Admin settings — real `company_settings` row loaded/saved; time fields sliced to `HH:MM` for `<input type="time">` compatibility with Postgres `time` columns
- [x] `npm run build` — zero errors, all 37 routes compile (9 static admin pages, 20 dynamic API routes)

### Deviations from the original Phase 9C prompt (and why)
1. **Sandbox Resend sender kept (`onboarding@resend.dev`), not `noreply@yourdomain.com`.** No domain is verified in Resend yet (still an open item from Phase 9A/9B). Using an unverified `from` address would make every send fail outright. Matches the existing pattern in `lib/email/send-otp.ts`.
2. **`app/api/settings/route.ts` PATCH fixed a real bug from the prompt.** The prompt's version ran `.update(...).select().single()` with no `.eq()` filter at all — since `company_settings` has no natural unique filter column exposed to the request, this would either error or update every row in the table. Fixed by fetching the existing single row's `id` first, then filtering the update on it explicitly.
3. **`app/api/correction/[id]/review/route.ts` handles the case where no attendance row exists yet for the requested date.** The prompt's version only handled `if (existing)` and silently did nothing otherwise — meaning a correction request for a day the employee never checked in on (the most common real reason to file one) would approve with no visible effect. Added an `else` branch that inserts a new attendance row from the requested times and audit-logs it against a `null` previous state.
4. **All `[id]` route handlers use `{ params: Promise<{ id: string }> }` with `await params`.** Next.js 16 requires this (already an established convention in this codebase — see Phase 9A/9B notes on `await cookies()`); the prompt's synchronous `{ params: { id: string } }` signature would not type-check.
5. **Components converted to real DB types instead of kept on mock types with an adapter layer** (`PendingRequestsPanel`, `WhoIsInOffice`, `EmployeeTable`, `AddEmployeeDrawer`, `AdminAttendanceTable`, `EditAttendanceModal`, `HolidayCard`, `AuditTable`) — same rationale as Phase 9B's equivalent deviation: real DB rows are shaped too differently from the hand-authored mock shapes (joined profile objects instead of flat denormalized fields, ISO timestamps instead of pre-formatted display strings) for a thin prop-shape swap to be honest. `lib/mock/*.ts` files are now unused by any page and were left in place rather than deleted, since removing them wasn't asked for.
6. **`EmployeeTable`'s per-row "Edit" action was dropped, not wired to a real update.** `AddEmployeeDrawer` has no prefill mode (an existing gap flagged back in Phase 6) — wiring a nonfunctional "Edit" button to it would be worse than removing it. Status toggle (deactivate/activate) is fully wired since that's the only per-row mutation the UI actually supports today.
7. **Vercel deploy (prompt Step 14) and Resend domain verification (Step 14d) were not performed this phase.** Both require interactive access this session doesn't have (a Vercel account/dashboard, and DNS control over a real domain) — flagged as still open below, consistent with how Phase 9A handled the equivalent Supabase-dashboard-only steps.

### Verification performed
- `npm run build` — zero TypeScript errors; all 9 admin pages compile static, all 20 API routes (11 new/updated this phase) compile dynamic.
- Confirmed real DB state directly via the service-role key: 3 profiles (1 admin, 2 employee), the seeded `company_settings` row, and zero rows in `attendance`/`holidays`/`audit_logs`/`leave_requests` — i.e. every admin page's "empty state" path is what will actually render today, not just a code path that was never exercised.
- Exercised the exact write/delete cycle the holidays page performs (insert → delete) directly against Supabase — succeeded cleanly.
- Exercised the exact update cycle the settings page performs (update `company_name` → revert) directly against Supabase — succeeded cleanly, confirming the earlier no-`.eq()`-filter bug fix actually targets the right row.
- Hit all 7 admin pages anonymously — all returned a clean `307` redirect to login (not `500`), confirming every rewired page (including the newly-built `/admin/requests`) renders without a server-side crash before auth resolves.
- Hit all 6 new/updated admin API routes anonymously — `/api/admin/stats`, `/api/attendance`, `/api/holidays`, `/api/audit`, `/api/settings` returned `401`; `/api/employees` returned `403` (its `requireAdmin` helper treats "no session" and "not admin" the same way) — all correct auth-gate behavior, no `500`s.
- **Full browser click-through as an authenticated admin (approve/reject a real request, edit a real attendance row and see the audit trail, etc.) was not performed this session.** The verification approach of minting a live Supabase session token to drive a headless browser (the same technique used successfully in earlier phases' groundwork) was flagged as a credential-handling risk by the harness and the user did not authorize it for this session; deleting a pre-existing unfamiliar test profile (`EMP-003`) found in the DB was also declined for the same "unverified provenance" reason and that row was left untouched. Verification instead focused on: build correctness, real DB state inspection, the exact write paths each page's mutations perform (exercised directly), and auth-gate behavior of every route. This is a lighter bar than a full clicked-through browser pass — recommend the user do one manual pass through `/admin/dashboard` → `/admin/employees` → `/admin/attendance` → `/admin/requests` → `/admin/holidays` → `/admin/audit` → `/admin/settings` themselves before considering the phase fully closed.

### Known gaps / still open
- **No browser-driven admin click-through this session** (see above) — recommend the user do a manual pass, especially the approve/reject flow (which also depends on a pending leave/WFH/correction request existing, and none do right now — an employee needs to submit one first).
- **The unfamiliar `EMP-003 / Test E2E User` profile in the DB was not investigated or removed.** It wasn't created by this session's work; if it's leftover from prior testing and safe to delete, the user should remove it directly.
- **Vercel deploy not performed** — needs the user's Vercel account access. All env vars from `.env.local` will need to be added to the Vercel project, plus `NEXT_PUBLIC_APP_URL` set to the real deployed URL.
- **Resend domain still not verified** — OTP and notification emails both still use the sandbox sender, which (per the Phase 9A troubleshooting) only delivers to the Resend account owner's own address. Real employee email delivery (OTP login, approval/rejection notifications) won't work for anyone else until a domain is verified.
- **Supabase Auth dashboard settings** (Site URL, redirect URL allowlist for the real production domain) still need to be set once a deploy URL exists — carried over from Phase 9A.
- **jsPDF/SheetJS export buttons** (Reports page, Attendance export) are still placeholder toasts — real export wiring is Phase 10 per the original plan.
- **GPS check-in will report everyone as "too far from office"** until an admin sets real `office_lat`/`office_lng` via `/admin/settings` (currently `0, 0`, the schema default) — this phase makes that page fully functional, so the user can fix this themselves now.

---

## Deployment — ✅ DONE (2026-07-09)

- Project pushed to GitHub repository
- Deployed to Vercel (live in production)
- All env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`) added to Vercel project settings
- `NEXT_PUBLIC_APP_URL` set to the real Vercel production URL
- Supabase Auth dashboard: Site URL + redirect URL allowlist must be updated to the production URL (requires manual action in Supabase dashboard → Authentication → Settings)
- Resend domain verification still pending — OTP and notification emails currently only deliver to the Resend account owner's address (sandbox mode); verify a real domain in Resend dashboard to enable delivery to all employee emails
- GPS check-in will report all employees as "too far from office" until an admin sets real `office_lat`/`office_lng` via `/admin/settings` (currently `0, 0`)

### Post-Deploy Manual Checklist (User Action Required)
- [ ] Supabase → Authentication → Settings → set Site URL to production Vercel URL
- [ ] Supabase → Authentication → Settings → add production URL to "Redirect URLs" allowlist
- [ ] Resend → Domains → verify your domain → update `from` address in `lib/email/send-otp.ts` and `lib/email/send-notification.ts` from `onboarding@resend.dev` to `noreply@yourdomain.com`
- [ ] Admin → Settings page → set real office latitude + longitude
- [ ] Investigate and remove orphan profile `EMP-003 / Test E2E User` from Supabase if it was a test artifact

---

## PWA Setup — ✅ DONE

- Created `public/manifest.json`.
- Generated and saved PWA icons in `public/icons`.
- Added Service Worker (`public/sw.js`) with offline caching functionality for non-API requests.
- Updated PWA meta tags in `<head>` and inline Service Worker registration script in `app/layout.tsx`.

---

## Phase 10A — QR Validation — ✅ DONE

- [x] app/api/qr/validate/route.ts — server-side QR token validation
- [x] QR_CHECKIN_SECRET added to .env.local and CLAUDE.md
- [x] app/(employee)/qr-checkin/page.tsx — mobile check-in/out UI (6 states)
- [x] npm run build — zero errors

---

## Phase 10B — Part 1: Admin QR Page — ✅ DONE

- [x] qrcode + @types/qrcode installed
- [x] app/(admin)/admin/qr/page.tsx — QR display + download
- [x] NEXT_PUBLIC_QR_CHECKIN_TOKEN added to .env.local and CLAUDE.md
- [x] AdminSidebar.tsx — Office QR nav link added
- [x] npm run build — zero errors

---

## Phase 10B — Part 2: QR Scanner + Sidebar Links — ✅ DONE

- [x] html5-qrcode installed
- [x] app/(employee)/scan/page.tsx — in-app QR scanner with camera
- [x] EmployeeSidebar.tsx — Scan QR nav link added (after Dashboard)
- [x] npm run build — zero errors
