import { Link } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import {
  GraduationCap, QrCode, ScanFace, BarChart3, ArrowRight,
  CheckCircle2, Clock, ShieldCheck, Zap, FileSpreadsheet,
  Calendar, BookOpen, Users, Camera, XCircle, Loader2,
  ChevronRight, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../api/axiosInstance'
import { scanQR } from '../../api/attendanceApi'
import { faceScan } from '../../api/faceApi'

/* ─── tiny public axios calls (no auth needed) ──────────────── */
const fetchTodaySessions  = () =>
  api.get(`/attendance/sessions/date/${format(new Date(), 'yyyy-MM-dd')}`)
const fetchActiveSessions = () =>
  api.get('/attendance/sessions/active')

export default function HomePage() {
  const [selectedSession, setSelectedSession] = useState(null)  // session student clicked

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      <NavBar />
      <Hero />
      <LogoStrip />
      <LiveSessions onSessionClick={setSelectedSession} />
      <FeatureGrid />
      <Stats />
      <Footer />

      {/* Student attendance modal */}
      {selectedSession && (
        <StudentAttendanceModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-[#0a1628]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-400 p-1.5 rounded-lg">
            <GraduationCap size={20} className="text-[#0a1628]" />
          </div>
          <span className="font-bold text-lg tracking-tight">Smart Attendance System</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#sessions" className="hover:text-white transition-colors">Sessions</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-medium text-slate-200 hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative pt-40 pb-28 px-6">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px]
                      bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10
                          rounded-full px-3 py-1.5 text-xs font-medium text-amber-300 mb-6">
            <Zap size={12} /> Attendance in under 3 seconds per student
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Roll call,<br /><span className="text-amber-400">automated.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md mb-9 leading-relaxed">
            Generate a live QR code or scan a face — attendance is logged, percentages
            calculated, and reports ready to download. No paper, no manual counting.
          </p>
          <div className="flex items-center gap-6 mt-10 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-amber-400" /> QR Code attendance</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-amber-400" /> Face recognition</span>
          </div>
        </div>
        <ScanMockup />
      </div>
    </section>
  )
}

function ScanMockup() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    let i = 0
    const id = setInterval(() => { i = (i + 1) % 3; setStep(i) }, 1700)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-6 bg-gradient-to-br from-amber-400/20 to-transparent
                      rounded-[2rem] blur-2xl pointer-events-none" />
      <div className="relative bg-[#0f1f38] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400">Course Code · Course Name</p>
            <p className="text-sm font-semibold">Topic Name — Session #Number</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400
                          bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LIVE
          </span>
        </div>
        <div className="relative bg-[#0a1628] rounded-2xl aspect-square flex items-center justify-center overflow-hidden border border-white/5">
          {step !== 2 ? (
            <div className="relative">
              <QrCode size={120} strokeWidth={1.2}
                className={`text-white transition-opacity duration-500 ${step === 1 ? 'opacity-40' : 'opacity-90'}`} />
              {step === 1 && (
                <div className="absolute left-0 right-0 h-0.5 bg-amber-400
                                shadow-[0_0_12px_2px_rgba(251,191,36,0.8)]
                                animate-[scanline_1.6s_ease-in-out_infinite]" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 animate-[popIn_0.4s_ease]">
              <div className="bg-emerald-400/15 rounded-full p-4">
                <CheckCircle2 size={56} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold mt-1">XYZ Student — Marked Present</p>
              <p className="text-xs text-slate-400">Roll Number</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5 text-center">
          {[['-','Present'],['-','Absent'],['-','Rate']].map(([n,l]) => (
            <div key={l} className="bg-white/5 rounded-xl py-2.5">
              <p className="text-lg font-bold text-amber-400">{n}</p>
              <p className="text-[11px] text-slate-400">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scanline { 0%,100%{top:8%} 50%{top:88%} }
        @keyframes popIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOGO STRIP
───────────────────────────────────────────────────────────── */
function LogoStrip() {
  return (
    <div className="border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
        {['Java 17','Spring Boot','MySQL','ZXing QR','React'].map(t => (
          <span key={t} className="text-xs tracking-widest uppercase text-slate-500 font-medium">{t}</span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   🆕 LIVE SESSIONS — real backend data, day-wise
───────────────────────────────────────────────────────────── */
function LiveSessions({ onSessionClick }) {
  const [sessions,  setSessions]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [lastFetch, setLastFetch] = useState(null)
  const today = format(new Date(), 'EEEE, MMMM do')

  const load = async () => {
    try {
      setLoading(true)
      // Active sessions la prefer karto — jar kahi nahi ter today's all sessions bghto
      const [activeRes, todayRes] = await Promise.all([
        fetchActiveSessions(),
        fetchTodaySessions(),
      ])
      // Merge + deduplicate by id
      const active = activeRes.data || []
      const today_all = todayRes.data || []
      const merged = [...active]
      today_all.forEach(s => {
        if (!merged.find(a => a.id === s.id)) merged.push(s)
      })
      // Sort: ACTIVE first, then by startTime desc
      merged.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
        return new Date(b.startTime) - new Date(a.startTime)
      })
      setSessions(merged)
      setLastFetch(new Date())
    } catch (e) {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE')
  const closedSessions = sessions.filter(s => s.status !== 'ACTIVE')

  return (
    <section id="sessions" className="max-w-6xl mx-auto px-6 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Live Sessions</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Today's Classes
          </h2>
          <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
            <Calendar size={14} /> {today}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white
                     border border-white/10 px-3 py-2 rounded-lg transition-colors mt-1">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-amber-400 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        /* Empty state */
        <div className="border border-white/10 rounded-2xl p-16 text-center bg-white/[0.02]">
          <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-slate-500" />
          </div>
          <h3 className="font-semibold text-lg text-slate-300 mb-2">No sessions today</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Your teacher hasn't started any sessions yet. Check back soon or contact your teacher.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ACTIVE sessions — highlighted */}
          {activeSessions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Live Right Now — {activeSessions.length} session{activeSessions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSessions.map(s => (
                  <SessionCard key={s.id} session={s} onClick={() => onSessionClick(s)} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier / closed sessions */}
          {closedSessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Earlier today
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {closedSessions.map(s => (
                  <SessionCard key={s.id} session={s} onClick={null} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {lastFetch && (
        <p className="text-xs text-slate-600 text-right mt-4">
          Last updated {format(lastFetch, 'HH:mm:ss')} · Auto-refreshes every 30s
        </p>
      )}
    </section>
  )
}

function SessionCard({ session, onClick }) {
  const isActive = session.status === 'ACTIVE'
  const time = session.startTime
    ? format(new Date(session.startTime), 'hh:mm a')
    : '—'
  const mode = session.attendanceMode || 'QR_CODE'

  return (
    <div
      onClick={isActive && onClick ? onClick : undefined}
      className={`relative rounded-2xl border p-5 transition-all
        ${isActive
          ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-400/60 cursor-pointer group'
          : 'border-white/10 bg-white/[0.02] opacity-60 cursor-default'}`}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        {isActive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400
                          bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-full">
            {session.status}
          </span>
        )}
        <span className="text-[11px] text-slate-500">{time}</span>
      </div>

      {/* Course info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
          <span className="text-xs font-mono text-slate-400">{session.courseCode}</span>
        </div>
        <h3 className="font-semibold text-sm leading-snug">
          {session.courseName}
        </h3>
        {session.topic && (
          <p className="text-xs text-slate-400 mt-0.5">{session.topic}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Users size={11} /> {session.presentCount}/{session.totalStudents}
        </span>
        {session.classRoom && (
          <span>· {session.classRoom}</span>
        )}
        <span className="ml-auto flex items-center gap-1">
          {mode === 'FACE_DETECTION'
            ? <><ScanFace size={11} /> Face</>
            : mode === 'HYBRID'
              ? <><QrCode size={11} /> QR + Face</>
              : <><QrCode size={11} /> QR</>}
        </span>
      </div>

      {/* CTA */}
      {isActive && onClick && (
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-xs text-emerald-400 font-medium">Click to mark attendance</span>
          <ChevronRight size={15} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   🆕 STUDENT ATTENDANCE MODAL
   Student session card click kelavar ya modal madhe
   QR Code kiva Face Detection select karun attendance mark
───────────────────────────────────────────────────────────── */
function StudentAttendanceModal({ session, onClose }) {
  const [mode, setMode] = useState(null) // null | 'qr' | 'face'

  const sessionMode = session.attendanceMode || 'QR_CODE'
  // Which options to show based on session mode
  const showQR   = sessionMode === 'QR_CODE'   || sessionMode === 'HYBRID'
  const showFace = sessionMode === 'FACE_DETECTION' || sessionMode === 'HYBRID'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1f38] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <p className="text-xs text-slate-400 font-mono">{session.courseCode}</p>
            <h3 className="font-semibold">{session.courseName}</h3>
            {session.topic && <p className="text-xs text-slate-400 mt-0.5">{session.topic}</p>}
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-5">
          {!mode ? (
            /* Mode selection screen */
            <div className="space-y-4">
              <p className="text-sm text-slate-300 text-center mb-6">
                How would you like to mark your attendance?
              </p>

              {showQR && (
                <button onClick={() => setMode('qr')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10
                             bg-white/5 hover:bg-amber-400/10 hover:border-amber-400/40
                             transition-all group">
                  <div className="bg-amber-400/10 p-3 rounded-xl group-hover:bg-amber-400/20 transition-colors">
                    <QrCode size={24} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">QR Code Scan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Enter your roll number after scanning</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 ml-auto group-hover:text-amber-400 transition-colors" />
                </button>
              )}

              {showFace && (
                <button onClick={() => setMode('face')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10
                             bg-white/5 hover:bg-emerald-400/10 hover:border-emerald-400/40
                             transition-all group">
                  <div className="bg-emerald-400/10 p-3 rounded-xl group-hover:bg-emerald-400/20 transition-colors">
                    <ScanFace size={24} className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Face Detection</p>
                    <p className="text-xs text-slate-400 mt-0.5">Look at the camera — auto recognized</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 ml-auto group-hover:text-emerald-400 transition-colors" />
                </button>
              )}

              <p className="text-center text-xs text-slate-500 pt-2">
                Session mode: <span className="text-slate-300">{sessionMode.replace('_',' ')}</span>
              </p>
            </div>
          ) : mode === 'qr' ? (
            <QRMarkFlow session={session} onBack={() => setMode(null)} onClose={onClose} />
          ) : (
            <FaceMarkFlow session={session} onBack={() => setMode(null)} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── QR Mark Flow ────────────────────────────────────────── */
function QRMarkFlow({ session, onBack, onClose }) {
  const [roll,   setRoll]   = useState('')
  const [result, setResult] = useState(null)
  const [error,  setError]  = useState('')
  const [busy,   setBusy]   = useState(false)

  // Get the qrToken from session (if session has it attached)
  const qrToken = session.qrToken

  const handleMark = async (e) => {
    e.preventDefault()
    if (!roll.trim()) return setError('Enter your roll number')
    if (!qrToken)     return setError('QR token not available. Ask teacher to refresh.')
    try {
      setBusy(true); setError('')
      const res = await scanQR(qrToken, roll.trim())
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Marking failed. Try again.')
    } finally { setBusy(false) }
  }

  if (result) return <SuccessScreen result={result} onClose={onClose} />

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
        ← Back
      </button>

      <div className="bg-[#0a1628] rounded-xl p-4 text-center border border-white/5">
        <QrCode size={48} className="mx-auto text-amber-400 mb-2" />
        <p className="text-sm font-medium">Scan the QR code displayed in class</p>
        <p className="text-xs text-slate-400 mt-1">Then enter your roll number below</p>
      </div>

      {!qrToken && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-300">
            ⚠ QR token not loaded. Please use the direct QR scan link or ask your teacher.
          </p>
        </div>
      )}

      <form onSubmit={handleMark} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number</label>
          <input
            className="input text-center font-mono tracking-wider"
            placeholder="CS2021001"
            value={roll}
            onChange={e => setRoll(e.target.value.toUpperCase())}
            autoFocus
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <XCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={busy || !qrToken}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                     bg-amber-400 text-[#0a1628] hover:bg-amber-300 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed">
          {busy ? <><Loader2 size={16} className="animate-spin" /> Marking...</> : '✓ Mark Attendance'}
        </button>
      </form>
    </div>
  )
}

/* ── Face Mark Flow ──────────────────────────────────────── */

// Image compress helper — uploaded photos khup mothy asatat
function compressImage(dataUrl, maxWidth = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // AVIF सारखे काही formats load होतात पण width/height 0 राहतो
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error('This image format could not be processed. Please use JPG or PNG.'))
        return
      }
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
    img.onerror = () => reject(new Error('Could not read this image format. Please use JPG or PNG.'))
    img.src = dataUrl
  })
}

function FaceMarkFlow({ session, onBack, onClose }) {
  const webcamRef = useRef(null)
  const fileRef   = useRef(null)

  const [subMode,  setSubMode]  = useState('camera') // 'camera' | 'upload'
  const [camReady, setCamReady] = useState(false)
  const [camError, setCamError] = useState('')
  const [preview,  setPreview]  = useState(null) // uploaded image preview
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  // ── Common: image backend la pathavto ────────────────────
  const markAttendance = async (imageBase64) => {
  try {
    setBusy(true); setError('')
    const compressed = await compressImage(imageBase64)
    const res = await faceScan(session.id, compressed)
    setResult(res.data)
  } catch (err) {
    setError(err?.message || err?.response?.data?.message || 'Face not recognized. Try again.')
  } finally { setBusy(false) }
}

  // ── Camera capture ───────────────────────────────────────
  const handleCapture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot()
    if (!img) return setError('Camera not ready. Allow camera access.')
    markAttendance(img)
  }, [session.id])

  // ── File upload ──────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    const maxSizeMB = 30
    if (file.size > maxSizeMB * 1024 * 1024) 
    {
      setError(`Image too large. Max ${maxSizeMB}MB allowed.`)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUploadMark = () => {
    if (preview) markAttendance(preview)
  }

  if (result) return <SuccessScreen result={result} onClose={onClose} />

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
        ← Back
      </button>

      {/* ── Sub-mode Toggle: Camera / Upload ── */}
      <div className="flex gap-2 bg-white/5 rounded-lg p-1">
        <button onClick={() => { setSubMode('camera'); setPreview(null); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                      text-xs font-medium transition-all
            ${subMode === 'camera' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
          <Camera size={13} /> Live Camera
        </button>
        <button onClick={() => { setSubMode('upload'); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                      text-xs font-medium transition-all
            ${subMode === 'upload' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
          <FileSpreadsheet size={13} /> Upload Photo
        </button>
      </div>

      {/* ── Camera Mode ── */}
      {subMode === 'camera' && (
        <>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
              onUserMedia={() => setCamReady(true)}
              onUserMediaError={() => setCamError('Camera access denied. Please allow camera permission.')}
              className="w-full h-full object-cover"
            />
            {camReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-44 border-2 border-emerald-400/60 rounded-full" />
              </div>
            )}
            {!camReady && !camError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={28} className="text-white animate-spin" />
              </div>
            )}
          </div>

          {camError && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <XCircle size={14} /> {camError}
            </div>
          )}

          <button onClick={handleCapture} disabled={busy || !camReady || !!camError}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                       bg-emerald-500 text-white hover:bg-emerald-400 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed">
            {busy
              ? <><Loader2 size={16} className="animate-spin" /> Recognizing...</>
              : <><Camera size={16} /> Capture & Mark Attendance</>}
          </button>
          <p className="text-center text-xs text-slate-500">
            Look at the camera and click capture
          </p>
        </>
      )}

      {/* ── Upload Mode ── */}
      {subMode === 'upload' && (
        <>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                className="absolute top-2 right-2 bg-white rounded-full p-1
                           shadow text-slate-600 hover:text-red-500 transition-colors">
                <XCircle size={18} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/15 rounded-xl p-8
                              text-center block hover:border-emerald-400/60 transition-colors
                              cursor-pointer">
              <FileSpreadsheet size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400 mb-1">Click to upload your photo</p>
              <p className="text-xs text-slate-500">JPG, PNG, AVIF supported</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.avif"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}

          <button onClick={handleUploadMark} disabled={busy || !preview}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                       bg-emerald-500 text-white hover:bg-emerald-400 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed">
            {busy
              ? <><Loader2 size={16} className="animate-spin" /> Recognizing...</>
              : <><FileSpreadsheet size={16} /> Mark Attendance with Photo</>}
          </button>
          <p className="text-center text-xs text-slate-500">
            Upload your registered photo to mark attendance
          </p>
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          <XCircle size={14} /> {error}
        </div>
      )}
    </div>
  )
}

/* ── Shared Success Screen ───────────────────────────────── */
function SuccessScreen({ result, onClose }) {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="bg-emerald-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={44} className="text-emerald-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Attendance Marked!</h3>
        <p className="text-slate-400 text-sm mt-1">{result.studentName}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4 text-sm space-y-2 text-left border border-white/10">
        <div className="flex justify-between">
          <span className="text-slate-400">Roll No.</span>
          <span className="font-mono font-medium">{result.rollNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <span className={`font-semibold ${result.status === 'PRESENT' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {result.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Marked via</span>
          <span className="text-slate-300">{result.markedVia?.replace('_',' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time</span>
          <span className="text-slate-300">{new Date(result.markedAt).toLocaleTimeString()}</span>
        </div>
        {result.faceConfidence && (
          <div className="flex justify-between">
            <span className="text-slate-400">Face confidence</span>
            <span className="text-emerald-400">{(result.faceConfidence * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <button onClick={onClose}
        className="w-full py-2.5 rounded-xl border border-white/15 text-sm font-medium
                   hover:bg-white/5 transition-colors">
        Close
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FEATURE GRID
───────────────────────────────────────────────────────────── */
function FeatureGrid() {
  const features = [
    { icon:QrCode,          title:'Dynamic QR codes',       desc:'Each session generates a fresh token that expires in 10 minutes — no screenshot, no replay.' },
    { icon:ScanFace,        title:'Face detection',         desc:'Webcam-based recognition marks attendance the moment a registered face is matched.' },
    { icon:BarChart3,       title:'Live percentages',       desc:'Attendance rate per student updates in real time as the session runs.' },
    { icon:FileSpreadsheet, title:'Excel & PDF exports',    desc:'One click turns any date range into a polished report you can hand to administration.' },
    { icon:ShieldCheck,     title:'Role-based access',      desc:'Admins manage every course; teachers see only the ones they run.' },
    { icon:Clock,           title:'Late detection',         desc:'Students who check in after the grace window are automatically marked late, not absent.' },
  ]
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 pb-28">
      <div className="max-w-xl mb-16">
        <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Features</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for the way classes actually run.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon:Icon, title, desc }) => (
          <div key={title}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6
                       hover:border-amber-400/30 hover:bg-white/[0.05] transition-all">
            <div className="bg-amber-400/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Icon size={18} className="text-amber-400" />
            </div>
            <h3 className="font-semibold mb-1.5">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   STATS
───────────────────────────────────────────────────────────── */
function Stats() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[['< 3s','Per-student check-in'],['10 min','QR token lifetime'],['75%','Default attendance threshold'],['2','Export formats']].map(([n,l]) => (
          <div key={l}>
            <p className="text-3xl font-bold text-amber-400 tracking-tight">{n}</p>
            <p className="text-xs text-slate-400 mt-1.5">{l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   CTA + FOOTER
───────────────────────────────────────────────────────────── */


function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2"><GraduationCap size={16} /><span>Smart Attendance System</span></div>
        <span>QR Code + Face Detection · Spring Boot + MySQL</span>
      </div>
    </footer>
  )
}
