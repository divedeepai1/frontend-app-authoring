import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EnhancedRichTextEditor } from "./enhanced-rich-text-editor";

export default function RichTextEditorModal({
  open,
  title,
  initialValue = "",
  onSave,
  onClose,
  saveLabel = "Save",
  editorId = "rich-text-editor-modal",
}) {
  const [content, setContent] = useState({ html: initialValue || "" });

  useEffect(() => {
    if (open) {
      setContent({ html: initialValue || "" });
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(content?.html || "");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-5 py-3">
          <div className="space-y-0">
            <p className="text-sm font-semibold text-gray-900 p-0 m-0">{title}</p>
            <p className="text-xs text-gray-500 p-0 m-0 mt-1">Use rich text to describe context around the video.</p>
          </div>
          <div
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
            aria-label="Close editor"
          >
            <X className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          <EnhancedRichTextEditor
            id={editorId}
            content={content}
            onContentChange={setContent}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-0 focus-visible:outline-none border-transparent"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

