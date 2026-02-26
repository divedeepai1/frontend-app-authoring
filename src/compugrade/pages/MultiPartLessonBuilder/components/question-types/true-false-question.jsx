

import { useState } from "react"
import { Trash2, X, Eye } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"
import { useQuestionImages } from "./useQuestionImages"

export function TrueFalseQuestion({ question, onQuestionChange, onDelete, onTimestampClick }) {
  const [questionContent, setQuestionContent] = useState({ html: question.natural_text || "" })
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer || null)
  const { questionImages, handleQuestionImageSelect, handleQuestionImageRemoveAt } = useQuestionImages(question)
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
          <div className="mt-2">
            <ImageAttach
              images={questionImages}
              onSelect={(file, record) => handleQuestionImageSelect(file, record, onQuestionChange)}
              onRemoveAt={(index) => handleQuestionImageRemoveAt(index, onQuestionChange)}
              label="Attach question images"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
              multiple={true}
            />
          </div>
          {question.video_timestamp && onTimestampClick && (
            <div className="mt-2 flex flex-wrap gap-3">
              <div
                className="relative flex items-center justify-between w-44 px-3 py-2 rounded-lg bg-white border border-purple-200 text-purple-700 text-sm cursor-pointer shadow-sm hover:shadow"
                onClick={() => onTimestampClick(question.video_timestamp)}
              >
                <div className="flex items-center gap-2 pr-6">
                  <Eye className="w-4 h-4" />
                  <span className="truncate">Timestamp Video</span>
                </div>
              </div>
            </div>
          )}
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
