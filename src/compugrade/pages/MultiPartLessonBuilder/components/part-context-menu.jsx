

import { useState } from "react"
import { MoreVertical, Edit, Copy, Trash2 } from "lucide-react"

export function PartContextMenu({ onEdit, onDuplicate, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
            <div
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Part
            </div>
            <div
              onClick={() => {
                onDuplicate()
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </div>
            <div className="border-t border-gray-100 my-1" />
            <div
              onClick={() => {
                onDelete()
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Part
            </div>
          </div>
        </>
      )}
    </div>
  )
}
