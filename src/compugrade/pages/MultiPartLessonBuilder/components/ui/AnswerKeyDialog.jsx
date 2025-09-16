import { useEffect, useState } from "react";
import { X, KeyRound } from "lucide-react";

export default function AnswerKeyDialog({ open, onClose, title = "Answer Key", answerKey }) {
  const [src, setSrc] = useState(null);
  const [isDocx, setIsDocx] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setSrc(null);
    setIsDocx(false);

    if (!answerKey) return;

    setLoading(true);

    // if (answerKey instanceof File && answerKey.name.endsWith(".docx")) {
    //   const objectUrl = URL.createObjectURL(answerKey);
    //   if (mounted) {
    //     setSrc(objectUrl);
    //     setIsDocx(true);
    //     setLoading(false);
    //   }
    // } else 
    // 
    // 
    if (typeof answerKey === "string" && answerKey.startsWith("https")) {
     
        if (mounted) {
          setSrc(answerKey);
          setIsDocx(false);
          setLoading(false);
        }
    } else {
      if (mounted) {
        setSrc(null);
        setIsDocx(false);
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, [answerKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-4 relative">
        <div onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer">
          <X size={22} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <KeyRound size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="max-h-[70vh] overflow-auto pr-1 flex items-center justify-center w-full">
          {loading ? (
            <div className="text-gray-500 text-sm italic">Loading answer key...</div>
          ) : src ? (
            isDocx ? (
              <iframe src={src} className="w-full h-[65vh] rounded-lg shadow-md" />
            ) : (
              <img src={src} alt="Answer Key" className="max-w-full max-h-[65vh] rounded-lg shadow-md" />
            )
          ) : (
            <div className="text-gray-600 text-sm">No answer key available for this part.</div>
          )}
        </div>
      </div>
    </div>
  );
}
