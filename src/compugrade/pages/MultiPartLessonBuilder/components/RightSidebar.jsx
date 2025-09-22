import { Plus, Settings } from "lucide-react";
import { DraggablePartCard } from "../components/draggable-part-card";

export default function RightSidebar({
  onOpenLessonConfig,
  lessonParts,
  selectedPartId,
  setSelectedPartId,
  onAddPartClick,
  onEditPart,
  onDuplicatePart,
  onDeletePart,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const totalWeight = lessonParts.reduce((sum, part) => sum + part.weightage, 0);
  const isWeightValid = totalWeight === 100;

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-sm overflow-y-auto">
      <div className="px-4 py-2">
        <div
          className="mb-3 rounded-lg border border-blue-200 bg-gradient-to-r from-white to-blue-50 cursor-pointer hover:shadow-sm"
          onClick={onOpenLessonConfig}
          style={{ borderLeftWidth: "4px", borderLeftColor: "#3b82f6" }}
        >
          <div className="flex items-center gap-3 p-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Settings className="w-5 h-5 mb-1 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 mt-1">
                Lesson Configuration
              </div>
              <p className="text-xs text-gray-500">Manage documents, videos, and settings</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Lesson Outline</h3>
          <div
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={onAddPartClick}
          >
            <Plus className="w-4 h-4" />
            Add Part
          </div>
        </div>

        <div className="space-y-3 mb-3">
          {lessonParts.map((part, index) => (
            <DraggablePartCard
              key={part.id}
              part={part}
              index={index}
              isSelected={selectedPartId === part.id}
              onSelect={() => setSelectedPartId(part.id)}
              onEdit={() => onEditPart(part)}
              onDuplicate={() => onDuplicatePart(part.id)}
              onDelete={() => onDeletePart(part)}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Lesson Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Parts:</span>
              <span className="font-semibold text-gray-900">{lessonParts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Weight:</span>
              <span className={`font-semibold ${isWeightValid ? "text-green-600" : "text-red-600"}`}>
                {totalWeight}%
              </span>
            </div>
            {!isWeightValid && (
              <p className="text-xs text-red-600 mt-2">⚠️ Weights should total 100%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


