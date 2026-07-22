import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, BookOpen, TrendingUp } from 'lucide-react'
import { getStudentById, registerFace, getFaceStatus, getStudentAttendancePct } from '../../api/studentApi'
import { getAllCourses } from '../../api/courseApi'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

// ✅ avif/webp/png/jpg sarvach formats JPEG madhe convert karto
function compressImage(dataUrl, maxWidth = 600, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width  = maxWidth
      }
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function StudentDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [student,    setStudent]    = useState(null)
  const [courses,    setCourses]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [faceStatus, setFaceStatus] = useState(null)

  const load = async () => {
    try {
      const [sRes, cRes, fRes] = await Promise.all([
        getStudentById(id),
        getAllCourses(),
        getFaceStatus(id),
      ])
      setStudent(sRes.data)
      setCourses(cRes.data)
      setFaceStatus(fRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleFaceRegister = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ avif pan accept karto
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, AVIF, WebP)')
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        // ✅ avif → JPEG compress karun pathavto
        const compressed = await compressImage(ev.target.result)
        await registerFace(id, compressed)
        toast.success('Face registered!')
        load()
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Registration failed')
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) return <Loader />
  if (!student) return <p className="text-gray-500">Student not found.</p>

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm">
        <ArrowLeft size={16}/> Back to Students
      </button>

      {/* Profile Card */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center
                        text-white text-2xl font-bold flex-shrink-0">
          {student.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{student.name}</h2>
          <p className="text-gray-500 text-sm font-mono">{student.rollNumber}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span>📧 {student.email}</span>
            {student.phoneNumber && <span>📞 {student.phoneNumber}</span>}
            {student.department  && <span>🏢 {student.department}</span>}
            {student.semester    && <span>📚 Semester {student.semester}</span>}
          </div>
        </div>

        {/* Face Register button */}
        <div className="flex flex-col gap-2">
          <button onClick={() => fileRef.current.click()}
            className="btn-primary flex items-center gap-2 text-sm">
            <Camera size={15}/>
            {faceStatus?.hasFaceRegistered ? 'Update Face' : 'Register Face'}
          </button>
          {faceStatus?.hasFaceRegistered && (
            <span className="badge-green text-center">✓ Face Registered</span>
          )}
        </div>

        {/* Hidden file input — ✅ avif accept karto */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp,image/avif,image/gif,image/*"
          className="hidden"
          onChange={handleFaceRegister}
        />
      </div>

      {/* Attendance per course */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={17} className="text-blue-600"/> Attendance Summary
        </h3>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses enrolled yet.</p>
        ) : (
          <div className="space-y-3">
            {courses.map(c => (
              <AttendanceRow key={c.id} studentId={id} course={c}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AttendanceRow({ studentId, course }) {
  const [pct, setPct] = useState(null)

  useEffect(() => {
    getStudentAttendancePct(studentId, course.id)
      .then(r => setPct(r.data.percentage))
      .catch(() => setPct(null))
  }, [studentId, course.id])

  const isAtRisk = pct !== null && pct < 75

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
      <div className="bg-blue-50 p-2 rounded-lg">
        <BookOpen size={16} className="text-blue-600"/>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{course.name}</p>
        <p className="text-xs text-gray-400">{course.courseCode}</p>
      </div>
      <div className="text-right">
        {pct === null ? (
          <span className="text-gray-400 text-sm">—</span>
        ) : (
          <>
            <p className={`font-bold text-lg ${isAtRisk?'text-red-600':'text-green-600'}`}>
              {pct}%
            </p>
            <span className={isAtRisk ? 'badge-red text-xs' : 'badge-green text-xs'}>
              {isAtRisk ? '⚠ At Risk' : '✓ Safe'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}