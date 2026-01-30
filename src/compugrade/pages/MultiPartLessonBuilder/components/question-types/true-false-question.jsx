

import { useState } from "react"
import { Trash2, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"

export function TrueFalseQuestion({ question, onQuestionChange, onDelete }) {
  const [questionContent, setQuestionContent] = useState({ html: question.natural_text || "" })
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer || null)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const correctError = !correctAnswer ? 'Select True or False.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, natural_text: text })
  }

  const handleAnswerChange = (answer) => {
    setCorrectAnswer(answer)
    onQuestionChange({ ...question, correct_answer: answer })
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">True/False Question</h4>
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
          {questionError && (
            <div className="mt-1 text-xs text-red-600">{questionError}</div>
          )}
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
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`tf-${question.id}-true`}
                name={`tf-correct-${question.id}`}
                value="true"
                checked={correctAnswer === "true"}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="true" className="text-sm text-gray-700">
                True
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`tf-${question.id}-false`}
                name={`tf-correct-${question.id}`}
                value="false"
                checked={correctAnswer === "false"}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="false" className="text-sm text-gray-700">
                False
              </label>
            </div>
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
    
  )
}
