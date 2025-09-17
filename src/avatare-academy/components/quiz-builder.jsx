import { useEffect, useState } from "react"
import { Container, Row, Col, Button, Alert } from "react-bootstrap"
import QuestionCard from "./question-card"
import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../cms-csrftoken"
import { useNavigate, useLocation } from "react-router"
import { ArrowLeft } from "lucide-react"

export default function QuizBuilder({ quizType, quizId, status, data }) {
  const [validationErrors, setValidationErrors] = useState([])
  const [isPublish,setIsPublish]=useState(false);
  const [showValidation, setShowValidation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backLoading, setBackLoading] = useState(false)
  const [questions, setQuestions] = useState([
    { id: 1, type: quizType === "multiple_choice" ? "multiple_choice" : quizType ==="matching" ? "matching" : "", questionText: "", options: ["", ""], answer: "", points: 0, blanks: ["", ""], pairs: [],connections: [], media: { images: [], videos: [] } },
  ])
  const navigate = useNavigate()
  const location = useLocation()

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: quizType === "multiple_choice" ? "multiple_choice" : "",
      questionText: "",
      options: ["", ""],
      answer: "",
      points: 0,
      blanks: ["", ""],
      pairs: [],
      connections: [],
      media: { images: [], videos: [] }
    }
    setQuestions([...questions, newQuestion])
  }

  console.log(questions)

  const parseQuestions = (questionsData) => {
    console.log("Parsing questions data:", questionsData)
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
        connections: [],
        media: { images: [], videos: [] },
        imageUrl: q.image_s3_url || null,
        videoUrl: q.video_s3_url || null
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
        const correctIndex = q.options.findIndex((opt) => opt.is_correct)
        return {
          ...base,
          blanks: q.options.map((o) => o.text),
          answer: correctIndex >= 0 ? correctIndex.toString() : ""
        }
      }

      if (q.question_type === "short_answer" || q.question_type === "long_answer") {
        return { ...base, answer: q.correct_answers?.[0]?.answer_text || "" }
      }

      if (q.question_type === "matching") {
      
        const columnAOptions = [];
        const columnBOptions = [];
        
      
        q.options.forEach((opt, index) => {
          if (index % 2 === 0) {
            columnAOptions.push({ ...opt, originalIndex: index });
          } else {
            columnBOptions.push({ ...opt, originalIndex: index });
          }
        });
      
   
        const pairs = [];
        const maxLength = Math.max(columnAOptions.length, columnBOptions.length);
        
        for (let i = 0; i < maxLength; i++) {
          pairs.push({
            columnA: columnAOptions[i]?.text || "",
            columnAImage: columnAOptions[i]?.image || null,
            columnB: columnBOptions[i]?.text || "",
            columnBImage: columnBOptions[i]?.image || null,
          });
        }
      
     
        const connections = [];
        const processedPairs = new Set();
      
      
        q.correct_answers.forEach((answer, index) => {
          const pairId = answer.pair_value;
          
          if (processedPairs.has(pairId)) return;
          processedPairs.add(pairId);
      
       
          const optionA = columnAOptions.find(opt => opt.match_pair_id === pairId);
          const optionB = columnBOptions.find(opt => opt.match_pair_id === pairId);
      
          if (optionA && optionB) {
          
            const leftIndex = columnAOptions.findIndex(opt => opt.match_pair_id === pairId);
            const rightIndex = columnBOptions.findIndex(opt => opt.match_pair_id === pairId);
      
            if (leftIndex !== -1 && rightIndex !== -1) {
              connections.push({
                id: `${leftIndex}-${rightIndex}`,
                leftIndex,
                rightIndex,
                x1: 0, 
                y1: 0,   
                x2: 0, 
                y2: 0, 
              });
            }
          }
        });
      
        return { ...base, pairs, connections };
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
          if (filledOptions.length < 2) questionErrors.push("At least 2 answer options are required")
          if (!question.answer && question.answer !== "0") questionErrors.push("Select the correct answer")
          break
        case "fill_blank":
          const filledBlanks = (question.blanks || []).filter((blank) => blank?.trim())
          if (filledBlanks.length < 1) questionErrors.push("Add at least one blank answer")
          if (!question.answer) questionErrors.push("Select the correct answer")
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
    setLoading(true)
    const id = sessionStorage.getItem("quizId");
    
    try {
      // Collect all media files from all questions
      const allMediaFiles = []
      questions.forEach(question => {
        if (question.media) {
          if (question.media.images) {
            allMediaFiles.push(...question.media.images.map(img => ({ ...img, questionId: question.id, questionType: question.type, mediaType: 'image' })))
          }
          if (question.media.videos) {
            allMediaFiles.push(...question.media.videos.map(vid => ({ ...vid, questionId: question.id, questionType: question.type, mediaType: 'video' })))
          }
        }
      })

     
      const data = convertQuestionsToBackendFormat(id, questions, allMediaFiles)
      
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
      if (responseData.questions && allMediaFiles.length > 0) {
        const uploadPromises = []
        responseData.questions.forEach(question => {
          const questionMedia = allMediaFiles.filter(media => media.questionText == question.text)

          
          
          questionMedia.forEach(media => {
            let presignedUrl = null
            
            if (media.mediaType === 'image' && question.image_upload_url) {
              presignedUrl = question.image_upload_url
            } else if (media.mediaType === 'video' && question.video_upload_url) {
              presignedUrl = question.video_upload_url

            }
            
            if (presignedUrl) {
            
              uploadPromises.push(
                uploadFileToS3(media.file, presignedUrl).then(success => ({
                  questionId: media.questionId,
                  questionType: media.questionType,
                  mediaType: media.mediaType,
                  filename: media.name,
                  uploadSuccess: success
                }))
              )
            }
          })
        })

        if (uploadPromises.length > 0) {
          const uploadResults = await Promise.all(uploadPromises)
          const successfulUploads = uploadResults.filter(result => result.uploadSuccess)
          console.log('Media upload results:', successfulUploads)
        }
      }

      if(isPublish){
      navigate("/publish-quiz" , { state: { isPublish : isPublish } })
      }
      else{
      navigate("/publish-quiz")
      }
    } catch (err) {
      console.error("Error saving quiz:", err)
    } finally {
      setLoading(false)
    }
  }
  
  // Helper function to upload files to S3
  const uploadFileToS3 = async (file, presignedUrl) => {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      return false;
    }
  };



  function convertQuestionsToBackendFormat(id, questionsList, allMediaFiles = []) {
    
    return {
      quiz_id: id,
      auto_order: true,
      starting_order: 1,
      questions: questionsList.map((question, index) => {
        // Get media files for this question (not uploaded yet)
        const questionMedia = allMediaFiles.filter(media => media.questionId === question.id)
        const images = questionMedia.filter(media => media.mediaType === 'image')
        const videos = questionMedia.filter(media => media.mediaType === 'video')

        const base = {
          quiz: id,
          difficulty:"medium",
          question_type: question.type,
          text: question.questionText,
          points: question.points || 0,
          image: images.length > 0 ? images[0].name : "",
          video_url: videos.length > 0 ? videos[0].name : ""
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
        if (question.type === "fill_blank") {
          return {
            ...base,
            options: question.blanks.map((blank, i) => ({
              text: blank,
              is_correct: String(i) === question.answer,
              order: i + 1,
            })),
          }
        }
        if (["short_answer", "long_answer"].includes(question.type)) {
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
  let pairIdCounter = 1;
  const options = [];
  const correct_answers = [];

  const columnARefs = [];
  const columnBRefs = [];


  question.pairs.forEach((pair, index) => {
    columnARefs[index] = options.length;
    options.push({
      text: pair.columnA || "",
      image: pair.columnAImage || null,
      match_pair_id: "", 
    });

    columnBRefs[index] = options.length;
    options.push({
      text: pair.columnB || "",
      image: pair.columnBImage || null,
      match_pair_id: "", 
    });
  });

 
  for (const conn of question.connections || []) {
    const fromIndex = conn.leftIndex;  
    const toIndex = conn.rightIndex;   

    const pairId = `pair${pairIdCounter++}`;

  
    correct_answers.push({
      pair_value: pairId,
      answer_text: `${question.pairs[fromIndex]?.columnA} = ${question.pairs[toIndex]?.columnB}`,
    });

    // Set match_pair_id for both connected options
    const aOptionIndex = columnARefs[fromIndex];  // Column A option index
    const bOptionIndex = columnBRefs[toIndex];    // Column B option index

    if (aOptionIndex !== undefined) options[aOptionIndex].match_pair_id = pairId;
    if (bOptionIndex !== undefined) options[bOptionIndex].match_pair_id = pairId;
  }

  return {
    ...base,
    options,
    correct_answers,
  };
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

  const handleBack = async () => {
    setBackLoading(true)
    try {
      // Check if we're in edit mode (existing quiz) or create mode (new quiz)
      const isEditMode = quizId && !location.state?.formValues
      
      if (isEditMode) {
        // Edit mode: Navigate back to quiz dashboard without deleting
        navigate("/quiz-dashboard")
      } else {
        // Create mode: Delete the quiz that was created and go back to form
        if (quizId) {
          const token = await fetchCsrfToken()
          const response = await fetch(
            `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/`,
            {
              method: "DELETE",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token,
              },
            }
          )

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to delete quiz: ${response.status} ${errorText}`)
          }
        }

        // Clear the quizId from session storage
        sessionStorage.removeItem("quizId")

        // Navigate back to new-quiz with preserved form values
        const formValues = location.state?.formValues || {}
        navigate("/create-new-quiz", { 
          state: { 
            preservedValues: formValues,
            quizType: quizType 
          } 
        })
      }
    } catch (error) {
      console.error("Error going back:", error.message)
      // Still navigate back even if delete fails
      const isEditMode = quizId && !location.state?.formValues
      if (!isEditMode) {
        sessionStorage.removeItem("quizId")
        const formValues = location.state?.formValues || {}
        navigate("/create-new-quiz", { 
          state: { 
            preservedValues: formValues,
            quizType: quizType 
          } 
        })
      } else {
        navigate("/quiz-dashboard")
      }
    } finally {
      setBackLoading(false)
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2>{quizType === "multiple_choice" ? "Multiple Choice" : quizType === "multi_component" ? "Multi Component" : "Matching"} Quiz</h2>
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
                  {quizType !=="matching" && <div className="d-flex mt-4" style={{width:"100%" ,height:"50px" ,borderRadius:"8px",}}>
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
          </div>}

          <div className="mt-4" style={{ display:"flex",  gap: "0.5rem" }}>
            <button
              disabled={backLoading}
              onClick={handleBack}
              className="px-4 py-4 secondary-button d-flex align-items-center justify-content-center"
              style={{
                fontWeight: "500",
                height: "50px",
              }}
            >
              {backLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2 mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Going Back...
                </>
              ) : (
                <>
                  <ArrowLeft size={16} className="me-2" />
                  Back
                </>
              )}
            </button>
            <button
              disabled={questions?.length ==0 || loading}
              onClick={handleGenerateQuiz}
              className="px-4 py-4 primary-button d-flex align-items-center justify-content-center"
              style={{
                fontWeight: "500",
                height: "50px",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2 mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                `${quizId ? "Update" :" Generate"} Quiz`
              )}
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
