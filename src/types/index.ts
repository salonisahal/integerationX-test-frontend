// Centralized TypeScript models for the Student Management System frontend.
// These mirror the inferred backend API contract as closely as possible.

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type EntityStatus = 'ACTIVE' | 'INACTIVE'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  status: EntityStatus
  createdAt: string
  departmentId?: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Department {
  id: string
  name: string
  code: string
  description: string
  departmentHeadId?: string
  departmentHeadName?: string
  status: EntityStatus
}

export interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  state: string
  postalCode: string
  departmentId: string
  departmentName?: string
  admissionDate: string
  semester: number
  status: EntityStatus
  profileImageUrl?: string
}

export interface Teacher {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  departmentId: string
  departmentName?: string
  specialization: string
  joiningDate: string
  status: EntityStatus
}

export interface Course {
  id: string
  courseCode: string
  courseName: string
  description: string
  credits: number
  departmentId: string
  departmentName?: string
  teacherId?: string
  teacherName?: string
  semester: number
  status: EntityStatus
}

export interface SchoolClass {
  id: string
  className: string
  courseId: string
  courseName?: string
  teacherId: string
  teacherName?: string
  room: string
  day: string
  startTime: string
  endTime: string
  semester: number
  status: EntityStatus
}

export interface Enrollment {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  enrollmentDate: string
  semester: number
  status: EntityStatus
}

export interface Attendance {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  classId?: string
  date: string
  status: AttendanceStatus
  remarks?: string
}

export interface Grade {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  assignmentId?: string
  assignmentTitle?: string
  marks: number
  maxMarks: number
  grade: string
  remarks?: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseName?: string
  dueDate: string
  maxMarks: number
  status: AssignmentStatus
}

export interface Notification {
  id: string
  title: string
  message?: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages?: number
}

export interface ListResponse<T> {
  data: T[]
  message?: string
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiErrorShape {
  success: false
  message: string
  errorCode?: string
  errors?: Record<string, string>
}

export interface AdminDashboard {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalDepartments: number
  activeStudents: number
  inactiveStudents: number
  studentStatusDistribution: { name: string; value: number }[]
  attendanceOverview: { name: string; value: number }[]
  courseDistribution: { name: string; value: number }[]
  enrollmentTrends: { name: string; value: number }[]
  recentStudents: Student[]
  recentCourses: Course[]
  recentEnrollments: Enrollment[]
  recentNotifications: Notification[]
}

export interface TeacherDashboard {
  assignedCourses: Course[]
  totalStudents: number
  todaysClasses: SchoolClass[]
  pendingAssignments: Assignment[]
  recentAttendance: Attendance[]
  recentNotifications: Notification[]
}

export interface StudentDashboard {
  enrolledCourses: Course[]
  attendancePercentage: number
  averageGrade: string
  pendingAssignments: Assignment[]
  recentGrades: Grade[]
  upcomingClasses: SchoolClass[]
  notifications: Notification[]
}

export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
  [key: string]: string | number | undefined
}
