import { useEffect, useState, useRef } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { refreshQR } from '../../api/attendanceApi'
import toast from 'react-hot-toast'

export default function QRDisplay({
  sessionId, qrToken, qrImageBase64,
  expiresInSeconds, onRefresh, onExpiring
}) {
  const [timer,      setTimer]      = useState(expiresInSeconds || 0)
  const [refreshing, setRefreshing] = useState(false)
  const [warnedExp,  setWarnedExp]  = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimer(expiresInSeconds || 0)
    setWarnedExp(false)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(intervalRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [qrToken, expiresInSeconds])

  // 2 minute warning — ekdach notification pathavto
  useEffect(() => {
    if (timer === 120 && !warnedExp) {
      setWarnedExp(true)
      onExpiring?.()
    }
  }, [timer, warnedExp, onExpiring])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const res = await refreshQR(sessionId)
      onRefresh?.(res.data)
      toast.success('QR code refreshed!')
    } catch {
      toast.error('Failed to refresh QR code')
    } finally { setRefreshing(false) }
  }

  const mins = Math.floor(timer / 60)
  const secs = timer % 60
  const isExpired  = timer === 0
  const isExpiring = timer <= 30 && timer > 0

  const timerColor = isExpired  ? 'text-red-500'
                   : isExpiring ? 'text-orange-400'
                   : 'text-green-500'

  if (!qrToken && !qrImageBase64) return (
    <div className="text-center py-8 text-gray-400">
      <AlertCircle size={32} className="mx-auto mb-2 opacity-40"/>
      <p className="text-sm">No QR code available.</p>
    </div>
  )

  return (
    <div className="text-center space-y-4">
      {/* QR Image */}
      <div className="flex justify-center">
        <div className={`p-3 border-2 rounded-2xl bg-white transition-colors
          ${isExpired ? 'border-red-300 opacity-50' : 'border-blue-300'}`}>
          {qrImageBase64 ? (
            <img
              src={`data:image/png;base64,${qrImageBase64}`}
              alt="Attendance QR Code"
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-sm">
              QR loading...
            </div>
          )}
        </div>
      </div>

      {/* Countdown */}
      <div className={`text-2xl font-mono font-bold ${timerColor}`}>
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        <span className="text-sm font-normal text-gray-400 ml-2">
          {isExpired ? 'expired' : 'remaining'}
        </span>
      </div>

      {isExpired && (
        <p className="text-red-400 text-sm font-medium flex items-center justify-center gap-1">
          <AlertCircle size={14}/> QR expired — refresh to generate a new one
        </p>
      )}

      <button onClick={handleRefresh} disabled={refreshing}
        className="btn-outline flex items-center gap-2 mx-auto">
        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/>
        {refreshing ? 'Refreshing...' : 'Refresh QR Code'}
      </button>

      <p className="text-xs text-gray-400">
        Students scan this code to mark their attendance
      </p>
    </div>
  )
}