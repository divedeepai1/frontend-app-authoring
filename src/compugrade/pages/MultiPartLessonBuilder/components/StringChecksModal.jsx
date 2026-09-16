import { useEffect, useState } from "react";
import { Plus, Trash2, X, Wand2 } from "lucide-react";
import { base_url } from "../../../../compugrade-constants";

export const STRING_CHECK_CONDITIONS = {
  WRONG_IF_EXISTS: "wrong_if_exists",
  WRONG_IF_MISSING: "wrong_if_missing",
};

const CONDITION_OPTIONS = [
  { value: STRING_CHECK_CONDITIONS.WRONG_IF_EXISTS, label: "Wrong if exists" },
  { value: STRING_CHECK_CONDITIONS.WRONG_IF_MISSING, label: "Wrong if missing" },
];

const createEmptyCheck = () => ({
  id: `string-check-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  searchText: "",
  condition: STRING_CHECK_CONDITIONS.WRONG_IF_EXISTS,
});

const normalizeChecks = (checks) => {
  if (!Array.isArray(checks)) return [];
  return checks.map((check, index) => ({
    id: check?.id || `string-check-${index}-${Date.now()}`,
    searchText: check?.searchText ?? check?.search_text ?? "",
    condition:
      check?.condition === STRING_CHECK_CONDITIONS.WRONG_IF_MISSING
        ? STRING_CHECK_CONDITIONS.WRONG_IF_MISSING
        : STRING_CHECK_CONDITIONS.WRONG_IF_EXISTS,
  }));
};

async function fileToBase64(input) {
  if (!input) return "";
  if (input instanceof File || input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(input);
      reader.onload = () => {
        try {
          resolve(String(reader.result).split(",")[1] || "");
        } catch {
          resolve("");
        }
      };
      reader.onerror = (err) => reject(err);
    });
  }
  if (typeof input === "string") {
    if (input.startsWith("data:") && input.includes(",")) {
      return input.split(",")[1] || "";
    }
    return input;
  }
  return "";
}

export default function StringChecksModal({
  open,
  onClose,
  onSave,
  initialChecks = [],
  sourceDocument = null,
}) {
  const [checks, setChecks] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [testingId, setTestingId] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    setChecks(normalizeChecks(initialChecks));
    setTestResults({});
    setTestingId(null);
    setFormError("");
    // Only rehydrate when the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const updateCheck = (id, patch) => {
    setChecks((prev) =>
      prev.map((check) => (check.id === id ? { ...check, ...patch } : check))
    );
    setFormError("");
  };

  const addCheck = () => {
    setChecks((prev) => [...prev, createEmptyCheck()]);
    setFormError("");
  };

  const removeCheck = (id) => {
    setChecks((prev) => prev.filter((check) => check.id !== id));
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSave = () => {
    const trimmed = checks.map((check) => ({
      ...check,
      searchText: (check.searchText || "").trim(),
    }));
    const empty = trimmed.find((check) => !check.searchText);
    if (empty) {
      setFormError("Each string check needs a search string.");
      return;
    }
    onSave(trimmed);
  };

  const runStringCheck = async (check) => {
    const searchText = (check.searchText || "").trim();
    if (!searchText) {
      setFormError("Enter a search string before testing.");
      return;
    }
    if (!sourceDocument) {
      setFormError("Attach a Source Document in Part Configuration before testing.");
      return;
    }

    setTestingId(check.id);
    setFormError("");
    try {
      const document_base64 = await fileToBase64(sourceDocument);
      if (!document_base64) {
        throw new Error("Could not read the part source document.");
      }
      const res = await fetch(`${base_url}/api/openedx/check_string_exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_base64,
          search_text: searchText,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.errorMessage || data?.detail || `Request failed (${res.status})`);
      }
      if (data?.success === false) {
        throw new Error(data?.errorMessage || "String check failed.");
      }

      const exists = Boolean(data?.exists);
      const isWrong =
        check.condition === STRING_CHECK_CONDITIONS.WRONG_IF_EXISTS
          ? exists
          : !exists;

      setTestResults((prev) => ({
        ...prev,
        [check.id]: {
          exists,
          isWrong,
          documentType: data?.documentType || "",
          message: isWrong
            ? exists
              ? "Would mark wrong (text found)"
              : "Would mark wrong (text missing)"
            : exists
              ? "Would pass (text found, expected present)"
              : "Would pass (text missing, expected absent)",
        },
      }));
    } catch (e) {
      setTestResults((prev) => ({
        ...prev,
        [check.id]: {
          exists: null,
          isWrong: null,
          message: e?.message || "Failed to run string check.",
          error: true,
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-[90vw] max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <div className="text-sm font-medium text-slate-900">String Checks</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Disqualify an instruction when specific text exists or is missing in the student document.
            </p>
          </div>
          <button
            type="button"
            className="p-1 border-none bg-transparent"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!sourceDocument && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              No source document on this part. Attach one in Part Configuration to enable testing.
            </div>
          )}

          {checks.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center">
              <p className="text-sm text-gray-600 mb-3">No string checks yet.</p>
              <button
                type="button"
                onClick={addCheck}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add string check
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {checks.map((check, index) => {
                const result = testResults[check.id];
                return (
                  <div
                    key={check.id}
                    className="rounded-md border border-gray-200 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        String check {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCheck(check.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Search string
                      </label>
                      <input
                        type="text"
                        value={check.searchText}
                        onChange={(e) =>
                          updateCheck(check.id, { searchText: e.target.value })
                        }
                        placeholder="Text to look for in the document"
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Condition
                      </label>
                      <select
                        value={check.condition}
                        onChange={(e) =>
                          updateCheck(check.id, { condition: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {CONDITION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => runStringCheck(check)}
                        disabled={testingId === check.id || !sourceDocument}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        {testingId === check.id ? "Testing..." : "Test against source document"}
                      </button>
                      {result && (
                        <span
                          className={`text-xs px-2 py-1 rounded-md border ${
                            result.error
                              ? "bg-red-50 text-red-700 border-red-200"
                              : result.isWrong
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {result.message}
                          {result.exists != null && !result.error
                            ? ` · exists=${String(result.exists)}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addCheck}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" /> Add another string check
              </button>
            </div>
          )}

          {formError && <div className="text-sm text-red-600">{formError}</div>}
        </div>

        {/* <div className="px-4 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div> */}
      </div>
    </div>
  );
}
