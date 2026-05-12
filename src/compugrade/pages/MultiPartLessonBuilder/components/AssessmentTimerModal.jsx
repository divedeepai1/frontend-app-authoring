import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock3, X } from "lucide-react";
import HeaderActionButton from "./ui/HeaderActionButton";

const TIMER_MODE_OPTIONS = [
  { label: "Display timer only", value: "display" },
  { label: "Lock lesson when time ends", value: "lock" },
];

const formatTwoDigits = (value) => String(value).padStart(2, "0");

const secondsToHoursMinutes = (totalSeconds) => {
  const safeSeconds = Number.isInteger(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return { hours, minutes };
};

const hoursMinutesToSeconds = (hours, minutes) => {
  const safeHours = Number.isInteger(hours) && hours >= 0 ? hours : 0;
  const safeMinutes = Number.isInteger(minutes) && minutes >= 0 ? minutes : 0;
  return safeHours * 3600 + safeMinutes * 60;
};

const ScrollableDropdown = ({ label, value, options, suffix, placeholder, disabled, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const selectedLabel = value ? `${value} ${suffix}` : placeholder;

  return (
    <div style={{ flex: 1, position: "relative" }} ref={wrapperRef}>
      <label className="form-label mb-1">{label}</label>
      <button
        type="button"
        className="form-control d-flex align-items-center justify-content-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        style={{ textAlign: "left", height: 38 }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #D1D5DB",
            borderRadius: 4,
            maxHeight: 210,
            overflowY: "auto",
            paddingBottom: 8,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {options.map((option) => {
            const isActive = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  border: "none",
                  textAlign: "left",
                  background: isActive ? "#F3F4F6" : "#fff",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {option} {suffix}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function AssessmentTimerModal({ open, onClose, initialTimerMode, initialTimeAllowed, onSave }) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [timerMode, setTimerMode] = useState("");
  const [error, setError] = useState("");

  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, index) => formatTwoDigits(index)),
    []
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, index) => formatTwoDigits(index)),
    []
  );

  useEffect(() => {
    if (!open) {
      setHours("");
      setMinutes("");
      setTimerMode("");
      setError("");
      return;
    }
    const timeSeconds = Number(initialTimeAllowed);
    if (Number.isInteger(timeSeconds) && timeSeconds > 0) {
      const mapped = secondsToHoursMinutes(timeSeconds);
      setHours(formatTwoDigits(Math.min(23, mapped.hours)));
      setMinutes(formatTwoDigits(mapped.minutes));
    } else {
      setHours("");
      setMinutes("");
    }
    setTimerMode(initialTimerMode === "display" || initialTimerMode === "lock" ? initialTimerMode : "");
    setError("");
  }, [open, initialTimeAllowed, initialTimerMode]);

  const handleSave = () => {
    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    if (!Number.isInteger(parsedHours) || parsedHours < 0) {
      setError("Hours must be a whole number greater than or equal to 0.");
      return;
    }
    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
      setError("Minutes must be a whole number between 0 and 59.");
      return;
    }
    const totalSeconds = hoursMinutesToSeconds(parsedHours, parsedMinutes);
    if (totalSeconds <= 0) {
      setError("Please enter a valid timer duration.");
      return;
    }
    if (timerMode !== "display" && timerMode !== "lock") {
      setError("Please select a valid timer mode.");
      return;
    }
    setError("");
    onSave({
      timer_mode: timerMode,
      time_allowed: String(totalSeconds),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] pt-[3%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-3xl max-h-[87vh] overflow-visible">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-base font-semibold">Lesson timer setup</div>
              <p className="text-xs text-gray-500">Configure assessment mode timer settings</p>
            </div>
          </div>
          <div className="p-1 rounded hover:bg-gray-100 border-none cursor-pointer" onClick={onClose}>
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-900">Timer mode</label>
            </div>
            <select
              className="form-control focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={timerMode}
              onChange={(event) => setTimerMode(event.target.value)}
            >
              <option value="">Select mode</option>
              {TIMER_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-900">Time allowed</label>
            </div>
            <div className="d-flex" style={{ gap: 12 }}>
              <ScrollableDropdown
                label="Hours"
                value={hours}
                options={hourOptions}
                suffix="hr"
                placeholder="Select hours"
                onChange={setHours}
              />
              <ScrollableDropdown
                label="Minutes"
                value={minutes}
                options={minuteOptions}
                suffix="min"
                placeholder="Select minutes"
                onChange={setMinutes}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <HeaderActionButton variant="secondary" className="mr-2" onClick={onClose}>
              Cancel
            </HeaderActionButton>
            <HeaderActionButton variant="primary" onClick={handleSave}>
              Save timer settings
            </HeaderActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
