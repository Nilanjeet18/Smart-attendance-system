import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

// react-hot-toast var custom styled wrapper — consistent icons + colors sathi
// Vapar: import { showSuccess, showError } from '../components/common/Toast'

export const showSuccess = (message) =>
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border-l-4 border-green-500 max-w-sm`}>
      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  ))

export const showError = (message) =>
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border-l-4 border-red-500 max-w-sm`}>
      <XCircle size={20} className="text-red-500 flex-shrink-0" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  ))

export const showWarning = (message) =>
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border-l-4 border-orange-500 max-w-sm`}>
      <AlertTriangle size={20} className="text-orange-500 flex-shrink-0" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  ))

export const showInfo = (message) =>
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border-l-4 border-blue-500 max-w-sm`}>
      <Info size={20} className="text-blue-500 flex-shrink-0" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  ))

// Default export — direct toast object pan vaparta yeto
export default { showSuccess, showError, showWarning, showInfo }
