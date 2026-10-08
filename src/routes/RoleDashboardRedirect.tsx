import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dashboardPathForRole } from '../constants/navConfig'

// Root "/" redirect target — sends the signed-in user to the dashboard
// matching their role.
export default function RoleDashboardRedirect() {
  const { role } = useAuth()
  return <Navigate to={dashboardPathForRole(role)} replace />
}
