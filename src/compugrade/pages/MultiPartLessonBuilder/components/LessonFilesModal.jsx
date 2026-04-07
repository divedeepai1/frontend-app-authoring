import { X, Paperclip, Upload, Download } from "lucide-react";

export default function LessonFilesModal({
  open,
  onClose,
  lessonFiles,
  onAddLessonFile,
  onReplaceLessonFile,
  onDeleteLessonFile,
  onDownloadLessonFile,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[94vw] max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-100">
              <Paperclip className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="text-base font-semibold">Downloadable Lesson Files</div>
              <p className="text-xs text-gray-500">Upload lesson files here</p>
            </div>
          </div>
          <div
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 cursor-pointer">
            <input
              type="file"
              className="hidden"
              id="lesson-files-upload"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  onAddLessonFile(selectedFile);
                }
                e.target.value = "";
              }}
            />
            <label htmlFor="lesson-files-upload" className="cursor-pointer">
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-sky-100 w-fit mx-auto mb-2 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-sky-700">
                Upload lesson files
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported examples: .docx, .txt, .xlsx, .csv, .pptx, .jpg, .jpeg, .png
              </p>
            </label>
          </div>

          <div className="space-y-2">
            {lessonFiles.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                No files added yet
              </div>
            ) : (
              lessonFiles.map((file, index) => (
                <div
                  key={`${file.file_name || "lesson-file"}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name || "lesson-file"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {file.file_type || "file"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      type="button"
                      onClick={() => onDownloadLessonFile(file)}
                      className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </div>
                  
                   
                    <div
                      type="button"
                      onClick={() => onDeleteLessonFile(index)}
                      className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
