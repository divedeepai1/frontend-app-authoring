import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import InstructionStateUpload from "./InstructionStateUpload";
import QARundiv from "./QARundiv";
import QAReport from "./QAReport";
import {
  deleteQaState,
  getLessonQaStates,
  runLessonQa,
  uploadQaState,
} from "./services/lessonQaService";

export default function LessonQAModal({ open, onClose, lessonParts, partId }) {
  const [qaReport, setQaReport] = useState(null);
  const [instructionStates, setInstructionStates] = useState({});
  const [loadingByInstruction, setLoadingByInstruction] = useState({});
  const [qaStatesLoading, setQaStatesLoading] = useState(false);
  const [qaRunLoading, setQaRunLoading] = useState(false);

  const lastLoadedPartIdRef = useRef(null);

  const activePart =
    lessonParts?.find((p) => String(p.id) === String(partId)) || lessonParts?.[0];

  const lessonTitle = activePart?.title || "Lesson";

  const instructions = [];
  const blocks = activePart?.content?.blocks || [];
  blocks.forEach((block) => {
    if (block.type === "instruction") {
      const instructionWeightage =
        typeof block.content?.weightage === "number"
          ? block.content.weightage
          : typeof block.content?.errorWeightage === "number"
            ? block.content.errorWeightage
            : null;
      if (instructionWeightage === 0) return;

      const rawBlockId = String(block.id || "");
      const backendItemId = rawBlockId.startsWith("instruction-block-")
        ? rawBlockId.replace("instruction-block-", "")
        : null;
      const instructionName = block.name || `Instruction ${instructions.length + 1}`;
      instructions.push({
        id: block.id,
        backendItemId,
        partId: activePart?.id,
        partTitle: lessonTitle,
        name: instructionName,
        contentHtml: block.content?.html || "",
        instructionNumber: instructions.length + 1,
      });
    }
  });

  const findInstructionByRubricItem = (rubricItemId) =>
    instructions.find(
      (instruction) =>
        String(instruction.backendItemId || "") == String(rubricItemId || "")
    );

  const normalizeForUi = (state) => ({
    id: state.id,
    stateType: state.stateType,
    fileName: state.fileName || "State file",
    fileUrl: state.fileUrl || "",
  });

  const groupStatesByInstruction = (states) => {
    const grouped = {};

    (states || []).forEach((state) => {
      const instruction = findInstructionByRubricItem(state.rubricItemId);
      if (!instruction) return;
      if (!grouped[instruction.id]) {
        grouped[instruction.id] = { correctState: [], wrongStates: [] };
      }

      const entry = normalizeForUi(state);
      if (state.stateType === "correct") {
        grouped[instruction.id].correctState = [entry];
      } else if (state.stateType === "wrong") {
        grouped[instruction.id].wrongStates.push(entry);
      }
    });

    return grouped;
  };

  // Reset modal state when opening a different part.
  useEffect(() => {
    if (!open) return;
    setQaReport(null);
    setInstructionStates({});
    setLoadingByInstruction({});
    setQaStatesLoading(false);
  }, [open, partId]);

  useEffect(() => {
    if (!open || !activePart?.id) return;

    const currentPartId = String(activePart.id);
    if (lastLoadedPartIdRef.current === currentPartId) return;
    lastLoadedPartIdRef.current = currentPartId;
    let cancelled = false;

    setQaStatesLoading(true);
    const loadStates = async () => {
      try {
        const states = await getLessonQaStates(activePart.id);
        if (cancelled) return;
        setInstructionStates(groupStatesByInstruction(states));
      } catch {
        if (!cancelled) setInstructionStates({});
      } finally {
        if (!cancelled) setQaStatesLoading(false);
      }
    };

    loadStates();
    return () => {
      cancelled = true;
    };
  }, [open, activePart?.id]);

  useEffect(() => {
    if (!open) {
      lastLoadedPartIdRef.current = null;
    }
  }, [open]);

  const totalStatesUploaded = Object.values(instructionStates).reduce((sum, state) => {
    return sum + (state.correctState?.length || 0) + (state.wrongStates?.length || 0);
  }, 0);

  const setInstructionLoading = (instructionId, patch) => {
    setLoadingByInstruction((prev) => ({
      ...prev,
      [instructionId]: {
        ...prev[instructionId],
        ...patch,
      },
    }));
  };

  const handleUploadStateFiles = async (instruction, stateType, files) => {
    if (!instruction?.backendItemId || !activePart?.id || !files?.length) return;

    const uploadKey = stateType === "correctState" ? "correctUpload" : "wrongUpload";
    setInstructionLoading(instruction.id, { [uploadKey]: true });

    try {
      const uploadedStates = await Promise.all(
        files.map((file) =>
          uploadQaState({
            subRubricId: activePart.id,
            rubricItemId: instruction.backendItemId,
            stateType: stateType === "correctState" ? "correct" : "wrong",
            appName: mapCourseTypeToAppName(courseType),
            file,
          })
        )
      );

      const uploadedEntries = uploadedStates.map((state, index) => {
        const entry = normalizeForUi(state);
        if (!entry.fileName || entry.fileName === "state file") {
          entry.fileName = files[index]?.name || "state file";
        }
        return entry;
      });

      setInstructionStates((prev) => {
        const current = prev[instruction.id] || { correctState: [], wrongStates: [] };
        if (stateType === "correctState") {
          return {
            ...prev,
            [instruction.id]: {
              ...current,
              correctState: uploadedEntries.slice(-1),
            },
          };
        }

        return {
          ...prev,
          [instruction.id]: {
            ...current,
            wrongStates: [...current.wrongStates, ...uploadedEntries],
          },
        };
      });

      const states = await getLessonQaStates(activePart.id);
      setInstructionStates(groupStatesByInstruction(states));
    } finally {
      setInstructionLoading(instruction.id, { [uploadKey]: false });
    }
  };

  const handleDeleteStateFile = async (instruction, stateType, file) => {
    if (!file?.id || !activePart?.id) return;

    setInstructionLoading(instruction.id, { deletingId: file.id });
    try {
      await deleteQaState({ subRubricId: activePart.id, stateId: file.id });
      const states = await getLessonQaStates(activePart.id);
      setInstructionStates(groupStatesByInstruction(states));
    } finally {
      setInstructionLoading(instruction.id, { deletingId: null });
    }
  };

  const handleDownloadStateFile = async (file) => {
    const url = file?.fileUrl;
    if (!url || typeof url !== "string") return;

    const fileName = file.fileName || "state-file";

    if (url.startsWith("data:")) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      return;
    }

    if (url.startsWith("blob:")) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      return;
    }

    try {
      const response = await fetch(url, { credentials: "include" });
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        return;
      }
    } catch {
      // fall through to direct link
    }

    const anchor = document.createElement("a");
    const isHttp = url.startsWith("http://") || url.startsWith("https://");
    anchor.href = url;

    if (isHttp) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    } else {
      anchor.download = fileName;
    }

    anchor.click();
  };

  const courseType = (sessionStorage.getItem("courseType") || "ms-word").toLowerCase();

  const ensureInstructionStateBucket = (instructionId) =>
    instructionStates[instructionId] || { correctState: [], wrongStates: [] };

  const mapCourseTypeToAppName = (type) => {
    if (type === "excel" || type === "ms_excel" || type === "google_sheets") {
      return "excel";
    }
    if (type === "powerpoint" || type === "ms_powerpoint" || type === "google_slides") {
      return "powerpoint";
    }
    return "word";
  };

  const mapQaEntries = (entries) =>
    (Array.isArray(entries) ? entries : []).map((item, index) => ({
      instructionNumber:
        item?.instruction_number ??
        item?.instructionNumber ??
        item?.rubric_item_id ??
        index + 1,
      instructionName:
        item?.instruction_name ??
        item?.instructionName ??
        item?.display_name ??
        `Instruction ${index + 1}`,
      stateDocument:
        item?.state_file ??
        item?.stateFile ??
        item?.state_document ??
        item?.stateDocument ??
        item?.file_name ??
        item?.fileName ??
        item?.document_name ??
        item?.documentName ??
        "State file",
      type: item?.type ?? item?.failure_type ?? item?.warning_type ?? "Issue",
      description: item?.description ?? item?.message ?? "QA issue found.",
      errorCodes:
        item?.generated_error_codes ??
        item?.generatedErrorCodes ??
        item?.error_codes ??
        item?.errorCodes ??
        [],
    }));

  const normalizeRunQaReport = (payload) => {
    const source =
      payload?.report ??
      payload?.result ??
      payload?.data ??
      payload;

    const failures = mapQaEntries(
      source?.failures ?? source?.failure_items ?? source?.failed_items ?? [],
    );
    const warnings = mapQaEntries(source?.warnings ?? source?.warning_items ?? []);

    return {
      lessonTitle:
        source?.lesson_title ?? source?.lessonTitle ?? lessonTitle,
      result: String(source?.result ?? source?.status ?? "PASS").toUpperCase(),
      timestamp:
        source?.timestamp ??
        source?.run_at ??
        new Date().toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      statesEvaluated:
        source?.states_evaluated ??
        source?.statesEvaluated ??
        source?.total_states ??
        source?.totalStates ??
        Object.values(instructionStates).reduce(
          (sum, state) =>
            sum + (state.correctState?.length || 0) + (state.wrongStates?.length || 0),
          0,
        ),
      failures,
      warnings,
    };
  };

  const handleRunQA = async () => {
    if (!activePart?.id) return;
    setQaRunLoading(true);
    try {
      const appName = mapCourseTypeToAppName(courseType);
      const payload = await runLessonQa({
        subRubricId: activePart.id,
        appName,
      });
      setQaReport(normalizeRunQaReport(payload));
    } finally {
      setQaRunLoading(false);
    }
  };

  return open ? (
    <div className="fixed inset-0 z-[1000]  flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[95vw] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 rounded-t-lg">
          
           
            <div className="pl-3">
              <h2 className="text-xl font-semibold text-gray-900">{lessonTitle}</h2>
              <p className="text-sm text-gray-600 ">
                {instructions.length} instructions · {totalStatesUploaded} test states uploaded
              </p>
            </div>
          
          <div className="flex items-center gap-3">
            <QARundiv onRunQA={handleRunQA} loading={qaRunLoading} />
            <div
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-b-lg relative">
          <div className="px-4 mb-8 space-y-6">
            {qaStatesLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {qaReport && (
              <div className="space-y-4">
                <QAReport report={qaReport} />
              </div>
            )}
            <div className="space-y-6">
              {instructions.map((instruction) => (
                <InstructionStateUpload
                  key={instruction.id}
                  instruction={instruction}
                  correctState={ensureInstructionStateBucket(instruction.id).correctState}
                  wrongStates={ensureInstructionStateBucket(instruction.id).wrongStates}
                  onUploadStateFiles={(stateType, files) =>
                    handleUploadStateFiles(instruction, stateType, files)
                  }
                  onDeleteStateFile={(stateType, file) =>
                    handleDeleteStateFile(instruction, stateType, file)
                  }
                  onDownloadStateFile={handleDownloadStateFile}
                  loading={loadingByInstruction[instruction.id] || {}}
                  courseType={courseType}
                  canUpload={Boolean(instruction.backendItemId)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
