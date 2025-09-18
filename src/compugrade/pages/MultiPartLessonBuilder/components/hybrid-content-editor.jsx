import { useEffect, useState } from "react";
import { Download, Eye, Layers, Settings } from "lucide-react";
import {
  Plus,
  FileText,
  Target,
  Trash2,
  GripVertical,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { EnhancedRichTextEditor } from "./enhanced-rich-text-editor";
import { FileDiffIcon, Image as ImageIcon, Video, Label } from "lucide-react";
import { ObjectiveEditor } from "./objective-editor";
import EditableBlockName from "./ui/input-name";
import { get } from "lodash";
import downloadFile from "../utils/downloadFile";
import TimestampModal from "./ui/timestamp";
import DocumentPreviewDialog from "./ui/DocumentPreviewDialog";

export function HybridContentEditor({
  video,
  content,
  onContentChange,
  selectedPart,
}) {
  const [blocks, setBlocks] = useState(content.blocks || []);
  const [timestampPreview, setTimestampPreview] = useState({
    open: false,
    timestamp: null,
  });
  // Collapse/Expand All is computed from current part's instruction blocks

  const [videoEnabled, setVideoEnabled] = useState(
    content.videoEnabled ?? false
  );
  const [documentComparisonEnabled, setDocumentComparisonEnabled] = useState(
    content.documentComparison?.enabled ?? false
  );
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);
  const [preDragCollapsed, setPreDragCollapsed] = useState(null);
  const [sourceDocument, setSourceDocument] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);
  const [documentComparisonMode, setDocumentComparisonMode] = useState(
    content.documentComparison?.mode || "comparison-only"
  );
  const [partConfigExpanded, setPartConfigExpanded] = useState(false);
  const [previewState, setPreviewState] = useState({
    open: false,
    url: null,
    type: null,
    name: "",
  });
  const [docPreview, setDocPreview] = useState({ open: false, title: "", src: null });

  const collapseOrExpandAll = () => {
    const shouldCollapse = blocks.some((b) => !b.isCollapsed);
    const newBlocks = blocks.map((b) => ({ ...b, isCollapsed: shouldCollapse }));
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  function getUrl(item) {
    if (item instanceof File || item instanceof Blob) {
      return URL.createObjectURL(item);
    } else {
      return item;
    }
  }

  const updateContent = (newContent) => {
    onContentChange(newContent);
  };
  useEffect(() => {
    // Sync local editor state when switching parts or content updates externally
    setBlocks(content?.blocks || []);
    // setVideoEnabled(content?.videos || false)
    // setDocumentComparisonEnabled(content?.documentComparison?.mode || false)
    setDocumentComparisonMode(
      content?.documentComparison?.mode || "comparison-only"
    );
    setUploadedVideo(
      Array.isArray(content?.videos) && content.videos.length > 0
        ? content.videos[0]
        : null
    );
    setSourceDocument(content?.sourceDocument || null);
    setAnswerKey(content?.answerKey || null);
  }, [content, selectedPart]);

  const addTextBlock = () => {
    const newBlock = {
      id: `text-${Date.now()}`,
      type: "text",
      name: "Add Text Block",
      content: {
        html: "",
      },
      isCollapsed: false,
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const addInstructionBlock = () => {
    const ins = blocks.filter((b) => b.type === "instruction").length + 1;
    const newBlock = {
      id: `instruction-${Date.now()}`,
      type: "instruction",
      name: "Instruction " + ins,
      content: {
        html: "",
        attachments: { images: [], videos: [] },
      },
      isCollapsed: false,
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const addDocComparisonBlock = () => {
    const newBlock = {
      id: `doccmp-${Date.now()}`,
      type: "doc-comparison",
      name: "Document Comparison",
      content: {
        mode: "comparison-only",
        documents: [], // legacy list (kept for reference)
        document: null, // single file (new)
      },
      isCollapsed: false,
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const addObjectiveBlock = () => {
    const newBlock = {
      id: `objective-${Date.now()}`,
      type: "objective",
      name: "Add Objective Question",
      content: {
        questions: [],
      },
      isCollapsed: false,
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const updateBlock = (blockId, newContent) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content: newContent } : block
    );
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const renameBlock = (blockId, newName) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, name: newName } : block
    );
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const toggleBlockCollapse = (blockId) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId
        ? { ...block, isCollapsed: !block.isCollapsed }
        : block
    );
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const deleteBlock = (blockId) => {
    const filtered = blocks.filter((block) => block.id !== blockId);
    const newBlocks = renumberInstructionNames(filtered);
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  const handleBlockDragStart = (index) => {
    setDraggedBlockIndex(index);
    // Capture current collapse state per block and collapse all to create space
    const stateById = blocks.reduce((acc, b) => {
      acc[b.id] = !!b.isCollapsed;
      return acc;
    }, {});
    setPreDragCollapsed(stateById);
    const collapsedBlocks = blocks.map((b) => ({ ...b, isCollapsed: true }));
    setBlocks(collapsedBlocks);
  };

  const handleBlockDrop = (dropIndex) => {
    if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
      const newBlocks = [...blocks];
      const draggedBlock = newBlocks[draggedBlockIndex];

      newBlocks.splice(draggedBlockIndex, 1);
      const insertIndex =
        draggedBlockIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newBlocks.splice(insertIndex, 0, draggedBlock);

      // Restore pre-drag collapsed state by id if available
      const restored = preDragCollapsed
        ? newBlocks.map((b) => ({
            ...b,
            isCollapsed:
              Object.prototype.hasOwnProperty.call(preDragCollapsed, b.id)
                ? preDragCollapsed[b.id]
                : b.isCollapsed,
          }))
        : newBlocks;

      const renumbered = renumberInstructionNames(restored);
      setBlocks(renumbered);
      updateContent({ ...content, blocks: renumbered });
    }
    setDraggedBlockIndex(null);
    setPreDragCollapsed(null);
  };

  const handleBlockDragEnd = () => {
    if (preDragCollapsed) {
      const restored = blocks.map((b) => ({
        ...b,
        isCollapsed: Object.prototype.hasOwnProperty.call(preDragCollapsed, b.id)
          ? preDragCollapsed[b.id]
          : b.isCollapsed,
      }));
      setBlocks(restored);
      updateContent({ ...content, blocks: restored });
    }
    setDraggedBlockIndex(null);
    setPreDragCollapsed(null);
  };

  const moveBlock = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= blocks.length || fromIndex === toIndex) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    const renumbered = renumberInstructionNames(newBlocks);
    setBlocks(renumbered);
    updateContent({ ...content, blocks: renumbered });
  };

  const renumberInstructionNames = (list) => {
    let instructionCounter = 0;
    const defaultPattern = /^Instruction\s+\d+$/i;
    return list.map((block) => {
      if (block.type === "instruction") {
        instructionCounter += 1;
        const shouldOverride = !block.name || defaultPattern.test(block.name);
        if (shouldOverride) {
          return { ...block, name: `Instruction ${instructionCounter}` };
        }
      }
      return block;
    });
  };

  const getInstructionNumber = (blockId) => {
    const instructionBlocks = blocks.filter((b) => b.type === "instruction");
    const idx = instructionBlocks.findIndex((b) => b.id === blockId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const triggerHiddenInput = (inputId) => {
    const el = document.getElementById(inputId);
    if (el) el.click();
  };

  const handleInstructionImageSelect = (block, files, inputEl) => {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) {
      if (inputEl) inputEl.value = "";
      return;
    }
    const nextImages = [
      ...(block.content.attachments?.images || []),
      ...fileList,
    ];
    const contentWithAttachments = {
      ...block.content,
      attachments: {
        ...block.content.attachments,
        images: nextImages,
      },
    };
    updateBlock(block.id, contentWithAttachments);
    if (inputEl) inputEl.value = "";
  };

  const handleInstructionVideoSelect = (block, files, inputEl) => {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) {
      if (inputEl) inputEl.value = "";
      return;
    }
    const nextVideos = [
      ...(block.content.attachments?.videos || []),
      ...fileList,
    ];
    const contentWithAttachments = {
      ...block.content,
      attachments: {
        ...block.content.attachments,
        videos: nextVideos,
      },
    };
    updateBlock(block.id, contentWithAttachments);
    if (inputEl) inputEl.value = "";
  };

  const removeInstructionAttachment = (block, type, index) => {
    const next = { ...block.content.attachments };
    if (type === "image")
      next.images = (next.images || []).filter((_, i) => i !== index);
    if (type === "video")
      next.videos = (next.videos || []).filter((_, i) => i !== index);
    updateBlock(block.id, { ...block.content, attachments: next });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3"> 
        <div className="flex justify-end mb-2"> 
          <div
            onClick={() => collapseOrExpandAll()}
            className="px-3 py-2 text-sm font-medium text-white cursor-pointer bg-blue-600 rounded hover:bg-blue-700"
            onDragEnd={handleBlockDragEnd}
          >
            {blocks.some((b) => !b.isCollapsed) ? "Collapse" : "Expand"} All
          </div>
        </div>
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
                {block.type === "text" && (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
                {block.type === "objective" && (
                  <Target className="w-5 h-5 text-green-600" />
                )}
                {block.type === "instruction" && (
                  <Layers className="w-5 h-5 text-indigo-600" />
                )}
                {block.type === "doc-comparison" && (
                  <FileDiffIcon className="w-5 h-5 text-orange-600" />
                )}

                <EditableBlockName block={block} renameBlock={renameBlock} />
              </div>

              <div className="flex items-center gap-2">
                {/* Move Up/Down controls */}
                <div
                  onClick={() => moveBlock(index, index - 1)}
                  className={`p-1 rounded transition-colors ${
                    index === 0
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div
                  onClick={() => moveBlock(index, index + 1)}
                  className={`p-1 rounded transition-colors ${
                    index === blocks.length - 1
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div
                  onClick={() => toggleBlockCollapse(block.id)}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                >
                  {block.isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
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
                {block.type === "text" && (
                  <EnhancedRichTextEditor
                    content={block.content}
                    onContentChange={(newContent) =>
                      updateBlock(block.id, newContent)
                    }
                    isCollapsed={false}
                    onToggleCollapse={() => toggleBlockCollapse(block.id)}
                  />
                )}
                {block.type === "instruction" && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-indigo-50 border-b border-indigo-200">
                      <div className="px-2 py-0.5  text-indigo-700">
                        Instruction {getInstructionNumber(block.id)}
                      </div>

                      <div className="flex items-center gap-2 mr-2">
                        <select
                          defaultValue="no-skill"
                          value={block.content.item_type || "no-skill"}
                          className="px-2 py-1 text-xs rounded  text-gray-950 border-green-200 border bg-transparent"
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateBlock(block.id, {
                              ...block.content,
                              item_type: newType,
                            });
                          }}
                        >
                          <option value="certification">
                            Certification Skill
                          </option>
                          <option value="foundation">Foundation Skill</option>
                          <option value="no-skill">No Skill</option>
                        </select>

                        <button
                          onClick={() =>
                            triggerHiddenInput(`instr-img-${block.id}`)
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 border-green-200 border bg-transparent rounded"
                        >
                          <ImageIcon className="w-4 h-4" /> Image
                        </button>

                        <button
                          onClick={() =>
                            triggerHiddenInput(`instr-vid-${block.id}`)
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-600 border-purple-200 border bg-transparent rounded"
                        >
                          <Video className="w-4 h-4" /> Video
                        </button>
                      </div>
                    </div>

                    <div className="p-2">
                      <EnhancedRichTextEditor
                        content={block.content}
                        onContentChange={(newContent) =>
                          updateBlock(block.id, newContent)
                        }
                        isCollapsed={false}
                        onToggleCollapse={() => toggleBlockCollapse(block.id)}
                        hideMediaButtons
                      />

                      <input
                        id={`instr-img-${block.id}`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleInstructionImageSelect(
                            block,
                            e.target.files,
                            e.target
                          )
                        }
                      />
                      <input
                        id={`instr-vid-${block.id}`}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleInstructionVideoSelect(
                            block,
                            e.target.files,
                            e.target
                          )
                        }
                      />

                      <div className="mt-2 flex flex-wrap gap-3">
                        {(block.content.attachments?.images || []).map(
                          (img, idx) => (
                            <div
                              key={`img-${idx}`}
                              className="relative flex items-center justify-between w-44 px-3 py-2 rounded-lg bg-white border border-green-200 text-green-700 text-sm cursor-pointer shadow-sm hover:shadow"
                              onClick={() =>
                                setPreviewState({
                                  open: true,
                                  url: getUrl(img),
                                  type: "image",
                                  name: "Image Attached " + (idx + 1),
                                })
                              }
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span className="truncate">
                                  {"Image Attached " + (idx + 1)}
                                </span>
                              </div>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeInstructionAttachment(
                                    block,
                                    "image",
                                    idx
                                  );
                                }}
                                className="absolute top-1 right-1 p-0.5 rounded-fullborder  text-red-500  cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          )
                        )}

                        {(block.content.attachments?.videos || []).map(
                          (vid, idx) => {
                            const isTimestamp = (vid) => {
                              // 1. Explicitly exclude File and Blob objects
                              if (vid instanceof File || vid instanceof Blob) {
                                return false;
                              }

                              // 2. Must be a string to be considered timestamp
                              if (typeof vid !== "string") {
                                return false;
                              }

                              // 3. Exclude URLs (http/https/blob) and file-like names
                              if (/^(https?:\/\/|blob:)/i.test(vid)) {
                                return false;
                              }
                              if (/\.(mp4|mov|avi|mkv|webm)$/i.test(vid)) {
                                return false;
                              }

                              // 4. Only allow "start-end" or "start-None"
                              return /^\d+-(\d+|None)$/i.test(vid);
                            };

                            return (
                              <div
                                key={`vid-${idx}`}
                                className="relative flex items-center justify-between w-44 px-3 py-2 rounded-lg bg-white border border-purple-200 text-purple-700 text-sm cursor-pointer shadow-sm hover:shadow"
                                onClick={() => {
                                  if (isTimestamp(vid)) {
                                    setTimestampPreview({
                                      open: true,
                                      timestamp: vid,
                                    });
                                  } else {
                                    setPreviewState({
                                      open: true,
                                      url: getUrl(vid),
                                      type: "video",
                                      name: "Video Attached " + (idx + 1),
                                    });
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 pr-6">
                                  <Eye className="w-4 h-4" />
                                  <span className="truncate">
                                    {isTimestamp(vid)
                                      ? `Timestamp Video`
                                      : `Video Attached ${idx + 1}`}
                                  </span>
                                </div>

                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeInstructionAttachment(
                                      block,
                                      "video",
                                      idx
                                    );
                                  }}
                                  className="absolute top-1 right-1 p-0.5 rounded-full text-red-500 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {block.type === "doc-comparison" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Document Comparison Mode (NG)
                      </label>
                      <select
                        value={block.content.mode}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            ...block.content,
                            mode: e.target.value,
                          })
                        }
                        className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="comparison-only">
                          Document Comparison Only (NG)
                        </option>
                        <option value="state-of-document">
                          State of the Document (NG)
                        </option>
                        <option value="graded-comparison">
                          Graded Comparison
                        </option>
                        <option value="assessment-mode">Assessment Mode</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        {block.content.mode === "comparison-only" &&
                          "Students will compare documents side-by-side without additional features"}
                        {block.content.mode === "state-of-document" &&
                          "Track and analyze document state changes over time with version history"}
                        {block.content.mode === "graded-comparison" &&
                          "Document comparison with automated grading criteria and scoring rubrics"}
                        {block.content.mode === "assessment-mode" &&
                          "Full assessment mode with comparison, evaluation, and comprehensive feedback"}
                      </p>
                    </div>

                    <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileDiffIcon className="w-5 h-5 text-orange-600" />
                        <div className="text-sm font-medium text-orange-800">
                          Comparison Configuration
                        </div>
                      </div>
                      <p className="text-sm text-orange-700">
                        {block.content.mode === "comparison-only" &&
                          "Students will compare documents side-by-side without additional features. Students will interact with this comparison during the lesson."}
                        {block.content.mode === "state-of-document" &&
                          "Track and analyze document state changes over time with version history. Students will interact with this comparison during the lesson."}
                        {block.content.mode === "graded-comparison" &&
                          "Document comparison with automated grading criteria and scoring rubrics. Students will interact with this comparison during the lesson."}
                        {block.content.mode === "assessment-mode" &&
                          "Full assessment mode with comparison, evaluation, and comprehensive feedback. Students will interact with this comparison during the lesson."}
                      </p>
                    </div>

                    {/* Show upload only when "state-of-document" is selected */}
                    {block.content.mode === "state-of-document" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Relevant Document (DOC/DOCX)
                        </label>
                        {block.content.document ? (
                          <div className="flex items-center justify-between gap-4 p-2 rounded border border-orange-200 bg-orange-50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <div className="text-sm font-medium">
                                Comparison Document Attached
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                onClick={() =>
                                  setDocPreview({
                                    open: true,
                                    title: "Comparison Document",
                                    src: block.content.document,
                                  })
                                }
                                className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </div>
                              <div
                                onClick={() =>
                                  downloadFile(
                                    block.content.document,
                                    "answer-key"
                                  )
                                }
                                className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </div>
                              <button
                                className="px-2 py-1 text-xs border-none bg-red-50 rounded"
                                onClick={() =>
                                  updateBlock(block.id, {
                                    ...block.content,
                                    document: null,
                                  })
                                }
                              >
                                <X className="w-4 h-4" color="red" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept=".doc,.docx"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                updateBlock(block.id, {
                                  ...block.content,
                                  document: f,
                                });
                                e.target.value = "";
                              }
                            }}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border border-gray-200 rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {block.type === "objective" && (
                  <ObjectiveEditor
                    content={block.content}
                    onContentChange={(newContent) =>
                      updateBlock(block.id, newContent)
                    }
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
      <div className="flex gap-3 flex-wrap w-full px-[5%] items-center justify-center">
        <div
          onClick={addTextBlock}
          className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          Add Text Block
        </div>

        <div
          onClick={addInstructionBlock}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <Layers className="w-4 h-4" />
          Add Instruction
        </div>

        <div
          onClick={addObjectiveBlock}
          className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-700 hover:bg-green-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <Target className="w-4 h-4" />
          Add Objective Question
        </div>
        <div
          onClick={addDocComparisonBlock}
          className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          Add Document Comparison
        </div>
      </div>

      <TimestampModal
        open={timestampPreview.open}
        timestamp={timestampPreview.timestamp}
        onClose={() => setTimestampPreview({ open: false, timestamp: null })}
        videoUrl={video}
      />

      {/* Preview Modal */}
      {previewState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setPreviewState({ open: false, url: null, type: null, name: "" })
            }
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-[90vw] max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="text-sm font-medium truncate pr-4">
                {previewState.name}
              </div>
              <div className="flex items-center gap-2">
                {previewState.url && (
                  <a
                    href={previewState.url}
                    download={previewState.name}
                    className="p-1 rounded"
                  >
                    <Download className="w-5 h-5 text-gray-500 " />
                  </a>
                )}
                <button
                  className="p-1 rounded border-none bg-transparent"
                  onClick={() =>
                    setPreviewState({
                      open: false,
                      url: null,
                      type: null,
                      name: "",
                    })
                  }
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 flex items-center justify-center bg-gray-50">
              {previewState.type === "image" && (
                <img
                  src={previewState.url}
                  alt={previewState.name}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              )}
              {previewState.type === "video" && (
                <video
                  src={previewState.url}
                  controls
                  className="max-h-[70vh] max-w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
      <DocumentPreviewDialog
        open={docPreview.open}
        onClose={() => setDocPreview({ open: false, title: "", src: null })}
        title={docPreview.title}
        source={docPreview.src}
        mimeHint={(() => {
          const s = docPreview.src;
          if (!s) return "";
          if (typeof s === "string") {
            if (/^data:/i.test(s)) return "";
            if (!/^https?:\/\//i.test(s)) {
              return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
          } else if (s && !s.type) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          }
          return "";
        })()}
        nameHint="document.docx"
      />
    </div>
  );
}
