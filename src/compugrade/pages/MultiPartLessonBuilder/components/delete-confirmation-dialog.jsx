

import { AlertTriangle, X } from "lucide-react"

export function DeleteConfirmationDialog({ open, onOpenChange, partTitle, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-2">Delete Part</h2>
          </div>
          <div
            onClick={() => onOpenChange(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">"{partTitle}"</span>? This action cannot be
            undone and all content in this part will be permanently lost.
          </p>
        </div>

        <div className="flex gap-3 justify-center items-center w-full">
          <div
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </div>
          <div
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete Part
          </div>
        </div>
      </div>
    </div>
  )
}
