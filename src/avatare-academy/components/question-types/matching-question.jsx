import { useState, useRef, useEffect } from "react";
import { Form, Button, Row, Col, Card, Nav } from "react-bootstrap";
import { Plus, Upload } from "lucide-react";

export default function MatchingQuestion({ question, onUpdate }) {
  const [activeTab, setActiveTab] = useState("text");
  const [pairs, setPairs] = useState(
    question.pairs || [
      { columnA: "", columnB: "", columnAImage: null, columnBImage: null },
    ]
  );

  const [connections, setConnections] = useState(question.connections || []);
  const [dragStart, setDragStart] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const containerRef = useRef(null);

  const validPairs = pairs.filter(
    (pair) =>
      (pair.columnA.trim() || pair.columnAImage) &&
      (pair.columnB.trim() || pair.columnBImage)
  );

  const addMorePair = () => {
    const newPairs = [
      ...pairs,
      { columnA: "", columnB: "", columnAImage: null, columnBImage: null },
    ];
    setPairs(newPairs);
    onUpdate({ pairs: newPairs });
  };

  const updatePair = (index, field, value) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    setPairs(newPairs);
    onUpdate({ pairs: newPairs });
  };

  const removePair = (index) => {
    if (pairs.length > 1) {
      const newPairs = pairs.filter((_, i) => i !== index);
      setPairs(newPairs);
      onUpdate({ pairs: newPairs });
    }
  };

  const handleImageUpload = (index, column, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePair(index, `${column}Image`, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= Line Drawing Logic ===================
  const getItemCenter = (index, side) => {
    const el = document.getElementById(`${side}-${index}`);
    const container = containerRef.current;
    if (!el || !container) return null;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x:
        elRect.left -
        containerRect.left +
        (side === "left" ? elRect.width - 5 : 5),
      y: elRect.top - containerRect.top + elRect.height / 2,
    };
  };

  const handleMouseDown = (index, side) => {
    if (side !== "left") return;
    setDragStart({ index, side });
    setIsDrawing(true);
    const startPos = getItemCenter(index, side);
    if (startPos) {
      setTempLine({
        x1: startPos.x,
        y1: startPos.y,
        x2: startPos.x,
        y2: startPos.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !dragStart || !tempLine) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTempLine((prev) => ({ ...prev, x2: x, y2: y }));
  };

  const handleMouseUp = (index, side) => {
    if (!isDrawing || !dragStart) return;
    if (side === "right") {
      const startPos = getItemCenter(dragStart.index, "left");
      const endPos = getItemCenter(index, "right");
      if (startPos && endPos) {
        const id = `${dragStart.index}-${index}`;
        const updated = connections.filter(
          (c) => c.leftIndex !== dragStart.index
        );
        updated.push({
          id,
          leftIndex: dragStart.index,
          rightIndex: index,
          x1: startPos.x,
          y1: startPos.y,
          x2: endPos.x,
          y2: endPos.y,
        });
        setConnections(updated);
        onUpdate({ connections: updated });
      }
    }
    setDragStart(null);
    setIsDrawing(false);
    setTempLine(null);
  };

  const removeConnection = (id) => {
    const updated = connections.filter((conn) => conn.id !== id);
    setConnections(updated);
    onUpdate({ connections: updated });
  };

  useEffect(() => {
    const up = () => {
      setDragStart(null);
      setIsDrawing(false);
      setTempLine(null);
    };
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, []);

  // ================== END Line Drawing ===================

  return (
    <>
      <div className="mb-3">
        {/* <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
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
        <Form.Control.Feedback type="invalid">
          Question text is required
        </Form.Control.Feedback> */}
      </div>

      <div className="mb-4">
        {/* <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link  style={{
                backgroundColor: activeTab === "text" ? "white" : "#f8f9fa",
                border: "1px solid #dee2e6",
                color: activeTab === "text" ? "#000" : "gray",
                fontSize: "14px",
                padding: "8px 16px",
              }} active={activeTab === "text"} onClick={() => setActiveTab("text")}>Text Based</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link  style={{
                backgroundColor: activeTab === "images" ? "white" : "#f8f9fa",
                border: "1px solid #dee2e6",
                color: activeTab === "images" ? "#000" : "gray",
                fontSize: "14px",
                padding: "8px 16px",
              }} active={activeTab === "images"} onClick={() => setActiveTab("images")}>Images Based</Nav.Link>
          </Nav.Item>
        </Nav> */}

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          style={{ position: "relative" }}
        >
          {activeTab === "text" && (
            <svg
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            >
              {connections.map((conn) => (
                <g key={conn.id}>
                  <line
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke="#000"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={0.25 * conn.x1 + 0.75 * conn.x2}
                    cy={0.25 * conn.y1 + 0.75 * conn.y2}
                    r="12"
                    fill="white"
                    stroke="#000"
                    strokeWidth="2"
                    onClick={() => removeConnection(conn.id)}
                    style={{ cursor: "pointer" }}
                  />
                  <text
                    x={0.25 * conn.x1 + 0.75 * conn.x2}
                    y={0.25 * conn.y1 + 0.75 * conn.y2}
                    fontSize="20"
                    fill="#000"
                    onClick={() => removeConnection(conn.id)}
                    style={{ cursor: "pointer" }}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    dominantBaseline="middle"
                  >
                    ×
                  </text>
                </g>
              ))}
              {tempLine && (
                <line
                  x1={tempLine.x1}
                  y1={tempLine.y1}
                  x2={tempLine.x2}
                  y2={tempLine.y2}
                  stroke="#000"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              )}
            </svg>
          )}

          <div
            className="d-flex justify-content-between"
            style={{ wifth: "100%" }}
          >
            <Col md={4}>
              <h6 className="text-center mb-3">Column A</h6>
              {pairs.map((pair, index) => (
                <div key={index} className="mb-3">
                  <div
                    id={`left-${index}`}
                    onMouseDown={() => handleMouseDown(index, "left")}
                    style={{ zIndex: 2, position: "relative" }}
                  >
                    {activeTab === "text" ? (
                      <Form.Control
                        type="text"
                        value={pair.columnA}
                        onChange={(e) =>
                          updatePair(index, "columnA", e.target.value)
                        }
                        placeholder="Add Word or Phrase"
                      />
                    ) : (
                      <Card
                        className="text-center p-4"
                        style={{ border: "2px dashed #dee2e6" }}
                      >
                        {pair.columnAImage ? (
                          <div>
                            <img
                              src={pair.columnAImage}
                              alt="A"
                              style={{ maxHeight: "80px" }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updatePair(index, "columnAImage", null)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload size={24} className="mb-2 text-muted" />
                            <div className="text-muted">Upload Image</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(index, "columnA", e)
                              }
                              style={{ display: "none" }}
                              id={`columnA-${index}`}
                            />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                document
                                  .getElementById(`columnA-${index}`)
                                  .click()
                              }
                            >
                              Choose File
                            </Button>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </Col>

            <Col md={4}>
              <h6 className="text-center mb-3">Column B</h6>
              {pairs.map((pair, index) => (
                <div key={index} className="mb-3">
                  <div
                    id={`right-${index}`}
                    onMouseUp={() => handleMouseUp(index, "right")}
                    style={{ zIndex: 2, position: "relative" }}
                  >
                    {activeTab === "text" ? (
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          value={pair.columnB}
                          onChange={(e) =>
                            updatePair(index, "columnB", e.target.value)
                          }
                          placeholder="Add Word or Phrase"
                        />
                        {pairs.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-2"
                            onClick={() => removePair(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Card
                        className="text-center p-4"
                        style={{ border: "2px dashed #dee2e6" }}
                      >
                        {pair.columnBImage ? (
                          <div>
                            <img
                              src={pair.columnBImage}
                              alt="B"
                              style={{ maxHeight: "80px" }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updatePair(index, "columnBImage", null)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload size={24} className="mb-2 text-muted" />
                            <div className="text-muted">Upload Image</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(index, "columnB", e)
                              }
                              style={{ display: "none" }}
                              id={`columnB-${index}`}
                            />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                document
                                  .getElementById(`columnB-${index}`)
                                  .click()
                              }
                            >
                              Choose File
                            </Button>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </Col>
          </div>
        </div>

        <div className="mt-3">
          <Button variant="outline-secondary" size="sm" onClick={addMorePair}>
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
        <Form.Label
          className="mb-2"
          style={{ fontSize: "14px", fontWeight: "600" }}
        >
          Answer Points
        </Form.Label>
        <Form.Control
          type="number"
          value={question.points}
          onChange={(e) =>
            onUpdate({ points: Number.parseInt(e.target.value) || 0 })
          }
          style={{ width: "150px" }}
          isInvalid={!question.points || question.points <= 0}
        />
        {question.points <= 0 && (
          <Form.Control.Feedback type="invalid">
            Points must be greater than 0
          </Form.Control.Feedback>
        )}
      </div>
    </>
  );
}
