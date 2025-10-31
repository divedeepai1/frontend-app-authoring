import { BookOpen, Save, Upload, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function PageHeader({
  onOpenPreview,
  onSaveDraft,
  onPublish,
  saveDraftLoading,
  publishLoading,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const unitTitle = sessionStorage?.getItem("unitTitle");
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2">
        {/* Top Breadcrumbs */}
        <nav className="flex items-center text-[18px] font-semibold  mb-2 mt-2">
          <div
            onClick={() => navigate("/home")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Home
          </div>
          <ChevronRight className="w-4 h-4 mx-2 mt-1" />
          <div
            onClick={() => courseId && navigate(`/course/${courseId}/`) }
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            {sessionStorage?.getItem("courseTitle")}
          </div>
          <ChevronRight className="w-4 h-4 mx-2 mt-1" />
          <div
            onClick={() => navigate(-1)}
            className="hover:text-blue-600 transition-colors cursor-pointer"
            title="Go back"
          >
            {unitTitle}
          </div>
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
            <div
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add-in Preview
            </div>

            <div
              onClick={onOpenPreview}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Preview
            </div>
            <div
              onClick={!saveDraftLoading ? onSaveDraft : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
        border border-transparent rounded-md transition-colors
        ${
          saveDraftLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
            >
              {saveDraftLoading ? (
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
              {saveDraftLoading ? "Saving..." : "Save Draft"}
            </div>
            <div
              onClick={!publishLoading ? onPublish : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
        border border-transparent rounded-md transition-colors
        ${
          publishLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
            >
              {publishLoading ? (
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
                <Upload className="w-4 h-4" />
              )}
              {publishLoading ? "Publishing..." : "Publish Lesson"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


