import { Card, Form, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";
import { ImageAttach } from '../ui/image-attach'

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function MultiSelectQuestion({ question, onUpdate }) {
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
  
  const handleOptionTextChange = (optionId, newText) => {
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    handleUpdate("options", updatedOptions);
  };

  const handleOptionCorrectChange = (optionId, isCorrect) => {
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, isCorrect: isCorrect } : opt
    );
    handleUpdate("options", updatedOptions);
  };

  const handleAddOption = () => {
    const newOption = { id: generateId(), text: "", isCorrect: false, image_url: '', image: '' };
    handleUpdate("options", [...question.options, newOption]);
  };

  const handleRemoveOption = (optionId) => {
    const updatedOptions = question.options.filter(
      (opt) => opt.id !== optionId
    );
    handleUpdate("options", updatedOptions);
  };



  const handleOptionImageSelect = (optionId, file) => {
    const url = URL.createObjectURL(file)
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, image_url: url, image: file.name } : opt
    );
    handleUpdate('options', updatedOptions)
  }
  const handleOptionImageRemove = (optionId) => {
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, image_url: '', image: '' } : opt
    );
    handleUpdate('options', updatedOptions)
  }

  // Validation
  const natural_textError = !question.natural_text || !question.natural_text.trim()
    ? 'Question text is required.'
    : null
  const options = question.options || []
  const hasEnoughOptions = options.length >= 2
  const hasEmptyOptionText = options.some((opt) => !opt.text || !opt.text.trim())
  const hasAtLeastOneCorrect = options.some((opt) => opt.isCorrect)

  return (
    <Card className="border-start border-4" style={{ borderColor: "#e83e8c" }}>
      <Card.Header>
        <h5 className="mb-0">Multi-Select Question</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Question Text</Form.Label>
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={handleQuestionImageSelect}
              onRemove={handleQuestionImageRemove}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter the multi-select question here..."
              value={question.natural_text}
              onChange={(e) => handleUpdate("natural_text", e.target.value)}
              isInvalid={!!natural_textError}
            />
            {natural_textError && (
              <Form.Text className="text-danger">{natural_textError}</Form.Text>
            )}
            {question.image_url && (
              <div className="mt-2"><img src={question.image_url} alt="question" style={{maxHeight:120}} /></div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Options (Check all that apply)</Form.Label>
            {question.options.map((option, index) => (
              <div
                key={option.id}
                className="d-flex align-items-center gap-2 mb-2"
              >
                <Form.Check
                  type="checkbox"
                  id={`option-correct-${option.id}`}
                  checked={option.isCorrect}
                  onChange={(e) =>
                    handleOptionCorrectChange(option.id, e.target.checked)
                  }
                />
                <Form.Control
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionTextChange(option.id, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="flex-grow-1"
                  isInvalid={!option.text || !option.text.trim()}
                />
                <ImageAttach
                  image={option.image_url ? { url: option.image_url } : null}
                  onSelect={(file) => handleOptionImageSelect(option.id, file)}
                  onRemove={() => handleOptionImageRemove(option.id)}
                  label="Attach option image"
                  scope={{ questionId: question.id, kind: 'option', refId: option.id }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <button type="button" onClick={handleAddOption} className="mt-2 primary-button px-3 py-1">
              <Plus size={16} className="me-2 mb-1" /> Add Option
            </button>
            {!hasEnoughOptions && (
              <div><Form.Text className="text-danger">Add at least two options.</Form.Text></div>
            )}
            {hasEmptyOptionText && (
              <div><Form.Text className="text-danger">Option text cannot be empty.</Form.Text></div>
            )}
            {!hasAtLeastOneCorrect && (
              <div><Form.Text className="text-danger">Mark at least one option as correct.</Form.Text></div>
            )}
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
