import {
  Bell, Search, Users, BookOpen,
  GraduationCap, Calendar, CheckCircle2,
  AlertTriangle, Info, XCircle, Trash2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllStudents } from '../../api/studentApi'
import { getAllCourses } from '../../api/courseApi'
import { getAllTeachers } from '../../api/teacherApi'
import { getSessionsByDate } from '../../api/attendanceApi'
import { format, formatDistanceToNow } from 'date-fns'

export default function Navbar({ title }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()

  const [search,     setSearch]     = useState('')
  const [students,   setStudents]   = useState([])
  const [courses,    setCourses]    = useState([])
  const [teachers,   setTeachers]   = useState([])
  const [sessions,   setSessions]   = useState([])
  const [results,    setResults]    = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [showNotif,  setShowNotif]  = useState(false)

  const notifRef  = useRef(null)
  const searchRef = useRef(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    Promise.all([
      getAllStudents(),
      getAllCourses(),
      getAllTeachers(),
      getSessionsByDate(today),
    ]).then(([s, c, t, ses]) => {
      setStudents(s.data)
      setCourses(c.data)
      setTeachers(t.data)
      setSessions(ses.data)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!search.trim()) { setResults([]); setShowSearch(false); return }
    const kw = search.toLowerCase()
    setResults([
      ...students.filter(s =>
        s.name?.toLowerCase().includes(kw) ||
        s.rollNumber?.toLowerCase().includes(kw) ||
        s.email?.toLowerCase().includes(kw)
      ).map(s => ({ id: s.id, type: 'Student', icon: Users,
        title: s.name, subtitle: s.rollNumber, route: '/students' })),

      ...courses.filter(c =>
        c.name?.toLowerCase().includes(kw) ||
        c.courseCode?.toLowerCase().includes(kw)
      ).map(c => ({ id: c.id, type: 'Course', icon: BookOpen,
        title: c.name, subtitle: c.courseCode, route: `/courses/${c.id}` })),

      ...teachers.filter(t =>
        t.name?.toLowerCase().includes(kw) ||
        t.employeeId?.toLowerCase().includes(kw)
      ).map(t => ({ id: t.id, type: 'Teacher', icon: GraduationCap,
        title: t.name, subtitle: t.employeeId, route: '/teachers' })),

      ...sessions.filter(s =>
        s.courseName?.toLowerCase().includes(kw) ||
        s.courseCode?.toLowerCase().includes(kw) ||
        s.topic?.toLowerCase().includes(kw)
      ).map(s => ({ id: s.id, type: 'Session', icon: Calendar,
        title: s.courseCode, subtitle: s.topic || 'Session', route: '/attendance' })),
    ])
    setShowSearch(true)
  }, [search, students, courses, teachers, sessions])

  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))  setShowNotif(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const notifIcon = (type) => ({
    success: <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />,
    error:   <XCircle      size={15} className="text-red-500    flex-shrink-0 mt-0.5" />,
    info:    <Info         size={15} className="text-blue-500   flex-shrink-0 mt-0.5" />,
  }[type] || <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />)

  const notifBg = (type, read) => {
    if (read) return 'bg-white hover:bg-gray-50'
    return ({
      success: 'bg-green-50  hover:bg-green-100',
      warning: 'bg-orange-50 hover:bg-orange-100',
      error:   'bg-red-50    hover:bg-red-100',
      info:    'bg-blue-50   hover:bg-blue-100',
    }[type] || 'bg-gray-50 hover:bg-gray-100')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center
                       justify-between sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">

        {/* ── Search ── */}
        <div ref={searchRef} className="hidden md:block relative w-80">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowSearch(true)}
            placeholder="Search students, teachers, courses..."
            className="w-full bg-gray-100 rounded-lg pl-10 pr-3 py-2 text-sm
                       outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSearch && results.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white border rounded-xl
                            shadow-lg max-h-80 overflow-y-auto z-50">
              {results.map(item => {
                const Icon = item.icon
                return (
                  <button key={`${item.type}-${item.id}`}
                    onClick={() => { navigate(item.route); setSearch(''); setShowSearch(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50
                               border-b last:border-b-0 transition text-left">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.type} • {item.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Notification Bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(p => !p)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition">
            <Bell size={18} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                               bg-red-500 text-white text-[10px] font-bold rounded-full
                               flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200
                            rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold
                                     rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button onClick={markAllRead}
                      className="text-xs text-blue-600 hover:underline">
                      Mark all read
                    </button>
                    <button onClick={clearAll}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                      title="Clear all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-300 mt-1">
                      Start a session to see updates here
                    </p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id}
                      onClick={() => {
                        markRead(n.id)
                        if (n.link) { navigate(n.link); setShowNotif(false) }
                      }}
                      className={`flex items-start gap-3 px-4 py-3 border-b
                                  last:border-b-0 cursor-pointer transition-colors
                                  ${notifBg(n.type, n.read)}`}>
                      {notifIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-sm leading-snug
                            ${n.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full
                                             flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        {n.message && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile ── */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
                          text-white text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}