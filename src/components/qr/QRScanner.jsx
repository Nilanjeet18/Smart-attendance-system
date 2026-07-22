import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, QrCode } from 'lucide-react'
import { scanQR } from '../../api/attendanceApi'

/**
 * QRScanner — reusable component jo student cha roll number input gheun
 * QR token validate karto aani attendance mark karto.
 * QRScanPage.jsx ya component la use karto (token URL madhun yeto).
 *
 * Usage:
 *   <QRScanner token={tokenFromUrl} />
 */
export default function QRScanner({ token }) {
  const [roll, setRoll]     = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!roll.trim()) return setError('Please enter your roll number')
    if (!token)       return setError('Invalid QR code — please scan again')

    try {
      setBusy(true)
      setError('')
      setResult(null)
      const res = await scanQR(token, roll.trim())
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Scan failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setRoll('')
    setError('')
  }

  // ── Success State ─────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Attendance Marked!</h2>
        <p className="text-gray-500 mt-1">{result.studentName}</p>

        <div className="mt-4 bg-green-50 rounded-xl p-4 space-y-1 text-sm text-left">
          <p><span className="text-gray-500">Roll No:</span> <strong>{result.rollNumber}</strong></p>
          <p>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-1 font-bold ${result.status === 'PRESENT' ? 'text-green-600' : 'text-orange-500'}`}>
              {result.status}
            </span>
          </p>
          <p><span className="text-gray-500">Time:</span> {new Date(result.markedAt).toLocaleTimeString()}</p>
        </div>

        <button onClick={handleReset} className="btn-outline w-full mt-4">
          Mark Another Student
        </button>
      </div>
    )
  }

  // ── Scan Form ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleScan} className="space-y-4">
      <div className="text-center mb-2">
        <QrCode size={28} className="text-blue-600 mx-auto mb-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
        <input
          className="input text-center text-lg font-mono tracking-wider"
          placeholder="CS2021001"
          value={roll}
          onChange={(e) => setRoll(e.target.value.toUpperCase())}
          autoFocus
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <XCircle size={16} /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
      >
        {busy
          ? <><Loader2 size={18} className="animate-spin" /> Marking...</>
          : '✓ Mark Attendance'}
      </button>
    </form>
  )
}
