import { useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import FaceCapture from './FaceCapture'
import Modal from '../common/Modal'
import { registerFace } from '../../api/studentApi'
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

export default function FaceRegister({ open, studentId, studentName, onClose, onSuccess }) {
  const [mode,   setMode]   = useState('camera')
  const [saving, setSaving] = useState(false)

  const handleSave = async (imageBase64) => {
    try {
      setSaving(true)
      const compressed = await compressImage(imageBase64, 600, 0.85)
      await registerFace(studentId, compressed)
      toast.success(`Face registered for ${studentName}!`)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Face registration failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ avif, webp, jpg, png, gif sarvach accept karto
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => handleSave(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <Modal open={open} onClose={onClose}
      title={`Register Face — ${studentName || ''}`} size="md">
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                        text-sm font-medium transition-all
              ${mode === 'camera' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>
            <Camera size={15} /> Use Camera
          </button>
          <button onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md
                        text-sm font-medium transition-all
              ${mode === 'upload' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>
            <Upload size={15} /> Upload Photo
          </button>
        </div>

        {/* Camera mode */}
        {mode === 'camera' && (
          <FaceCapture
            buttonLabel={saving ? 'Saving...' : 'Capture & Register'}
            onCapture={handleSave}
          />
        )}

        {/* Upload mode */}
        {mode === 'upload' && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center
                          hover:border-blue-400 transition-colors">
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-1">
              Choose a clear, front-facing photo of the student
            </p>
            <p className="text-xs text-gray-400 mb-3">
              JPG, PNG, AVIF, WebP supported · Auto-compressed
            </p>
            <label className={`btn-primary cursor-pointer inline-flex items-center gap-2
              ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <Upload size={15} />
              {saving ? 'Processing...' : 'Choose File'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,image/avif,image/gif,image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={saving}
              />
            </label>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Tip: Use a well-lit photo with only one face visible for best results.
        </p>
      </div>
    </Modal>
  )
}