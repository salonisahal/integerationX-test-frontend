import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, Eye } from 'lucide-react'
import { getCourses, deleteCourse } from '../../api/courseApi'
import { getDepartments } from '../../api/departmentApi'
import { getTeachers } from '../../api/teacherApi'
import type { Course, Department, Teacher } from '../../types'
import { useListQuery } from '../../hooks/useListQuery'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/tables/SearchBar'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Pagination from '../../components/tables/Pagination'
import Badge, { statusToTone } from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'

export default function CourseList() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const canManage = role === 'ADMIN'

  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [semester, setSemester] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getCourses, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    teacherId: teacherId || undefined,
    semester: semester || undefined,
    status: status || undefined,
  })

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 }).then((response) => setDepartments(response.data)).catch(() => undefined)
    getTeachers({ page: 0, limit: 100 }).then((response) => setTeachers(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, departmentId, teacherId, semester, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCourse(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  const columns: DataTableColumn<Course>[] = [
    { header: 'Code', render: (course) => course.courseCode },
    { header: 'Name', render: (course) => course.courseName },
    { header: 'Credits', render: (course) => course.credits },
    { header: 'Department', render: (course) => course.departmentName ?? '-' },
    { header: 'Teacher', render: (course) => course.teacherName ?? '-' },
    { header: 'Semester', render: (course) => course.semester },
    { header: 'Status', render: (course) => <Badge tone={statusToTone(course.status)}>{course.status}</Badge> },
    {
      header: 'Actions',
      render: (course) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => navigate(ROUTES.COURSE_DETAIL(course.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Eye size={16} />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => navigate(ROUTES.COURSE_EDIT(course.id))}
                className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(course)}
                className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Browse and manage course offerings."
        actions={
          canManage && (
            <Button onClick={() => navigate(ROUTES.COURSE_NEW)}>
              <Plus size={16} />
              Add Course
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search courses" />
        <Select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="max-w-[170px]">
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
        <Select value={teacherId} onChange={(event) => setTeacherId(event.target.value)} className="max-w-[170px]">
          <option value="">All Teachers</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))}
        </Select>
        <Select value={semester} onChange={(event) => setSemester(event.target.value)} className="max-w-[150px]">
          <option value="">All Semesters</option>
          {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              Semester {value}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-[150px]">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(course) => course.id}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(course) => navigate(ROUTES.COURSE_DETAIL(course.id))}
        emptyTitle="No courses found."
        emptyAction={
          canManage && (
            <Button onClick={() => navigate(ROUTES.COURSE_NEW)}>
              <Plus size={16} />
              Add Course
            </Button>
          )
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete course"
        message={`Are you sure you want to delete ${deleteTarget?.courseName ?? 'this course'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
