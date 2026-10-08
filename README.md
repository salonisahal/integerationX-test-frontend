# integerationX-test

A Student Management System frontend for an institution with ADMIN, TEACHER,
and STUDENT roles. It provides role-based dashboards, student/teacher/
department/course/class/enrollment management, attendance marking and
viewing, grade entry and viewing, assignment management, user administration,
and a notification center. The app makes real HTTP requests to an external
backend (no mock fallback, no local API server) so it can be connected to an
independently generated backend through IntegrationX.

## Tech stack

React + TypeScript, Vite, Tailwind CSS, React Router, axios.

## Getting started

```
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Then open http://localhost:39867

## Environment variables

See `.env.example`. `VITE_API_BASE_URL` is the base URL of the backend REST
API (e.g. `http://localhost:8080`). It is read once in `src/api/client.ts`;
every request path used throughout the app is relative to it (e.g.
`/api/v1/students`). Leave it unset during local frontend-only development —
requests will simply fail with a visible error/toast instead of silently
falling back to fake data, by design (see `src/api/client.ts`).

## Project structure

- `src/api` — centralized axios client (`client.ts`) plus one typed service
  module per backend resource (`authApi.ts`, `studentApi.ts`, `teacherApi.ts`,
  `departmentApi.ts`, `courseApi.ts`, `classApi.ts`, `enrollmentApi.ts`,
  `attendanceApi.ts`, `gradeApi.ts`, `assignmentApi.ts`, `notificationApi.ts`,
  `dashboardApi.ts`, `userApi.ts`) and a shared `crudFactory.ts` for the
  repeated list/get/create/update/delete pattern.
- `src/pages` — one folder per feature area (`auth`, `admin`, `teacher`,
  `student`, `students`, `teachers`, `departments`, `courses`, `classes`,
  `enrollments`, `attendance`, `grades`, `assignments`, `users`,
  `notifications`, `profile`) with a co-located `*.test.tsx` smoke test next
  to every page component.
- `src/components` — shared UI: `common` (Button, Input, Select, Textarea,
  Badge, Skeleton, EmptyState, ErrorState, PageHeader, FormField, Spinner),
  `layout` (Sidebar, TopBar), `tables` (DataTable, Pagination, SearchBar),
  `dashboard` (SummaryCard, ChartCard), and `modals` (Modal, ConfirmDialog).
- `src/contexts` — `AuthContext.tsx`, the centralized authentication state
  (isAuthenticated, user, role, tokens, login/logout/refresh/getCurrentUser).
- `src/routes` — `index.tsx` (createBrowserRouter route tree), `RequireAuth.tsx`
  (auth guard), `RequireRole.tsx` (role guard), `RoleDashboardRedirect.tsx`.
- `src/types` — shared TypeScript models for every entity and API envelope.
- `src/constants` — route path constants, nav/RBAC configuration, storage
  keys, pagination defaults.
- `src/validation` — reusable field validators shared across forms.
- `src/utils` — stateless formatting helpers (dates, names, pagination math).
- `src/hooks` — `useDebouncedValue`, `useListQuery` (shared list
  fetch/loading/error/pagination logic).
