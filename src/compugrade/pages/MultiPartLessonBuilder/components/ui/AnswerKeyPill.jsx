import { KeyRound } from "lucide-react";

export default function AnswerKeyPill({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border transition-colors ${
        disabled
          ? "text-gray-400 border-gray-200 cursor-not-allowed"
          : "text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
      }`}
    >
      <KeyRound size={14} />
      Answer Key
    </button>
  );
}


