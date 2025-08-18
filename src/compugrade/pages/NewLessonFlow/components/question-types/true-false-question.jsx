import { Card, Form } from "react-bootstrap";
import { ImageAttach } from "../ui/image-attach";

export function TrueFalseQuestion({ question, onUpdate }) {
  const handleUpdate = (field, value) => {
    if (typeof field === "object" && value === undefined) {
      onUpdate({ ...question, ...field });
    } else {
      onUpdate({ ...question, [field]: value });
    }
  };

   const handleQuestionImageSelect = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      handleUpdate({
        image_url: url,
        image_name: file.name
      });
    }
  };

  const handleQuestionImageRemove = () => {
    handleUpdate({
      image_url: "",
      image_name: ""
    });
  };

  const handleAnswerImageSelect = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      handleUpdate({
        image_url: url,
        answer_image_name: file.name
      });
    }
  };

  const handleAnswerImageRemove = () => {
    handleUpdate({
      image_url: "",
      image_name: ""
    });
  };

  const natural_textError =
    !question.natural_text || !question.natural_text.trim()
      ? "Question text is required."
      : null;

  const correct_answerError =
    question.correct_answer === null || question.correct_answer === ''
      ? "Please select the correct answer."
      : null;

 

  return (
    <Card className="border-start border-4 border-info">
      <Card.Header>
        <h5 className="mb-0">True/False Question</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Question Text</Form.Label>
            <ImageAttach
              image={
                question.image_url
                  ? { url: question.image_url }
                  : null
              }
              onSelect={handleQuestionImageSelect}
              onRemove={handleQuestionImageRemove}
              label="Attach question image"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter the true/false statement here..."
              value={question.natural_text}
              onChange={(e) => handleUpdate("natural_text", e.target.value)}
              isInvalid={!!natural_textError}
            />
            {natural_textError && (
              <Form.Text className="text-danger">{natural_textError}</Form.Text>
            )}
            {question.image_url && (
              <div className="mt-2">
                <img
                  src={question.image_url}
                  alt="question"
                  style={{ maxHeight: 140 }}
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Correct Answer</Form.Label>
            {/* <ImageAttach
              image={
                question.answer_image_url
                  ? { url: question.answer_image_url }
                  : null
              }
              onSelect={handleAnswerImageSelect}
              onRemove={handleAnswerImageRemove}
              label="Attach answer image"
            /> */}
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="d-flex gap-3 align-items-center">
              <Form.Check
                type="radio"
                id={`true-${question.id}`}
                label="True"
                name={`answer-${question.id}`}
                checked={question.correct_answer === true}
                onChange={() => handleUpdate("correct_answer", true)}
              />
              <Form.Check
                type="radio"
                id={`false-${question.id}`}
                label="False"
                name={`answer-${question.id}`}
                checked={question.correct_answer === false}
                onChange={() => handleUpdate("correct_answer", false)}
              />
            </div>
            {correct_answerError && (
              <Form.Text className="text-danger">
                {correct_answerError}
              </Form.Text>
            )}
            {/* {question.answer_image_url && (
              <div className="mt-2">
                <img
                  src={question.answer_image_url}
                  alt="answer"
                  style={{ maxHeight: 120 }}
                />
              </div>
            )} */}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hint (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide hint..."
              value={question.explanation || ""}
              onChange={(e) => handleUpdate("explanation", e.target.value)}
            />
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
}
