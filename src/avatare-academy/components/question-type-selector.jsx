import { useState } from "react"
import { Form } from "react-bootstrap"
import { ChevronDown, Plus } from "lucide-react"

const allQuestionTypes = [
  { value: "true_false", label: "True/False" },
  { value: "multiple_choice", label: "Multiple Choice Question(s)" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "short_answer", label: "Short Answer" },
  { value: "long_answer", label: "Long Answer" },
  // { value: "matching", label: "Matching Columns" },
]

export default function QuestionTypeSelector({ selectedType, onTypeChange, quizType }) {
  console.log(quizType)
  const [isOpen, setIsOpen] = useState(false)

  const filteredQuestionTypes =
    quizType == "multiple_choice"
      ? allQuestionTypes.filter((q) => q.value === "multiple_choice")
      : allQuestionTypes

  const selectedLabel =
    filteredQuestionTypes.find((type) => type.value === selectedType)?.label || "Select Question Type"

  const handleSelect = (value) => {
    onTypeChange(value)
    setIsOpen(false)
  }

  return (
    <div className="mb-3">
      <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
        Question Type
      </Form.Label>

      <div className="position-relative">
        <div
          className="form-control d-flex align-items-center justify-content-between"
          style={{
            cursor: "pointer",
            backgroundColor: "white",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            padding: "12px 16px",
            fontSize: "14px",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="d-flex align-items-center">
            <Plus size={16} className="me-2" />
            {selectedLabel}
          </div>
          <ChevronDown
            size={16}
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </div>

        {isOpen && (
          <div
            className="position-absolute w-100 bg-white border rounded shadow-sm"
            style={{
              top: "100%",
              left: 0,
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {filteredQuestionTypes.map((type) => (
              <div
                key={type.value}
                className="px-3 py-2 d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  borderBottom: "1px solid #f0f0f0",
                }}
                onClick={() => handleSelect(type.value)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white"
                }}
              >
                <Plus size={16} className="me-2" />
                {type.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="position-fixed"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
