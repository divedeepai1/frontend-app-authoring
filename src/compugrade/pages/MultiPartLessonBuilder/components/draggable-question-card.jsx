

import { useState } from "react"
import { GripVertical } from "lucide-react"

export function DraggableQuestionCard({
  question,
  index,
  onQuestionChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
    onDragStart(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
    onDragOver(index)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(index)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2 text-gray-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
        </div>
      </div>

      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all ${
          isDragOver ? "border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-2" : ""
        }`}
      >
        {children}
      </div>
    </div>
  )
}
