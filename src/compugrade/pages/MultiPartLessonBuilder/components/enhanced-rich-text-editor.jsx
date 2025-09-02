

import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export function EnhancedRichTextEditor({ content, onContentChange, isCollapsed = false, onToggleCollapse }) {
  const [attachedImages, setAttachedImages] = useState(content?.images || [])
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  const formatText = (command, value) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      onContentChange({
        ...content,
        html: editorRef.current.innerHTML,
      })
    }
  }

  // Initialize or sync editor only when external html actually changes
  useEffect(() => {
    const html = content?.html || ""
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html
    }
    // Sync attached images from content prop if provided
    if (Array.isArray(content?.images)) {
      setAttachedImages(content.images)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content?.html])

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result
        const newImages = [...attachedImages, imageUrl]
        setAttachedImages(newImages)

        // Insert image at cursor position
        const img = document.createElement("img")
        img.src = imageUrl
        img.style.maxWidth = "100%"
        img.style.height = "auto"
        img.style.margin = "10px 0"
        img.style.borderRadius = "8px"
        img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"

        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.insertNode(img)
          range.collapse(false)
        }

        updateContent()
      }
      reader.readAsDataURL(file)
    }
  }

  const insertLink = () => {
    if (linkUrl) {
      formatText("createLink", linkUrl)
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  if (isCollapsed) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 truncate">
            {content?.html ? content.html.replace(/<[^>]*>/g, "").substring(0, 100) + "..." : "Empty text content"}
          </div>
          <div
            onClick={onToggleCollapse}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Toolbar */}
      <div className="p-4 shadow-sm border border-blue-200 rounded-lg bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r pr-3">
              <div
                onClick={() => formatText("bold")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <Bold className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("italic")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <Italic className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("underline")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <Underline className="w-4 h-4" />
              </div>
            </div>

            {/* Headings */}
            <div className="flex items-center justify-center gap-1 border-r pr-3">
              <div
                onClick={() => formatText("formatBlock", "p")}
                className="h-9 w-9 text-xs font-semibold hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
                title="Paragraph"
              >
                P
              </div>
              <div
                onClick={() => formatText("formatBlock", "h1")}
                className="h-9 w-9 text-xs font-semibold hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
                title="Heading 1"
              >
                H1
              </div>
              <div
                onClick={() => formatText("formatBlock", "h2")}
                className="h-9 w-9 text-xs font-semibold hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
                title="Heading 2"
              >
                H2
              </div>
              <div
                onClick={() => formatText("formatBlock", "h3")}
                className="h-9 w-9 text-xs font-semibold hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
                title="Heading 3"
              >
                H3
              </div>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r pr-3">
              <div
                onClick={() => formatText("insertUnorderedList")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <List className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("insertOrderedList")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <ListOrdered className="w-4 h-4" />
              </div>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 border-r pr-3">
              <div
                onClick={() => formatText("justifyLeft")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <AlignLeft className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("justifyCenter")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <AlignCenter className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("justifyRight")}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <AlignRight className="w-4 h-4" />
              </div>
            </div>

            {/* Media */}
            <div className="flex items-center gap-1">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 rounded transition-colors flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4" />
              </div>

              {/* <div
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors flex items-center justify-center"
              >
                <LinkIcon className="w-4 h-4" />
              </div> */}
            </div>
          </div>

          {/* Collapse div */}
          {onToggleCollapse && (
            <div
              onClick={onToggleCollapse}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Link Input */}
        {showLinkInput && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <input
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div
              onClick={insertLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Insert Link
            </div>
            <div
              onClick={() => setShowLinkInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Editor */}
      <div className="p-3 shadow-sm border border-blue-200 rounded-lg bg-white">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[300px] p-4 border-2 border-dashed border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all"
          style={{ whiteSpace: "pre-wrap" }}
          onInput={updateContent}
        />
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
    </div>
  )
}
