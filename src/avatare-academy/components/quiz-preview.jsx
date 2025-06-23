

import { useState, useEffect } from "react"
import { Card, Form, Button, Row, Col, Badge } from "react-bootstrap"
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { useNavigate } from "react-router";




const QuestionRenderer = ({ question }) => {
  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

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
                checked={option.is_correct}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="custom-radio"
                inline
                style={{display:"flex",gap:"6px"}}
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
                value={option.text}
                checked={option.is_correct}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="custom-radio"
                inline
                style={{display:"flex",gap:"6px"}}
              />
            ))}
          </div>
        )

      case "fill_blank":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer</Form.Label>
            <Form.Control
              type="text"
              value={question?.correct_answers[0].answer_text ||""}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>
        )

      case "short_answer":
        return (
          <div className="mt-3">
            <Form.Label className="fw-bold mb-3">Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={question?.correct_answers[0].answer_text ||""}
              onChange={(e) => handleAnswerChange(e.target.value)}
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
              value={question?.correct_answers[0].answer_text ||""}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  return (
    <Card className="mb-4" style={{background:"#f7f8fc"}}>
      <Card.Body>
        <Row className="align-items-start">
          <Col>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1 fw-bold">
                Question ({question.question_type == "true_false" ? "True /False" : question.question_type =="multiple_choice" ?"Multiple Choice":question.question_type =="fill_blank"?"Fill in the Blank":question.question_type =="short_answer"?"Short Answer":"Long Answer"})
                </h4>
                <p className="mb-0 fw-bold">Question</p>
              </div>
              <Badge bg="secondary" className="ms-2">
                Points: {question.points}
              </Badge>
            </div>

            <input type="text" className="form-control mb-3 fs-6" style={{ background:"white"}}disabled value={question.text}/>

            {renderQuestionInput()}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default function QuizPreview() {
  const [quizData, setQuizData] = useState(null)
  const [answers, setAnswers] = useState({})
  const navigate=useNavigate()

  useEffect(() => {
    const fetchQuizData = async () => {
    
    const quizId= sessionStorage.getItem("quizId")
    const token = await fetchCsrfToken();

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
           );
       
           if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Failed to add quiz: ${response.status} ${errorText}`);
           }
           const responseData = await response.json();
           console.log("Quiz data fetched:", responseData);
           setQuizData(responseData);
    
         } catch (error) {
           console.error("Error:", error.message);
         }
    }

    fetchQuizData()
  }, [])

  const handlePublish = async (e) => {
    const quizId= sessionStorage.getItem("quizId")
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/publish/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to publish quiz: ${response.status} ${errorText}`);
      }
      const responseData = await response.json();
    
      navigate("/quiz-dashboard");
    } catch (error) {''
      console.error("Error:", error);
    }
  };
  



  return (
    
      <>
      <div className="mb-4">
       
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">{quizData?.title}</h4>
              <small className="text-muted">Quiz preview in interactive format</small>
            </Col>
            <Col xs="auto" style={{display:"flex",gap:"5px"}}>
              {/* <Button variant="outline-secondary" size="sm" className="me-2">
                Edit Quiz
              </Button> */}
              <Button variant="primary" onClick={(e)=> handlePublish(e)}  className="primary-button px-2"  size="sm">
                Publish
              </Button>
            </Col>
          </Row>
        
      </div>

    
      <Form >
        {quizData?.questions?.map((question) => (
          <QuestionRenderer key={question.id} question={question}   />
        ))}

      </Form>
      </>

   
  )
}
