import { FileText, Video, Eye, X, Download, Settings } from "lucide-react";

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
              <p className="text-xs text-gray-500">Configure lesson-wide documents and videos</p>
            </div>
          </div>
          <div className="p-1 rounded hover:bg-gray-100 border-none" onClick={onClose}>
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Lesson Documents</label>
                <p className="text-xs text-gray-500">Upload source materials and answer keys</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Source Document</label>
                {lessonConfig.sourceDocument ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-200">
                        <FileText className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {lessonConfig.sourceDocument.name || "Uploaded"}
                        </span>
                        <p className="text-xs text-gray-500">Source document uploaded</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div
                        onClick={() =>
                          setDocPreview({ open: true, title: "Lesson Source Document", src: lessonConfig.sourceDocument })
                        }
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => downloadFile(lessonConfig.sourceDocument, "source-document.docx")}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => setLessonConfig((c) => ({ ...c, sourceDocument: null }))}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept=".doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLessonConfig((c) => ({ ...c, sourceDocument: file }));
                      }}
                      className="hidden"
                      id="lesson-source-document"
                    />
                    <label htmlFor="lesson-source-document" className="cursor-pointer">
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 w-fit mx-auto mb-2 transition-colors">
                        <UploadIcon />
                      </div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Upload source document</p>
                      <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Answer Key</label>
                {lessonConfig.answerKey ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-200">
                        <FileText className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {lessonConfig.answerKey.name || "Uploaded"}
                        </span>
                        <p className="text-xs text-gray-500">Answer key uploaded</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div
                        onClick={() =>
                          setDocPreview({ open: true, title: "Lesson Answer Key", src: lessonConfig.answerKey })
                        }
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => downloadFile(lessonConfig.answerKey, "answer-key.docx")}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => setLessonConfig((c) => ({ ...c, answerKey: null }))}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept=".doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLessonConfig((c) => ({ ...c, answerKey: file }));
                      }}
                      className="hidden"
                      id="lesson-answer-key"
                    />
                    <label htmlFor="lesson-answer-key" className="cursor-pointer">
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 w-fit mx-auto mb-2 transition-colors">
                        <UploadIcon />
                      </div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">Upload answer key</p>
                      <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
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


