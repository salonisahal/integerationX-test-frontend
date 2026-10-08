import { NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { navItemsForRole } from '../../constants/navConfig'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Responsive sidebar. Renders only the nav items the current role is
// allowed to see (RBAC) and marks the active link via NavLink's callback.
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { role } = useAuth()
  const items = navItemsForRole(role)

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-gray-300 transition-transform
          md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 px-6 py-5 text-white">
          <GraduationCap size={24} className="text-primary-light" />
          <span className="text-base font-semibold">Student MS</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-input px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 text-xs text-gray-500">Student Management System</div>
      </aside>
    </>
  )
}
