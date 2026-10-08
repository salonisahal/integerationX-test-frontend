# integerationX-test — Routes & Navigation

## How to run

```
cd /workspace/frontend_runs/d24c12f7-92e1-4ced-97c6-118cb076410f/project
npm install --legacy-peer-deps && npm run dev
```

Then open http://localhost:39867

## Routes

| Route | Page file | Description |
|-------|-----------|-------------|
| `/login` | `src/pages/auth/Login.tsx` | Public sign-in screen. |
| `/forgot-password` | `src/pages/auth/ForgotPassword.tsx` | Public placeholder reset-password flow. |
| `/` | redirects | Redirects to the signed-in user's role dashboard (`RoleDashboardRedirect.tsx`), or to `/login` if signed out. |
| `/dashboard/admin` | `src/pages/admin/AdminDashboard.tsx` | Admin-only dashboard with summary cards, charts, and recent activity. |
| `/dashboard/teacher` | `src/pages/teacher/TeacherDashboard.tsx` | Teacher-only dashboard. |
| `/dashboard/student` | `src/pages/student/StudentDashboard.tsx` | Student-only dashboard. |
| `/students` | `src/pages/students/StudentList.tsx` | Student list with search/filter/pagination. Admin, Teacher. |
| `/students/new` | `src/pages/students/StudentForm.tsx` | Create student. Admin only. |
| `/students/:id` | `src/pages/students/StudentDetail.tsx` | Student profile with Courses/Attendance/Grades/Assignments tabs. |
| `/students/:id/edit` | `src/pages/students/StudentForm.tsx` | Edit student. Admin only. |
| `/teachers` | `src/pages/teachers/TeacherList.tsx` | Teacher list. Admin only. |
| `/teachers/new` | `src/pages/teachers/TeacherForm.tsx` | Create teacher. Admin only. |
| `/teachers/:id` | `src/pages/teachers/TeacherDetail.tsx` | Teacher profile with assigned courses. Admin only. |
| `/teachers/:id/edit` | `src/pages/teachers/TeacherForm.tsx` | Edit teacher. Admin only. |
| `/departments` | `src/pages/departments/DepartmentList.tsx` | Department list. Admin only. |
| `/departments/new` | `src/pages/departments/DepartmentForm.tsx` | Create department. Admin only. |
| `/departments/:id/edit` | `src/pages/departments/DepartmentForm.tsx` | Edit department. Admin only. |
| `/courses` | `src/pages/courses/CourseList.tsx` | Course list. Admin, Teacher, Student. |
| `/courses/new` | `src/pages/courses/CourseForm.tsx` | Create course. Admin only. |
| `/courses/:id` | `src/pages/courses/CourseDetail.tsx` | Course profile with Students/Classes/Assignments/Attendance/Grades tabs. |
| `/courses/:id/edit` | `src/pages/courses/CourseForm.tsx` | Edit course. Admin only. |
| `/classes` | `src/pages/classes/ClassList.tsx` | Class schedule list. Admin, Teacher. |
| `/classes/new` | `src/pages/classes/ClassForm.tsx` | Create class. Admin, Teacher. |
| `/classes/:id/edit` | `src/pages/classes/ClassForm.tsx` | Edit class. Admin, Teacher. |
| `/enrollments` | `src/pages/enrollments/EnrollmentList.tsx` | Enrollment list. Admin only. |
| `/enrollments/new` | `src/pages/enrollments/EnrollmentForm.tsx` | Create enrollment. Admin only. |
| `/enrollments/:id/edit` | `src/pages/enrollments/EnrollmentForm.tsx` | Edit enrollment. Admin only. |
| `/attendance` | `src/pages/attendance/AttendancePage.tsx` | Teacher: mark attendance by course/date. Student: view own attendance %. Admin: review all records. |
| `/grades` | `src/pages/grades/GradesPage.tsx` | Teacher: enter grades by course/assignment. Student: view own grades/average. Admin: review all grades. |
| `/assignments` | `src/pages/assignments/AssignmentList.tsx` | Assignment list with publish/close actions (Teacher/Admin) and overdue highlighting. |
| `/assignments/new` | `src/pages/assignments/AssignmentForm.tsx` | Create assignment. Teacher, Admin. |
| `/assignments/:id/edit` | `src/pages/assignments/AssignmentForm.tsx` | Edit assignment. Teacher, Admin. |
| `/users` | `src/pages/users/UserList.tsx` | User account administration. Admin only. |
| `/users/new` | `src/pages/users/UserForm.tsx` | Create user. Admin only. |
| `/users/:id/edit` | `src/pages/users/UserForm.tsx` | Edit user. Admin only. |
| `/notifications` | `src/pages/notifications/NotificationsPage.tsx` | Notification center (mark read/all read/delete). |
| `/settings` | `src/pages/admin/SettingsPage.tsx` | Institution settings. Admin only. |
| `/profile` | `src/pages/profile/ProfilePage.tsx` | View/edit own profile fields. |
| `*` | `src/pages/NotFound.tsx` | Catch-all 404 with a "Go Home" link. |

Role restrictions above are enforced both by hiding the corresponding sidebar
link (`src/constants/navConfig.ts`) and by the `RequireRole` route guard
(`src/routes/RequireRole.tsx`), which redirects a disallowed direct URL entry
back to the user's own dashboard.

## Navigation map

- Sidebar links (role-filtered) -> Dashboard / Students / Teachers /
  Departments / Courses / Classes / Enrollments / Attendance / Grades /
  Assignments / Users / Notifications / Settings / Profile.
- TopBar notification bell -> `/notifications`.
- TopBar avatar menu -> Profile (`/profile`) or Logout (confirmation dialog,
  then `/login`).
- Login -> Dashboard (role-specific) on successful submit; shows inline error
  on failure; "Forgot password?" -> `/forgot-password`.
- Login/Signup is mock-gated client side only for routing convenience; all
  other data operations hit the real backend.
- Student list row / "View" action -> Student detail (`/students/:id`).
- Student detail "Edit" (Admin) -> Student form (`/students/:id/edit`).
- Student form submit -> creates/updates via `studentApi.ts`, then navigates
  to the student's detail page.
- Teacher list row -> Teacher detail; Teacher detail "Edit" -> Teacher form.
- Course list row / "View" -> Course detail (`/courses/:id`), with tabs for
  Students (enrollments), Classes, Assignments, Attendance, and Grades —
  each tab navigates to the related entity's own management screen when
  clicked where applicable.
- Course detail "Edit" (Admin) -> Course form.
- Admin dashboard "Recently Added Students" rows -> Student detail.
- Teacher dashboard "Assigned Courses" rows -> Course detail.
- Student dashboard "Enrolled Courses" rows -> Course detail.
- Assignment list "Publish"/"Close" buttons -> in-place status update
  (no navigation) via `assignmentApi.ts`.
- Every delete action (students, teachers, departments, courses, classes,
  enrollments, assignments, users, notifications) opens a `ConfirmDialog`
  before calling the delete API.
- Any unknown URL -> NotFound (`*`), which links back to `/`.

## Shared components

- `src/components/layout/Sidebar.tsx` — role-aware navigation list with
  active-link highlighting via `NavLink`.
- `src/components/layout/TopBar.tsx` — mobile menu toggle, notification
  badge, profile/logout menu with a logout confirmation dialog.
- `src/components/common/Button.tsx` — primary/secondary/danger/ghost button
  with a built-in loading spinner state.
- `src/components/common/Input.tsx`, `Select.tsx`, `Textarea.tsx` — styled
  form controls.
- `src/components/common/FormField.tsx` — label + helper text / inline error
  wrapper used by every form field in the app.
- `src/components/common/Badge.tsx` — status pill with a shared
  `statusToTone` mapping (ACTIVE/INACTIVE/PRESENT/ABSENT/...).
- `src/components/common/Skeleton.tsx` — skeleton loaders for cards and
  table rows.
- `src/components/common/EmptyState.tsx` / `ErrorState.tsx` — list empty
  state and failed-fetch retry state.
- `src/components/common/PageHeader.tsx` — page title/description/actions
  row used at the top of every page.
- `src/components/tables/DataTable.tsx` — generic column-driven table with
  built-in loading/empty/error rendering.
- `src/components/tables/Pagination.tsx` — server-side pagination control
  ("Showing X-Y of Z").
- `src/components/tables/SearchBar.tsx` — debounced-friendly search input.
- `src/components/dashboard/SummaryCard.tsx` / `ChartCard.tsx` — dashboard
  stat cards and chart containers (recharts).
- `src/components/modals/Modal.tsx` / `ConfirmDialog.tsx` — local-state
  modal and the shared destructive-action confirmation dialog.

## Design tokens

Defined in `tailwind.config.js` under `theme.extend.colors`:

- `primary` (`#2563EB`, with `dark`/`light`/`50`/`100` variants) — primary
  actions, active nav state, links.
- `sidebar` (`#111827`, with `hover`) — sidebar background.
- `surface` (`#F3F4F6`) — app background.
- `card` (`#FFFFFF`) — card/panel background.
- `muted` (`#6B7280`) — secondary text.
- `border` (`#E5E7EB`) — borders/dividers.
- `accent` (`#7C3AED`) — secondary highlight (charts, badges).
- `success` (`#16A34A`), `warning` (`#D97706`), `danger` (`#DC2626`),
  `info` (`#0891B2`) — status colors used by `Badge`.

Border radius tokens: `card` (`0.75rem`) for panels/cards, `input`
(`0.5rem`) for inputs/buttons/selects.

## Notes

- Known gap: no dedicated "forgot password", "settings", or "my student
  profile lookup" endpoints were present in the inferred backend contract.
  Those screens are implemented with clearly commented `// MOCK:` placeholder
  behavior and should be reconciled with the real backend once available.
- `npx tsc --noEmit` (via `tsc -p tsconfig.app.json`) and `npm run build`
  both pass with no errors. `npx vitest run` passes all 30 page smoke tests.
