

import { Card } from "react-bootstrap"
import QuestionTypeSelector from "./question-type-selector"
import TrueFalseQuestion from "./question-types/true-false-question"
import MultipleChoiceQuestion from "./question-types/multiple-choice-question"
import FillInBlankQuestion from "./question-types/fill-in-blank-question"
import ShortAnswerQuestion from "./question-types/short-answer-question"
import LongAnswerQuestion from "./question-types/long-answer-question"
import MatchingQuestion from "./question-types/matching-question"

export default function QuestionCard({ question, questionNumber, onUpdate ,hasValidationError }) {
  const renderQuestionContent = () => {
    switch (question.type) {
      case "true_false":
        return <TrueFalseQuestion question={question} onUpdate={onUpdate} />
      case "multiple_choice":
        return <MultipleChoiceQuestion question={question} onUpdate={onUpdate} />
      case "fill_blank":
        return <FillInBlankQuestion question={question} onUpdate={onUpdate} />
      case "short_answer":
        return <ShortAnswerQuestion question={question} onUpdate={onUpdate} />
      case "long_answer":
        return <LongAnswerQuestion question={question} onUpdate={onUpdate} />
      case "matching":
          return <MatchingQuestion question={question} onUpdate={onUpdate} />
      default:
        return null
    }
  }

  return (
    <Card className="mb-4" style={{ backgroundColor: "#f8f9fa",  border: hasValidationError ? "1px solid #dc3545" : "1px solid #dee2e6" }}>
      <Card.Body className="p-4">
        <h5 className="mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
          Question {questionNumber}
        </h5>
        {hasValidationError && (
            <span className="text-danger ms-2" style={{ fontSize: "14px" }}>
              (Has errors - check above)
            </span>
          )}

        <QuestionTypeSelector selectedType={question.type} onTypeChange={(type) => onUpdate({ type })} />

        {renderQuestionContent()}
      </Card.Body>
    </Card>
  )
}
