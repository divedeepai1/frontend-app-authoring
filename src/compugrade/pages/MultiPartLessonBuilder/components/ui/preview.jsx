import { X, BookOpenText, FileText, Target, Layers } from "lucide-react";
import { useState } from "react";
import AnswerKeyDialog from "./AnswerKeyDialog";
import AnswerKeyPill from "./AnswerKeyPill";

export default function LessonPreviewDialog({ data, open, setOpen }) {
  if (!open) return null;

  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const lessonParts = data.lessonParts || [];
  const currentPart = lessonParts[currentPartIndex];
  console.log(currentPart)
  const [answerOpen, setAnswerOpen] = useState(false);

  const renderBlockPreview = (block) => {
    if (block.type === "instruction") {
      return (
        <div
          key={block.id}
          className="border rounded-lg p-3 mb-3 bg-blue-50 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-1">
            <BookOpenText size={18} className="text-blue-600" /> {block.name} 
          </div>
          
          <pre className="whitespace-pre-wrap font-normal text-gray-700 text-sm leading-relaxed">
            {block.content?.html || "No instruction content"}
          </pre>
         {/* <div dangerouslySetInnerHTML={{ __html: block.content?.html || "No text content" }} className="text-gray-700 text-sm leading-relaxed">
             
          </div> */}
        </div>
      );
    }

    if (block.type === "objective") {
      const questions = block.content?.questions || [];
      return (
        <div
          key={block.id}
          className="border rounded-lg p-3 mb-3 bg-green-50 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <Target size={18} className="text-green-600" /> {block.name}
            </div>
            <span className="text-xs font-medium bg-green-600 text-white px-2 py-0.5 rounded-full">
              {questions.length} Question{questions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1">
            {questions.map((q) => (
              <div
                key={q.id}
                className="text-gray-700 text-sm border-l-2 border-green-400 pl-2"
              >
                {q.natural_text || "No question text"}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "text") {
      return (
        <div
          key={block.id}
          className="border rounded-lg p-3 mb-3 bg-purple-50 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-1">
            <FileText size={18} className="text-purple-600" /> {block.name}
          </div>
          <div dangerouslySetInnerHTML={{ __html: block.content?.html || "No text content" }} className="text-gray-700 text-sm leading-relaxed">
            
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-4 relative ">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-500 border-none bg-transparent hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Layers className="text-indigo-600" size={20} /> Lesson Preview
        </h2>

        {currentPart ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Part : {currentPart.title}
              </h3>
              {/* <AnswerKeyPill
                onClick={() => setAnswerOpen(true)}
                disabled={!currentPart?.answerKey}
              /> */}
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[52vh]">
              {currentPart.content?.blocks?.map((block) =>
                renderBlockPreview(block)
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No part data</div>
        )}

        {/* Part navigation */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {lessonParts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPartIndex(index)}
              className={`px-4 py-1.5 rounded text-sm font-medium border transition-all ${
                currentPartIndex === index
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Part {index + 1}
            </button>
          ))}
        </div>
      </div>
      <AnswerKeyDialog
        open={answerOpen}
        onClose={() => setAnswerOpen(false)}
        title={`Answer Key — ${currentPart?.title || "Part"}`}
        answerKey={currentPart?.answerKey}
      />
    </div>
  );
}
