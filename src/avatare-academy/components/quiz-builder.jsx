

import { useState } from "react"
import { Container, Row, Col, Button, Alert  } from "react-bootstrap"
import QuestionCard from "./question-card"
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { useNavigate } from "react-router";

export default function QuizBuilder() {
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidation, setShowValidation] = useState(false)
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { id: 1, type: "", questionText: "", options: ["", "", "", ""], answer: "", points: 0, blanks: [], pairs: [], },
  ])

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: "",
      questionText: "",
      options: ["", "", "", ""],
      answer: "",
      points: 0,
      blanks: [],
      pairs: [],
    }

    console.log(JSON.stringify(questions, null, 2))
    setQuestions([...questions, newQuestion])

  
  }

  const updateQuestion = (id, updatedQuestion) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
    if (showValidation) {
      setShowValidation(false)
      setValidationErrors([])
    }
  }

  const validateQuestions = () => {
    const errors = []

    questions.forEach((question, index) => {
      const questionNumber = index + 1
      const questionErrors = []

      // Check if question type is selected
      if (!question.type) {
        questionErrors.push("Question type is required")
      }

      // Check if question text is filled
      if (!question.questionText.trim()) {
        questionErrors.push("Question text is required")
      }

      // Check if points are set
      if (!question.points || question.points <= 0) {
        questionErrors.push("Answer points must be greater than 0")
      }

      // Type-specific validations
      switch (question.type) {
        case "true-false":
          if (!question.answer) {
            questionErrors.push("Please select True or False answer")
          }
          break

        case "multiple-choice":
          const filledOptions = (question.options || []).filter((opt) => opt.trim())
          if (filledOptions.length < 4) {
            questionErrors.push("At least 4 answer options are required")
          }
          if (!question.answer && question.answer !== "0") {
            questionErrors.push("Please select the correct answer option")
          }
          break

        case "fill-in-blank":
          const hasQuestionText = question.questionText.trim().length > 0
          const filledBlanks = (question.blanks || []).filter((blank) => blank.trim().length > 0)
          const hasFilledBlanks = filledBlanks.length > 0
          const hasValidBlanks = hasFilledBlanks

          if (!hasValidBlanks) {
            questionErrors.push("Please add at least one blank answer or include ___ in your question text")
          }

          if (hasFilledBlanks) {
            questionErrors.push("Please provide correct answers for the blanks in your question")
          }
          break

        case "short-answer":
        case "long-answer":
          if (!question.answer.trim()) {
            questionErrors.push("Correct answer is required")
          }
          break

        case "matching":
          const validPairs = (question.pairs || []).filter(
            (pair) => (pair.columnA.trim() || pair.columnAImage) && (pair.columnB.trim() || pair.columnBImage),
          )
          if (validPairs.length < 2) {
            questionErrors.push("At least 2 matching pairs are required")
          }
          break
      }

      if (questionErrors.length > 0) {
        errors.push({
          questionNumber,
          errors: questionErrors,
        })
      }
    })

    return errors
  }

  const handleGenerateQuiz = async () => {
    try {
      // Call backend API
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions }),
      })

      if (response.ok) {
        console.log("Quiz generated successfully!")
        // Handle success
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
    }
  }

  const handleSave = async () => {
    const errors = validateQuestions()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidation(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const quizId = sessionStorage.getItem("quizId");
    const data = convertQuestionsToBackendFormat(quizId , questions)
    console.log(data)

    try {
          setShowValidation(false)
          setValidationErrors([])
          const token = await fetchCsrfToken();
          const response = await fetch(
            `${getConfig().STUDIO_BASE_URL}/quizplugin/api/questions/bulk-add/`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token,
              },
              body: JSON.stringify(data),
            }
          );
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add quiz: ${response.status} ${errorText}`);
          }
          const responseData = await response.json();
          
          
          navigate("/publish-quiz");
        } catch (error) {
          console.error("Error:", error.message);
        }
      }

  function convertQuestionsToBackendFormat(quizId, questionsList) {
    return {
      quiz_id: quizId,
      auto_order: true,
      starting_order: 1,
      questions: questionsList.map((question, index) => {
        const base = {
          quiz: quizId,
          question_type: question.type,
          text: question.questionText,
          points: question.points || 0,

        };
  
        if (question.type === "true_false") {
          return {
            ...base,
            options: [
              {
                text: "True",
                is_correct: question.answer === "true",
                order: 1,
              },
              {
                text: "False",
                is_correct: question.answer === "false",
                order: 2,
              },
            ],
          };
        }
  
        if (question.type === "multiple_choice") {
          return {
            ...base,
            options: question.options.map((opt, i) => ({
              text: opt,
              is_correct: String(i) === question.answer,
              order: i + 1,
            })),
          };
        }
  
        if (question.type === "fill_blank" || question.type === "short_answer" || question.type === "long_answer") {
          return {
            ...base,
            correct_answers: (question.blanks.length ? question.blanks : [question.answer])
              .filter(ans => ans && ans.trim() !== "")
              .map((ans, i) => ({
                answer_text: ans,
                is_case_sensitive: false,
                is_exact_match: true,
                position: i + 1,
              })),
          };
        }
  
        // Default fallback
        return base;
      }),
    };
  }
  

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="mb-4">
            <h2 className="mb-2" style={{ fontSize: "24px", fontWeight: "600" }}>
              Multi-Component Quiz
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Upload questions manually below.
            </p>
          </div>
          {showValidation && validationErrors.length > 0 && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading style={{ fontSize: "16px" }}>Please fix the following errors:</Alert.Heading>
              {validationErrors.map((error, index) => (
                <div key={index} className="mb-2">
                  <strong>Question {error.questionNumber}:</strong>
                  <ul className="mb-0 mt-1">
                    {error.errors.map((err, errIndex) => (
                      <li key={errIndex}>{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Alert>
          )}

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
              hasValidationError={validationErrors.some((error) => error.questionNumber === index + 1)}
            />
          ))}

          <div className="d-flex mt-4" style={{width:"100%" ,height:"50px" ,borderRadius:"8px",}}>
            <button
              onClick={addQuestion}
              className="primary-button"
              style={{
                fontWeight: "500",
                width: "100%",
                
                
              }}
            >
              Add Another Question
            </button>
          </div>

          <div className="mt-4" style={{ display:"flex",  gap: "0.5rem" }}>
            <button  onClick={handleSave} className="px-4 py-2 secondary-button">
              Save
            </button>
            <button
            
              onClick={handleGenerateQuiz}
              className="px-4 py-2 primary-button"
              style={{
                fontWeight: "500",
              }}
            >
              Generate Quiz
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
