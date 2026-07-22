import { useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import Webcam from 'react-webcam'
import { Camera, CheckCircle, XCircle, Loader2, RefreshCw, Upload } from 'lucide-react'
import { faceScan } from '../../api/faceApi'

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

export default function FaceScanPage() {
  const [params]  = useSearchParams()
  const sessionId = params.get('sessionId') || ''

  const webcamRef = useRef(null)
  const fileRef   = useRef(null)

  const [mode,     setMode]    = useState('camera')
  const [result,   setResult]  = useState(null)
  const [error,    setError]   = useState('')
  const [busy,     setBusy]    = useState(false)
  const [camReady, setCamReady]= useState(false)
  const [preview,  setPreview] = useState(null)

  const markAttendance = async (imageBase64) => {
    if (!sessionId) return setError('No session ID found in URL.')
    try {
      setBusy(true); setError('')
      const compressed = await compressImage(imageBase64)
      const res = await faceScan(Number(sessionId), compressed)
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Face not recognized. Try again.')
    } finally { setBusy(false) }
  }

  const handleCapture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot()
    if (!img) return setError('Camera not ready. Allow camera access.')
    markAttendance(img)
  }, [sessionId])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // ✅ avif pan accept karto
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
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

  const handleReset = () => {
    setResult(null); setError('')
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] to-[#00695c]
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex bg-white/10 p-4 rounded-2xl mb-3">
            <Camera size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Face Attendance</h1>
          <p className="text-emerald-200 text-sm mt-1">
            Use camera or upload a photo to mark attendance
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-5">
          {result ? (
            <div className="text-center py-4">
              <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold">Attendance Marked!</h2>
              <p className="text-gray-500 mt-1">{result.studentName}</p>
              <div className="mt-4 bg-green-50 rounded-xl p-4 text-sm space-y-1 text-left">
                <p><span className="text-gray-500">Roll No:</span>
                  <strong className="ml-1">{result.rollNumber}</strong></p>
                <p><span className="text-gray-500">Status:</span>
                  <strong className={`ml-1 ${result.status==='PRESENT'
                    ?'text-green-600':'text-orange-500'}`}>
                    {result.status}
                  </strong></p>
                <p><span className="text-gray-500">Confidence:</span>
                  <strong className="ml-1 text-blue-600">
                    {result.faceConfidence
                      ? (result.faceConfidence*100).toFixed(1)+'%' : '—'}
                  </strong></p>
                <p><span className="text-gray-500">Time:</span>
                  <span className="ml-1">
                    {new Date(result.markedAt).toLocaleTimeString()}
                  </span></p>
              </div>
              <button onClick={handleReset}
                className="btn-outline w-full mt-4 flex items-center justify-center gap-1">
                <RefreshCw size={15}/> Mark Next Student
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setMode('camera'); setPreview(null); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                              text-sm font-medium transition-all
                    ${mode==='camera'?'bg-white shadow text-emerald-700':'text-gray-500'}`}>
                  <Camera size={14}/> Live Camera
                </button>
                <button
                  onClick={() => { setMode('upload'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                              text-sm font-medium transition-all
                    ${mode==='upload'?'bg-white shadow text-emerald-700':'text-gray-500'}`}>
                  <Upload size={14}/> Upload Photo
                </button>
              </div>

              {/* Camera Mode */}
              {mode === 'camera' && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode:'user', width:640, height:480 }}
                      onUserMedia={() => setCamReady(true)}
                      onUserMediaError={() => setError('Camera access denied.')}
                      className="w-full h-full object-cover"
                    />
                    {camReady && (
                      <div className="absolute inset-0 flex items-center justify-center
                                      pointer-events-none">
                        <div className="w-36 h-44 border-2 border-emerald-400/60 rounded-full"/>
                      </div>
                    )}
                    {!camReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={28} className="text-white animate-spin"/>
                      </div>
                    )}
                  </div>
                  <button onClick={handleCapture} disabled={busy || !camReady}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center
                               justify-center gap-2 bg-emerald-600 text-white
                               hover:bg-emerald-500 transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed">
                    {busy
                      ? <><Loader2 size={16} className="animate-spin"/> Recognizing...</>
                      : <><Camera size={16}/> Capture & Mark Attendance</>}
                  </button>
                </div>
              )}

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="space-y-3">
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                      <img src={preview} alt="Preview"
                        className="w-full h-full object-contain"/>
                      <button
                        onClick={() => {
                          setPreview(null)
                          if (fileRef.current) fileRef.current.value = ''
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1
                                   shadow text-gray-500 hover:text-red-500">
                        <XCircle size={18}/>
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8
                                      text-center block hover:border-emerald-400 transition-colors
                                      cursor-pointer">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
                      <p className="text-sm text-gray-500 mb-1">
                        Click to upload student photo
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, AVIF, WebP supported
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,image/avif,image/gif,image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}

                  <button onClick={handleUploadMark} disabled={busy || !preview}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center
                               justify-center gap-2 bg-emerald-600 text-white
                               hover:bg-emerald-500 transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed">
                    {busy
                      ? <><Loader2 size={16} className="animate-spin"/> Recognizing...</>
                      : <><Upload size={16}/> Mark Attendance with Photo</>}
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm
                                bg-red-50 p-3 rounded-lg border border-red-200">
                  <XCircle size={16}/> {error}
                </div>
              )}

              <p className="text-center text-xs text-gray-400">
                {mode==='camera'
                  ? 'Position your face inside the oval guide and click capture'
                  : 'Upload the registered photo of the student'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}