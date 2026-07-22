import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, BookOpen, UserMinus, Play } from 'lucide-react'
import { getCourseById, unenrollStudent } from '../../api/courseApi'
import { getStudentsByCourse } from '../../api/studentApi'
import { getSessionsByCourse } from '../../api/attendanceApi'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function CourseDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [course,    setCourse]   = useState(null)
  const [students,  setStudents] = useState([])
  const [sessions,  setSessions] = useState([])
  const [loading,   setLoading]  = useState(true)
  const [tab,       setTab]      = useState('students')
  const [unenrollId, setUnenrollId] = useState(null)
  const { user } = useAuth()

  const load = () => {
    setLoading(true)
    Promise.all([
      getCourseById(id),
      getStudentsByCourse(id),   // 🔧 FIX: dedicated API call
      getSessionsByCourse(id),
    ])
      .then(([c, s, ses]) => {
        setCourse(c.data)
        setStudents(s.data)      // students separately set karto
        setSessions(ses.data)
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const handleUnenroll = async () => {
    await unenrollStudent(id, unenrollId)
    toast.success('Student removed from course')
    setUnenrollId(null)
    load()
  }

  if (loading) return <Loader />
  if (!course)  return <p className="text-gray-500">Course not found.</p>

  const statusBadge = {
    ACTIVE:    'badge-green',
    CLOSED:    'badge-blue',
    CANCELLED: 'badge-red',
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm">
        <ArrowLeft size={16}/> Back to Courses
      </button>

      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="bg-blue-50 p-4 rounded-2xl">
          <BookOpen size={28} className="text-blue-600"/>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{course.name}</h2>
            <span className="badge-blue">{course.courseCode}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{course.description || 'No description'}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>🏢 {course.department}</span>
            <span>📚 Semester {course.semester}</span>
            <span>📊 {course.totalClasses} classes held</span>
          </div>
        </div>
        {user?.role === "TEACHER" && (
        <button onClick={() => navigate('/attendance')}
          className="btn-primary flex items-center gap-2">
          <Play size={15}/> Start Session
        </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'students', label: `Students (${students.length})`, icon: Users },
          { key: 'sessions',  label: `Sessions (${sessions.length})`, icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all
              ${tab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {tab === 'students' && (
        students.length === 0 ? (
          <EmptyState icon={Users} title="No Students Enrolled"
            message="Go to the Courses page and click 'Enroll' to add students."/>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Roll No.</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Dept</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Face</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">UnRoll</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-700 font-medium">{s.rollNumber}</td>
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-gray-500">{s.email}</td>
                    <td className="py-3 px-4 text-gray-500">{s.department || '—'}</td>
                    <td className="py-3 px-4">
                      {s.hasFaceEncoding
                        ? <span className="badge-green">✓ Set</span>
                        : <span className="badge-orange">Not set</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setUnenrollId(s.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Unenroll">
                        <UserMinus size={15}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Sessions Tab */}
      {tab === 'sessions' && (
        sessions.length === 0 ? (
          <EmptyState icon={Calendar} title="No Sessions Yet"
            message="Start your first attendance session for this course."
            action={
              <button onClick={() => navigate('/attendance')} className="btn-primary">
                Start Session
              </button>
            }/>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Date','Topic','Mode','Status','Present/Total','%'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {format(new Date(s.sessionDate), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.topic || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="badge-blue">{s.attendanceMode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={statusBadge[s.status] || 'badge-blue'}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{s.presentCount}/{s.totalStudents}</td>
                    <td className="py-3 px-4 font-semibold">{s.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <ConfirmModal open={!!unenrollId} title="Unenroll Student" danger
        message="Remove this student from the course?"
        onConfirm={handleUnenroll} onCancel={() => setUnenrollId(null)}/>
    </div>
  )
}
