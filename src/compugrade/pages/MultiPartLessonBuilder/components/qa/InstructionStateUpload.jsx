import { useState, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowDownToLine,
} from "lucide-react";
import InstructionContentPreview from "./InstructionContentPreview";

function FileItem({ file, onRemove, onDownload, deleting }) {
  const fileName = file.fileName || file.name || "State file";

  return (
    <div className="flex items-center justify-between p-1 px-2 bg-white rounded border border-gray-200 group hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{fileName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          type="button"
          onClick={onDownload}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Download"
        >
          <ArrowDownToLine className="w-4 h-4" />
        </div>
        <div
          type="button"
          onClick={onRemove}
          disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function InstructionStateUpload({
  instruction,
  correctState,
  wrongStates,
  onUploadStateFiles,
  onDeleteStateFile,
  onDownloadStateFile,
  loading,
  courseType,
  canUpload,
  addToast,
}) {
  const correctInputRef = useRef(null);
  const wrongInputRef = useRef(null);
  const [correctDragActive, setCorrectDragActive] = useState(false);
  const [wrongDragActive, setWrongDragActive] = useState(false);

  const isWordCourse =
  courseType === "ms-word" || courseType === "ms_word";

const isPptCourse =
  courseType === "powerpoint";

const isExcelCourse =
  courseType === "excel";

const acceptedExtensions = isWordCourse
  ? [".doc", ".docx"]
  : isPptCourse
  ? [".ppt", ".pptx"]
  : isExcelCourse
  ? [".xls", ".xlsx"]
  : [];

const acceptAttr = acceptedExtensions.join(",");

const isAllowedByExtension = (fileName) =>
  acceptedExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

const getFileTypeText = () => {
  if (isWordCourse) return ".doc/.docx";
  if (isPptCourse) return ".ppt/.pptx";
  if (isExcelCourse) return ".xls/.xlsx";
  return "";
};

const notifyInvalidFiles = () => {
  addToast?.({
    title: "Invalid file type",
    message: `Please upload ${getFileTypeText()} files only.`,
    variant: "error",
  });
};

const handleFileSelect = async (stateType, event) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  const validFiles = files.filter((file) =>
    isAllowedByExtension(file.name || "")
  );

  if (validFiles.length === 0) {
    notifyInvalidFiles();
    event.target.value = "";
    return;
  }

  try {
    await onUploadStateFiles(stateType, validFiles);
  } finally {
    event.target.value = "";
  }
};

  const handleDrag = (e, stateType) => {
    e.preventDefault();
    e.stopPropagation();
    if (stateType === "correctState") {
      setCorrectDragActive(true);
    } else {
      setWrongDragActive(true);
    }
  };

  const handleDragLeave = (e, stateType) => {
    e.preventDefault();
    e.stopPropagation();
    if (stateType === "correctState") {
      setCorrectDragActive(false);
    } else {
      setWrongDragActive(false);
    }
  };

  const handleDrop = async (e, stateType) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canUpload) return;
    if (stateType === "correctState") {
      setCorrectDragActive(false);
    } else {
      setWrongDragActive(false);
    }

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => isAllowedByExtension(file.name || ""));

    if (validFiles.length === 0) {
      notifyInvalidFiles();
      return;
    }

    await onUploadStateFiles(stateType, validFiles);
  };


  return (
    <div className="bg-white rounded border border-gray-200 p-3">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
          {instruction.instructionNumber}
        </div>
        <h4 className="text-base font-semibold text-gray-900">
          {instruction.name}
        </h4>
      </div>
      <InstructionContentPreview html={instruction.contentHtml} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            CORRECT STATE
          </label>
          {correctState.length > 0 ? (
            <div className="space-y-2">
              {correctState.map((file, index) => (
                <FileItem
                  key={file.id || index}
                  file={file}
                  deleting={loading?.deletingId === file.id}
                  onRemove={() => onDeleteStateFile("correctState", file)}
                  onDownload={() => onDownloadStateFile(file)}
                />
              ))}
            </div>
          ) : (
            <div
              onClick={() =>
                canUpload && !loading?.correctUpload && correctInputRef.current?.click()
              }
              onDragEnter={(e) => handleDrag(e, "correctState")}
              onDragLeave={(e) => handleDragLeave(e, "correctState")}
              onDragOver={(e) => handleDrag(e, "correctState")}
              onDrop={(e) => handleDrop(e, "correctState")}
              className={`border-2 border-dashed rounded text-center  transition-colors ${
                correctDragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-400 hover:bg-green-50/50"
              } ${canUpload ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
            >
              <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-600">
                {loading?.correctUpload
                  ? "Uploading..."
                  : !canUpload
                  ? "Save lesson first to upload"
                  : `Drop ${getFileTypeText()} or click`}
              </p>
            </div>
          )}
          <input
            ref={correctInputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={(e) => handleFileSelect("correctState", e)}
          />
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <XCircle className="w-4 h-4" />
            WRONG STATES
          </label>
          {wrongStates.length > 0 && (
            <div className="space-y-2 mb-2">
              {wrongStates.map((file, index) => (
                <FileItem
                  key={file.id || index}
                  file={file}
                  deleting={loading?.deletingId === file.id}
                  onRemove={() => onDeleteStateFile("wrongStates", file)}
                  onDownload={() => onDownloadStateFile(file)}
                />
              ))}
            </div>
          )}
          <div
            onClick={() =>
              canUpload && !loading?.wrongUpload && wrongInputRef.current?.click()
            }
            onDragEnter={(e) => handleDrag(e, "wrongStates")}
            onDragLeave={(e) => handleDragLeave(e, "wrongStates")}
            onDragOver={(e) => handleDrag(e, "wrongStates")}
            onDrop={(e) => handleDrop(e, "wrongStates")}
            className={`border-2 border-dashed rounded text-center transition-colors ${
              wrongDragActive
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-red-400 hover:bg-red-50/50"
            } ${canUpload ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
          >
            <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600">
              {loading?.wrongUpload
                ? "Uploading..."
                : !canUpload
                ? "Save lesson first to upload"
                : `Drop ${getFileTypeText()} or click`}
            </p>
          </div>
          <input
            ref={wrongInputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            multiple
            onChange={(e) => handleFileSelect("wrongStates", e)}
          />
        </div>
      </div>
    </div>
  );
}
