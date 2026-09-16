import { useEffect, useState, useMemo, useRef } from "react";
import { Download, Eye, Layers, Settings, Pencil, Check, Wand2, Save as SaveIcon } from "lucide-react";
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
import { FileDiffIcon, Image as ImageIcon, Video, Tag } from "lucide-react";
import { base_url } from "../../../../compugrade-constants";
import {
  comparePartialKey,
  matchErrorCodes,
} from "../utils/partialKeyComparison";
import { ObjectiveEditor } from "./objective-editor";
import EditableBlockName from "./ui/input-name";
import { get } from "lodash";
import downloadFile from "../utils/downloadFile";
import TimestampModal from "./ui/timestamp";
import DocumentPreviewDialog from "./ui/DocumentPreviewDialog";
import ProgrammaticErrorCodeModal from "./ProgrammaticErrorCodeModal";
import StringChecksModal from "./StringChecksModal";

export function HybridContentEditor({
  video,
  content,
  onContentChange,
  selectedPart,
  lessonSkills = [],
}) {
  const [blocks, setBlocks] = useState(content.blocks || []);
  const [editingWeightageFor, setEditingWeightageFor] = useState(null);
  const [tempWeightage, setTempWeightage] = useState(10);
  const [questionTypeModal, setQuestionTypeModal] = useState({ open: false, selectedType: "true-false" });
  const [errorCodesModal, setErrorCodesModal] = useState({ open: false, blockId: null });
  const [stringChecksModal, setStringChecksModal] = useState({ open: false, blockId: null });
  const [errorCodesInput, setErrorCodesInput] = useState("");
  const [availableErrorCodes, setAvailableErrorCodes] = useState([]);
  const [selectedErrorCodes, setSelectedErrorCodes] = useState([]);
  const [errorCodeQuery, setErrorCodeQuery] = useState("");
  const [errorDropdownOpen, setErrorDropdownOpen] = useState(false);
  const [errorAutoRef, setErrorAutoRef] = useState(null);
  const [errorGenLoading, setErrorGenLoading] = useState(false);
  const [errorGenLoadingFor, setErrorGenLoadingFor] = useState(null);
  const [errorGenMessage, setErrorGenMessage] = useState("");
  const [timestampPreview, setTimestampPreview] = useState({
    open: false,
    timestamp: null,
  });
  const [programmaticModalOpen, setProgrammaticModalOpen] = useState(false);
  const [partialKeyFile, setPartialKeyFile] = useState(null);
  const [matchedCodesCollapsed, setMatchedCodesCollapsed] = useState(true);
  const [associatedCodesCollapsed, setAssociatedCodesCollapsed] = useState(true);
  const [comparisonCodesCollapsed, setComparisonCodesCollapsed] = useState(true);
  const [instructionStatus, setInstructionStatus] = useState(null);
  const [filteredCodes, setFilteredCodes] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const [partialKeyCheckerCollapsed, setPartialKeyCheckerCollapsed] = useState(true);

  // Memoize filtered error codes for dropdown to prevent lag
  const filteredErrorCodes = useMemo(() => {
    const filtered = availableErrorCodes
      .filter((c) => !errorCodeQuery || c.toLowerCase().includes(errorCodeQuery.toLowerCase()));
    
    // Limit to first 100 items for performance
    return filtered.slice(0, 100);
  }, [availableErrorCodes, errorCodeQuery]);
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
  const dragStartRef = useRef({ blockId: null, fromHeader: false });
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
  const [docPreview, setDocPreview] = useState({ open: false, title: "", src: null, nameHint: "" });

  // Get course type from session storage
  const getCourseType = () => {
    return sessionStorage.getItem('courseType') || 'ms-word';
  };

  // Get file upload configuration based on course type
  const getFileConfig = () => {
    const courseType = getCourseType();
    switch (courseType) {
      case 'ms-word':
        return {
          accept: '.doc,.docx',
          description: 'DOC, DOCX files supported',
          sourceFilename: 'source-document.docx',
          answerKeyFilename: 'answer-key.docx'
        };
      case 'powerpoint':
        return {
          accept: '.ppt,.pptx',
          description: 'PPT, PPTX files supported',
          sourceFilename: 'source-presentation.pptx',
          answerKeyFilename: 'answer-key.pptx'
        };
      case 'excel':
        return {
          accept: '.xls,.xlsx',
          description: 'XLS, XLSX files supported',
          sourceFilename: 'source-spreadsheet.xlsx',
          answerKeyFilename: 'answer-key.xlsx'
        };
      default:
        return {
          accept: '.doc,.docx',
          description: 'DOC, DOCX files supported',
          sourceFilename: 'source-document.docx',
          answerKeyFilename: 'answer-key.docx'
        };
    }
  };

  // Get default MIME type based on course type
  const getDefaultMimeType = (courseType) => {
    switch (courseType) {
      case 'ms-word':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'powerpoint':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  };

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

  // Helper function to renumber instruction and objective blocks with unified counter
  const renumberInstructionNames = (list) => {
    let unifiedCounter = 0;
    const defaultInstructionPattern = /^Instruction\s+\d+$/i;
    const defaultObjectivePattern = /^Question\s+\d+$/i;
    return list.map((block) => {
      if (block.type === "instruction") {
        unifiedCounter += 1;
        const shouldOverride = !block.name || defaultInstructionPattern.test(block.name);
        if (shouldOverride) {
          return { ...block, name: `Instruction ${unifiedCounter}` };
        }
      } else if (block.type === "objective") {
        unifiedCounter += 1;
        const shouldOverride = !block.name || defaultObjectivePattern.test(block.name);
        if (shouldOverride) {
          return { ...block, name: `Question ${unifiedCounter}` };
        }
      }
      return block;
    });
  };

  const previousBlocksRef = useRef(null);
  useEffect(() => {
    // Sync local editor state when switching parts or content updates externally
    const initialBlocks = content?.blocks || [];
    
    // Automatically renumber instruction and objective blocks on load
    // Only renumber if blocks exist and haven't been processed yet
    if (initialBlocks.length > 0) {
      const renumberedBlocks = renumberInstructionNames(initialBlocks);
      
      // Check if renumbering actually changed any block names
      const blocksChanged = renumberedBlocks.some((block, index) => {
        const original = initialBlocks[index];
        return original && block.name !== original.name;
      });
      
      if (blocksChanged) {
        // Only update if this is a new set of blocks (different from previous)
        const blocksKey = JSON.stringify(initialBlocks.map(b => b.id));
        const previousKey = previousBlocksRef.current;
        
        if (blocksKey !== previousKey) {
          previousBlocksRef.current = blocksKey;
          setBlocks(renumberedBlocks);
          // Update content with renumbered blocks
          updateContent({ ...content, blocks: renumberedBlocks });
        } else {
          setBlocks(renumberedBlocks);
        }
      } else {
        setBlocks(initialBlocks);
        previousBlocksRef.current = JSON.stringify(initialBlocks.map(b => b.id));
      }
    } else {
      setBlocks(initialBlocks);
      previousBlocksRef.current = null;
    }
    
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

  // Auto-expand dropdowns when they receive data
  useEffect(() => {
    if (filteredCodes) {
      // Auto-expand matched codes if it has data
      if (filteredCodes.matchedCodes && filteredCodes.matchedCodes.length > 0) {
        setMatchedCodesCollapsed(false);
      }
      // Auto-expand associated codes not seen if it has data
      if (filteredCodes.associatedCodesNotSeen && filteredCodes.associatedCodesNotSeen.length > 0) {
        setAssociatedCodesCollapsed(false);
      }
      // Auto-expand comparison codes not associated if it has data
      if (filteredCodes.comparisonCodesNotAssociated && filteredCodes.comparisonCodesNotAssociated.length > 0) {
        setComparisonCodesCollapsed(false);
      }
    }
  }, [filteredCodes]);

  const addTextBlock = () => {
    const newBlock = {
      id: `text-${Date.now()}`,
      type: "text",
      name: "Add Text Block",
      content: {
        html: "",
        attachments: { images: [] },
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
        weightage: 10,
        errorWeightage: 10,
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

  const openQuestionTypeModal = () => {
    setQuestionTypeModal({ open: true, selectedType: "true-false" });
  };

  const closeQuestionTypeModal = () => {
    setQuestionTypeModal({ open: false, selectedType: "true-false" });
  };

  const confirmAddObjectiveBlock = () => {
    const questionType = questionTypeModal.selectedType;
    const objectiveCount = blocks.filter((b) => b.type === "objective").length + 1;
    
    const getDefaultQuestionData = (type) => {
      switch (type) {
        case "true-false":
          return { correct_answer: null };
        case "multiple-choice":
          return { 
            options: [
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
            ], 
            correct_answer: null 
          };
        case "multiple-select":
          return { 
            options: [
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
              { text: "", image_url: "", image: "" },
            ], 
            correct_answer: [] 
          };
        case "short-answer":
          return { correct_answer: "" };
        case "fill-in-the-blank":
          return { blanks: [{ answer: "", position: 0 }] };
        default:
          return {};
      }
    };

    const newQuestion = {
      id: `question-${Date.now()}`,
      objective_type: questionType,
      natural_text: "",
      ...getDefaultQuestionData(questionType),
    };

    const newBlock = {
      id: `objective-${Date.now()}`,
      type: "objective",
      name: `Question ${objectiveCount}`,
      content: {
        questions: [newQuestion],
        weightage: 10,
        item_type: "no-skill",
      },
      isCollapsed: false,
    };
    const newBlocks = [...blocks, newBlock];
    const renumbered = renumberInstructionNames(newBlocks);
    setBlocks(renumbered);
    updateContent({ ...content, blocks: renumbered });
    closeQuestionTypeModal();
  };

  const updateBlock = (blockId, newContent) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content: newContent } : block
    );
    setBlocks(newBlocks);
    updateContent({ ...content, blocks: newBlocks });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (errorAutoRef && !errorAutoRef.contains(e.target)) {
        setErrorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [errorAutoRef]);

  const startEditWeightage = (block) => {
    const currentVal =
      typeof block.content?.weightage === "number"
        ? block.content.weightage
        : typeof block.content?.errorWeightage === "number"
          ? block.content.errorWeightage
          : 10;
    setTempWeightage(currentVal);
    setEditingWeightageFor(block.id);
  };
  const cancelEditWeightage = () => setEditingWeightageFor(null);
  const saveEditWeightage = (block) => {
    const val = parseInt(tempWeightage || 0, 10);
    const next = isNaN(val) ? 0 : val;
    updateBlock(block.id, { ...block.content, weightage: next, errorWeightage: next });
    setEditingWeightageFor(null);
  };

  const getInstructionWeightage = (block) => {
    if (!block?.content) return 10;
    if (typeof block.content.weightage === "number") return block.content.weightage;
    if (typeof block.content.errorWeightage === "number") return block.content.errorWeightage;
    return 10;
  };

  const isInstructionNonGraded = (block) => {
    if (block.type !== "instruction") return false;
    const weight = getInstructionWeightage(block);
    const errorCodes = Array.isArray(block.content?.errorCodes) ? block.content.errorCodes : [];
    return weight === 0 && errorCodes.length === 0;
  };

  const setInstructionGrading = (block, shouldBeGraded) => {
    if (block.type !== "instruction") return;

    if (shouldBeGraded) {
      const restoredWeight =
        typeof block.content?.lastGradedWeightage === "number" && block.content.lastGradedWeightage > 0
          ? block.content.lastGradedWeightage
          : 10;
      const nextContent = {
        ...block.content,
        weightage: restoredWeight,
        errorWeightage: restoredWeight,
      };
      if ("lastGradedWeightage" in nextContent) {
        delete nextContent.lastGradedWeightage;
      }
      updateBlock(block.id, nextContent);
    } else {
      const currentWeight = getInstructionWeightage(block);
      updateBlock(block.id, {
        ...block.content,
        lastGradedWeightage:
          currentWeight > 0
            ? currentWeight
            : typeof block.content?.lastGradedWeightage === "number"
              ? block.content.lastGradedWeightage
              : 10,
        weightage: 0,
        errorWeightage: 0,
        errorCodes: [],
        stringChecks: [],
      });
    }
  };

  const openErrorCodesModal = (block) => {
    const currentSelected = Array.isArray(block.content?.errorCodes)
      ? block.content.errorCodes
      : [];
    setSelectedErrorCodes(currentSelected);
    // Initialize available list as empty - will be populated when user generates codes
    setAvailableErrorCodes([]);
    setErrorCodesInput(block.content?.errorCodesText || "");
    setErrorCodesModal({ open: true, blockId: block.id });
    setProgrammaticModalOpen(false);
  };

  const closeErrorCodesModal = () => {
    setErrorCodesModal({ open: false, blockId: null });
    setErrorCodesInput("");
    setAvailableErrorCodes([]);
    setSelectedErrorCodes([]);
    setProgrammaticModalOpen(false);
    setPartialKeyFile(null);
    setMatchedCodesCollapsed(true);
    setAssociatedCodesCollapsed(true);
    setComparisonCodesCollapsed(true);
    setInstructionStatus(null);
    setFilteredCodes(null);
    setComparisonError("");
    setPartialKeyCheckerCollapsed(false);
  };

  const openProgrammaticModal = () => {
    setProgrammaticModalOpen(true);
  };

  const closeProgrammaticModal = () => {
    setProgrammaticModalOpen(false);
  };

  const openStringChecksModal = (block) => {
    setStringChecksModal({ open: true, blockId: block.id });
  };

  const closeStringChecksModal = () => {
    setStringChecksModal({ open: false, blockId: null });
  };

  const saveStringChecks = (stringChecks) => {
    const blockId = stringChecksModal.blockId;
    if (!blockId) return;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    updateBlock(blockId, {
      ...block.content,
      stringChecks,
    });
    closeStringChecksModal();
  };

  const fileToBase64 = async (input) => {
    if (!input) return "";
    if (input instanceof File || input instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(input);
        reader.onload = () => {
          try {
            const base64String = String(reader.result).split(",")[1] || "";
            resolve(base64String);
          } catch (e) {
            resolve("");
          }
        };
        reader.onerror = (err) => reject(err);
      });
    }
    // assume already base64 or URL; if URL, backend may not accept; best-effort
    return input;
  };

  const getAppName = () => {
    const t = sessionStorage.getItem("courseType");
    if (t === "ms-word") return "word";
    if (t === "powerpoint") return "powerpoint";
    if (t === "excel") return "excel";
    return "word";
  };

  const handleGenerateCodes = async (withText) => {
    try {
      setErrorGenMessage("");
      setErrorGenLoading(true);
      setErrorGenLoadingFor(withText ? "text" : "notext");
      // Validate part configuration
      const src = selectedPart?.sourceDocument;
      const ans = selectedPart?.answerKey;
      if (!src || !ans) {
        setErrorGenMessage("Please attach Source Document and Answer Key in Part Configuration before generating error codes.");
        setErrorGenLoading(false);
        setErrorGenLoadingFor(null);
        return;
      }
      const sourceBase64 = await fileToBase64(src);
      const answerBase64 = await fileToBase64(ans);
      if (!sourceBase64 || !answerBase64) {
        setErrorGenMessage("Invalid document(s). Please re-upload Source Document and Answer Key.");
        setErrorGenLoading(false);
        setErrorGenLoadingFor(null);
        return;
      }

      const workingSkill = (lessonSkills || []).find((skill) => {
        const normalizedStatus = (skill?.status || "").trim().toLowerCase();
        return normalizedStatus === "working" || normalizedStatus === "working a2";
      });
      const skillStatus = workingSkill ? (workingSkill.status || "").trim() : "";

      const payload = {
        source_document: sourceBase64,
        answer_key: answerBase64,
        app_name: getAppName(),
        filter_text: withText ? (errorCodesInput || "") : "",
        skill_status: skillStatus,
      };
      const res = await fetch(base_url + "/api/openedx/get_error_codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to get error codes: ${res.status} ${t}`);
      }
      const data = await res.json();
      const codes = Array.isArray(data?.error_codes)
        ? data.error_codes
        : Array.isArray(data)
          ? data
          : [];
      if (!codes.length) {
        setErrorGenMessage("No error codes returned for the provided inputs.");
      }
      // Concatenate new codes with existing ones instead of replacing
      setAvailableErrorCodes((prev) => {
        const combined = [...prev, ...codes];
        return combined;
      });
      // Add new codes to selected
      setSelectedErrorCodes((prev) => {
        const combined = [...prev, ...codes];
        return combined;
      });
      setErrorCodeQuery("");
    } catch (e) {
      setErrorGenMessage(e?.message || "Failed to generate error codes.");
    } finally {
      setErrorGenLoading(false);
      setErrorGenLoadingFor(null);
    }
  };

  const isCustomPatternCode = (code) => {
    if (!code || typeof code !== "string") return false;
    return (
      code.includes("[any]") ||
      /\[[^\]]*[<>=!]+[^\]]*x[^\]]*[<>=!]+[^\]]*\]/.test(code) ||
      /\[[^\]]*x[^\]]*[<>=!]+[^\]]*[<>=!]+[^\]]*\]/.test(code)
    );
  };

  const isWlPatternCode = (code) => {
    if (!code || typeof code !== "string") return false;
    return code.includes("[wl]");
  };

  const addSelectedCode = (code, options = {}) => {
    if (!code) return;
    const { allowCustom = false } = options;
    const existsInAvailable = availableErrorCodes.includes(code);
    if (!allowCustom && !existsInAvailable) return;
    if (allowCustom && !existsInAvailable) {
      setAvailableErrorCodes((prev) => [...prev, code]);
    }
    setSelectedErrorCodes((prev) => [...prev, code]);
  };

  const handleProgrammaticPatternSave = (pattern) => {
    if (!pattern) return;
    addSelectedCode(pattern, { allowCustom: true });
    setErrorDropdownOpen(false);
    closeProgrammaticModal();
  };

  const removeSelectedCode = (code) => {
    setSelectedErrorCodes((prev) => {
      const index = prev.indexOf(code);
      if (index === -1) return prev;
      const newCodes = [...prev];
      newCodes.splice(index, 1);
      return newCodes;
    });
  };

  const handleComparePartialKey = async () => {
    try {
      setComparisonError("");
      setComparisonLoading(true);
      
      if (!partialKeyFile) {
        setComparisonError("Please upload a partial key first.");
        setComparisonLoading(false);
        return;
      }

      const ans = selectedPart?.answerKey;
      if (!ans) {
        setComparisonError("Please attach Answer Key in Part Configuration before comparing.");
        setComparisonLoading(false);
        return;
      }

      const workingSkill = (lessonSkills || []).find((skill) => {
        const normalizedStatus = (skill?.status || "").trim().toLowerCase();
        return normalizedStatus === "working" || normalizedStatus === "working a2";
      });
      const skillStatus = workingSkill ? (workingSkill.status || "").trim() : "";

      const originalCodes = [...selectedErrorCodes];

      const comparisonCodes = await comparePartialKey(
        partialKeyFile,
        ans,
        "",
        skillStatus
      );

      const matched = await matchErrorCodes(originalCodes, comparisonCodes);
      setFilteredCodes(matched);
      setInstructionStatus(matched.status);
    } catch (e) {
      setComparisonError(e?.message || "Failed to compare partial key.");
      setFilteredCodes(null);
      setInstructionStatus(null);
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleSelectMatchedCode = (code) => {
    removeSelectedCode(code);
    if (filteredCodes) {
      const updatedMatched = filteredCodes.matchedCodes.filter((c) => c !== code);
      const updatedFiltered = {
        ...filteredCodes,
        matchedCodes: updatedMatched,
      };
      setFilteredCodes(updatedFiltered);
      setInstructionStatus(updatedMatched.length > 0 ? false : true);
    }
  };

  // Handle selecting from comparison codes not associated dropdown - add to main list
  const handleSelectComparisonCode = (code) => {
    addSelectedCode(code, { allowCustom: true });
    if (filteredCodes) {
      const updatedComparison = filteredCodes.comparisonCodesNotAssociated.filter(
        (c) => c !== code
      );
      const updatedFiltered = {
        ...filteredCodes,
        comparisonCodesNotAssociated: updatedComparison,
      };
      setFilteredCodes(updatedFiltered);
      const hasMatched = filteredCodes.matchedCodes && filteredCodes.matchedCodes.length > 0;
      setInstructionStatus(hasMatched ? false : true);
    }
  };

  const handleRemoveAllMatchedCodes = () => {
    if (!filteredCodes || !filteredCodes.matchedCodes) return;
    filteredCodes.matchedCodes.forEach((code) => {
      removeSelectedCode(code);
    });
    setFilteredCodes({
      ...filteredCodes,
      matchedCodes: [],
    });
    setInstructionStatus(true);
  };

  const handleAddAllComparisonCodes = () => {
    if (!filteredCodes || !filteredCodes.comparisonCodesNotAssociated) return;
    filteredCodes.comparisonCodesNotAssociated.forEach((code) => {
      addSelectedCode(code, { allowCustom: true });
    });
    setFilteredCodes({
      ...filteredCodes,
      comparisonCodesNotAssociated: [],
    });
    const hasMatched = filteredCodes.matchedCodes && filteredCodes.matchedCodes.length > 0;
    setInstructionStatus(hasMatched ? false : true);
  };

  const resetErrorCodes = () => {
    // Clear textarea input
    setErrorCodesInput("");
    // Clear selected codes
    setSelectedErrorCodes([]);
    // Clear search query
    setErrorCodeQuery("");
    // Keep availableErrorCodes intact so all generated codes remain in dropdown
  };

  const saveErrorCodes = () => {
    const blockId = errorCodesModal.blockId;
    if (!blockId) return;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    updateBlock(blockId, {
      ...block.content,
      errorCodes: selectedErrorCodes,
      errorCodesText: errorCodesInput,
    });
    closeErrorCodesModal();
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

  const handleBlockDragStart = (e, index) => {
    // This function is only called if drag is allowed (from header, not editor)
    // So we can proceed with the drag operation
    setDraggedBlockIndex(index);
    // Capture current collapse state per block and collapse all to create space
    const stateById = blocks.reduce((acc, b) => {
      acc[b.id] = !!b.isCollapsed;
      return acc;
    }, {});
    setPreDragCollapsed(stateById);
    // Do not auto-collapse all blocks on drag start; this caused UX issues
    // Keep current visual state while dragging
  };

  const handleBlockDrop = (dropIndex) => {
    if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
      const newBlocks = [...blocks];
      const originalDraggedIndex = draggedBlockIndex;
      const originalDropIndex = dropIndex;
      const draggedBlock = newBlocks[originalDraggedIndex];

      // Remove dragged item first
      newBlocks.splice(originalDraggedIndex, 1);

      // Compute insertion index with special handling for last item and tail drop
      let insertIndex;
      const droppedOnContainerEnd = originalDropIndex === blocks.length;
      const droppedOnLastBlock = originalDropIndex === blocks.length - 1;

      if (droppedOnContainerEnd || droppedOnLastBlock) {
        // Always append to the very end
        insertIndex = newBlocks.length;
      } else {
        insertIndex =
          originalDraggedIndex < originalDropIndex
            ? originalDropIndex - 1
            : originalDropIndex;
      }

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

  const getInstructionNumber = (blockId) => {
    let unifiedCounter = 0;
    for (const block of blocks) {
      if (block.type === "instruction" || block.type === "objective") {
        unifiedCounter += 1;
        if (block.id === blockId && block.type === "instruction") {
          return unifiedCounter;
        }
      }
    }
    return 0;
  };

  const getObjectiveNumber = (blockId) => {
    let unifiedCounter = 0;
    for (const block of blocks) {
      if (block.type === "instruction" || block.type === "objective") {
        unifiedCounter += 1;
        if (block.id === blockId && block.type === "objective") {
          return unifiedCounter;
        }
      }
    }
    return 0;
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

  const handleTextBlockImageSelect = (block, files, inputEl) => {
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

  const removeTextBlockAttachment = (block, index) => {
    const next = { ...block.content.attachments };
    next.images = (next.images || []).filter((_, i) => i !== index);
    updateBlock(block.id, { ...block.content, attachments: next });
  };

  return (
    <div className="space-y-4">
      <div
        className="space-y-3"
        onDragOver={(e) => {
          // Don't allow drop if dragging from editor
          const editorContainer = e.target.closest('[id^="editor-"]') || 
                                 e.target.closest('.jodit-container') ||
                                 e.target.closest('.jodit-wysiwyg') ||
                                 e.target.closest('.jodit-workplace');
          if (!editorContainer) {
            e.preventDefault();
          }
        }}
        onDrop={(e) => {
          // Don't handle drop if it's from editor
          const editorContainer = e.target.closest('[id^="editor-"]') || 
                                 e.target.closest('.jodit-container') ||
                                 e.target.closest('.jodit-wysiwyg') ||
                                 e.target.closest('.jodit-workplace');
          if (!editorContainer) {
            handleBlockDrop(blocks.length);
          }
        }}
      > 
        {blocks.length > 0 && (
          <div className="flex justify-end mb-2"> 
            <div
              onClick={() => collapseOrExpandAll()}
              className="px-3 py-2 text-sm font-medium text-white cursor-pointer bg-blue-600 rounded hover:bg-blue-700"
            >
              {blocks.some((b) => !b.isCollapsed) ? "Collapse" : "Expand"} All
            </div>
          </div>
        )}
        {blocks.map((block, index) => {
          const instructionNonGraded = isInstructionNonGraded(block);
          const effectiveWeightage = getInstructionWeightage(block);
          return (
            <div
              key={block.id}
              className="relative group  border-blue-200 rounded-lg shadow-sm bg-white"
              draggable={true}
              onMouseDownCapture={(e) => {
              // Use capture phase to run first, before child handlers
              // Track where the mouse down happened
              const target = e.target;
              const editorContainer = target.closest('[id^="editor-"]') || 
                                     target.closest('.jodit-container') ||
                                     target.closest('.jodit-wysiwyg') ||
                                     target.closest('.jodit-workplace');
              
              // If in editor, mark as not from grip icon
              if (editorContainer) {
                dragStartRef.current = {
                  blockId: block.id,
                  fromHeader: false
                };
                return;
              }
              
              // ONLY check if it's the grip icon, not the whole header
              const isGripIcon = target.closest('.cursor-move');
              
              // Set initial value - only true if from grip icon
              // Grip icon handler can override to true if needed
              dragStartRef.current = {
                blockId: block.id,
                fromHeader: isGripIcon
              };
            }}
            onDragStart={(e) => {
              // Check if drag started from grip icon ONLY (tracked in onMouseDown)
              const isFromGripIcon = dragStartRef.current.blockId === block.id && dragStartRef.current.fromHeader;
              
              // Double check - prevent if from editor
              const target = e.target;
              const editorContainer = target.closest('[id^="editor-"]') || 
                                     target.closest('.jodit-container') ||
                                     target.closest('.jodit-wysiwyg') ||
                                     target.closest('.jodit-workplace');
              
              // Only allow if from grip icon AND not from editor
              if (!isFromGripIcon || editorContainer) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
              
              handleBlockDragStart(e, index);
            }}
              onDragEnd={() => {
                // Reset drag start tracking
                dragStartRef.current = { blockId: null, fromHeader: false };
              }}
              onDragOver={(e) => {
                // Don't allow drop if dragging from editor
                const editorContainer = e.target.closest('[id^="editor-"]') || 
                                       e.target.closest('.jodit-container') ||
                                       e.target.closest('.jodit-wysiwyg') ||
                                       e.target.closest('.jodit-workplace');
                if (!editorContainer) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                // Don't handle drop if it's from editor
                const editorContainer = e.target.closest('[id^="editor-"]') || 
                                       e.target.closest('.jodit-container') ||
                                       e.target.closest('.jodit-wysiwyg') ||
                                       e.target.closest('.jodit-workplace');
                if (!editorContainer) {
                  e.stopPropagation();
                  handleBlockDrop(index);
                }
              }}
            >
            {/* Block Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div 
                  className="cursor-move opacity-50 group-hover:opacity-100"
                  onMouseDown={(e) => {
                    // Mark that drag started from grip icon ONLY
                    dragStartRef.current = {
                      blockId: block.id,
                      fromHeader: true
                    };
                    // Don't stop propagation - let the block handle the drag
                  }}
                >
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

                {(block.type === "instruction" || block.type === "objective") && (
                  <div className="ml-2 flex items-center gap-3">
                    {block.type === "instruction" && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-gray-700">Graded</span>
                        <div
                          onClick={() => setInstructionGrading(block, instructionNonGraded)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                            !instructionNonGraded ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              !instructionNonGraded ? "translate-x-[1.125rem]" : "translate-x-0.5"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    {!(block.type === "instruction" && instructionNonGraded) && (
                      <>
                        {editingWeightageFor === block.id ? (
                          <div className="flex items-center gap-1 mt-1 mr-1">
                            <span className="text-sm font-semibold">Weightage</span>
                            <input
                              type="number"
                              min={0}
                              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                              value={tempWeightage}
                              onChange={(e) => setTempWeightage(e.target.value)}
                            />
                            <button
                              className="p-1 border-none bg-transparent text-green-600 hover:bg-green-50 rounded"
                              onClick={() => saveEditWeightage(block)}
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 border-none bg-transparent text-gray-600 hover:bg-gray-100 rounded"
                              onClick={cancelEditWeightage}
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 group/weight mt-1 mr-1">
                            <span className="text-sm font-semibold mr-1">Weightage :</span>
                            <span className="text-xs font-semibold text-gray-900 mt-0.5">
                              {effectiveWeightage}
                            </span>
                            <button
                              className="p-1 border-none bg-transparent hover:bg-blue-50 rounded opacity-0 group-hover/weight:opacity-100"
                              onClick={() => startEditWeightage(block)}
                              title="Edit weightage"
                            >
                              <Pencil className="w-4 h-4 mb-1" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* Move Up/Down controls - hidden for instruction and objective blocks */}
                
                  <>
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
                  </>
                
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
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-indigo-50 border-b border-indigo-200">
                      <div className="px-2 py-0.5 text-indigo-700">
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerHiddenInput(`text-img-${block.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 border-green-200 border bg-transparent rounded"
                        >
                          <ImageIcon className="w-4 h-4" /> Image
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
                      />

                      <input
                        id={`text-img-${block.id}`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleTextBlockImageSelect(
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
                              key={`text-img-${idx}`}
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
                                  removeTextBlockAttachment(block, idx);
                                }}
                                className="absolute top-1 right-1 p-0.5 rounded-fullborder  text-red-500  cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {block.type === "instruction" && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-indigo-50 border-b border-indigo-200">
                      <div className="px-2 py-0.5  text-indigo-700">
                        {getInstructionNumber(block.id)}
                      </div>
                      <div className="flex items-center gap-2">
                        {!instructionNonGraded && (
                          <select
                            defaultValue="no-skill"
                            value={block.content.item_type || "no-skill"}
                            className="px-2 py-1 text-xs rounded text-gray-950 border-green-200 border bg-transparent"
                            onChange={(e) => {
                              const newType = e.target.value;
                              updateBlock(block.id, {
                                ...block.content,
                                item_type: newType,
                              });
                            }}
                          >
                            <option value="certification">Certification Skill</option>
                            <option value="foundation">Foundation Skill</option>
                            <option value="no-skill">No Skill</option>
                          </select>
                        )}
                        <button
                          onClick={() => triggerHiddenInput(`instr-img-${block.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 border-green-200 border bg-transparent rounded"
                        >
                          <ImageIcon className="w-4 h-4" /> Image
                        </button>
                        <button
                          onClick={() => triggerHiddenInput(`instr-vid-${block.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-600 border-purple-200 border bg-transparent rounded"
                        >
                          <Video className="w-4 h-4" /> Video
                        </button>
                        {!instructionNonGraded && (
                          <>
                            <button
                              onClick={() => openErrorCodesModal(block)}
                              className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                block.content?.errorCodes &&
                                Array.isArray(block.content.errorCodes) &&
                                block.content.errorCodes.length > 0
                                  ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                                  : "text-gray-700 bg-transparent border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Add Error Codes
                            </button>
                            <button
                              onClick={() => openStringChecksModal(block)}
                              className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                block.content?.stringChecks &&
                                Array.isArray(block.content.stringChecks) &&
                                block.content.stringChecks.length > 0
                                  ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                                  : "text-gray-700 bg-transparent border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              String Checks
                            </button>
                          </>
                        )}
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
                          Relevant Document ({getFileConfig().description})
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
                                    nameHint: block.content.document?.name || getFileConfig().answerKeyFilename,
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
                                    getFileConfig().answerKeyFilename
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
                            accept={getFileConfig().accept}
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
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-indigo-50 border-b border-indigo-200">
                      <div className="px-2 py-0.5 text-indigo-700">
                        {getObjectiveNumber(block.id)}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue="no-skill"
                          value={block.content.item_type || "no-skill"}
                          className="px-2 py-1 text-xs rounded text-gray-950 border-green-200 border bg-transparent"
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateBlock(block.id, {
                              ...block.content,
                              item_type: newType,
                            });
                          }}
                        >
                          <option value="certification">Certification Skill</option>
                          <option value="foundation">Foundation Skill</option>
                          <option value="no-skill">No Skill</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-2">
                      <ObjectiveEditor
                        content={block.content}
                        onContentChange={(newContent) =>
                          updateBlock(block.id, newContent)
                        }
                        singleQuestionMode={true}
                        questionNumber={getObjectiveNumber(block.id)}
                        onTimestampClick={(timestamp) =>
                          timestamp &&
                          setTimestampPreview({
                            open: true,
                            timestamp,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}

        
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
          onClick={openQuestionTypeModal}
          className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-700 hover:bg-green-50 bg-transparent rounded-lg transition-colors cursor-pointer"
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

      {/* Question Type Selection Modal */}
      {questionTypeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeQuestionTypeModal}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-[90vw]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200">
              <div className="text-lg font-semibold text-gray-900">Select Question Type</div>
              <button className="p-1 border-none bg-transparent hover:bg-gray-100 rounded" onClick={closeQuestionTypeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select
                  value={questionTypeModal.selectedType}
                  onChange={(e) => setQuestionTypeModal({ ...questionTypeModal, selectedType: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true-false">True/False</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="multiple-select">Multiple Select</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="fill-in-the-blank">Fill in the Blank</option>
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-blue-200 flex justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={closeQuestionTypeModal}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={confirmAddObjectiveBlock}
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Codes Modal */}
      {errorCodesModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeErrorCodesModal}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-[90vw] max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="text-sm font-medium">Add Error Codes</div>
              <button className="p-1 border-none bg-transparent" onClick={closeErrorCodesModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text (optional)</label>
                <textarea
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={errorCodesInput}
                  onChange={(e) => setErrorCodesInput(e.target.value)}
                  placeholder="Paste or type text to generate error codes from..."
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleGenerateCodes(true)}
                  disabled={errorGenLoadingFor !== null}
                >
                  <Wand2 className="w-4 h-4" /> {errorGenLoadingFor === "text" ? "Generating..." : "Generate error codes for text"}
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleGenerateCodes(false)}
                  disabled={errorGenLoadingFor !== null}
                >
                  <Wand2 className="w-4 h-4" /> {errorGenLoadingFor === "notext" ? "Generating..." : "Generate error codes without text"}
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-600  rounded-md border border-transparent hover:bg-slate-700 transition-colors focus:outline-none"
                  onClick={openProgrammaticModal}
                >
                  <Tag className="w-4 h-4" /> Add Custom Error Code
                </button>
              </div>
              {errorGenMessage && (
                <div className="text-sm text-red-600">{errorGenMessage}</div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Select Error Codes</label>
                  {(availableErrorCodes.length > 0 || selectedErrorCodes.length > 0) && (
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      onClick={resetErrorCodes}
                      title="Reset error codes list"
                    >
                      <Trash2 className="w-4 h-4" /> Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* {selectedErrorCodes.map((code) => (
                    <span key={code} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {code}
                      <button className="p-0.5 border-none bg-transparent" onClick={() => removeSelectedCode(code)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))} */}
                  {selectedErrorCodes.length === 0 && (
                    <span className="text-xs text-gray-500">No error codes selected</span>
                  )}
                </div>
                <div className="space-y-2 relative" ref={setErrorAutoRef}>
                  <div
                    className="flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500"
                    onClick={() => setErrorDropdownOpen(true)}
                  >
                    {(selectedErrorCodes || []).map((code, idx) => {
                      const isWl = isWlPatternCode(code);
                      const isCustom = isCustomPatternCode(code);
                      return (
                        <span
                          key={`selected-${idx}-${code}`}
                          className={`flex items-center gap-1 rounded-md border text-xs px-2 py-1 ${
                            isWl
                              ? "bg-red-100 text-red-700 border-red-300"
                              : isCustom
                              ? "bg-gray-400/30 text-gray-700 border-gray-300"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          <span className="font-medium">{code}</span>
                          <div
                            className="ml-1 text-gray-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedCode(code);
                            }}
                            aria-label="Remove"
                          >
                            <X className="w-3 h-3" />
                          </div>
                        </span>
                      );
                    })}
                    <input
                      value={errorCodeQuery}
                      onChange={(e) => setErrorCodeQuery(e.target.value)}
                      onFocus={() => setErrorDropdownOpen(true)}
                      placeholder={
                        availableErrorCodes.length === 0
                          ? "Generate codes to choose"
                          : availableErrorCodes.length > selectedErrorCodes.length
                            ? "Type to search codes..."
                            : ""
                      }
                      className="flex-1 min-w-[160px] outline-none border-none text-sm px-1 py-1"
                    />
                  </div>
                  {errorDropdownOpen && (
                    <div className="absolute z-10 mt-1  w-[calc(100%)] rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {availableErrorCodes.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No codes yet. Use Generate above.</div>
                      ) : filteredErrorCodes.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No matching codes found.</div>
                      ) : (
                        <ul className="py-1">
                          {filteredErrorCodes.map((c, idx) => (
                            <li
                              key={`error-code-${idx}-${c}`}
                              className="px-3 py-2 text-sm hover:bg-gray-50 border-1 border-b-gray-500 cursor-pointer"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addSelectedCode(c)}
                            >
                              {c}
                            </li>
                          ))}
                          {availableErrorCodes.length > 100 && (
                            <li className="px-3 py-2 text-sm text-gray-500 italic">
                              Showing first 100 results. Use search to filter.
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Partial Key Upload and Compare Section */}
              <div className="pt-2 px-2.5 py-3 bg-transparent border border-gray-200 rounded-md">
                {/* Partial Key Checker Header */}
                <div
                  onClick={() => setPartialKeyCheckerCollapsed(!partialKeyCheckerCollapsed)}
                  className="w-full flex items-start justify-between gap-4 p-2 rounded transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Partial key checker</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      This tool compares a partial key to the final answer key using the current associated error codes for this instruction.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Instruction Status Tag - will be dynamic from backend */}
                   
                    {partialKeyCheckerCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {!partialKeyCheckerCollapsed && (
                  <div className="space-y-4 mt-4">
                    {/* Partial Key Input and Compare Button - Side by Side */}
                    <div className="flex justify-end">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        instructionStatus === true
                          ? "bg-green-100 text-green-700"
                          : instructionStatus === false
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {instructionStatus === true
                        ? "Instruction Status : Right"
                        : instructionStatus === false
                        ? "Instruction Status : Wrong"
                        : "No comparison run yet"}
                    </span>
                    </div>
                    <div className="flex items-stretch gap-2">
                  <div className="flex-1 min-w-0">
                    {partialKeyFile ? (
                      <div className="flex items-center gap-2 px-3 py-2 h-[38px] border border-gray-300 rounded-md bg-white">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1 min-w-0" title={partialKeyFile.name || "Uploaded"}>
                          {partialKeyFile.name || "Uploaded"}
                        </span>
                        <div
                          onClick={() => setPartialKeyFile(null)}
                          className="p-0.5 rounded transition-colors flex-shrink-0"
                          type="button"
                        >
                          <X className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full">
                        <input
                          type="file"
                          accept={getFileConfig().accept}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPartialKeyFile(file);
                            e.target.value = "";
                          }}
                          className="hidden"
                          id="partial-key-upload"
                        />
                        <label
                          htmlFor="partial-key-upload"
                          className="flex items-center gap-2 px-3 py-2 h-[38px] border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Upload partial key</span>
                        </label>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleComparePartialKey}
                    disabled={comparisonLoading || !partialKeyFile}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 h-[38px] text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {comparisonLoading ? "Comparing..." : "Compare with Answer Key"}
                  </button>
                </div>

                {comparisonError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {comparisonError}
                  </div>
                )}

                {/* Three Collapsible Sections */}
                <div className="space-y-2.5 pt-1">
                  {/* 1. Matched Codes */}
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <div
                      onClick={() => setMatchedCodesCollapsed(!matchedCodesCollapsed)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">1. Matched codes</span>
                      {matchedCodesCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    {!matchedCodesCollapsed && (
                      <div className="px-3 py-2.5 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-600">Codes that appear in both comparison result and associated list</p>
                          {filteredCodes && filteredCodes.matchedCodes.length > 0 && (
                            <button
                              onClick={handleRemoveAllMatchedCodes}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              Remove All
                            </button>
                          )}
                        </div>
                        {filteredCodes && filteredCodes.matchedCodes.length > 0 ? (
                          <div className="space-y-1.5">
                            {filteredCodes.matchedCodes.map((code, idx) => (
                              <div
                                key={`matched-${idx}-${code}`}
                                onClick={() => handleSelectMatchedCode(code)}
                                className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-700 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
                              >
                                <span className="flex-1">{code}</span>
                                <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-600 flex-shrink-0 ml-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {filteredCodes ? "No matched codes." : "Run a comparison to see matches."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Associated Codes Not Seen */}
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <div
                      onClick={() => setAssociatedCodesCollapsed(!associatedCodesCollapsed)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">2. Associated codes not seen</span>
                      {associatedCodesCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    {!associatedCodesCollapsed && (
                      <div className="px-3 py-2.5 border-t">
                        <p className="text-xs text-gray-600 mb-2">Codes associated with instruction that did not appear for this partial key</p>
                        {filteredCodes && filteredCodes.associatedCodesNotSeen.length > 0 ? (
                          <div className="space-y-1.5">
                            {filteredCodes.associatedCodesNotSeen.map((code, idx) => (
                              <div
                                key={`associated-${idx}-${code}`}
                                className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-700"
                              >
                                {code}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {filteredCodes ? "No unused associated codes." : "Run a comparison to see unused associated codes."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Comparison Codes Not Associated */}
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <div
                      onClick={() => setComparisonCodesCollapsed(!comparisonCodesCollapsed)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">3. Comparison codes not associated</span>
                      {comparisonCodesCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    {!comparisonCodesCollapsed && (
                      <div className="px-3 py-2.5 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-600">Codes from comparison that are not yet associated with this instruction</p>
                          {filteredCodes && filteredCodes.comparisonCodesNotAssociated.length > 0 && (
                            <button
                              onClick={handleAddAllComparisonCodes}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              Add All
                            </button>
                          )}
                        </div>
                        {filteredCodes && filteredCodes.comparisonCodesNotAssociated.length > 0 ? (
                          <div className="space-y-1.5">
                            {filteredCodes.comparisonCodesNotAssociated.map((code, idx) => (
                              <div
                                key={`comparison-${idx}-${code}`}
                                onClick={() => handleSelectComparisonCode(code)}
                                className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-700 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
                              >
                                <span className="flex-1">{code}</span>
                                <Plus className="w-3.5 h-3.5 text-gray-400 hover:text-green-600 flex-shrink-0 ml-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {filteredCodes ? "No extra comparison codes." : "Run a comparison to see extra comparison codes."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-4 border-t flex justify-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={closeErrorCodesModal}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={saveErrorCodes}
              >
                <SaveIcon className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
      <ProgrammaticErrorCodeModal
        open={programmaticModalOpen && errorCodesModal.open}
        onClose={closeProgrammaticModal}
        onSave={handleProgrammaticPatternSave}
      />

      <StringChecksModal
        open={stringChecksModal.open}
        onClose={closeStringChecksModal}
        onSave={saveStringChecks}
        initialChecks={
          blocks.find((b) => b.id === stringChecksModal.blockId)?.content
            ?.stringChecks || []
        }
        sourceDocument={selectedPart?.sourceDocument || null}
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
        onClose={() => setDocPreview({ open: false, title: "", src: null, nameHint: "" })}
        title={docPreview.title}
        source={docPreview.src}
        mimeHint={(() => {
          const s = docPreview.src;
          const courseType = getCourseType();
          
          if (!s) return "";
          
          // If it's a File object, use its type
          if (s instanceof File) {
            return s.type || getDefaultMimeType(courseType);
          }
          
          if (typeof s === "string") {
            if (/^data:/i.test(s)) return "";
            if (!/^https?:\/\//i.test(s)) {
              return getDefaultMimeType(courseType);
            }
          } else if (s && !s.type) {
            return getDefaultMimeType(courseType);
          }
          return "";
        })()}
        nameHint={docPreview.nameHint || (() => {
          const courseType = getCourseType();
          switch (courseType) {
            case 'ms-word':
              return 'document.docx';
            case 'powerpoint':
              return 'presentation.pptx';
            case 'excel':
              return 'spreadsheet.xlsx';
            default:
              return 'document.docx';
          }
        })()}
      />
    </div>
  );
}
