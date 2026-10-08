import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, UserCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatFullName, initialsFromName } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'
import { getNotifications } from '../../api/notificationApi'
import ConfirmDialog from '../modals/ConfirmDialog'

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const fullName = formatFullName(user?.firstName, user?.lastName)

  useEffect(() => {
    getNotifications({ isRead: 'false', page: 0, limit: 1 })
      .then((response) => setUnreadCount(response.total))
      .catch(() => {
        // Silently leave the badge at its previous value — the page-level
        // notification list already surfaces the toast for this failure.
      })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleConfirmLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate(ROUTES.LOGIN)
    } finally {
      setLoggingOut(false)
      setConfirmLogoutOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <button onClick={onMenuClick} className="rounded p-2 text-gray-500 hover:bg-surface md:hidden">
        <Menu size={20} />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="relative rounded p-2 text-gray-500 hover:bg-surface"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-input px-2 py-1 hover:bg-surface"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary">
              {initialsFromName(fullName)}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 md:block">{fullName}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-card border border-border bg-white py-1 shadow-card">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate(ROUTES.PROFILE)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface"
              >
                <UserCircle size={16} />
                Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setConfirmLogoutOpen(true)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-surface"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        title="Log out"
        message="Are you sure you want to log out of Student Management System?"
        confirmLabel="Logout"
        loading={loggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </header>
  )
}
