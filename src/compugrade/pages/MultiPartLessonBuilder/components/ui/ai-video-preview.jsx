
import { useRef, useState, useEffect } from "react";
import { X, Clock, Play, Save, Loader, CheckCircle } from "lucide-react";
const  SaveTimestampsDialog = ({
    isOpen,
    onClose,
    data,
    title = "Save Timestamp Instructions",
    onSave,
    onSaveAll,
  }) => {
    console.log(data)
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [savedItems, setSavedItems] = useState(new Set());
    const [savingItems, setSavingItems] = useState(new Set());
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [instructionTimes, setInstructionTimes] = useState({});
    const [playingRange, setPlayingRange] = useState(null);
  
    // Initialize editable times from props
    useEffect(() => {
      const initial = {};
      for (const t of data.timestamps) {
        const [s, e] = t.timestamp.split("-");
        initial[t.item_id] = {
          instruction: t.instruction,
          start: Number.isFinite(parseFloat(s)) ? parseFloat(s) : 0,
          end: e === "None" ? 0 : Number.isFinite(parseFloat(e)) ? parseFloat(e) : 0,
        };
      }
      setInstructionTimes(initial);
    }, [data]);
  
    const formatTime = (seconds) => {
      const sec = Math.max(0, Math.floor(seconds || 0));
      const minutes = Math.floor(sec / 60);
      const s = sec % 60;
      return `${minutes.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };
  
    // Play between start and end (auto-pause at end)
    const playInstruction = (start, end) => {
      if (!videoRef.current) return;
      const s = Math.max(0, Math.floor(start));
      const e = Math.max(0, Math.floor(end));
      videoRef.current.currentTime = s;
      setPlayingRange({ start: s, end: e });
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 100);
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
  
    // Save one
    const handleSave = async (item_id) => {
      setSavingItems((prev) => new Set([...prev, item_id]));
      try {
        if (onSave) {
          const { start, end } = instructionTimes[item_id];
          await onSave({
            item_id,
            timestamp: `${Math.floor(start)}-${end ? Math.floor(end) : "None"}`,
          });
        }
        setSavedItems((prev) => new Set([...prev, item_id]));
      } catch (e) {
        console.error(e);
      } finally {
        setSavingItems((prev) => {
          const u = new Set(prev);
          u.delete(item_id);
          return u;
        });
      }
    };
  
    // Save all
    const handleSaveAll = async () => {
      setIsSavingAll(true);
      try {
        if (onSaveAll) {
          const payload = Object.entries(instructionTimes).map(
            ([item_id, { start, end }]) => ({
              item_id: parseInt(item_id, 10),
              timestamp: `${Math.floor(start)}-${end ? Math.floor(end) : "None"}`,
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
    const savedCount = savedItems.size;
    const allSaved = totalInstructions > 0 && savedCount === totalInstructions;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              {/* <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-green-600">
                  {savedCount} of {totalInstructions} instructions saved
                </p>
                {allSaved && (
                  <span className="flex items-center text-sm text-green-700 font-medium">
                    <CheckCircle size={16} className="mr-1" />
                    All Saved!
                  </span>
                )}
              </div> */}
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
                {Object.entries(instructionTimes).map(([item_id, { instruction, start, end }]) => {
                  const startInt = Math.max(0, Math.floor(start));
                  const endInt = Math.max(0, Math.floor(end));
                  const active = currentTime >= startInt && currentTime <= endInt;
                  const isSaved = savedItems.has(parseInt(item_id, 10));
                  const isSaving = savingItems.has(parseInt(item_id, 10));
  
                  // Option ranges
                  const startOptions = Array.from(
                    { length: endInt - 0 + 1 },
                    (_, i) => i
                  );
                  const endOptions = Array.from(
                    { length: videoDuration - startInt + 1 },
                    (_, i) => startInt + i
                  );
  
                  return (
                    <div
                      key={item_id}
                      className={`p-4 rounded-lg border transition-all ${
                        isSaved
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
                              isSaved
                                ? "text-green-800"
                                : active
                                ? "text-blue-800"
                                : "text-gray-800"
                            }`}
                          >
                            {instruction}
                          </p>
  
                          <div className="flex items-center flex-wrap gap-2">
                            {/* Start dropdown */}
                            <label className="text-xs text-gray-500">Start</label>
                            <select
                              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                              value={startInt}
                              onChange={(e) => {
                                const newStart = parseInt(e.target.value, 10);
                                setInstructionTimes((prev) => ({
                                  ...prev,
                                  [item_id]: {
                                    ...prev[item_id],
                                    start: newStart,
                                    end: Math.max(newStart, prev[item_id].end),
                                  },
                                }));
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
  
                            {/* End dropdown */}
                            <label className="text-xs text-gray-500">End</label>
                            <select
                              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                              value={endInt}
                              onChange={(e) => {
                                const newEnd = parseInt(e.target.value, 10);
                                setInstructionTimes((prev) => ({
                                  ...prev,
                                  [item_id]: {
                                    ...prev[item_id],
                                    start: Math.min(prev[item_id].start, newEnd),
                                    end: newEnd,
                                  },
                                }));
                                markUnsaved(parseInt(item_id, 10));
                              }}
                            >
                              {endOptions.map((t) => (
                                <option key={t} value={t}>
                                  {formatTime(t)}
                                </option>
                              ))}
                            </select>
  
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isSaved
                                  ? "bg-green-200 text-green-800"
                                  : active
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {formatTime(startInt)} - {endInt ? formatTime(endInt) : "None"}
                            </span>
                          </div>
                        </div>
  
                        <div className="flex items-center gap-2 ml-3">
                          {/* Play */}
                          <div
                            className={`p-2 rounded-full ${
                             " text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                               
                            }`}
                            onClick={() => playInstruction(startInt, endInt)}
                            title="Play this range"
                          >
                            <Play size={14} />
                          </div>
  
                          {/* Save */}
                          {/* <div
                            onClick={() => handleSave(parseInt(item_id, 10))}
                            disabled={isSaving || isSaved}
                            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1 ${
                              isSaved
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : isSaving
                                ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isSaving ? (
                              <Loader size={12} className="animate-spin" />
                            ) : isSaved ? (
                              <CheckCircle size={12} />
                            ) : (
                              <Save size={12} />
                            )}
                            <span>
                              {isSaved ? "Saved" : isSaving ? "Saving..." : "Save"}
                            </span>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
  
              {/* Save All */}
              <div className="mt-4 flex justify-center">
                <div
                  onClick={handleSaveAll}
                  disabled={isSavingAll || allSaved}
                  className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    
                      isSavingAll
                      ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSavingAll ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>
                    {isSavingAll ? "Saving All..." : "Save All"}
                  </span>
                </div>
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
        </div>
      </div>
    );
  };

  export default SaveTimestampsDialog;