import { Eye, Edit, Trash2, Plus, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import AddClassModal from './AddClassModal';
import ViewClassModal from './ViewClassModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

interface Class {
  id: number;
  name: string;
  grade: number;
  period: number;
  students: number;
  assignedCourses: string;
  status: 'Active' | 'Inactive';
}

const mockClasses: Class[] = [
  {
    id: 1,
    name: 'arooj',
    grade: 5,
    period: 4,
    students: 2,
    assignedCourses: 'LBD WORD 365 - DiveDeepAI',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Test Class Csv Import',
    grade: 10,
    period: 5,
    students: 2,
    assignedCourses: 'LBD WORD 365 - DiveDeepAI',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Test Class Taimoor',
    grade: 1,
    period: 1,
    students: 62,
    assignedCourses: 'LBD WORD 365 - DiveDeepAI, LBD Excel 365 - DiveDeepAI, LBD PPT 365 - DiveDeepAI, LBD Google Docs - DiveDeepAI, LBD Google Sheets - DiveDeepAI, LBD Google slides - DiveDeepAI, Excel 365 (Free Trial), PowerPoint 365 (Free Trial), Word 365 - Level 1 (beta), DiveDeep (Free Trial), DiveDeep Word 365 (Free Trial)',
    status: 'Active',
  },
];

export default function MyClasses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [deleteClass, setDeleteClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>(mockClasses);

  const handleDeleteClass = () => {
    if (deleteClass) {
      setClasses((prev) => prev.filter((c) => c.id !== deleteClass.id));
      toast.success(`Class "${deleteClass.name}" deleted successfully`);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Table Header */}
        <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#27aae1] rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[#101828] text-[16px] font-semibold">My Classes</h3>
                <p className="text-[#6a7282] text-[13px]">Manage and organize your class information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add a New Class
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="px-6 py-4 text-left">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Class Name
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Grade
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Period
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Students
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Assigned Courses
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e7eb]">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#101828] text-[14px] font-medium">{classItem.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#6a7282] text-[14px]">{classItem.grade}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#6a7282] text-[14px]">{classItem.period}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#6a7282] text-[14px]">{classItem.students}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#6a7282] text-[14px] max-w-md truncate">
                      {classItem.assignedCourses}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedClass(classItem);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                      >
                        <Eye className="w-5 h-5 text-[#6a7282]" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditClass(classItem);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                      >
                        <Edit className="w-5 h-5 text-[#6a7282]" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => {
                          setDeleteClass(classItem);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-[#ef4444]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddClassModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditClass(null);
        }} 
        editClass={editClass} 
      />
      <ViewClassModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} selectedClass={selectedClass} />
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message="Are you sure you want to delete this class? All associated students and data will be removed. This action cannot be undone."
        itemName={deleteClass?.name}
      />
    </>
  );
}