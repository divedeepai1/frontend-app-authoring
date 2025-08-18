

import { useState } from "react"
import { GripVertical, FileText, Target, Layers } from "lucide-react"
import { PartContextMenu } from "./part-context-menu"

export function DraggablePartCard({
  part,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const partType = part?.type || "text"

  const getPartTypeIcon = (type) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "objective":
        return <Target className="w-4 h-4" />
      case "hybrid":
        return <Layers className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getPartTypeColor = (type) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "objective":
        return "bg-green-100 text-green-800 border-green-200"
      case "hybrid":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-2 cursor-pointer transition-all hover:shadow-md bg-white border border-gray-200 rounded-lg ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
      } ${isDragOver ? "border-2 border-dashed border-blue-400 bg-blue-50" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 text-gray-400 mt-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-medium">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getPartTypeIcon(partType)}
            <h4 className="font-medium text-gray-900 text-sm truncate">{part?.title || "Untitled Part"}</h4>
          </div>

          <div className="flex items-center justify-between">
            {/* <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPartTypeColor(partType)}`}
            >
              {partType.charAt(0).toUpperCase() + partType.slice(1)}
            </span> */}
            <span className="text-xs text-gray-500 font-medium">Weightage {part?.weightage || 0}%</span>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <PartContextMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
