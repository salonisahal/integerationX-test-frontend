// Centralized route path constants referenced from the sidebar config,
// route definitions, and navigation calls across the app.
export const ROUTES = {
  LOGIN: '/login',

  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_TEACHER: '/dashboard/teacher',
  DASHBOARD_STUDENT: '/dashboard/student',

  STUDENTS: '/students',
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  STUDENT_NEW: '/students/new',
  STUDENT_EDIT: (id: string) => `/students/${id}/edit`,

  TEACHERS: '/teachers',
  TEACHER_DETAIL: (id: string) => `/teachers/${id}`,
  TEACHER_NEW: '/teachers/new',
  TEACHER_EDIT: (id: string) => `/teachers/${id}/edit`,

  DEPARTMENTS: '/departments',
  DEPARTMENT_NEW: '/departments/new',
  DEPARTMENT_EDIT: (id: string) => `/departments/${id}/edit`,

  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  COURSE_NEW: '/courses/new',
  COURSE_EDIT: (id: string) => `/courses/${id}/edit`,

  CLASSES: '/classes',
  CLASS_NEW: '/classes/new',
  CLASS_EDIT: (id: string) => `/classes/${id}/edit`,

  ENROLLMENTS: '/enrollments',
  ENROLLMENT_NEW: '/enrollments/new',
  ENROLLMENT_EDIT: (id: string) => `/enrollments/${id}/edit`,

  ATTENDANCE: '/attendance',
  GRADES: '/grades',

  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_NEW: '/assignments/new',
  ASSIGNMENT_EDIT: (id: string) => `/assignments/${id}/edit`,

  USERS: '/users',
  USER_NEW: '/users/new',
  USER_EDIT: (id: string) => `/users/${id}/edit`,

  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

export const DEFAULT_PAGE_SIZE = 10
