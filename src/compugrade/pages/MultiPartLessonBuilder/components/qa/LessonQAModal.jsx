import { useState } from "react";
import { ArrowLeft, ChevronLeft, X } from "lucide-react";
import InstructionStateUpload from "./InstructionStateUpload";
import QARundiv from "./QARundiv";
import QAReport from "./QAReport";

export default function LessonQAModal({ open, onClose, lessonParts }) {
  const [qaReport, setQaReport] = useState(null);
  const [instructionStates, setInstructionStates] = useState({});

  if (!open) return null;

  const instructions = [];
  lessonParts?.forEach((part) => {
    const blocks = part.content?.blocks || [];
    blocks.forEach((block) => {
      if (block.type === "instruction") {
        instructions.push({
          id: block.id,
          partId: part.id,
          partTitle: part.title,
          name: block.name,
          instructionNumber: instructions.length + 1,
        });
      }
    });
  });

  const totalStatesUploaded = Object.values(instructionStates).reduce((sum, state) => {
    return sum + (state.correctState?.length || 0) + (state.wrongStates?.length || 0);
  }, 0);

  const handleStateChange = (instructionId, stateType, files) => {
    setInstructionStates((prev) => ({
      ...prev,
      [instructionId]: {
        ...prev[instructionId],
        [stateType]: files,
      },
    }));
  };

  const handleRunQA = () => {
    setQaReport({
      lessonTitle: lessonTitle,
      result: "FAIL",
      timestamp: new Date().toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      statesEvaluated: 3,
      failures: [
        {
          instructionNumber: 1,
          instructionName: "Instruction 1",
          stateDocument: "Word Lesson 11 Source.docx",
          type: "False Negative",
          description: "Instruction 1 marked WRONG in its own Correct State when it should be RIGHT.",
          errorCodes: ["E101"],
        },
      ],
      warnings: [],
    });
  };

  const lessonTitle = lessonParts?.[0]?.title || "Lesson";

  return (
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
            <QARundiv onRunQA={handleRunQA} />
            <div
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-b-lg">
          <div className="px-5 mb-3 space-y-6">
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
                  correctState={
                    instructionStates[instruction.id]?.correctState || []
                  }
                  wrongStates={
                    instructionStates[instruction.id]?.wrongStates || []
                  }
                  onStateChange={(stateType, files) =>
                    handleStateChange(instruction.id, stateType, files)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
