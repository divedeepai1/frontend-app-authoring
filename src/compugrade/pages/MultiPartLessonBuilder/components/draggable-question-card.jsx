

import { useState } from "react"
import { GripVertical, ChevronDown, ChevronUp, X, Trash, Trash2 } from "lucide-react"

export function DraggableQuestionCard({
  question,
  index,
  onQuestionChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  hideDelete = false,
  hideGrip = false,
  hideNumber = false,
  questionNumber = null,
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      <div className="flex items-center justify-between mb-2 border-b bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center gap-2 text-gray-400 cursor-grab active:cursor-grabbing">
          {!hideGrip && <GripVertical className="w-4 h-4" />}
          {!hideNumber && (
            <span className="text-sm font-medium text-gray-600">{questionNumber !== null ? questionNumber : index + 1}</span>
          )}
        </div>
        {/* <div className="flex items-center gap-2 ">
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors cursor-pointer"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
          {!hideDelete && (
            <div
              onClick={onDelete}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          )}
        </div> */}
      </div>

      {!isCollapsed && (
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
      )}
    </div>
  )
}
