import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

const titles = {
  '/dashboard':  'Dashboard',
  '/students':   'Students',
  '/courses':    'Courses',
  '/attendance': 'Attendance',
  '/reports':    'Reports',
}

export default function Layout() {
  const loc = useLocation()
  const title = Object.entries(titles).find(([k]) =>
    loc.pathname === k || loc.pathname.startsWith(k + '/')
  )?.[1] || 'Smart Attendance'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
