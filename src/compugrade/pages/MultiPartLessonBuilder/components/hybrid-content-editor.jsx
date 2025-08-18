
import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import {
  Plus,
  FileText,
  Target,
  Video,
  FileDiffIcon as FileCompare,
  Trash2,
  GripVertical,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { EnhancedRichTextEditor } from "./enhanced-rich-text-editor"
import { ObjectiveEditor } from "./objective-editor"

export function HybridContentEditor({ content, onContentChange ,selectedPart}) {

  const [blocks, setBlocks] = useState(
    content.blocks || []
  )

  const [videoEnabled, setVideoEnabled] = useState(content.videoEnabled ?? false)
  const [documentComparisonEnabled, setDocumentComparisonEnabled] = useState(
    content.documentComparison?.enabled ?? false,
  )
  const [uploadedVideo, setUploadedVideo] = useState(null)
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null)
  const [sourceDocument, setSourceDocument] = useState(null)
  const [answerKey, setAnswerKey] = useState(null)
  const [documentComparisonMode, setDocumentComparisonMode] = useState(
    content.documentComparison?.mode || "comparison-only",
  )
  const [partConfigExpanded, setPartConfigExpanded] = useState(false)

  const updateContent = (newContent) => {
    onContentChange(newContent)
  }
  useEffect(() => {
    // Sync local editor state when switching parts or content updates externally
    setBlocks(content?.blocks || [])
    setVideoEnabled(content?.videos ?? false)
    setDocumentComparisonEnabled(content?.documentComparison?.mode ?? false)
    setDocumentComparisonMode(content?.documentComparison?.mode || "comparison-only")
    setUploadedVideo(Array.isArray(content?.videos) && content.videos.length > 0 ? content.videos[0] : null)
    setSourceDocument(content?.sourceDocument || null)
    setAnswerKey(content?.answerKey || null)
  },[content,selectedPart])  

  const addTextBlock = () => {
    const newBlock = {
      id: `text-${Date.now()}`,
      type: "text",
      content: {
        html: "",
      },
      isCollapsed: false,
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    updateContent({ ...content, blocks: newBlocks })
  }

  const addObjectiveBlock = () => {
    const newBlock = {
      id: `objective-${Date.now()}`,
      type: "objective",
      content: {
        questions: [],
      },
      isCollapsed: false,
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    updateContent({ ...content, blocks: newBlocks })
  }

  const updateBlock = (blockId, newContent) => {
    const newBlocks = blocks.map((block) => (block.id === blockId ? { ...block, content: newContent } : block))
    setBlocks(newBlocks)
    updateContent({ ...content, blocks: newBlocks })
  }

  const toggleBlockCollapse = (blockId) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, isCollapsed: !block.isCollapsed } : block,
    )
    setBlocks(newBlocks)
    updateContent({ ...content, blocks: newBlocks })
  }

  const deleteBlock = (blockId) => {
   
    const newBlocks = blocks.filter((block) => block.id !== blockId)
    setBlocks(newBlocks)
    updateContent({ ...content, blocks: newBlocks })
  }

  const handleVideoToggle = (enabled) => {
    setVideoEnabled(enabled)
    updateContent({ ...content, videoEnabled: enabled })
  }

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedVideo(file)
      updateContent({ ...content, videos: [file] })
    }
  }

  const removeVideo = () => {
    setUploadedVideo(null)
    updateContent({ ...content, videos: [] })
  }

  const handleDocumentComparisonToggle = (enabled) => {
    setDocumentComparisonEnabled(enabled)
    const newDocComparison = {
      enabled,
      mode: enabled ? documentComparisonMode : "comparison-only",
      documents: enabled ? content.documentComparison?.documents || [] : [],
    }
    updateContent({ ...content, documentComparison: newDocComparison })
  }

  const handleComparisonModeChange = (mode) => {
    setDocumentComparisonMode(mode)
    const newDocComparison = {
      enabled: documentComparisonEnabled,
      mode,
      documents: content.documentComparison?.documents || [],
    }
    updateContent({ ...content, documentComparison: newDocComparison })
  }

  const handleSourceDocumentUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSourceDocument(file)
      updateContent({ ...content, sourceDocument: file })
    }
  }

  const handleAnswerKeyUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setAnswerKey(file)
      updateContent({ ...content, answerKey: file })
    }
  }

  const removeSourceDocument = () => {
    setSourceDocument(null)
    updateContent({ ...content, sourceDocument: null })
  }

  const removeAnswerKey = () => {
    setAnswerKey(null)
    updateContent({ ...content, answerKey: null })
  }

  const handleBlockDragStart = (index) => {
    setDraggedBlockIndex(index)
  }

  const handleBlockDrop = (dropIndex) => {
    if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
      const newBlocks = [...blocks]
      const draggedBlock = newBlocks[draggedBlockIndex]

      newBlocks.splice(draggedBlockIndex, 1)
      const insertIndex = draggedBlockIndex < dropIndex ? dropIndex - 1 : dropIndex
      newBlocks.splice(insertIndex, 0, draggedBlock)

      setBlocks(newBlocks)
      updateContent({ ...content, blocks: newBlocks })
    }
    setDraggedBlockIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Part Configuration Section */}
      <div className="rounded-lg shadow-lg bg-gradient-to-br from-white to-blue-50"style={{
    border: "1px solid #bfdbfe",
  }}>
        <div className="p-2">
          <div
            onClick={() => setPartConfigExpanded(!partConfigExpanded)}
            className="flex  items-center justify-between w-full text-left group"
          >
            <div className="flex items-center justify-center gap-x-3 pl-3">
              <div className="p-1 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Settings className="w-5 h-5 text-blue-600 mb-1" />
              </div>
              <div>
                <label className="text-base font-semibold text-gray-900 mt-2">Part Configuration</label>
                <p className="text-sm text-gray-500 mb-1">Manage documents, videos, and comparison settings</p>
              </div>
            </div>
            <div className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              {partConfigExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>

          {partConfigExpanded && (
            <div className="mt-4 space-y-4">
              {/* Document Uploads */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <FileText className="w-5 h-5 text-blue-600 mb-1" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">Part Documents</label>
                    <p className="text-xs text-gray-500">Upload source materials and answer keys</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Source Document</label>
                    {sourceDocument ? (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-200">
                            <FileText className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{sourceDocument.name}</span>
                            <p className="text-xs text-gray-500">Source document uploaded</p>
                          </div>
                        </div>
                        <div
                          onClick={removeSourceDocument}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                        <input
                          type="file"
                          accept=".doc,.docx"
                          onChange={handleSourceDocumentUpload}
                          className="hidden"
                          id="source-document"
                        />
                        <label htmlFor="source-document" className="cursor-pointer">
                          <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 w-fit mx-auto mb-2 transition-colors">
                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                            Upload source document
                          </p>
                          <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Answer Key</label>
                    {answerKey ? (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-200">
                            <FileText className="w-4 h-4 text-green-700" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{answerKey.name}</span>
                            <p className="text-xs text-gray-500">Answer key uploaded</p>
                          </div>
                        </div>
                        <div
                          onClick={removeAnswerKey}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                        <input
                          type="file"
                          accept=".doc,.docx"
                          onChange={handleAnswerKeyUpload}
                          className="hidden"
                          id="answer-key"
                        />
                        <label htmlFor="answer-key" className="cursor-pointer">
                          <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 w-fit mx-auto mb-2 transition-colors">
                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                            Upload answer key
                          </p>
                          <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Attachments */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Video className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">Video Attachments</label>
                      <p className="text-xs text-gray-500">Enable video uploads for this part</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{videoEnabled ? "Enabled" : "Disabled"}</span>
                    <div
                      onClick={() => handleVideoToggle(!videoEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        videoEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          videoEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {videoEnabled && (
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    {uploadedVideo ? (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-200">
                            <Video className="w-4 h-4 text-purple-700" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{uploadedVideo.name || ""}</span>
                            <p className="text-xs text-gray-500">Video file uploaded</p>
                          </div>
                        </div>
                        <div
                          onClick={removeVideo}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <div className="p-2 rounded-full bg-gray-100 group-hover:bg-purple-100 w-fit mx-auto mb-2 transition-colors">
                            <Video className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                            Upload video file
                          </p>
                          <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI files supported</p>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document Comparison */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <FileCompare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">Document Comparison</label>
                      <p className="text-xs text-gray-500">Enable document comparison features</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{documentComparisonEnabled ? "Enabled" : "Disabled"}</span>
                    <div
                      onClick={() => handleDocumentComparisonToggle(!documentComparisonEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        documentComparisonEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          documentComparisonEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {documentComparisonEnabled && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-700">Comparison Mode</label>
                    <div className="relative">
                      <select
                        value={documentComparisonMode}
                        onChange={(e) => handleComparisonModeChange(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-10"
                      >
                        <option value="comparison-only">Document Comparison Only Mode</option>
                        <option value="state-of-document">State-of-the-Document Comparison</option>
                        <option value="graded-comparison">Graded Document Comparison</option>
                        <option value="assessment-mode">Assessment Mode</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800">
                        {documentComparisonMode === "comparison-only" &&
                          "Students will compare documents side-by-side without grading."}
                        {documentComparisonMode === "state-of-document" &&
                          "Students will analyze the current state of documents."}
                        {documentComparisonMode === "graded-comparison" &&
                          "Document comparison will be graded automatically."}
                        {documentComparisonMode === "assessment-mode" &&
                          "Full assessment mode with detailed comparison metrics."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="relative group  border-blue-200 rounded-lg shadow-sm bg-white"
            draggable
            onDragStart={() => handleBlockDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleBlockDrop(index)}
          >
            {/* Block Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="cursor-move opacity-50 group-hover:opacity-100">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                {block.type === "text" ? (
                  <>
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Text Content Block</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Assessment Block</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div
                  onClick={() => toggleBlockCollapse(block.id)}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                >
                  {block.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>

                {blocks.length > 0 && (
                  <div
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Block Content */}
            {!block.isCollapsed && (
              <div className="p-3">
                {block.type === "text" ? (
                  <EnhancedRichTextEditor
                    content={block.content}
                    onContentChange={(newContent) => updateBlock(block.id, newContent)}
                    isCollapsed={false}
                    onToggleCollapse={() => toggleBlockCollapse(block.id)}
                  />
                ) : (
                  <ObjectiveEditor
                    content={block.content}
                    onContentChange={(newContent) => updateBlock(block.id, newContent)}
                    isCollapsed={false}
                    onToggleCollapse={() => toggleBlockCollapse(block.id)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Block divs */}
      <div className="flex gap-3 justify-center">
        <div
          onClick={addTextBlock}
          className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          Add Text Block
        </div>

        <div
          onClick={addObjectiveBlock}
          className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-700 hover:bg-green-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <Target className="w-4 h-4" />
          Add Assessment Block
        </div>
      </div>
    </div>
  )
}
