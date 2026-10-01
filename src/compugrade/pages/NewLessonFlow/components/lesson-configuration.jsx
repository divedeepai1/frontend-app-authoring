


import { useRef, useState } from 'react'
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { MultiSelectTags } from './ui/multi-select-tags'

export function LessonConfiguration({ config, onConfigChange ,skills }) {
  console.log(skills)
  const [isOpen, setIsOpen] = useState(true)
  const sourceRef = useRef(null);
  const answerKeyRef = useRef(null);


  const isDocEval = config.lessonType === 'document-evaluation-only' || config.lessonType === 'hybrid'
  const isSkills = config.lessonType === 'skills-only' || config.lessonType === 'hybrid'
  const errors = {}
  if (config.sourceFile) {
    if (!/\.docx$/i.test(config.sourceFile.name)) {
      errors.sourceFile = 'Only .docx files are allowed.'
    }
  } else if (isDocEval) {
    errors.sourceFile = 'Source file is required for this lesson type.'
  }
  if (config.answerKeyFile) {
    if (!/\.docx$/i.test(config.answerKeyFile.name)) {
      errors.answerKeyFile = 'Only .docx files are allowed.'
    }
  } else if (isDocEval) {
    errors.answerKeyFile = 'Answer key is required for this lesson type.'
  }
  if (isSkills && (!config.skills || config.skills.length === 0)) {
    errors.skills = 'Add at least one skill.'
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files ? e.target.files[0] : null
    onConfigChange({ ...config, [field]: file })
  }

  const handleLessonTypeChange = (lessonType) => {
    onConfigChange({ ...config, lessonType })
  }

  const removeFile = (field) => {
    onConfigChange({ ...config, [field]: null });
  };

  return (
    <div className="mb-4">
      <Card>
        <Card.Header 
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: 'pointer' }}
          className="d-flex justify-content-between align-items-center"
        >
          <h4 className="mb-0">Lesson Configuration</h4>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </Card.Header>
        {isOpen && (
          <Card.Body>
            <Row className="g-2">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className='text-black'>Type of Lesson</Form.Label>
                  <div className="d-flex flex-wrap">
                    <button
                       style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      className={config.lessonType === 'skills-only' ? 'primary-button px-3 py-2' : 'secondary-button px-3 py-2'}
                      onClick={() => handleLessonTypeChange('skills-only')}
                    >
                      Skills only
                    </button>
                    <button
                      style={{borderRadius:"none !important"}}
                      className={config.lessonType === 'document-evaluation-only' ? 'primary-button px-3 py-2 rounded-0' : 'secondary-button px-3 py-2 rounded-0'}
                      onClick={() => handleLessonTypeChange('document-evaluation-only')}
                    >
                      Document evaluation only
                    </button>
                    <button
                       style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      
                      className={config.lessonType === 'hybrid' ? 'primary-button px-3 py-2' : 'secondary-button px-3 py-2'}
                      onClick={() => handleLessonTypeChange('hybrid')}
                    >
                      Hybrid (both)
                    </button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
        <Form.Group>
          <Form.Label className='text-black'>Source File (docx)</Form.Label>
          <Form.Control
            type="file"
            accept=".docx"
            onChange={(e) => handleFileChange(e, "sourceFile")}
            className="d-none"
            ref={sourceRef}
          />
          <InputGroup>
            <Form.Control
              type="text"
              value={config.sourceFile?.name || "Source File"}
              placeholder="Choose file"
              readOnly
              isInvalid={!!errors.sourceFile}
              style={{ background: "transparent", cursor: "pointer" }}
              onClick={() => sourceRef.current?.click()}
            />
            {config.sourceFile && (
              <Button
                variant="outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile("sourceFile");
                }}
              >
                <X size={18} />
              </Button>
            )}
          </InputGroup>
          {errors.sourceFile && (
            <Form.Text className="text-danger">{errors.sourceFile}</Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className='text-black'>Answer Key (docx)</Form.Label>
          <Form.Control
            type="file"
            accept=".docx"
            onChange={(e) => handleFileChange(e, "answerKeyFile")}
            className="d-none"
            ref={answerKeyRef}
          />
          <InputGroup>
            <Form.Control
              type="text"
              value={config.answerKeyFile?.name || "Answer key File"}
              placeholder="Choose file"
              readOnly
              isInvalid={!!errors.answerKeyFile}
              style={{ background: "transparent", cursor: "pointer" }}
              onClick={() => answerKeyRef.current?.click()}
            />
            {config.answerKeyFile && (
              <Button
                variant="outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile("answerKeyFile");
                }}
              >
                <X size={18} />
              </Button>
            )}
          </InputGroup>
          {errors.answerKeyFile && (
            <Form.Text className="text-danger">{errors.answerKeyFile}</Form.Text>
          )}
        </Form.Group>
      </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className='text-black'>Skills</Form.Label>
                {skills.length > 0 &&<MultiSelectTags
                    skills={skills} 
                    selectedSkills={config.skills}
                    onChange={(newSkills) => onConfigChange({ ...config, skills: newSkills })}
                    placeholder="Add skills here"
                  />}
                  {errors.skills && (
                    <Form.Text className="text-danger">{errors.skills}</Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        )}
      </Card>
    </div>
  )
}
