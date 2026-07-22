import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout        from './components/layout/Layout'
import HomePage       from './pages/home/HomePage'
import LoginPage     from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import StudentsPage  from './pages/students/StudentsPage'
import StudentDetailPage from './pages/students/StudentDetailPage'
import CoursesPage   from './pages/courses/CoursesPage'
import CourseDetailPage from './pages/courses/CourseDetailPage'
import SessionPage   from './pages/attendance/SessionPage'
import QRScanPage    from './pages/attendance/QRScanPage'
import FaceScanPage  from './pages/attendance/FaceScanPage'
import ReportsPage   from './pages/reports/ReportsPage'
import Loader        from './components/common/Loader'
import TeacherPage from "./pages/teachers/TeacherPage";

// Protected route — login nasel tar /login la pathavto
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader fullScreen />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Loader fullScreen />

  return (
    <Routes>
      {/* "/" — logged out zalyas marketing Home page; login zalyas Dashboard la redirect */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />

      {/* Public auth pages */}
      <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/qr-scan"   element={<QRScanPage />} />
      <Route path="/face-scan" element={<FaceScanPage />} />

      {/* Protected app — Navbar + Sidebar wrapped Layout */}
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route path="dashboard"            element={<DashboardPage />} />
        <Route path="students"             element={<StudentsPage />} />
        <Route path="students/:id"         element={<StudentDetailPage />} />
        <Route path="courses"              element={<CoursesPage />} />
        <Route path="courses/:id"          element={<CourseDetailPage />} />
        <Route path="attendance"           element={<SessionPage />} />
        <Route path="reports"              element={<ReportsPage />} />
        <Route path="teachers"            element={<TeacherPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
