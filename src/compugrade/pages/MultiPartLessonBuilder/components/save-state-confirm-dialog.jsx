import { Save, X } from "lucide-react";

export function SaveStateConfirmDialog({
  open,
  onOpenChange,
  actionLabel = "save",
  onConfirmWithState,
  onConfirmWithoutState,
  busy = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => {
          if (!busy) onOpenChange(false);
        }}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full">
              <Save className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-2">
              Save Lesson State?
            </h2>
          </div>
          <div
            onClick={() => {
              if (!busy) onOpenChange(false);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Do you want to save the current lesson state before you{" "}
            <span className="font-semibold">{actionLabel}</span>? This creates a
            restore point you can return to later.
          </p>
        </div>

        <div className="flex gap-3 justify-center items-center w-full flex-wrap">
          <div
            onClick={() => {
              if (!busy) onConfirmWithoutState();
            }}
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              busy ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }`}
          >
            No, just {actionLabel}
          </div>
          <div
            onClick={() => {
              if (!busy) onConfirmWithState();
            }}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              busy ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }`}
          >
            Yes, save state then {actionLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
