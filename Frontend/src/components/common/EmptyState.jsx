// Koni data nasel tar (no students, no courses, etc) hi friendly empty screen dakhavto
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-gray-100 p-5 rounded-full mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-lg">{title}</h3>
      <p className="text-gray-400 text-sm mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
