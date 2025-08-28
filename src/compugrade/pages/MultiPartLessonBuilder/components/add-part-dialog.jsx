

import { useState } from "react"
import { X, FileText, Target, Layers } from "lucide-react"

export function AddPartDialog({ open, onOpenChange, onAddPart }) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("text")
  const [weightage, setWeightage] = useState(10)

  const partTypes = [
    {
      value: "text",
      label: "Text-Based",
      description: "Rich text content with images and videos",
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      value: "objective",
      label: "Objective-Based",
      description: "Questions and assessments",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      value: "hybrid",
      label: "Hybrid",
      description: "Combination of text and objectives",
      icon: <Layers className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onAddPart({ title: title.trim(), weightage })
      setTitle("")
      setType("text")
      setWeightage(10)
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center m-10 justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Part</h2>
            <p className="text-sm text-gray-500">Create a new lesson part with content and configuration.</p>
          </div>
          <div
            onClick={() => onOpenChange(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Part Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter part title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Part Type</label>
            <div className="space-y-2">
              {partTypes.map((partType) => (
                <div key={partType.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={partType.value}
                    name="partType"
                    value={partType.value}
                    checked={type === partType.value}
                    onChange={(e) => setType(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={partType.value}
                    className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className={partType.color}>{partType.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{partType.label}</div>
                      <div className="text-sm text-gray-500">{partType.description}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div> */}

          <div className="space-y-2">
            <label htmlFor="weightage" className="block text-sm font-medium text-gray-700">
              Weightage (%)
            </label>
            <input
              id="weightage"
              type="number"
              min="0"
              max="100"
              value={weightage}
              onChange={(e) => setWeightage(Number.parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4 pb-4">
            <button
              type="div"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Part
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
