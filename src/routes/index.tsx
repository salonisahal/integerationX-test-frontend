import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import RequireAuth from './RequireAuth'
import RequireRole from './RequireRole'
import RoleDashboardRedirect from './RoleDashboardRedirect'

import Login from '../pages/auth/Login'
import ForgotPassword from '../pages/auth/ForgotPassword'

import AdminDashboard from '../pages/admin/AdminDashboard'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import StudentDashboard from '../pages/student/StudentDashboard'
import SettingsPage from '../pages/admin/SettingsPage'

import StudentList from '../pages/students/StudentList'
import StudentDetail from '../pages/students/StudentDetail'
import StudentForm from '../pages/students/StudentForm'

import TeacherList from '../pages/teachers/TeacherList'
import TeacherDetail from '../pages/teachers/TeacherDetail'
import TeacherForm from '../pages/teachers/TeacherForm'

import DepartmentList from '../pages/departments/DepartmentList'
import DepartmentForm from '../pages/departments/DepartmentForm'

import CourseList from '../pages/courses/CourseList'
import CourseDetail from '../pages/courses/CourseDetail'
import CourseForm from '../pages/courses/CourseForm'

import ClassList from '../pages/classes/ClassList'
import ClassForm from '../pages/classes/ClassForm'

import EnrollmentList from '../pages/enrollments/EnrollmentList'
import EnrollmentForm from '../pages/enrollments/EnrollmentForm'

import AttendancePage from '../pages/attendance/AttendancePage'
import GradesPage from '../pages/grades/GradesPage'

import AssignmentList from '../pages/assignments/AssignmentList'
import AssignmentForm from '../pages/assignments/AssignmentForm'

import UserList from '../pages/users/UserList'
import UserForm from '../pages/users/UserForm'

import NotificationsPage from '../pages/notifications/NotificationsPage'
import ProfilePage from '../pages/profile/ProfilePage'

import NotFound from '../pages/NotFound'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <RoleDashboardRedirect /> },

          {
            element: <RequireRole allowedRoles={['ADMIN']} />,
            children: [
              { path: 'dashboard/admin', element: <AdminDashboard /> },
              { path: 'teachers', element: <TeacherList /> },
              { path: 'teachers/new', element: <TeacherForm /> },
              { path: 'teachers/:id', element: <TeacherDetail /> },
              { path: 'teachers/:id/edit', element: <TeacherForm /> },
              { path: 'departments', element: <DepartmentList /> },
              { path: 'departments/new', element: <DepartmentForm /> },
              { path: 'departments/:id/edit', element: <DepartmentForm /> },
              { path: 'enrollments', element: <EnrollmentList /> },
              { path: 'enrollments/new', element: <EnrollmentForm /> },
              { path: 'enrollments/:id/edit', element: <EnrollmentForm /> },
              { path: 'users', element: <UserList /> },
              { path: 'users/new', element: <UserForm /> },
              { path: 'users/:id/edit', element: <UserForm /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },

          {
            element: <RequireRole allowedRoles={['TEACHER']} />,
            children: [{ path: 'dashboard/teacher', element: <TeacherDashboard /> }],
          },

          {
            element: <RequireRole allowedRoles={['STUDENT']} />,
            children: [{ path: 'dashboard/student', element: <StudentDashboard /> }],
          },

          {
            element: <RequireRole allowedRoles={['ADMIN', 'TEACHER']} />,
            children: [
              { path: 'students', element: <StudentList /> },
              { path: 'students/new', element: <StudentForm /> },
              { path: 'students/:id', element: <StudentDetail /> },
              { path: 'students/:id/edit', element: <StudentForm /> },
              { path: 'classes', element: <ClassList /> },
              { path: 'classes/new', element: <ClassForm /> },
              { path: 'classes/:id/edit', element: <ClassForm /> },
            ],
          },

          {
            element: <RequireRole allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']} />,
            children: [
              { path: 'courses', element: <CourseList /> },
              { path: 'courses/new', element: <CourseForm /> },
              { path: 'courses/:id', element: <CourseDetail /> },
              { path: 'courses/:id/edit', element: <CourseForm /> },
              { path: 'attendance', element: <AttendancePage /> },
              { path: 'grades', element: <GradesPage /> },
              { path: 'assignments', element: <AssignmentList /> },
              { path: 'assignments/new', element: <AssignmentForm /> },
              { path: 'assignments/:id/edit', element: <AssignmentForm /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },

          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
