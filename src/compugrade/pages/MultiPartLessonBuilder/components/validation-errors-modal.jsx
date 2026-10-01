import { X, AlertTriangle } from "lucide-react"

export function ValidationErrorsModal({ open, onOpenChange, errors = [] }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-semibold text-gray-900">Please fix the following before publishing</h2>
          </div>
          <div onClick={() => onOpenChange(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </div>
        </div>
        <div className="max-h-80 overflow-auto pr-1">
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-end">
          <div onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">OK</div>
        </div>
      </div>
    </div>
  )
}


