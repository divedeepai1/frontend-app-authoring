

import { useState } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"

export function MultipleChoiceQuestion({ question, onQuestionChange, onDelete }) {
  const [questionContent, setQuestionContent] = useState({ html: question.natural_text || "" })
  const normalizeOptions = (opts) => {
    const arr = opts || ["", "", "", ""]
    return arr.map((o) => (typeof o === 'string' ? { text: o, image_url: "", image: "" } : ({ text: o.text || "", image_url: o.image_url || "", image: o.image || "" })))
  }
  const [options, setOptions] = useState(normalizeOptions(question.options))
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer || null)

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, natural_text: text })
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

      // Adjust correct answer if needed
      if (Number.parseInt(correctAnswer) >= newOptions.length) {
        setCorrectAnswer("0")
        onQuestionChange({ ...question, options: newOptions, correct_answer: "0" })
      }
    }
  }

  const handleCorrectAnswerChange = (answer) => {
    setCorrectAnswer(answer)
    onQuestionChange({ ...question, correct_answer: answer })
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

  // Inline validation messages
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const optionsError = options.length < 2 ? 'Add at least two options.' : null
  const emptyOptionError = options.some((o) => !o?.text || !o.text.trim()) ? 'Option text cannot be empty.' : null
  const correctError = (correctAnswer === null || correctAnswer === undefined || correctAnswer === '') ? 'Select a correct option.' : null

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Multiple Choice Question</h4>
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
          <EnhancedRichTextEditor
            id={`question-editor-${question.id}`}
            content={questionContent}
            onContentChange={handleContentChange}
            lines={2}
          />
          {(!questionContent?.html || !(questionContent.html || "").replace(/<[^>]+>/g, "").trim()) && (
            <div className="mt-1 text-xs text-red-600">Question is required.</div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`mcq-${question.id}-option-${index}`}
                  name={`mcq-correct-${question.id}`}
                  value={index.toString()}
                  checked={correctAnswer === index.toString()}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
