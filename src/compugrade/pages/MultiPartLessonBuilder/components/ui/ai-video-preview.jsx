import { useRef, useState, useEffect } from "react";
import { X, Clock, Play, Pause, Save, Loader, CheckCircle } from "lucide-react";

const SaveTimestampsDialog = ({
  isOpen,
  onClose,
  data,
  title = "Save Timestamp Instructions",
  onSave,
  onSaveAll,
  onRegenerate,
  regenerating = false,
}) => {
  // console.log(data);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [savedItems, setSavedItems] = useState(new Set());
  const [savingItems, setSavingItems] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [instructionTimes, setInstructionTimes] = useState({});
  const [playingRange, setPlayingRange] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Initialize editable times from props
  useEffect(() => {
    const initial = {};
    const safeTimestamps = Array.isArray(data?.timestamps)
      ? data.timestamps
      : [];
    for (const t of safeTimestamps) {
      const [s, e] = t.timestamp.split("-");
      initial[t.item_id] = {
        instruction: t.instruction,
        start: Number.isFinite(parseFloat(s)) ? parseFloat(s) : 0,
        // Use null to represent "None" (end of video)
        end:
          e === "None"
            ? null
            : Number.isFinite(parseFloat(e))
            ? parseFloat(e)
            : 0,
        removed: false,
      };
    }
    setInstructionTimes(initial);
  }, [data]);

  const formatTime = (seconds) => {
    if (seconds == null) return "End";
    const sec = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(sec / 60);
    const s = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Play between start and end (if end is null -> end of video)
  const playInstruction = (start, end) => {
    if (!videoRef.current) return;
    const s = Math.max(0, Math.floor(start));
    const e =
      end == null
        ? Math.floor(videoRef.current?.duration || videoDuration || 0)
        : Math.max(0, Math.floor(end));

    videoRef.current.currentTime = s;
    setPlayingRange({ start: s, end: e });
    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 100);
  };

  const pauseInstruction = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setPlayingRange(null);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const now = videoRef.current.currentTime;
    setCurrentTime(now);
    if (playingRange && now >= playingRange.end) {
      videoRef.current.pause();
      setPlayingRange(null);
    }
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoDuration(Math.floor(videoRef.current.duration || 0));
  };

  const markUnsaved = (item_id) => {
    setSavedItems((prev) => {
      const u = new Set(prev);
      u.delete(item_id);
      return u;
    });
  };



  // Save all
  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      if (onSaveAll) {
        const payload = Object.entries(instructionTimes).map(
          ([item_id, { start, end, removed }]) => ({
            item_id: parseInt(item_id, 10),
            timestamp: removed ? null : `${Math.floor(start)}-${end == null ? "None" : Math.floor(end)}`,
          })
        );
        await onSaveAll(payload);
      }
      setSavedItems(new Set(Object.keys(instructionTimes).map((id) => parseInt(id, 10))));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAll(false);
    }
  };

  if (!isOpen) return null;

  const totalInstructions = Object.keys(instructionTimes).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          <div onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Instructions */}
          <div className="lg:w-1/2 p-2 border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock size={20} className="mr-2 text-blue-600" />
              Timestamp Instructions ({totalInstructions})
            </h3>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
      {Object.entries(instructionTimes).map(
        ([item_id, { instruction, start, end, removed }]) => {
          const startInt = Math.max(0, Math.floor(start));
          const endInt = end == null ? null : Math.max(0, Math.floor(end));
          const effectiveEnd =
            endInt == null ? Math.floor(videoDuration) : endInt;

          const active = parseInt(item_id, 10) === selectedId;

          const isPlaying =
          parseInt(item_id, 10) === selectedId &&
          playingRange &&
          playingRange.start === startInt &&
          playingRange.end === effectiveEnd;
        

          const startOptions = Array.from(
            { length: effectiveEnd + 1 },
            (_, i) => i
          );
          const endOptions = Array.from(
            { length: Math.max(0, Math.floor(videoDuration) - startInt) + 1 },
            (_, i) => startInt + i
          );

          const isSaved = savedItems.has(parseInt(item_id, 10));
          const isSaving = savingItems.has(parseInt(item_id, 10));

          return (
            <div
              key={item_id}
              className={`p-4 rounded-lg border transition-all ${
                removed
                  ? "bg-red-50 border-red-300"
                  : isSaved
                  ? "bg-green-50 border-green-300 shadow-sm"
                  : active
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium mb-2 ${
                      removed
                        ? "text-red-800"
                        : isSaved
                        ? "text-green-800"
                        : active
                        ? "text-blue-800"
                        : "text-gray-800"
                    }`}
                  >
                    {instruction}
                  </p>

                  <div className="flex items-center flex-wrap gap-2">
                    <label className="text-xs text-gray-500">Start</label>
                    <select
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                      value={startInt}
                      disabled={removed}
                      onChange={(e) => {
                        const newStart = parseInt(e.target.value, 10);
                        setInstructionTimes((prev) => {
                          const prevEnd = prev[item_id].end;
                          return {
                            ...prev,
                            [item_id]: {
                              ...prev[item_id],
                              start: newStart,
                              end:
                                prevEnd == null
                                  ? null
                                  : Math.max(newStart, prevEnd),
                            },
                          };
                        });
                        markUnsaved(parseInt(item_id, 10));
                      }}
                    >
                      {startOptions.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>

                    <span className="text-xs text-gray-400">→</span>

                    <label className="text-xs text-gray-500">End</label>
                    <select
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                      value={endInt == null ? "__NONE__" : String(endInt)}
                      disabled={removed}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInstructionTimes((prev) => {
                          const newEnd =
                            val === "__NONE__" ? null : parseInt(val, 10);
                          return {
                            ...prev,
                            [item_id]: {
                              ...prev[item_id],
                              start: Math.min(
                                prev[item_id].start,
                                newEnd ?? Math.floor(videoDuration)
                              ),
                              end: newEnd,
                            },
                          };
                        });
                        markUnsaved(parseInt(item_id, 10));
                      }}
                    >
                      <option value="__NONE__">End of video</option>
                      {endOptions.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        removed
                          ? "bg-red-200 text-red-800"
                          : isSaved
                          ? "bg-green-200 text-green-800"
                          : active
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {removed
                        ? "No timestamp"
                        : `${formatTime(startInt)} - ${
                            endInt == null ? "End" : formatTime(effectiveEnd)
                          }`}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors ml-3`}
                  onClick={() => {
                    setSelectedId(
                      isPlaying ? null : parseInt(item_id, 10)
                    );
                    if (isPlaying) {
                      pauseInstruction();
                    } else {
                      playInstruction(startInt, endInt);
                    }
                  }}
                  title={
                    isPlaying ? "Pause this range" : "Play this range"
                  }
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </div>

                <div
                  className="p-2 rounded-full text-red-600 hover:bg-red-100 cursor-pointer transition-colors ml-1"
                  title="Remove timestamp for this instruction"
                  onClick={() => {
                    setInstructionTimes((prev) => ({
                      ...prev,
                      [item_id]: { ...prev[item_id], removed: true },
                    }));
                    markUnsaved(parseInt(item_id, 10));
                  }}
                >
                  <X size={14} />
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>

            

          
          </div>

          {/* RIGHT: Video */}
          <div className="lg:w-1/2 p-3">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                src={data.video}
                controls
                className="w-full h-auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                preload="metadata"
              />
            </div>

            {/* Current Time */}
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center space-x-2">
                <Clock size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Current Time: {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Duration hint */}
            {videoDuration > 0 && (
              <p className="mt-2 text-center text-xs text-gray-500">
                Video length: {formatTime(videoDuration)}
              </p>
            )}
          </div>
          
        </div>
        <div className="flex justify-center items-center gap-2">
        <div
                              onClick={!isSavingAll ? handleSaveAll : undefined}
                              className={`px-3 flex gap-2 items-center mt-4 mb-4 py-2 text-sm font-medium text-white 
                    border border-transparent rounded-md transition-colors
                    ${
                      isSavingAll
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                            >
                              {isSavingAll ? (
                                <svg
                                  className="w-4 h-4 animate-spin text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                  ></path>
                                </svg>
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              {isSavingAll ? "Saving..." : "Save All"}
                            </div>

                            {onRegenerate && (
                              <div
                                onClick={!regenerating ? onRegenerate : undefined}
                                className={`px-3 flex gap-2 items-center mt-4 mb-4 py-2 text-sm font-medium text-white 
                    border border-transparent rounded-md transition-colors
                    ${
                      regenerating
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                              >
                                {regenerating ? (
                                  <svg
                                    className="w-4 h-4 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <Loader className="w-4 h-4" />
                                )}
                                {regenerating ? "Regenerating..." : "Regenerate"}
                              </div>
                            )}

                            <div
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </div>
                            </div>
      </div>
    </div>
  );
};

export default SaveTimestampsDialog;
