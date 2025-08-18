

import { useRef, useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Plus, FileText, Target, Edit3, ArrowUp, ArrowDown, Copy, Trash2, Eye } from 'lucide-react'
import { TextEditorModal } from './text-editor-modal'
import { TrueFalseQuestion } from './question-types/true-false-question'
import { MultipleChoiceQuestion } from './question-types/multiple-choice-question'
import { FillInTheBlanksQuestion } from './question-types/fill-in-the-blanks-question'
import { MatchingPairsQuestion } from './question-types/matching-pairs-question'
import { OrderingQuestion } from './question-types/ordering-question'
import { CategorizingItemsQuestion } from './question-types/categorizing-items-question'
import { ShortAnswerQuestion } from './question-types/short-answer-question'
import { MultiSelectQuestion } from './question-types/multi-select-question'
import { Editor } from "@tinymce/tinymce-react";


 

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function LessonContentEditor({ contentBlocks, onContentBlocksChange ,editorRef }) {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [content,setContent]=useState(null)
  const [editingTextBlock, setEditingTextBlock] = useState(null)
  const [activeBlockId, setActiveBlockId] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const activeBlock = activeBlockId ? contentBlocks.find((block) => block.id === activeBlockId) : null

  const addTextBlock = () => {
    const newBlock = {
      id: generateId(),
      type: 'text',
      content :'',
    }
    onContentBlocksChange([...contentBlocks, newBlock])
    setActiveBlockId(newBlock.id)
  }

  const addQuestionBlock = (objective_type) => {
    
    let newQuestion
    switch (objective_type) {
      case 'true-false':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'true-false',
          natural_text: '',
          correct_answer: '',
        }
        break
      case 'multiple-choice':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'multiple-choice',
          natural_text: '',
          options: [{ id: generateId(), text: '' }],
          correct_answer: null,
        }
        break
      case 'fill-in-the-blanks':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'fill-in-the-blanks',
          natural_text: '',
          blanks: [{ id: generateId(), answer: '' }],
        }
        break
      case 'matching-pairs':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'matching-pairs',
          natural_text: '',
          pairs: [{ id: generateId(), term: '', definition: '' }],
        }
        break
      case 'ordering':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'ordering',
          natural_text: '',
          items: [{ id: generateId(), text: '' }],
        }
        break
      case 'categorizing-items':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'categorizing-items',
          natural_text: '',
          categories: [{ id: generateId(), name: 'Category 1' }],
          items: [{ id: generateId(), text: '', categoryId: '' }],
        }
        break
      case 'short-answer':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'short-answer',
          natural_text: '',
          correct_answer: '',
        }
        break
      case 'multi-select':
        newQuestion = {
          id: generateId(),
          type: 'question',
          objective_type: 'multi-select',
          natural_text: '',
          options: [{ id: generateId(), text: '', isCorrect: false }],
          
        }
        break
      default:
        console.warn('Unsupported question type:', objective_type)
        return
    }
    onContentBlocksChange([...contentBlocks, newQuestion])
    setActiveBlockId(newQuestion.id)
    setShowDropdown(false)
  }

  const updateContentBlock = (updatedBlock) => {
    onContentBlocksChange(
      contentBlocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block))
    )
  }

  const deleteContentBlock = (id) => {
    onContentBlocksChange(contentBlocks.filter((block) => block.id !== id))
    if (activeBlockId === id) {
      setActiveBlockId(null)
    }
  }

  const duplicateContentBlock = (id) => {
    const blockToDuplicate = contentBlocks.find((block) => block.id === id)
    if (blockToDuplicate) {
      const duplicatedBlock = { ...blockToDuplicate, id: generateId() }
      const insertIndex = contentBlocks.findIndex((block) => block.id === id) + 1
      const newBlocks = [
        ...contentBlocks.slice(0, insertIndex),
        duplicatedBlock,
        ...contentBlocks.slice(insertIndex),
      ]
      onContentBlocksChange(newBlocks)
      setActiveBlockId(duplicatedBlock.id)
    }
  }

  const moveContentBlock = (id, direction) => {
    const index = contentBlocks.findIndex((block) => block.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= contentBlocks.length) return

    const newBlocks = [...contentBlocks]
    const [movedBlock] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, movedBlock)
    onContentBlocksChange(newBlocks)
  }

  const handleEditTextBlock = (block) => {
    setEditingTextBlock(block)
    setIsTextModalOpen(true)
    setActiveBlockId(block.id)
  }

  const handleSaveEditedTextBlock = () => {
    if (editingTextBlock) {
      updateContentBlock({ ...editingTextBlock})
      setEditingTextBlock(null)
    } else {
      addTextBlock()
    }
  }

  const renderQuestionComponent = () => {
    switch (activeBlock.objective_type) {
      case 'true-false':
        return <TrueFalseQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'multiple-choice':
        return <MultipleChoiceQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'fill-in-the-blanks':
        return <FillInTheBlanksQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'matching-pairs':
        return <MatchingPairsQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'ordering':
        return <OrderingQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'categorizing-items':
        return <CategorizingItemsQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'short-answer':
        return <ShortAnswerQuestion question={activeBlock} onUpdate={updateContentBlock} />
      case 'multi-select':
        return <MultiSelectQuestion question={activeBlock} onUpdate={updateContentBlock} />
      default:
        return (
          <div className="p-4 border rounded text-muted">
            Unsupported question type: {activeBlock.objective_type}
          </div>
        )
    }
  }

  return (
    <Row className="g-4">
      {/* Left Panel: Lesson Content (70%) */}
      <Col lg={8}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Lesson Content</h4>
            <button className="primary-button px-3 py-2" size="sm">
              CWE
            </button>
          </Card.Header>
          <Card.Body className="overflow-auto">
            {!activeBlock ? (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Select a block from the right panel to edit.
              </div>
            ) : activeBlock.type === 'text' ? (
            
                    <Editor
                                      onInit={(evt, editor) => (editorRef.current = editor)}
                                      initialValue={""}
                                      id="question"
                                      editorType="question"
                                      init={{
                                        height: 500,
                                        width: "100%",
                                        menubar: false,
                                        toolbar:
                                          "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                                      }}
                                    />
              
            ) : (
              renderQuestionComponent()
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Right Panel: Content Block Manager (30%) */}
      <Col lg={4}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Content Blocks</h4>
            <button className='primary-button px-3 py-2' size="sm">
              <Eye size={20} className="me-2 mb-1" /> Preview
            </button>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto mb-3">
              {contentBlocks.length === 0 && (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <small>No blocks added yet.</small>
                </div>
              )}
              {contentBlocks.map((block) => (
                <div
                  key={block.id}
                 
                  className={`mb-2 p-2 rounded cursor-pointer ${
                    activeBlockId === block.id
                      ? 'bg-[#255A71] bg-opacity-10'
                      : 'bg-transparent'
                  }`}
                  onClick={() => setActiveBlockId(block.id)}
                  style={{ cursor: 'pointer', border:"1px solid #255A71" }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <small className="fw-bold d-flex align-items-center">
                      {block.type === 'text' ? (
                        <>
                          <FileText size={18} className="me-1" />
                          {"Add Text"}
                        </>
                      ) : (
                        <>
                          <Target size={18} className="me-1" />
                          {block.objective_type.replace(/-/g, ' ')}
                        </>
                      )}
                    </small>
                    <div className="d-flex gap-1">
                      {/* {block.type === 'text' && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTextBlock(block)
                          }}
                        >
                          <Edit3 size={18} />
                        </Button>
                      )} */}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveContentBlock(block.id, 'up')
                        }}
                      >
                        <ArrowUp size={18} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveContentBlock(block.id, 'down')
                        }}
                      >
                        <ArrowDown size={18} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateContentBlock(block.id)
                        }}
                      >
                        <Copy size={18} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteContentBlock(block.id)
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  {block.type === 'text' && (
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                      {block.content.substring(0, 100)}...
                      
                    </small>
                  )}
                  {block.type === 'question' && (
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                      {block.natural_text.substring(0, 100)}...
                    </small>
                  )}
                </div>
              ))}
            </div>
            
           
            <div className="position-relative">
      <button
        className="w-100 primary-button px-3 py-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Plus size={16} className="me-2 mb-1" /> Add New Block
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu show w-100"
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: '5px',
            top: 'auto',             // override Bootstrap top
            transform: 'none',       // prevent dropdown animation
            zIndex: 1000,            // ensure it's on top
          }}
        >
          <div className="dropdown-header">Add New Block</div>
          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              // setIsTextModalOpen(true);
              handleSaveEditedTextBlock()
              setShowDropdown(false);
            }}
          >
            <FileText size={16} className="me-2" /> Text Block
          </button>

          <div className="dropdown-divider"></div>
          <div className="dropdown-header">Objective-Based Questions</div>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('true-false');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> True/False
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('multiple-choice');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Multiple Choice
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('fill-in-the-blanks');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Fill in the Blanks
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('matching-pairs');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Matching Pairs
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('ordering');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Ordering
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('categorizing-items');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Categorizing Items
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('short-answer');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Short Answer
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              addQuestionBlock('multi-select');
              setShowDropdown(false);
            }}
          >
            <Target size={16} className="me-2" /> Multi-Select
          </button>
        </div>
      )}
    </div>
          </Card.Body>
        </Card>
      </Col>

      <TextEditorModal
        isOpen={isTextModalOpen}
        onClose={() => {
          setIsTextModalOpen(false)
          setEditingTextBlock(null)
        }}
        onSave={handleSaveEditedTextBlock}
        initialLabel={editingTextBlock?.label || ''}
        initialContent={editingTextBlock?.content || ''}
      />
    </Row>
  )
}
