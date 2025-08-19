

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"

export function ShortAnswerQuestion({ question, onQuestionChange, onDelete }) {
  const [questionText, setQuestionText] = useState(question.natural_text || "")
  const [sampleAnswer, setSampleAnswer] = useState(question.correct_answer || "")
  const questionError = !questionText || !questionText.trim() ? 'Question is required.' : null
  const answerError = !sampleAnswer || !sampleAnswer.trim() ? 'Answer is required.' : null

  const handleTextChange = (text) => {
    setQuestionText(text)
    onQuestionChange({ ...question, natural_text:text })
  }

  const handleSampleAnswerChange = (answer) => {
    setSampleAnswer(answer)
    onQuestionChange({ ...question, correct_answer: answer })
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Short Answer Question</h4>
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
            placeholder="Enter your short answer question..."
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
              onSelect={(file) => {
                const url = URL.createObjectURL(file)
                onQuestionChange({ ...question, image_url: url, image_name: file.name })
              }}
              onRemove={() => onQuestionChange({ ...question, image_url: "", image_name: "" })}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
            />
          </div>
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>
        </div>

        <div>
          <label htmlFor="sample-answer" className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <textarea
            id="sample-answer"
            placeholder="Please add a suitable answer"
            value={sampleAnswer}
            onChange={(e) => handleSampleAnswerChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {answerError && (
            <div className="mt-1 text-xs text-red-600">{answerError}</div>
          )}
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
