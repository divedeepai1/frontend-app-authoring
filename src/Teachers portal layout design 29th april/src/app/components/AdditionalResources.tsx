import { FileText, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddResourcesModal from './AddResourcesModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Resource {
  id: string;
  name: string;
  type: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: '20251031115423217690.image-2051028-062215.png',
    type: 'image',
  },
  {
    id: '2',
    name: '20251031115424580013Z.compugrade_context (1).md',
    type: 'document',
  },
  {
    id: '3',
    name: '20251031115433139015O.compugrade_context (1).md',
    type: 'document',
  },
  {
    id: '4',
    name: '20251031115464663205Z.image-2051023-130526 (1).png',
    type: 'image',
  },
  {
    id: '5',
    name: 'ai-agentsv1.odt',
    type: 'document',
  },
  {
    id: '6',
    name: 'compugrade_context.md',
    type: 'document',
  },
];

export default function AdditionalResources() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [isAddResourcesModalOpen, setIsAddResourcesModalOpen] = useState(false);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null
  );

  const handleDownload = (resource: Resource) => {
    toast.success(`Downloading ${resource.name}`);
  };

  const handleDelete = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      toast.success(`"${resource.name}" deleted successfully`);
    }
  };

  const handleUploadResource = (uploadType: string, file: File | null) => {
    if (file) {
      const newResource: Resource = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'document',
      };
      setResources((prev) => [...prev, newResource]);
      toast.success(`Resource "${file.name}" uploaded successfully!`);
    }
    setIsAddResourcesModalOpen(false);
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Resources Table */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Select Class */}
              <div className="flex items-center gap-3">
                <label className="text-[#364153] text-[14px] font-medium whitespace-nowrap">
                  All Resources:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent min-w-[220px]"
                >
                  <option value="all">All Resources</option>
                  <option value="class-1">Class 1 - Morning Batch</option>
                  <option value="class-2">Class 2 - Evening Batch</option>
                  <option value="class-3">Class 3 - Weekend Batch</option>
                </select>
              </div>

              {/* Select Course */}
              <div className="flex items-center gap-3">
                <label className="text-[#364153] text-[14px] font-medium whitespace-nowrap">
                  All Courses:
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent min-w-[220px]"
                >
                  <option value="all">All Courses</option>
                  <option value="course-1">LBD WORD 365 - DiveDeepAI</option>
                  <option value="course-2">Excel Fundamentals</option>
                  <option value="course-3">PowerPoint Mastery</option>
                </select>
              </div>
            </div>

            {/* Add Resources Button */}
            <button
              onClick={() => setIsAddResourcesModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
            >
              Add Resources
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E8F4F8] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    File Name
                  </span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e7eb]">
              {resources.map((resource) => (
                <tr
                  key={resource.id}
                  className="hover:bg-[#f9fafb] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText
                        className="w-5 h-5 text-[#6a7282] flex-shrink-0"
                        strokeWidth={2}
                      />
                      <span className="text-[#364153] text-[14px]">
                        {resource.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownload(resource)}
                        className="p-2 rounded-lg bg-[#f3f4f6] text-[#6a7282] hover:bg-[#e5e7eb] transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          setResourceToDelete(resource);
                          setIsDeleteConfirmationModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-[#f3f4f6] text-[#6a7282] hover:bg-[#fee2e2] hover:text-[#dc2626] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {resources.length === 0 && (
            <div className="py-12 text-center">
              <FileText
                className="w-12 h-12 text-[#d1d5db] mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-[#6a7282] text-[14px]">No resources found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Resources Modal */}
      <AddResourcesModal
        isOpen={isAddResourcesModalOpen}
        onClose={() => setIsAddResourcesModalOpen(false)}
        onUpload={handleUploadResource}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmationModalOpen}
        onClose={() => setIsDeleteConfirmationModalOpen(false)}
        onConfirm={() => {
          if (resourceToDelete) {
            handleDelete(resourceToDelete.id);
          }
        }}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        itemName={resourceToDelete?.name}
      />
    </div>
  );
}