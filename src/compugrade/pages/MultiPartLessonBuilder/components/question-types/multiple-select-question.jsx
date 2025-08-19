

import { useState } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"

export function MultipleSelectQuestion({ question, onQuestionChange, onDelete }) {
  const [questionText, setQuestionText] = useState(question.natural_text || "")
  const normalizeOptions = (opts) => {
    const arr = opts || ["", "", "", ""]
    return arr.map((o) => (typeof o === 'string' ? { text: o, image_url: "", image: "" } : ({ text: o.text || "", image_url: o.image_url || "", image: o.image || "" })))
  }
  const [options, setOptions] = useState(normalizeOptions(question.options))
  const [correctAnswers, setCorrectAnswers] = useState(question.correct_answer || [])
  const questionError = !questionText || !questionText.trim() ? 'Question is required.' : null
  const optionsError = options.length < 2 ? 'Add at least two options.' : null
  const emptyOptionError = options.some((o) => !o?.text || !o.text.trim()) ? 'Option text cannot be empty.' : null
  const correctError = !Array.isArray(correctAnswers) || correctAnswers.length === 0 ? 'Select at least one correct answer.' : null

  const handleTextChange = (text) => {
    setQuestionText(text)
    onQuestionChange({ ...question, natural_text:text })
  }

  const emitOptions = (newOptions) => {
    setOptions(newOptions)
    onQuestionChange({ ...question, options: newOptions })
  }

  const handleQuestionImageSelect = (file) => {
    const url = URL.createObjectURL(file)
    onQuestionChange({ ...question, image_url: url, image_name: file.name })
  }
  const handleQuestionImageRemove = () => {
    onQuestionChange({ ...question, image_url: "", image_name: "" })
  }

  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) => (i === index ? { ...opt, text: value } : opt))
    emitOptions(newOptions)
  }

  const addOption = () => {
    const newOptions = [...options, { text: "", image_url: "", image: "" }]
    emitOptions(newOptions)
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      emitOptions(newOptions)
      // Remove from correct answers if selected
      const newCorrectAnswers = correctAnswers
        .filter((answer) => answer !== index)
        .map((answer) => (answer > index ? answer - 1 : answer))
      setCorrectAnswers(newCorrectAnswers)
      onQuestionChange({ ...question, options: newOptions, correct_answer: newCorrectAnswers })
    }
  }

  const handleCorrectAnswerChange = (index, checked) => {
    let newCorrectAnswers = [...correctAnswers]
    if (checked) {
      if (!newCorrectAnswers.includes(index)) {
        newCorrectAnswers.push(index)
      }
    } else {
      newCorrectAnswers = newCorrectAnswers.filter((answer) => answer !== index)
    }
    setCorrectAnswers(newCorrectAnswers)
    onQuestionChange({ ...question, correct_answer: newCorrectAnswers })
  }

  const handleOptionImageSelect = (index, file) => {
    const url = URL.createObjectURL(file)
    const newOptions = options.map((opt, i) => (i === index ? { ...opt, image_url: url, image: file.name } : opt))
    emitOptions(newOptions)
  }
  const handleOptionImageRemove = (index) => {
    const newOptions = options.map((opt, i) => (i === index ? { ...opt, image_url: "", image: "" } : opt))
    emitOptions(newOptions)
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Multiple Select Question</h4>
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
          <input
            id="question-text"
            type="text"
            placeholder="Enter your multiple select question..."
            value={questionText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {questionError && (
            <div className="mt-1 text-xs text-red-600">{questionError}</div>
          )}
          <div className="mt-2 flex justify-end">
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={(file) => handleQuestionImageSelect(file)}
              onRemove={() => handleQuestionImageRemove()}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
              fileName={question.image_name}
              showPreview={false}
            />
          </div>
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options (Select all correct answers)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  checked={correctAnswers.includes(index)}
                  onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option?.text || ""}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ImageAttach
                  image={options[index]?.image_url ? { url: options[index].image_url } : null}
                  onSelect={(file) => handleOptionImageSelect(index, file)}
                  onRemove={() => handleOptionImageRemove(index)}
                  label="Attach option image"
                  scope={{ questionId: question.id, kind: 'option', refId: String(index) }}
                  fileName={options[index]?.image}
                  showPreview={false}
                />
                {options.length > 2 && (
                  <div
                    onClick={() => removeOption(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {optionsError && (
            <div className="mt-1 text-xs text-red-600">{optionsError}</div>
          )}
          {emptyOptionError && (
            <div className="mt-1 text-xs text-red-600">{emptyOptionError}</div>
          )}

          <div
            onClick={addOption}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Option
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
          {correctError && (
            <div className="mt-1 text-xs text-red-600">{correctError}</div>
          )}
        </div>
      </div>
    </div>
  )
}
