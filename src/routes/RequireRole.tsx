import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'
import { dashboardPathForRole } from '../constants/navConfig'

interface RequireRoleProps {
  allowedRoles: Role[]
}

// Enforces section-level role restrictions (e.g. Users/Settings admin-only).
// A role attempting a disallowed route is redirected to their own dashboard
// rather than shown a raw 403 screen, since the sidebar already hides these
// links — this exists as a defense-in-depth guard against manual URL entry.
export default function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { role } = useAuth()

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />
  }

  return <Outlet />
}
