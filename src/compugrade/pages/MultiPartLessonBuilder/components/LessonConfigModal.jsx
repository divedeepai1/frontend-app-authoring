import { FileText, Video, Eye, X, Download, Settings } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { base_url } from "../../../../compugrade-constants";

export default function LessonConfigModal({
  open,
  onClose,
  lessonConfig,
  setLessonConfig,
  setDocPreview,
  downloadFile,
  setVideoPreviewOpen,
  setVideoPreviewUrl,
  videoObjectUrlRef,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pt-[3%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-3xl max-h-[87vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-base font-semibold">Lesson Configuration</div>
              <p className="text-xs text-gray-500">Configure lesson-wide skills and video</p>
            </div>
          </div>
          <div className="p-1 rounded hover:bg-gray-100 border-none" onClick={onClose}>
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/*
            Lesson Documents (commented out for now, kept for potential future use)
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"> ... </div>
          */}

          {/* Skills multi-select input */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Settings className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Lesson Skills</label>
                <p className="text-xs text-gray-500">Select related skills</p>
              </div>
            </div>

            <SkillsMultiSelect
              selectedSkills={lessonConfig.skills || []}
              onChange={(skills) => setLessonConfig((c) => ({ ...c, skills }))}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900">Video Attachments</label>
                  <p className="text-xs text-gray-500">Enable video uploads for this lesson</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {lessonConfig.videoEnabled ? "Enabled" : "Disabled"}
                </span>
                <div
                  onClick={() => setLessonConfig((c) => ({ ...c, videoEnabled: !c.videoEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lessonConfig.videoEnabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      lessonConfig.videoEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            </div>

            {lessonConfig.videoEnabled && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {lessonConfig.videos?.[0] ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-200">
                        <Video className="w-4 h-4 text-purple-700" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {lessonConfig.videos[0].name || "Uploaded"}
                        </span>
                        <p className="text-xs text-gray-500">Video file uploaded</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div
                        onClick={() => {
                          try {
                            const v = lessonConfig.videos?.[0];
                            if (!v) return;
                            if (typeof v === "string") {
                              setVideoPreviewUrl(v);
                            } else {
                              const blob = v instanceof Blob ? v : new Blob([v]);
                              const url = URL.createObjectURL(blob);
                              videoObjectUrlRef.current = url;
                              setVideoPreviewUrl(url);
                            }
                            setVideoPreviewOpen(true);
                          } catch (_) {}
                        }}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => downloadFile(lessonConfig.videos[0], "lesson-video")}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => setLessonConfig((c) => ({ ...c, videos: [] }))}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setLessonConfig((c) => ({ ...c, videos: [f], videoEnabled: true }));
                      }}
                      className="hidden"
                      id="lesson-video-upload"
                    />
                    <label htmlFor="lesson-video-upload" className="cursor-pointer">
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-purple-100 w-fit mx-auto mb-2 transition-colors">
                        <Video className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Upload video file</p>
                      <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI files supported</p>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeWidth="2" d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
    </svg>
  );
}

function SkillsMultiSelect({ selectedSkills, onChange }) {
  const [allSkills, setAllSkills] = useState([]);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let aborted = false;
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${base_url}/api/skills/get_skills`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (aborted) return;
        const mapped = (data?.skills || []).map((item) => ({
          id: item.id,
          name: item.customer_facing_name,
          status: item.comparison_status, // keep original casing from API
        }));
        setAllSkills(mapped);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };
    fetchSkills();
    return () => {
      aborted = true;
    };
  }, []);

  const selectedByName = useMemo(() => new Set((selectedSkills || []).map((s) => s.customer_facing_name)), [selectedSkills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasWorking = (selectedSkills || []).some((s) => (s.status || "").trim() === "Working");
    const hasWorkingA2 = (selectedSkills || []).some((s) => (s.status || "").trim() === "Working A2");
    return allSkills.filter((s) => {
      if (selectedByName.has(s.name)) return false;
      const statusNorm = (s.status || "").trim();
      if (hasWorking && statusNorm === "Working A2") return false;
      if (hasWorkingA2 && statusNorm === "Working") return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allSkills, query, selectedByName]);

  const statusColorClasses = (status) => {
    const s = (status || "").trim();
    if (s === "Working") return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    if (s === "Working A2") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  };

  const chipColorClasses = (status) => {
    const s = (status || "").trim();
    if (s === "Working") return "bg-blue-50 text-blue-800 border-blue-200";
    if (s === "Working A2") return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-gray-50 text-gray-800 border-gray-200";
  };

  const addSkill = (skill) => {
    const hasWorking = (selectedSkills || []).some((s) => (s.status || "").trim() === "Working");
    const hasWorkingA2 = (selectedSkills || []).some((s) => (s.status || "").trim() === "Working A2");
    const statusNorm = (skill.status || "").trim();
    if ((hasWorking && statusNorm === "Working A2") || (hasWorkingA2 && statusNorm === "Working")) {
      setOpen(false);
      return;
    }
    if ((selectedSkills || []).some((s) => s.customer_facing_name === skill.name)) {
      setOpen(false);
      return;
    }
    const next = [...(selectedSkills || []), { customer_facing_name: skill.name, status: skill.status }];
    onChange(next);
    setQuery("");
    setOpen(false);
  };

  const removeSkill = (customerFacingName) => {
    const next = (selectedSkills || []).filter((s) => s.customer_facing_name !== customerFacingName);
    onChange(next);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">Skills</label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500"
          onClick={() => setOpen(true)}
        >
          {(selectedSkills || []).map((s) => (
            <span
              key={s.customer_facing_name}
              className={`flex items-center gap-1 rounded-md border text-xs px-2 py-1 ${chipColorClasses(s.status)}`}
            >
              <span className="font-medium">{s.customer_facing_name}</span>
              <div
                type="button"
                className="ml-1 text-gray-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(s.customer_facing_name);
                }}
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </div>
            </span>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Type to search skills..."
            className="flex-1 min-w-[160px] outline-none border-none text-sm px-1 py-1"
          />
        </div>

        {open &&  allSkills.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No skills found</div>
            ) : (
              <ul className="py-1">
                {filtered.map((s) => (
                  <li
                    key={s.id}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addSkill(s)}
                  >
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className={`ml-2 rounded px-2 py-0.5 text-xs ${statusColorClasses(s.status)}`}>{s.status === "Working" ? "A1" : s.status === "Working A2" ? "A2" : "OB"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


