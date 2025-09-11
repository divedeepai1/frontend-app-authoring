import { useState, useRef } from "react"
import { Button, Modal, Row, Col, Badge } from "react-bootstrap"
import { Plus, X, Image as ImageIcon, Video, Eye } from "lucide-react"

export default function MediaAttachment({ 
  questionId, 
  media, 
  onMediaChange, 
  disabled = false 
}) {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ type: '', url: '', name: '' })
  const fileInputRef = useRef(null)

  const handleFileSelect = (type) => {
    if (disabled) return
    // Set the accept attribute based on type
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*'
    }
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = { ...media }

    files.forEach(file => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fileObj = {
        id: fileId,
        name: file.name,
        file: file,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: URL.createObjectURL(file)
      }

      if (fileObj.type === 'image') {
        // Replace existing image instead of adding
        newMedia.images = [fileObj]
      } else {
        // Replace existing video instead of adding
        newMedia.videos = [fileObj]
      }
    })

    onMediaChange(newMedia)
    e.target.value = '' // Reset file input
  }

  const removeMedia = (type, id) => {
    if (disabled) return
    const newMedia = { ...media }
    
    if (type === 'image') {
      newMedia.images = []
    } else {
      newMedia.videos = []
    }
    
    onMediaChange(newMedia)
  }

  const openModal = (item) => {
    setModalContent({
      type: item.type,
      url: item.url,
      name: item.name
    })
    setShowModal(true)
  }

  const renderMediaChips = (items, type) => {
    if (!items || items.length === 0) return null

    return items.map(item => (
      <div
        key={item.id}
        className="d-inline-flex align-items-center"
        style={{
          backgroundColor: type === 'image' ? '#e3f2fd' : '#f3e5f5',
          border: `1px solid ${type === 'image' ? '#2196f3' : '#9c27b0'}`,
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '500',
          color: type === 'image' ? '#1976d2' : '#7b1fa2',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = type === 'image' ? '#bbdefb' : '#e1bee7'
          e.target.style.transform = 'translateY(-1px)'
          e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = type === 'image' ? '#e3f2fd' : '#f3e5f5'
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onClick={() => openModal(item)}
      >
        <Eye size={14} className="me-2" />
        <span className="me-2" style={{ textTransform: 'capitalize' }}>
          {type}
        </span>
        {!disabled && (
          <Button
            variant="link"
            size="sm"
            className="p-0"
            onClick={(e) => {
              e.stopPropagation()
              removeMedia(type, item.id)
            }}
            style={{ 
              color: type === 'image' ? '#1976d2' : '#7b1fa2', 
              padding: '0', 
              minWidth: 'auto',
              textDecoration: 'none'
            }}
          >
            <X size={16} />
          </Button>
        )}
      </div>
    ))
  }

  return (
    <>
      <Row className="mb-3">
        <Col xs="auto">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="d-flex align-items-center"
            // onClick={() => handleFileSelect('image')}
            disabled={disabled}
          >
            <Plus size={16} className="me-1" />
            Add Image
          </Button>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="d-flex align-items-center"
            // onClick={() => handleFileSelect('video')}
            disabled={disabled}
          >
            <Plus size={16} className="me-1" />
            Add Video
          </Button>
        </Col>
      </Row>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Media Chips Display */}
      {(media?.images?.length > 0 || media?.videos?.length > 0) && (
        <div className="mb-3">
          <div className="mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
            Attached Media
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {renderMediaChips(media?.images, 'image')}
            {renderMediaChips(media?.videos, 'video')}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600', color: '#495057', textTransform: 'capitalize' }}>
            {modalContent.type} Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body 
          className="text-center" 
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {modalContent.type === 'image' ? (
            <img 
              src={modalContent.url} 
              alt={modalContent.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
          ) : (
            <video 
              src={modalContent.url} 
              controls 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
          <div 
            style={{ 
              display: 'none',
              color: '#6c757d',
              fontSize: '14px',
              fontStyle: 'italic'
            }}
          >
            Unable to load media file
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
