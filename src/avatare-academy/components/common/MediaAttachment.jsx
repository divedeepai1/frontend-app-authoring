import { useState, useRef, useEffect } from "react"
import { Button, Row, Col } from "react-bootstrap"
import { Plus, X, Eye } from "lucide-react"

export default function MediaAttachment({
  questionId,
  questionType,
  questionText,
  media,
  onMediaChange,
  disabled = false,
  serverImageUrl = null,
  serverVideoUrl = null,
}) {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ type: "", url: "", name: "" })
  const [ignoreServerImage, setIgnoreServerImage] = useState(false)
  const [ignoreServerVideo, setIgnoreServerVideo] = useState(false)
  const fileInputRef = useRef(null)

  // merge server + local into unified media state
  const unifiedMedia = {
    images: media?.images?.length
      ? media.images
      : !ignoreServerImage && serverImageUrl
      ? [
          {
            id: "server-image",
            type: "image",
            url: serverImageUrl,
            name: "Server Image",
          },
        ]
      : [],
    videos: media?.videos?.length
      ? media.videos
      : !ignoreServerVideo && serverVideoUrl
      ? [
          {
            id: "server-video",
            type: "video",
            url: serverVideoUrl,
            name: "Server Video",
          },
        ]
      : [],
  }

  // Close modal on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false)
    }
    if (showModal) document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [showModal])

  const handleFileSelect = (type) => {
    if (disabled) return
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : "video/*"
    }
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = { ...unifiedMedia }

    files.forEach((file) => {
      const fileObj = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        file,
        type: file.type.startsWith("image/") ? "image" : "video",
        url: URL.createObjectURL(file),
        questionId,
        questionType,
        questionText,
      }

      if (fileObj.type === "image") {
        newMedia.images = [fileObj] // only keep 1
        setIgnoreServerImage(true) // replace server media
      } else {
        newMedia.videos = [fileObj]
        setIgnoreServerVideo(true) // replace server media
      }
    })

    onMediaChange(newMedia)
    e.target.value = ""
  }

  const removeMedia = (type) => {
    const newMedia = { ...media }
    if (type === "image") {
      newMedia.images = []
      setIgnoreServerImage(true)
    } else {
      newMedia.videos = []
      setIgnoreServerVideo(true)
    }
    onMediaChange(newMedia)
  }

  const openModal = (item) => {
    setModalContent({
      type: item.type,
      url: item.url,
      name: item.name,
    })
    setShowModal(true)
  }

  const renderMediaChips = (items, type) => {
    if (!items?.length) return null
    return items.map((item) => (
      <div
        key={item.id}
        className="d-inline-flex align-items-center py-1.5 px-2.5"
        style={{
          backgroundColor: type === "image" ? "#e3f2fd" : "#f3e5f5",
          border: `1px solid ${type === "image" ? "#2196f3" : "#9c27b0"}`,
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "500",
          color: type === "image" ? "#1976d2" : "#7b1fa2",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        onClick={() => openModal(item)}
      >
        <Eye size={16} className="me-2" />
        <span
          className="me-2 ml-1"
          style={{ textTransform: "capitalize", fontSize: "13px" }}
        >
          {type}
        </span>

        <Button
          variant="link"
          size="sm"
          className="p-0 ml-2"
          onClick={(e) => {
            e.stopPropagation()
            removeMedia(type)
          }}
          style={{
            color: type === "image" ? "#1976d2" : "#7b1fa2",
            padding: "0",
            minWidth: "auto",

            textDecoration: "none",
          }}
        >
          <X size={16} />
        </Button>
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
            onClick={() => handleFileSelect("image")}
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
            onClick={() => handleFileSelect("video")}
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
        style={{ display: "none" }}
      />

      {(unifiedMedia.images.length > 0 || unifiedMedia.videos.length > 0) && (
        <div className="mb-3">
          <div className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
            Attached Media
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {renderMediaChips(unifiedMedia.images, "image")}
            {renderMediaChips(unifiedMedia.videos, "video")}
          </div>
        </div>
      )}

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1050,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#f8f9fa",
              borderRadius: 8,
              width: "min(90vw, 900px)",
              maxHeight: "80vh",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid #dee2e6",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#495057",
                  textTransform: "capitalize",
                }}
              >
                {modalContent.type} Preview
              </div>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6c757d",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f9fa",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {modalContent.type === "image" ? (
                <img
                  src={modalContent.url}
                  alt={modalContent.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              ) : (
                <video
                  src={modalContent.url}
                  controls
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
