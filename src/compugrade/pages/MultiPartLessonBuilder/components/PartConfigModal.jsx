import { FileText, Eye, X, Download, Settings } from "lucide-react";

export default function PartConfigModal({
  open,
  onClose,
  selectedPart,
  selectedPartConfig,
  setSelectedPartConfig,
  setDocPreview,
  downloadFile,
}) {
  if (!open || !selectedPart) return null;

  // Get course type from session storage
  const getCourseType = () => {
    return sessionStorage.getItem('courseType') || 'ms-word';
  };

  // Get file upload configuration based on course type
  const getFileConfig = () => {
    const courseType = getCourseType();
    switch (courseType) {
      case 'ms-word':
        return {
          accept: '.doc,.docx',
          description: 'DOC, DOCX files supported',
          sourceFilename: 'source-document.docx',
          answerKeyFilename: 'answer-key.docx'
        };
      case 'powerpoint':
        return {
          accept: '.ppt,.pptx',
          description: 'PPT, PPTX files supported',
          sourceFilename: 'source-presentation.pptx',
          answerKeyFilename: 'answer-key.pptx'
        };
      case 'excel':
        return {
          accept: '.xls,.xlsx',
          description: 'XLS, XLSX files supported',
          sourceFilename: 'source-spreadsheet.xlsx',
          answerKeyFilename: 'answer-key.xlsx'
        };
      default:
        return {
          accept: '.doc,.docx',
          description: 'DOC, DOCX files supported',
          sourceFilename: 'source-document.docx',
          answerKeyFilename: 'answer-key.docx'
        };
    }
  };

  const fileConfig = getFileConfig();

  return (
    <div className="fixed inset-0 z-50 pt-[3%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-3xl max-height-[87vh] max-h-[87vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-base font-semibold">Part Configuration</div>
              <p className="text-xs text-gray-500">Configure source document and answer key for this part</p>
            </div>
          </div>
          <div className="p-1 rounded hover:bg-gray-100 border-none" onClick={onClose}>
            <X className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Minutes to Complete Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Minutes to Complete
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Estimated time allowed for this part. Leave blank if not applicable.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedPartConfig.time_allowed ?? ""}
                  onKeyDown={(e) => {
                    // Block minus, plus, exponent, and other non-numeric control keys
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Allow only digits using regex; ignore any invalid updates
                    if (!/^\d*$/.test(raw)) return;
                    const num = raw === "" ? null : Number(raw);
                    setSelectedPartConfig({
                      time_allowed:
                        num !== null && !Number.isNaN(num) ? num : null,
                    });
                  }}
                  placeholder="e.g. 30"
                />
                <span className="text-xs text-gray-500">minutes</span>
              </div>
            </div>
          </div>

          {/* Part Documents Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Part Documents</label>
                <p className="text-xs text-gray-500">Upload source material and answer key for this part</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Source Document</label>
                {selectedPartConfig.sourceDocument ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-blue-200 flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 block truncate" title={selectedPartConfig.sourceDocument.name || "Uploaded"}>
                          {selectedPartConfig.sourceDocument.name || "Uploaded"}
                        </span>
                        <p className="text-xs text-gray-500">Source document uploaded</p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0">
                      <div
                        onClick={() =>
                          setDocPreview({
                            open: true,
                            title: `Part Source Document — ${selectedPart?.title || "Part"}`,
                            src: selectedPartConfig.sourceDocument,
                            nameHint: selectedPartConfig.sourceDocument?.name || fileConfig.sourceFilename,
                          })
                        }
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => downloadFile(selectedPartConfig.sourceDocument, fileConfig.sourceFilename)}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => setSelectedPartConfig({ sourceDocument: null })}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <FileInput id="part-source-document" onSelect={(file) => setSelectedPartConfig({ sourceDocument: file })} fileConfig={fileConfig} />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Answer Key</label>
                {selectedPartConfig.answerKey ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-green-200 flex-shrink-0">
                        <FileText className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 block truncate" title={selectedPartConfig.answerKey.name || "Uploaded"}>
                          {selectedPartConfig.answerKey.name || "Uploaded"}
                        </span>
                        <p className="text-xs text-gray-500">Answer key uploaded</p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0">
                      <div
                        onClick={() =>
                          setDocPreview({
                            open: true,
                            title: `Part Answer Key — ${selectedPart?.title || "Part"}`,
                            src: selectedPartConfig.answerKey,
                            nameHint: selectedPartConfig.answerKey?.name || fileConfig.answerKeyFilename,
                          })
                        }
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => downloadFile(selectedPartConfig.answerKey, fileConfig.answerKeyFilename)}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => setSelectedPartConfig({ answerKey: null })}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <FileInput id="part-answer-key" onSelect={(file) => setSelectedPartConfig({ answerKey: file })} fileConfig={fileConfig} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileInput({ id, onSelect, fileConfig }) {
  return (
    <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
      <input
        type="file"
        accept={fileConfig.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
        className="hidden"
        id={id}
      />
      <label htmlFor={id} className="cursor-pointer">
        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 w-fit mx-auto mb-2 transition-colors">
          <UploadIcon />
        </div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Upload document</p>
        <p className="text-xs text-gray-500 mt-1">{fileConfig.description}</p>
      </label>
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


