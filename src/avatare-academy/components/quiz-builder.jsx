import { useEffect, useState } from "react"
import { Container, Row, Col, Button, Alert } from "react-bootstrap"
import QuestionCard from "./question-card"
import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../cms-csrftoken"
import { useNavigate } from "react-router"

export default function QuizBuilder({ quizType, quizId, status, data }) {
  const [validationErrors, setValidationErrors] = useState([])
  const [isPublish,setIsPublish]=useState(false);
  const [showValidation, setShowValidation] = useState(false)
  const [questions, setQuestions] = useState([
    { id: 1, type: quizType === "multiple_choice" ? "multiple_choice" : "", questionText: "", options: ["", "", "", ""], answer: "", points: 0, blanks: [], pairs: [],connections: [], },
  ])
  const navigate = useNavigate()

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: quizType === "multiple_choice" ? "multiple_choice" : "",
      questionText: "",
      options: ["", "", "", ""],
      answer: "",
      points: 0,
      blanks: [],
      pairs: [],
      connections: [],
    }
    setQuestions([...questions, newQuestion])
  }

  const parseQuestions = (questionsData) => {
    return questionsData.map((q) => {
      const base = {
        id: q.id,
        type: q.question_type,
        questionText: q.text,
        points: q.points,
        answer: "",
        options: [],
        blanks: [],
        pairs: [],
        connections: []
      }

      if (q.question_type === "true_false") {
        const correct = q.options.find((opt) => opt.is_correct)
        return { ...base, answer: correct?.text.toLowerCase() }
      }

      if (q.question_type === "multiple_choice") {
        const correctIndex = q.options.findIndex((opt) => opt.is_correct)
        return {
          ...base,
          options: q.options.map((o) => o.text),
          answer: correctIndex.toString()
        }
      }

      if (q.question_type === "fill_blank") {
        return { ...base, blanks: q.correct_answers.map((a) => a.answer_text) }
      }

      if (q.question_type === "short_answer" || q.question_type === "long_answer") {
        return { ...base, answer: q.correct_answers?.[0]?.answer_text || "" }
      }

      if (q.question_type === "matching") {
        const groupedPairs = {}

        q.options.forEach((opt) => {
          const pairId = opt.match_pair_id
          if (!groupedPairs[pairId]) groupedPairs[pairId] = []
          groupedPairs[pairId].push(opt)
        })

        const pairs = Object.values(groupedPairs).map((pair) => ({
          columnA: pair[0]?.text || "",
          columnAImage: pair[0]?.image || null,
          columnB: pair[1]?.text || "",
          columnBImage: pair[1]?.image || null,
        }))

        const connections = q.correct_answers.map((ans, index) => {
          const fromIndex = pairs.findIndex((p) => p.columnA === ans.pair_value)
          const toIndex = pairs.findIndex((p) => p.columnB === ans.answer_text)
          return {
            id: Date.now() + index,
            fromIndex,
            toIndex,
          }
        })

        return { ...base, pairs, connections }
      }

      return base
    })
  }

  const fetchQuizData = async () => {
    const token = await fetchCsrfToken()
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      )
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch quiz: ${response.status} ${errorText}`)
      }

      const responseData = await response.json()
      setQuestions(parseQuestions(responseData.questions))
    } catch (error) {
      console.error("Error:", error.message)
    }
  }

  useEffect(() => {
    if (quizId) {
      fetchQuizData()
      sessionStorage.setItem("quizId", quizId)
      setIsPublish(status)
    } else if (data?.length > 0) {
      setQuestions(parseQuestions(data))
    }
  }, [quizId, data])

  const updateQuestion = (id, updatedQuestion) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
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
      if (!question.type) questionErrors.push("Question type is required")
        if (!question.questionText.trim() && question.type !== "matching")
          questionErrors.push("Question text is required")
      if (!question.points || question.points <= 0) questionErrors.push("Answer points must be greater than 0")
      switch (question.type) {
        case "true_false":
          if (!question.answer) questionErrors.push("Please select True or False answer")
          break
        case "multiple_choice":
          const filledOptions = (question.options || []).filter((opt) => opt.trim())
          if (filledOptions.length < 4) questionErrors.push("At least 4 answer options are required")
          if (!question.answer && question.answer !== "0") questionErrors.push("Select the correct answer")
          break
        case "fill_blank":
          if (!question.blanks.length) questionErrors.push("Add at least one correct blank answer")
          break
        case "short_answer":
        case "long_answer":
          if (!question.answer.trim()) questionErrors.push("Correct answer is required")
          break
        case "matching":
            if (!question.pairs || question.pairs.length < 2) {
              questionErrors.push("At least 2 matching pairs are required")
            } else {
              const invalidPair = question.pairs.some(
                (pair) => !pair.columnA.trim() || !pair.columnB.trim()
              )
              if (invalidPair) {
                questionErrors.push("Each matching pair must have values in both columns")
              }
            }
            break
      }
      if (questionErrors.length > 0) {
        errors.push({ questionNumber, errors: questionErrors })
      }
    })
    return errors
  }

  const handleGenerateQuiz = async () => {
    const errors = validateQuestions()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidation(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const id = sessionStorage.getItem("quizId");
    const data = convertQuestionsToBackendFormat(id, questions)
    try {
      const token = await fetchCsrfToken()
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
      )
      if (!response.ok) throw new Error(`Failed to save quiz: ${response.status}`)
      const responseData = await response.json()
      if(isPublish){
      navigate("/publish-quiz" , { state: { isPublish : isPublish } })
      }
      else{
      navigate("/publish-quiz")
      }
    } catch (err) {
      console.error("Error saving quiz:", err)
    }
  }
  
  function convertQuestionsToBackendFormat(id, questionsList) {
    console.log(questionsList)
    return {
      quiz_id: id,
      auto_order: true,
      starting_order: 1,
      questions: questionsList.map((question, index) => {
        const base = {
          quiz: id,
          difficulty:"medium",
          question_type: question.type,
          text: question.questionText,
          points: question.points || 0,
        }
        if (question.id && typeof question.id === "string") base.id = question.id
        if (question.type === "true_false") {
          return {
            ...base,
            options: [
              { text: "True", is_correct: question.answer === "true", order: 1 },
              { text: "False", is_correct: question.answer === "false", order: 2 },
            ],
          }
        }
        if (question.type === "multiple_choice") {
          return {
            ...base,
            options: question.options.map((opt, i) => ({
              text: opt,
              is_correct: String(i) === question.answer,
              order: i + 1,
            })),
          }
        }
        if (["fill_blank", "short_answer", "long_answer"].includes(question.type)) {
          const answers = (question.blanks.length ? question.blanks : [question.answer]).filter(
            (ans) => ans && ans.trim() !== ""
          )
          return {
            ...base,
            correct_answers: answers.map((ans, i) => ({
              answer_text: ans,
              is_case_sensitive: false,
              is_exact_match: true,
              position: i + 1,
            })),
          }
        } 
        if (question.type === "matching") {
          let pairIdCounter = 1
          const options = []
          const correct_answers = []
        
          const columnARefs = []
          const columnBRefs = []
        
          question.pairs.forEach((pair, index) => {
            columnARefs[index] = options.length
            options.push({ text: pair.columnA || "", match_pair_id: "" })
        
            columnBRefs[index] = options.length
            options.push({ text: pair.columnB || "", match_pair_id: "" })
          })
        
          for (const conn of question.connections || []) {
            const fromIndex = conn.fromIndex
            const toIndex = conn.toIndex
        
            const pairId = `pair${pairIdCounter++}`
        
            correct_answers.push({
              pair_value: pairId,
              answer_text: `${question.pairs[fromIndex]?.columnA} = ${question.pairs[toIndex]?.columnB}`,
            })
        
            const aOptionIndex = columnARefs[fromIndex]
            const bOptionIndex = columnBRefs[toIndex]
        
            if (aOptionIndex !== undefined) options[aOptionIndex].match_pair_id = pairId
            if (bOptionIndex !== undefined) options[bOptionIndex].match_pair_id = pairId
          }
        
          return {
            ...base,
            options,
            correct_answers,
          }
        }
        
        
        return base
      }),
    }
  }

  const handleRemove = async (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))

    try {
      const token = await fetchCsrfToken()
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/questions/${id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
         
        }
      )
      if (!response.ok) throw new Error(`Failed to delete: ${response.status}`)
      const responseData = await response.json()
      
    } catch (err) {
      console.error("Error:", err)
    }

  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2>{quizType === "multiple_choice" ? "Multiple Choice" : "Multi Component"} Quiz</h2>
          {showValidation && validationErrors.length > 0 && (
            <Alert variant="danger">
              <Alert.Heading>Please fix the following errors:</Alert.Heading>
              {validationErrors.map((error, i) => (
                <div key={i}>
                  <strong>Question {error.questionNumber}:</strong>
                  <ul>
                    {error.errors.map((err, j) => (
                      <li key={j}>{err}</li>
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
              quizType={quizType}
              handleRemove={handleRemove}
              questionNumber={index + 1}
              onUpdate={(updated) => updateQuestion(question.id, updated)}
              hasValidationError={validationErrors.some((e) => e.questionNumber === index + 1)}
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
              Add {questions.length > 0 && "Another"} Question
            </button>
          </div>

          <div className="mt-4" style={{ display:"flex",  gap: "0.5rem" }}>
            {/* <button  onClick={handleSave} className="px-4 py-2 secondary-button">
              Save
            </button> */}
            <button
              disabled={questions?.length ==0}
              onClick={handleGenerateQuiz}
              className="px-4 py-4 primary-button"
              style={{
                fontWeight: "500",
                height: "50px",
              }}
            >
              {quizId ? "Update" :" Generate"} Quiz
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
