import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ProgrammaticErrorCodeModal({
  open,
  onClose,
  onSave,
}) {
  const [segments, setSegments] = useState([]);
  const [textSegment, setTextSegment] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [patternError, setPatternError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSegments([]);
    setTextSegment("");
    setMinValue("");
    setMaxValue("");
    setPatternError("");
  }, [open]);

  const clearBuilder = () => {
    setSegments([]);
    setTextSegment("");
    setMinValue("");
    setMaxValue("");
    setPatternError("");
  };

  const addTextSegment = () => {
    if (!textSegment.trim()) {
      setPatternError("Enter a string before adding a string segment.");
      return;
    }
    setSegments((prev) => [...prev, { type: "text", value: textSegment.trim() }]);
    setTextSegment("");
    setPatternError("");
  };

  const addAnySegment = () => {
    setSegments((prev) => [...prev, { type: "any" }]);
    setPatternError("");
  };

  const addRangeSegment = () => {
    if (minValue === "" || maxValue === "") {
      setPatternError("Provide both minimum and maximum values.");
      return;
    }
    const min = Number(minValue);
    const max = Number(maxValue);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      setPatternError("Use valid numbers for the range.");
      return;
    }
    if (min > max) {
      setPatternError("Minimum cannot be greater than maximum.");
      return;
    }
    setSegments((prev) => [...prev, { type: "number_range", min, max }]);
    setMinValue("");
    setMaxValue("");
    setPatternError("");
  };

  const serializeSegments = () => {
    return segments
      .map((seg) => {
        if (seg.type === "text") {
          return seg.value;
        }
        if (seg.type === "any") {
          return "[any]";
        }
        if (seg.type === "number_range") {
          return `[${seg.min}<=x>=${seg.max}]`;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");
  };

  const handleSave = () => {
    if (segments.length === 0) {
      setPatternError("Add at least one segment to build a pattern.");
      return;
    }
    const patternLabel = serializeSegments();
    onSave(patternLabel);
    clearBuilder();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-5 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add Programmatic Error Code</h3>
            <p className="text-sm text-slate-500">
              Build a structured pattern to append to the selected error code.
            </p>
          </div>
          <div
            className="cursor-pointer focus:outline-none"
            onClick={onClose}

            
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pattern preview</label>
          <div className="min-h-[56px] rounded-lg bg-white border border-slate-200  px-3 py-3 flex flex-wrap gap-2 items-center">
            {segments.length === 0 ? (
              <span className="text-xs text-slate-500">
                No segments yet. Add strings and variables below.
              </span>
            ) : (
              segments.map((seg, index) => {
                if (seg.type === "text") {
                  return (
                    <span
                      key={`seg-${index}`}
                      className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-800"
                    >
                      {seg.value}
                    </span>
                  );
                }
                if (seg.type === "any") {
                  return (
                    <span
                      key={`seg-${index}`}
                      className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-800"
                    >
                      [any]
                    </span>
                  );
                }
                return (
                  <span
                    key={`seg-${index}`}
                    className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {`[${seg.min}<=x>=${seg.max}]`}
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Add string segment</label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={textSegment}
                onChange={(e) => setTextSegment(e.target.value)}
                placeholder="Example: Sheet 'Sheet1', column C: Width changed from 26.00 to "
                className="flex-1 min-w-[240px] rounded-lg border border-slate-200 px-3 py-2 text-sm  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors self-start focus:outline-none"
                onClick={addTextSegment}
                type="button"
              >
                Add string
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Add variable segment</label>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
              onClick={addAnySegment}
              type="button"
            >
              Add ANY value
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Add numeric segment with tolerance
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                step="0.01"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="Min"
                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                step="0.01"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="Max"
                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
                onClick={addRangeSegment}
                type="button"
              >
                Add range
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Values outside the provided range will be flagged as incorrect.
            </p>
          </div>
        </div>

        {patternError && <div className="text-sm text-red-600">{patternError}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
            onClick={clearBuilder}
            type="button"
          >
            Clear
          </button>
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 focus:outline-none"
            onClick={handleSave}
            type="button"
            disabled={segments.length === 0}
          >
            Save pattern
          </button>
        </div>
      </div>
    </div>
  );
}

