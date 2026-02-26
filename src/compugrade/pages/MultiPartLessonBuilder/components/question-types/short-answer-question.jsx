

import { useState } from "react"
import { Trash2, Eye, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"
import { useQuestionImages } from "./useQuestionImages"

export function ShortAnswerQuestion({ question, onQuestionChange, onDelete, onTimestampClick }) {
  const [questionContent, setQuestionContent] = useState({ html: question.natural_text || "" })
  const [sampleAnswer, setSampleAnswer] = useState(question.correct_answer || "")
  const { questionImages, handleQuestionImageSelect, handleQuestionImageRemoveAt } = useQuestionImages(question)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const answerError = !sampleAnswer || !sampleAnswer.trim() ? 'Answer is required.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, natural_text: text })
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
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestionChange({ ...question, video_timestamp: null });
                  }}
                  className="absolute top-1 right-1 p-0.5 rounded-full text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
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
