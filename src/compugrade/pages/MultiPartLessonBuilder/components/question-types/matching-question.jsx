

import { useState } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"

export function MatchingQuestion({ question, onQuestionChange, onDelete }) {
  const [questionText, setQuestionText] = useState(question.text || "")
  const [pairs, setPairs] = useState(
    question.pairs || [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
  )
  const questionError = !questionText || !questionText.trim() ? 'Question is required.' : null
  const pairsError = pairs.length < 1 ? 'Add at least one pair.' : null
  const emptyPairError = pairs.some((p) => !p.left?.toString().trim() || !p.right?.toString().trim()) ? 'Pair terms and definitions cannot be empty.' : null

  const handleTextChange = (text) => {
    setQuestionText(text)
    onQuestionChange({ ...question, text })
  }

  const handlePairChange = (index, side, value) => {
    const newPairs = [...pairs]
    newPairs[index][side] = value
    setPairs(newPairs)
    onQuestionChange({ ...question, pairs: newPairs })
  }

  const addPair = () => {
    const newPairs = [...pairs, { left: "", right: "" }]
    setPairs(newPairs)
    onQuestionChange({ ...question, pairs: newPairs })
  }

  const removePair = (index) => {
    if (pairs.length > 2) {
      const newPairs = pairs.filter((_, i) => i !== index)
      setPairs(newPairs)
      onQuestionChange({ ...question, pairs: newPairs })
    }
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Matching Question</h4>
        {/* <div
          onClick={onDelete}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </div> */}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <div className="mt-2 flex justify-end">
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={(file) => {
                const url = URL.createObjectURL(file)
                onQuestionChange({ ...question, image_url: url, image_name: file.name })
              }}
              onRemove={() => onQuestionChange({ ...question, image_url: "", image_name: "" })}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
              fileName={question.image_name}
            />
          </div>
        </div>
        <input
            id="question-text"
            type="text"
            placeholder="Enter instructions for matching..."
            value={questionText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {questionError && (
            <div className="mt-1 text-xs text-red-600">{questionError}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Matching Pairs</label>
          <div className="space-y-2">
            {pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Left item"
                  value={pair.left}
                  onChange={(e) => handlePairChange(index, "left", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">↔</span>
                <input
                  type="text"
                  placeholder="Right item"
                  value={pair.right}
                  onChange={(e) => handlePairChange(index, "right", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ImageAttach
                  image={pair.left_image_url ? { url: pair.left_image_url } : null}
                  onSelect={(file) => {
                    const url = URL.createObjectURL(file)
                    const newPairs = pairs.map((p, i) => i === index ? { ...p, left_image_url: url, left_image: file.name } : p)
                    setPairs(newPairs)
                    onQuestionChange({ ...question, pairs: newPairs })
                  }}
                  onRemove={() => {
                    const newPairs = pairs.map((p, i) => i === index ? { ...p, left_image_url: "", left_image: "" } : p)
                    setPairs(newPairs)
                    onQuestionChange({ ...question, pairs: newPairs })
                  }}
                  label="Attach left image"
                  scope={{ questionId: question.id, kind: 'pair-term', refId: String(index) }}
                  showPreview={false}
                  fileName={pair.left_image}
                />
                <ImageAttach
                  image={pair.right_image_url ? { url: pair.right_image_url } : null}
                  onSelect={(file) => {
                    const url = URL.createObjectURL(file)
                    const newPairs = pairs.map((p, i) => i === index ? { ...p, right_image_url: url, right_image: file.name } : p)
                    setPairs(newPairs)
                    onQuestionChange({ ...question, pairs: newPairs })
                  }}
                  onRemove={() => {
                    const newPairs = pairs.map((p, i) => i === index ? { ...p, right_image_url: "", right_image: "" } : p)
                    setPairs(newPairs)
                    onQuestionChange({ ...question, pairs: newPairs })
                  }}
                  label="Attach right image"
                  scope={{ questionId: question.id, kind: 'pair-definition', refId: String(index) }}
                  showPreview={false}
                  fileName={pair.right_image}
                />
                {pairs.length > 2 && (
                  <div
                    onClick={() => removePair(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {pairsError && (
            <div className="mt-1 text-xs text-red-600">{pairsError}</div>
          )}
          {emptyPairError && (
            <div className="mt-1 text-xs text-red-600">{emptyPairError}</div>
          )}

          <div
            onClick={addPair}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Pair
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hint (Optional)</label>
          <textarea
            placeholder="Provide hint..."
            value={question.explanation || ""}
            onChange={(e) => onQuestionChange({ ...question, explanation: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    
  )
}
