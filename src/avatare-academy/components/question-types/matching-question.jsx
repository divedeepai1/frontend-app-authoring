"use client"

import { useState } from "react"
import { Form, Button, Row, Col, Card, Nav } from "react-bootstrap"
import { Plus, Upload } from "lucide-react"

export default function MatchingQuestion({ question, onUpdate }) {
  const [activeTab, setActiveTab] = useState("text")
  const [pairs, setPairs] = useState(
    question.pairs || [{ columnA: "", columnB: "", columnAImage: null, columnBImage: null }],
  )

  const validPairs = pairs.filter(
    (pair) => (pair.columnA.trim() || pair.columnAImage) && (pair.columnB.trim() || pair.columnBImage),
  )

  const addMorePair = () => {
    const newPairs = [...pairs, { columnA: "", columnB: "", columnAImage: null, columnBImage: null }]
    setPairs(newPairs)
    onUpdate({ pairs: newPairs })
  }

  const updatePair = (index, field, value) => {
    const newPairs = [...pairs]
    newPairs[index][field] = value
    setPairs(newPairs)
    onUpdate({ pairs: newPairs })
  }

  const removePair = (index) => {
    if (pairs.length > 1) {
      const newPairs = pairs.filter((_, i) => i !== index)
      setPairs(newPairs)
      onUpdate({ pairs: newPairs })
    }
  }

  const handleImageUpload = (index, column, event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updatePair(index, `${column}Image`, e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Question Text 
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter matching question instructions"
          value={question.questionText}
          onChange={(e) => onUpdate({ questionText: e.target.value })}
          style={{ resize: "vertical" }}
          isInvalid={!question.questionText.trim()}
        />
        <Form.Control.Feedback type="invalid">Question text is required</Form.Control.Feedback>
      </div>

      <div className="mb-4">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link
              active={activeTab === "text"}
              onClick={() => setActiveTab("text")}
              style={{
                backgroundColor: activeTab === "text" ? "white" : "#f8f9fa",
                border: "1px solid #dee2e6",
                color: activeTab === "text" ? "#000" : "#6c757d",
                fontSize: "14px",
                padding: "8px 16px",
              }}
            >
              Text Based
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "images"}
              onClick={() => setActiveTab("images")}
              style={{
                backgroundColor: activeTab === "images" ? "white" : "#f8f9fa",
                border: "1px solid #dee2e6",
                borderLeft: "none",
                color: activeTab === "images" ? "#000" : "#6c757d",
                fontSize: "14px",
                padding: "8px 16px",
              }}
            >
              Images Based
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Row>
          <Col md={6}>
            <h6 className="text-center mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
              Column A
            </h6>
            {pairs.map((pair, index) => (
              <div key={index} className="mb-3">
                {activeTab === "text" ? (
                  <Form.Control
                    type="text"
                    placeholder="Add Word or phrase"
                    value={pair.columnA}
                    onChange={(e) => updatePair(index, "columnA", e.target.value)}
                    style={{ fontSize: "14px", padding: "12px" }}
                  />
                ) : (
                  <Card
                    className="text-center p-4"
                    style={{
                      border: "2px dashed #dee2e6",
                      backgroundColor: "#f8f9fa",
                      minHeight: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pair.columnAImage ? (
                      <div>
                        <img
                          src={pair.columnAImage || "/placeholder.svg"}
                          alt="Column A"
                          style={{ maxWidth: "100px", maxHeight: "80px", objectFit: "contain" }}
                        />
                        <div className="mt-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => updatePair(index, "columnAImage", null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} className="mb-2 text-muted" />
                        <div className="text-muted mb-2" style={{ fontSize: "14px" }}>
                          Upload Image here
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, "columnA", e)}
                          style={{ display: "none" }}
                          id={`columnA-${index}`}
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => document.getElementById(`columnA-${index}`).click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            ))}
          </Col>

          <Col md={6}>
            <h6 className="text-center mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
              Column B 
            </h6>
            {pairs.map((pair, index) => (
              <div key={index} className="mb-3">
                {activeTab === "text" ? (
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Add Word or phrase"
                      value={pair.columnB}
                      onChange={(e) => updatePair(index, "columnB", e.target.value)}
                      style={{ fontSize: "14px", padding: "12px" }}
                    />
                    {pairs.length > 1 && (
                      <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => removePair(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="d-flex">
                    <Card
                      className="text-center p-4 flex-grow-1"
                      style={{
                        border: "2px dashed #dee2e6",
                        backgroundColor: "#f8f9fa",
                        minHeight: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pair.columnBImage ? (
                        <div>
                          <img
                            src={pair.columnBImage || "/placeholder.svg"}
                            alt="Column B"
                            style={{ maxWidth: "100px", maxHeight: "80px", objectFit: "contain" }}
                          />
                          <div className="mt-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updatePair(index, "columnBImage", null)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload size={24} className="mb-2 text-muted" />
                          <div className="text-muted mb-2" style={{ fontSize: "14px" }}>
                            Upload Image here
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, "columnB", e)}
                            style={{ display: "none" }}
                            id={`columnB-${index}`}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => document.getElementById(`columnB-${index}`).click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </Card>
                    {pairs.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2 align-self-start"
                        onClick={() => removePair(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </Col>
        </Row>

        <div className="mt-3">
          <Button variant="outline-secondary" size="sm" onClick={addMorePair} className="d-flex align-items-center">
            <Plus size={16} className="me-1" />
            Add More Pair
          </Button>
        </div>

        {validPairs.length < 2 && (
          <div className="text-danger mt-2" style={{ fontSize: "12px" }}>
            At least 2 matching pairs are required
          </div>
        )}
      </div>

      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Answer Points 
        </Form.Label>
        <Form.Control
          type="number"
          value={question.points}
          onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 0 })}
          style={{ width: "150px" }}
          isInvalid={!question.points || question.points <= 0}
        />
        {question.points <= 0 &&<Form.Control.Feedback type="invalid">Points must be greater than 0</Form.Control.Feedback>}
      </div>
    </>
  )
}
