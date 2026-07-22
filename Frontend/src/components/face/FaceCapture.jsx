import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Camera, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { detectFace } from '../../api/faceApi'

/**
 * FaceCapture — reusable webcam component jo:
 *  1. Live camera feed dakhavto
 *  2. Photo capture karto
 *  3. Optionally /api/face/detect call karun face check karto (preview mode)
 *  4. onCapture(imageBase64) callback parent component la pathavto
 *
 * Usage:
 *   <FaceCapture onCapture={(img) => doSomethingWith(img)} autoDetect />
 */
export default function FaceCapture({ onCapture, autoDetect = false, buttonLabel = 'Capture Photo' }) {
  const webcamRef = useRef(null)
  const [camReady, setCamReady]   = useState(false)
  const [camError, setCamError]   = useState('')
  const [captured, setCaptured]   = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [detectResult, setDetectResult] = useState(null)

  const videoConstraints = {
    facingMode: 'user',
    width: 640,
    height: 480,
  }

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      setCamError('Could not capture image. Try again.')
      return
    }
    setCaptured(imageSrc)
    setDetectResult(null)

    if (autoDetect) {
      runDetection(imageSrc)
    } else {
      onCapture?.(imageSrc)
    }
  }, [autoDetect, onCapture])

  const runDetection = async (imageSrc) => {
    try {
      setDetecting(true)
      const res = await detectFace(imageSrc)
      setDetectResult(res.data)
      if (res.data.detected) {
        onCapture?.(imageSrc)
      }
    } catch (err) {
      setDetectResult({ detected: false, message: 'Detection failed. Try again.' })
    } finally {
      setDetecting(false)
    }
  }

  const handleRetake = () => {
    setCaptured(null)
    setDetectResult(null)
  }

  return (
    <div className="space-y-4">
      {/* Camera / Captured Preview */}
      <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
        {!captured ? (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => setCamReady(true)}
              onUserMediaError={() => setCamError('Camera access denied. Please allow camera permission.')}
              className="w-full h-full object-cover"
            />
            {/* Face guide oval */}
            {camReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-52 border-2 border-emerald-400 rounded-full opacity-50" />
              </div>
            )}
            {!camReady && !camError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <img src={captured} alt="Captured face" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Error */}
      {camError && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} /> {camError}
        </div>
      )}

      {/* Detection result (only if autoDetect=true) */}
      {detecting && (
        <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">
          <Loader2 size={16} className="animate-spin" /> Checking for face...
        </div>
      )}
      {detectResult && !detecting && (
        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg
          ${detectResult.detected ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
          {detectResult.detected
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />}
          {detectResult.message || (detectResult.detected ? 'Face detected!' : 'No face detected.')}
        </div>
      )}

      {/* Action buttons */}
      {!captured ? (
        <button
          onClick={handleCapture}
          disabled={!camReady}
          className="btn-success w-full py-3 flex items-center justify-center gap-2"
        >
          <Camera size={18} /> {buttonLabel}
        </button>
      ) : (
        <button
          onClick={handleRetake}
          className="btn-outline w-full py-2.5 flex items-center justify-center gap-2"
        >
          <RefreshCw size={15} /> Retake Photo
        </button>
      )}
    </div>
  )
}
