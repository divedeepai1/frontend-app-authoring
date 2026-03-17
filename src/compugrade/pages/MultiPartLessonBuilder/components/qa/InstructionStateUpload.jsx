import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, XCircle, FileText } from "lucide-react";

function FileItem({ file, index, stateType, onRemove, onReplace }) {
  const replaceInputRef = useRef(null);

  const fileName = file.name || file;

  return (
    <div className="flex items-center justify-between p-2.5 bg-white rounded border border-gray-200 group hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{fileName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          ref={replaceInputRef}
          type="file"
          accept=".docx,.doc"
          className="hidden"
          onChange={(e) => onReplace(e)}
        />
        <div
          onClick={() => replaceInputRef.current?.click()}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Replace"
        >
          <Upload className="w-4 h-4" />
        </div>
        <div
          onClick={() => onRemove()}
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
  onStateChange,
}) {
  const correctInputRef = useRef(null);
  const wrongInputRef = useRef(null);
  const [correctDragActive, setCorrectDragActive] = useState(false);
  const [wrongDragActive, setWrongDragActive] = useState(false);

  const handleFileSelect = (stateType, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.type === "application/msword" ||
                file.name.endsWith(".docx") ||
                file.name.endsWith(".doc")
    );

    if (validFiles.length === 0) return;

    if (stateType === "correctState") {
      onStateChange(stateType, validFiles);
    } else {
      onStateChange(stateType, [...wrongStates, ...validFiles]);
    }

    if (event.target) {
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

  const handleDrop = (e, stateType) => {
    e.preventDefault();
    e.stopPropagation();
    if (stateType === "correctState") {
      setCorrectDragActive(false);
    } else {
      setWrongDragActive(false);
    }

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.type === "application/msword" ||
                file.name.endsWith(".docx") ||
                file.name.endsWith(".doc")
    );

    if (validFiles.length === 0) return;

    if (stateType === "correctState") {
      onStateChange(stateType, validFiles);
    } else {
      onStateChange(stateType, [...wrongStates, ...validFiles]);
    }
  };

  const handleRemoveFile = (stateType, index) => {
    if (stateType === "correctState") {
      onStateChange(stateType, []);
    } else {
      const updated = wrongStates.filter((_, i) => i !== index);
      onStateChange(stateType, updated);
    }
  };

  const handleReplaceFile = (stateType, index, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (stateType === "correctState") {
      onStateChange(stateType, files);
    } else {
      const updated = [...wrongStates];
      updated[index] = files[0];
      onStateChange(stateType, updated);
    }

    if (event.target) {
      event.target.value = "";
    }
  };


  return (
    <div className="bg-white rounded border border-gray-200 p-3">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
          {instruction.instructionNumber}
        </div>
        <h4 className="text-base font-semibold text-gray-900">
          {instruction.name}
        </h4>
      </div>

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
                  key={index}
                  file={file}
                  index={index}
                  stateType="correctState"
                  onRemove={() => handleRemoveFile("correctState", index)}
                  onReplace={(e) => handleReplaceFile("correctState", index, e)}
                />
              ))}
            </div>
          ) : (
            <div
              onClick={() => correctInputRef.current?.click()}
              onDragEnter={(e) => handleDrag(e, "correctState")}
              onDragLeave={(e) => handleDragLeave(e, "correctState")}
              onDragOver={(e) => handleDrag(e, "correctState")}
              onDrop={(e) => handleDrop(e, "correctState")}
              className={`border-2 border-dashed rounded  text-center cursor-pointer transition-colors ${
                correctDragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-400 hover:bg-green-50/50"
              }`}
            >
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-600">Drop .docx or click</p>
            </div>
          )}
          <input
            ref={correctInputRef}
            type="file"
            accept=".docx,.doc"
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
                  key={index}
                  file={file}
                  index={index}
                  stateType="wrongStates"
                  onRemove={() => handleRemoveFile("wrongStates", index)}
                  onReplace={(e) => handleReplaceFile("wrongStates", index, e)}
                />
              ))}
            </div>
          )}
          <div
            onClick={() => wrongInputRef.current?.click()}
            onDragEnter={(e) => handleDrag(e, "wrongStates")}
            onDragLeave={(e) => handleDragLeave(e, "wrongStates")}
            onDragOver={(e) => handleDrag(e, "wrongStates")}
            onDrop={(e) => handleDrop(e, "wrongStates")}
            className={`border-2 border-dashed rounded  text-center cursor-pointer transition-colors ${
              wrongDragActive
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-red-400 hover:bg-red-50/50"
            }`}
          >
            <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600">Drop .docx or click</p>
          </div>
          <input
            ref={wrongInputRef}
            type="file"
            accept=".docx,.doc"
            className="hidden"
            multiple
            onChange={(e) => handleFileSelect("wrongStates", e)}
          />
        </div>
      </div>
    </div>
  );
}
