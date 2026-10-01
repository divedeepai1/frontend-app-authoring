import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import HeaderActionButton from "./ui/HeaderActionButton";

export default function LessonStateModal({
  open,
  onClose,
  saveStates,
  loading,
  saving,
  restoringId,
  onSaveNewState,
  onRestoreState,
}) {
  const [notePopupOpen, setNotePopupOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setNotePopupOpen(false);
      setNote("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[96vw] max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lesson States</h2>
            <p className="text-sm text-gray-500">Manage and restore saved lesson snapshots</p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActionButton
              icon={Save}
              onClick={() => setNotePopupOpen(true)}
              variant="primary"
              disabled={saving}
            >
              Save New State
            </HeaderActionButton>
            <div
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 overflow-auto max-h-[calc(90vh-88px)]">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Note</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Created At</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[280px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      Loading lesson states...
                    </td>
                  </tr>
                ) : saveStates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      No saved states found
                    </td>
                  </tr>
                ) : (
                  saveStates.map((state) => (
                    <tr key={state.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3 text-gray-800">{state.id}</td>
                      <td className="px-4 py-3 text-gray-800">{state.created_by || "-"}</td>
                      <td className="px-4 py-3 text-gray-800">{state.note || "-"}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {state.created_at
                          ? new Date(state.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <HeaderActionButton
                          onClick={() => onRestoreState(state.id)}
                          variant="primary"
                          loading={restoringId === state.id}
                          disabled={saving || !!restoringId}
                        >
                          {restoringId === state.id ? "Restoring..." : "Restore"}
                        </HeaderActionButton>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {notePopupOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!saving) {
                setNotePopupOpen(false);
              }
            }}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Save New State</h3>
              <div  
                onClick={() => {
                  if (!saving) {
                    setNotePopupOpen(false);
                  }
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter note"
              disabled={saving}
            />
            <div className="mt-4 flex justify-end gap-2">
              <HeaderActionButton
                onClick={() => setNotePopupOpen(false)}
                disabled={saving}
              >
                Cancel
              </HeaderActionButton>
              <HeaderActionButton
                onClick={async () => {
                  const isSaved = await onSaveNewState(note);
                  if (isSaved) {
                    setNotePopupOpen(false);
                    setNote("");
                  }
                }}
                variant="primary"
                loading={saving}
              >
                Save
              </HeaderActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
