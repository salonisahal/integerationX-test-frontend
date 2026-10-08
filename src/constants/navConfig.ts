import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  CalendarClock,
  ClipboardList,
  CalendarCheck,
  Award,
  FileText,
  UserCog,
  Bell,
  Settings,
  UserCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { Role } from '../types'
import { ROUTES } from './routes'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ size?: number; className?: string }>
  roles: Role[]
}

// Permission-aware navigation configuration shared by the Sidebar component
// for every role, so the sidebar implementation itself is never duplicated.
export const navItems: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD_ADMIN, icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'Dashboard', to: ROUTES.DASHBOARD_TEACHER, icon: LayoutDashboard, roles: ['TEACHER'] },
  { label: 'Dashboard', to: ROUTES.DASHBOARD_STUDENT, icon: LayoutDashboard, roles: ['STUDENT'] },
  { label: 'Students', to: ROUTES.STUDENTS, icon: GraduationCap, roles: ['ADMIN', 'TEACHER'] },
  { label: 'Teachers', to: ROUTES.TEACHERS, icon: Users, roles: ['ADMIN'] },
  { label: 'Departments', to: ROUTES.DEPARTMENTS, icon: Building2, roles: ['ADMIN'] },
  { label: 'Courses', to: ROUTES.COURSES, icon: BookOpen, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Classes', to: ROUTES.CLASSES, icon: CalendarClock, roles: ['ADMIN', 'TEACHER'] },
  { label: 'Enrollments', to: ROUTES.ENROLLMENTS, icon: ClipboardList, roles: ['ADMIN'] },
  { label: 'Attendance', to: ROUTES.ATTENDANCE, icon: CalendarCheck, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Grades', to: ROUTES.GRADES, icon: Award, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Assignments', to: ROUTES.ASSIGNMENTS, icon: FileText, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Users', to: ROUTES.USERS, icon: UserCog, roles: ['ADMIN'] },
  { label: 'Notifications', to: ROUTES.NOTIFICATIONS, icon: Bell, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings, roles: ['ADMIN'] },
  { label: 'Profile', to: ROUTES.PROFILE, icon: UserCircle, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
]

export function navItemsForRole(role: Role | null): NavItem[] {
  if (!role) return []
  return navItems.filter((item) => item.roles.includes(role))
}

export function dashboardPathForRole(role: Role | null): string {
  switch (role) {
    case 'ADMIN':
      return ROUTES.DASHBOARD_ADMIN
    case 'TEACHER':
      return ROUTES.DASHBOARD_TEACHER
    case 'STUDENT':
      return ROUTES.DASHBOARD_STUDENT
    default:
      return ROUTES.LOGIN
  }
}
