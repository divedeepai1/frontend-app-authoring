"use client"

import { useState, useEffect, useRef } from "react"
import { Card, Form, Button, Row, Col, Badge } from "react-bootstrap"
import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../cms-csrftoken"
import { useNavigate } from "react-router"

const QuestionRenderer = ({ question }) => {
  const containerRef = useRef(null)
  const [connections, setConnections] = useState([])
  const [answers, setAnswers] = useState({}) // Declared setAnswers variable

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  // Function to render matching question preview
  const renderMatchingPreview = () => {
    // Process backend data to create pairs and connections
    const columnAOptions = []
    const columnBOptions = []

    // Separate options based on their position (even = Column A, odd = Column B)
    question.options?.forEach((opt, index) => {
      if (index % 2 === 0) {
        columnAOptions.push({ ...opt, originalIndex: index })
      } else {
        columnBOptions.push({ ...opt, originalIndex: index })
      }
    })

    // Create pairs array
    const pairs = []
    const maxLength = Math.max(columnAOptions.length, columnBOptions.length)

    for (let i = 0; i < maxLength; i++) {
      pairs.push({
        columnA: columnAOptions[i]?.text || "",
        columnAImage: columnAOptions[i]?.image || null,
        columnB: columnBOptions[i]?.text || "",
        columnBImage: columnBOptions[i]?.image || null,
      })
    }

    // Create connections based on match_pair_id
    const initialConnections = []
    const processedPairs = new Set()

    question.correct_answers?.forEach((answer, index) => {
      const pairId = answer.pair_value

      if (processedPairs.has(pairId)) return
      processedPairs.add(pairId)

      const optionA = columnAOptions.find((opt) => opt.match_pair_id === pairId)
      const optionB = columnBOptions.find((opt) => opt.match_pair_id === pairId)

      if (optionA && optionB) {
        const leftIndex = columnAOptions.findIndex((opt) => opt.match_pair_id === pairId)
        const rightIndex = columnBOptions.findIndex((opt) => opt.match_pair_id === pairId)

        if (leftIndex !== -1 && rightIndex !== -1) {
          initialConnections.push({
            id: `${leftIndex}-${rightIndex}`,
            leftIndex,
            rightIndex,
          })
        }
      }
    })

    // Function to get item center for line drawing
    const getItemCenter = (index, side) => {
      const el = document.getElementById(`preview-${side}-${index}`)
      const container = containerRef.current
      if (!el || !container) return null
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      return {
        x: elRect.left - containerRect.left + (side === "left" ? elRect.width - 5 : 5),
        y: elRect.top - containerRect.top + elRect.height / 2,
      }
    }

    return (
      <div className="mt-3">
        <Form.Label className="fw-bold mb-3">Matching Pairs</Form.Label>

        <div className="mb-4">
          <div ref={containerRef} style={{ position: "relative" }}>
            {/* SVG for drawing connection lines */}
            <svg
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            >
              {connections.map((conn) => {
                const startPos = getItemCenter(conn.leftIndex, "left")
                const endPos = getItemCenter(conn.rightIndex, "right")

                if (!startPos || !endPos) return null

                return (
                  <g key={conn.id}>
                    <line
                      x1={startPos.x}
                      y1={startPos.y}
                      x2={endPos.x}
                      y2={endPos.y}
                      stroke="black"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={0.25 * startPos.x + 0.75 * endPos.x}
                      cy={0.25 * startPos.y + 0.75 * endPos.y}
                      r="12"
                      fill="white"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <text
                      x={0.25 * startPos.x + 0.75 * endPos.x}
                      y={0.25 * startPos.y + 0.75 * endPos.y}
                      fontSize="16"
                      fill="black"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      dominantBaseline="middle"
                    >
                      ✓
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Use same layout structure as original MatchingQuestion */}
            <div className="d-flex justify-content-between" style={{ width: "100%" }}>
              <Col md={4}>
                <h6 className="text-center mb-3">Column A</h6>
                {pairs.map((pair, index) => (
                  <div key={index} className="mb-3">
                    <div id={`preview-left-${index}`} style={{ zIndex: 2, position: "relative" }}>
                      {pair.columnAImage ? (
                        <Card
                          className="text-center p-4"
                          style={{ border: "2px solid #dee2e6", backgroundColor: "white" }}
                        >
                          <img
                            src={pair.columnAImage || "/placeholder.svg"}
                            alt="A"
                            style={{ maxHeight: "80px", maxWidth: "100%" }}
                          />
                        </Card>
                      ) : (
                        <Form.Control
                          type="text"
                          value={pair.columnA}
                          disabled
                          style={{ backgroundColor: "white", border: "1px solid #dee2e6" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </Col>

              <Col md={4}>
                <h6 className="text-center mb-3">Column B</h6>
                {pairs.map((pair, index) => (
                  <div key={index} className="mb-3">
                    <div id={`preview-right-${index}`} style={{ zIndex: 2, position: "relative" }}>
                      {pair.columnBImage ? (
                        <Card
                          className="text-center p-4"
                          style={{ border: "2px solid #dee2e6", backgroundColor: "white" }}
                        >
                          <img
                            src={pair.columnBImage || "/placeholder.svg"}
                            alt="B"
                            style={{ maxHeight: "80px", maxWidth: "100%" }}
                          />
                        </Card>
                      ) : (
                        <Form.Control
                          type="text"
                          value={pair.columnB}
                          disabled
                          style={{ backgroundColor: "white", border: "1px solid #dee2e6" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </Col>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (question.question_type === "matching") {
      const recalculateConnections = () => {
        // Process backend data to create initial connections
        const columnAOptions = []
        const columnBOptions = []

        question.options?.forEach((opt, index) => {
          if (index % 2 === 0) {
            columnAOptions.push({ ...opt, originalIndex: index })
          } else {
            columnBOptions.push({ ...opt, originalIndex: index })
          }
        })

        const initialConnections = []
        const processedPairs = new Set()

        question.correct_answers?.forEach((answer) => {
          const pairId = answer.pair_value

          if (processedPairs.has(pairId)) return
          processedPairs.add(pairId)

          const optionA = columnAOptions.find((opt) => opt.match_pair_id === pairId)
          const optionB = columnBOptions.find((opt) => opt.match_pair_id === pairId)

          if (optionA && optionB) {
            const leftIndex = columnAOptions.findIndex((opt) => opt.match_pair_id === pairId)
            const rightIndex = columnBOptions.findIndex((opt) => opt.match_pair_id === pairId)

            if (leftIndex !== -1 && rightIndex !== -1) {
              initialConnections.push({
                id: `${leftIndex}-${rightIndex}`,
                leftIndex,
                rightIndex,
              })
            }
          }
        })

        const getItemCenter = (index, side) => {
          const el = document.getElementById(`preview-${side}-${index}`)
          const container = containerRef.current
          if (!el || !container) return null
          const containerRect = container.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()
          return {
            x: elRect.left - containerRect.left + (side === "left" ? elRect.width - 5 : 5),
            y: elRect.top - containerRect.top + elRect.height / 2,
          }
        }

        const updatedConnections = initialConnections.map((conn) => {
          const startPos = getItemCenter(conn.leftIndex, "left")
          const endPos = getItemCenter(conn.rightIndex, "right")

          if (startPos && endPos) {
            return {
              ...conn,
              x1: startPos.x,
              y1: startPos.y,
              x2: endPos.x,
              y2: endPos.y,
            }
          }
          return conn
        })

        setConnections(updatedConnections)
      }

      const timer = setTimeout(recalculateConnections, 200)
      return () => clearTimeout(timer)
    }
  }, [question, connections])

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case "true_false":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer Options</Form.Label>
            {question.options?.map((option, index) => (
              <Form.Check
                key={index}
                type="radio"
                id={`q${question.id}-${index}`}
                name={`question-${question.id}`}
                label={option.text}
                value={option.text}
                disabled
                checked={option.is_correct}
                className="custom-radio"
                inline
                style={{ display: "flex", gap: "6px" }}
              />
            ))}
          </div>
        )

      case "multiple_choice":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer Options</Form.Label>
            {question?.options?.map((option, index) => (
              <Form.Check
                key={index}
                type="radio"
                id={`q${question.id}-${index}`}
                name={`question-${question.id}`}
                label={option.text}
                disabled
                value={option.text}
                checked={option.is_correct}
                className="custom-radio"
                inline
                style={{ display: "flex", gap: "6px" }}
              />
            ))}
          </div>
        )

      case "fill_blank":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answers</Form.Label>
            {question?.correct_answers?.map((ans, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control type="text" value={ans.answer_text} disabled style={{ background: "white" }} />
              </div>
            ))}
          </div>
        )

      case "short_answer":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              disabled
              value={question?.correct_answers[0].answer_text || ""}
              style={{ resize: "vertical", background: "white" }}
            />
          </div>
        )

      case "long_answer":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              disabled
              value={question?.correct_answers[0].answer_text || ""}
              style={{ resize: "vertical", background: "white" }}
            />
          </div>
        )

      case "matching":
        return renderMatchingPreview()

      default:
        return <div>Unsupported question type</div>
    }
  }

  // Get question type display name
  const getQuestionTypeDisplay = (type) => {
    const typeMap = {
      true_false: "True / False",
      multiple_choice: "Multiple Choice",
      fill_blank: "Fill in the Blank",
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      matching: "Matching",
    }
    return typeMap[type] || type
  }

  return (
    <Card className="mb-4" style={{ background: "#f7f8fc" }}>
      <Card.Body>
        <Row className="align-items-start">
          <Col>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1 fw-bold">Question ({getQuestionTypeDisplay(question.question_type)})</h4>
                {question.question_type !== "matching" && <p className="mb-0 fw-bold">Question</p>}
              </div>
              <Badge bg="secondary" className="ms-2">
                Points: {question.points}
              </Badge>
            </div>

            {question.question_type !== "matching" && (
              <input
                type="text"
                className="form-control mb-3 fs-6"
                style={{ background: "white" }}
                disabled
                value={question.text}
              />
            )}

            {renderQuestionInput()}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default function QuizPreview({ isPublish }) {
  const [quizData, setQuizData] = useState(null)
  const [answers, setAnswers] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuizData = async () => {
      const quizId = sessionStorage.getItem("quizId")
      const token = await fetchCsrfToken()

      try {
        const response = await fetch(`${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to add quiz: ${response.status} ${errorText}`)
        }
        const responseData = await response.json()
        console.log("Quiz data fetched:", responseData)
        setQuizData(responseData)
      } catch (error) {
        console.error("Error:", error.message)
      }
    }

    fetchQuizData()
  }, [])

  const handlePublish = async (e) => {
    const quizId = sessionStorage.getItem("quizId")
    const token = await fetchCsrfToken()
    try {
      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/publish/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to publish quiz: ${response.status} ${errorText}`)
      }
      const responseData = await response.json()

      navigate("/quiz-dashboard")
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <>
      <div className="mb-4">
        <Row className="align-items-center">
          <Col>
            <h4 className="mb-0">{quizData?.title}</h4>
            <small className="text-muted">Quiz preview in interactive format</small>
          </Col>
          <Col xs="auto" style={{ display: "flex", gap: "5px" }}>
            <Button
              variant="primary"
              style={{ height: "40px" }}
              onClick={(e) => (isPublish ? navigate("/quiz-dashboard") : handlePublish(e))}
              className="primary-button px-2"
              size="sm"
            >
              Publish & Proceed
            </Button>
          </Col>
        </Row>
      </div>

      <Form>
        {quizData?.questions?.map((question) => (
          <QuestionRenderer key={question.id} question={question} />
        ))}
      </Form>
    </>
  )
}
