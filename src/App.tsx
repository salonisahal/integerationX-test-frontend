import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Layout shell shared by every protected screen (Sidebar + TopBar + Outlet).
// Toaster is mounted once here as a sibling of the layout, never re-mounted
// per page.
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
