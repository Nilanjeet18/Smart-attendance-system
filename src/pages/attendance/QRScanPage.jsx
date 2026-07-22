import { useSearchParams } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import QRScanner from '../../components/qr/QRScanner'

export default function QRScanPage() {
  const [params] = useSearchParams()
  const token    = params.get('token') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] to-[#1565c0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex bg-white/10 p-4 rounded-2xl mb-3">
            <QrCode size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
          <p className="text-blue-200 text-sm mt-1">Enter your roll number to confirm</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <QRScanner token={token} />
        </div>
      </div>
    </div>
  )
}
