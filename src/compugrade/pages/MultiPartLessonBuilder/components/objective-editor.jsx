

import { useState } from "react"
import { Plus } from "lucide-react"
import { TrueFalseQuestion } from "./question-types/true-false-question"
import { MultipleChoiceQuestion } from "./question-types/multiple-choice-question"
import { MultipleSelectQuestion } from "./question-types/multiple-select-question"
import { ShortAnswerQuestion } from "./question-types/short-answer-question"
import { MatchingQuestion } from "./question-types/matching-question"
import { DragDropQuestion } from "./question-types/drag-drop-question"
import { FillInTheBlankQuestion } from "./question-types/fill-in-the-blank-question"
import { LabelingQuestion } from "./question-types/labeling-question"
import { CategorizingQuestion } from "./question-types/categorizing-question"
import { ReorderingQuestion } from "./question-types/reordering-question"
import { DraggableQuestionCard } from "./draggable-question-card"

const QUESTION_TYPES = [
  { value: "true-false", label: "True/False" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "multiple-select", label: "Multiple Select" },
  { value: "short-answer", label: "Short Answer" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  // { value: "matching", label: "Matching" },
  // { value: "drag-drop", label: "Drag and Drop" },
  // { value: "labeling", label: "Labeling" },
  // { value: "categorizing", label: "Categorizing" },
  // { value: "reordering", label: "Reordering" },
]

export function ObjectiveEditor({ content, onContentChange }) {
  const [questions, setQuestions] = useState(content?.questions || [])
  const [selectedQuestionType, setSelectedQuestionType] = useState("true-false")
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null)

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      objective_type: selectedQuestionType,
      natural_text: "",
      ...getDefaultQuestionData(selectedQuestionType),
    }

    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    onContentChange({ ...content, questions: newQuestions })
  }

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
    onContentChange({ ...content, questions: newQuestions })
  }

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    onContentChange({ ...content, questions: newQuestions })
  }

  const handleQuestionDragStart = (index) => {
    setDraggedQuestionIndex(index)
  }

  const handleQuestionDragOver = (index) => {
    // Visual feedback is handled by the DraggableQuestionCard component
  }

  const handleQuestionDrop = (dropIndex) => {
    if (draggedQuestionIndex !== null && draggedQuestionIndex !== dropIndex) {
      const newQuestions = [...questions]
      const draggedQuestion = newQuestions[draggedQuestionIndex]

      // Remove the dragged question
      newQuestions.splice(draggedQuestionIndex, 1)

      // Insert at the new position
      const insertIndex = draggedQuestionIndex < dropIndex ? dropIndex - 1 : dropIndex
      newQuestions.splice(insertIndex, 0, draggedQuestion)

      setQuestions(newQuestions)
      onContentChange({ ...content, questions: newQuestions })
    }
    setDraggedQuestionIndex(null)
  }

  const getDefaultQuestionData = (type) => {
    switch (type) {
      case "true-false":
        return { correct_answer: null }
      case "multiple-choice":
        return { options: [
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
        ], correct_answer: null }
      case "multiple-select":
        return { options: [
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
          { text: "", image_url: "", image: "" },
        ], correct_answer: [] }
      case "short-answer":
        return { correct_answer: "" }
      case "fill-in-the-blank":
        return { blanks: [{ answer: "", position: 0 }] }
      case "matching":
        return {
          pairs: [
            { left: "", right: "" },
            { left: "", right: "" },
          ],
        }
      case "drag-drop":
        return { draggableItems: ["", ""], dropZones: ["", ""], correctMatches: {} }
      case "labeling":
        return { labels: [{ text: "", x: 50, y: 50 }], imageUrl: "" }
      case "categorizing":
        return { categories: ["Category 1", "Category 2"], items: [{ text: "", category: 0 }] }
      case "reordering":
        return { items: ["Item 1", "Item 2", "Item 3"] }
      default:
        return {}
    }
  }

  const renderQuestion = (question, index) => {
    const commonProps = {
      question,
      onQuestionChange: (updatedQuestion) => updateQuestion(index, updatedQuestion),
      onDelete: () => deleteQuestion(index),
    }

    let questionComponent
    switch (question.objective_type) {
      case "true-false":
        questionComponent = <TrueFalseQuestion key={question.id} {...commonProps} />
        break
      case "multiple-choice":
        questionComponent = <MultipleChoiceQuestion key={question.id} {...commonProps} />
        break
      case "multiple-select":
        questionComponent = <MultipleSelectQuestion key={question.id} {...commonProps} />
        break
      case "short-answer":
        questionComponent = <ShortAnswerQuestion key={question.id} {...commonProps} />
        break
      case "fill-in-the-blank":
        questionComponent = <FillInTheBlankQuestion key={question.id} {...commonProps} />
        break
      case "matching":
        questionComponent = <MatchingQuestion key={question.id} {...commonProps} />
        break
      case "drag-drop":
        questionComponent = <DragDropQuestion key={question.id} {...commonProps} />
        break
      case "labeling":
        questionComponent = <LabelingQuestion key={question.id} {...commonProps} />
        break
      case "categorizing":
        questionComponent = <CategorizingQuestion key={question.id} {...commonProps} />
        break
      case "reordering":
        questionComponent = <ReorderingQuestion key={question.id} {...commonProps} />
        break
      default:
        questionComponent = (
          <div key={question.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="text-center text-gray-500">
              <p className="font-medium">Question Type: {question.objective_type}</p>
              <p className="text-sm">This question type will be implemented soon</p>
            </div>
          </div>
        )
    }

    return (
      <DraggableQuestionCard
        key={question.id}
        question={question}
        index={index}
        onQuestionChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
        onDelete={() => deleteQuestion(index)}
        onDragStart={handleQuestionDragStart}
        onDragOver={handleQuestionDragOver}
        onDrop={handleQuestionDrop}
      >
        {questionComponent}
      </DraggableQuestionCard>
    )
  }

  return (
    <div className="space-y-6">
     

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No Questions Added</div>
            <p className="text-sm">Select a question type and click "Add Question" to get started</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">{questions.map((question, index) => renderQuestion(question, index))}</div>
      )}
       {/* Add Question Controls */}
       <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <select
            value={selectedQuestionType}
            onChange={(e) => setSelectedQuestionType(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </div>
        </div>
      </div>
    </div>
  )
}
