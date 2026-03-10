import { BookOpen, Save, Upload, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import LessonImportExportButtons from "./LessonImportExportButtons";
import HeaderActionButton from "./ui/HeaderActionButton";

export default function PageHeader({
  onOpenPreview,
  onSaveDraft,
  onPublish,
  onImportLesson,
  onExportLesson,
  saveDraftLoading,
  publishLoading,
  transferLoading,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const unitTitle = sessionStorage?.getItem("unitTitle");
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2">
        <nav className="mb-2 mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center text-[18px] font-semibold">
            <div
              onClick={() => navigate("/home")}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              Home
            </div>
            <ChevronRight className="mx-2 mt-1 h-4 w-4" />
            <div
              onClick={() => courseId && navigate(`/course/${courseId}/`)}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              {sessionStorage?.getItem("courseTitle")}
            </div>
            <ChevronRight className="mx-2 mt-1 h-4 w-4" />
            <div
              onClick={() => navigate(-1)}
              className="cursor-pointer transition-colors hover:text-blue-600"
              title="Go back"
            >
              {unitTitle}
            </div>
          </div>
          <LessonImportExportButtons
            onImport={onImportLesson}
            onExport={onExportLesson}
            loading={transferLoading}
          />
        </nav>
        <div className="flex items-center justify-between">
          <div className="flex items-center  gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mt-2">
              <h1 className="text-[20px] font-bold text-gray-900">
                {unitTitle}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and organize your lesson content with ease
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeaderActionButton >
              Add-in Preview
            </HeaderActionButton>

            <HeaderActionButton onClick={onOpenPreview}>
              Preview
            </HeaderActionButton>
            <HeaderActionButton
              icon={Save}
              onClick={onSaveDraft}
              loading={saveDraftLoading}
              variant="primary"
            >
              {saveDraftLoading ? "Saving..." : "Save Draft"}
            </HeaderActionButton>
            <HeaderActionButton
              icon={Upload}
              onClick={onPublish}
              loading={publishLoading}
              variant="primary"
            >
              {publishLoading ? "Publishing..." : "Publish Lesson"}
            </HeaderActionButton>
          </div>
        </div>
      </div>
    </header>
  );
}


