import { X, Search, Download, ChevronDown, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GradebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
}

interface StudentGrade {
  id: string;
  name: string;
  email: string;
  grades: Record<string, string | null>;
}

interface EditTarget {
  studentId: string;
  studentEmail: string;
  unitId: string;
  unitLabel: string;
  currentGrade: string | null;
}

const UNIT_COLUMNS = [
  { id: 'unit-1-1', label: 'Unit 1.1 Word 1.1' },
  { id: 'unit-1-2', label: 'Unit 1.2 Word 1.2' },
  { id: 'unit-1-3', label: 'Unit 1.3 Word 1.3' },
  { id: 'unit-1-4', label: 'Unit 1.4 Word 1.4' },
  { id: 'unit-1-5', label: 'Unit 1.5 Word 1.5' },
  { id: 'unit-1-6', label: 'Unit 1.6 Word 1.6' },
  { id: 'unit-1-7', label: 'Unit 1.7 Word 1.7' },
  { id: 'unit-1-8', label: 'Unit 1.8 Word 1.8' },
  { id: 'unit-1-9', label: 'Unit 1.9 Word 1.9' },
];

const INITIAL_GRADES: StudentGrade[] = [
  {
    id: '1',
    name: 'sharyar.nadeem@gmail.com',
    email: 'sharyar.nadeem@gmail.com',
    grades: {
      'unit-1-1': null,
      'unit-1-2': null,
      'unit-1-3': null,
      'unit-1-4': null,
      'unit-1-5': null,
      'unit-1-6': null,
      'unit-1-7': null,
      'unit-1-8': null,
      'unit-1-9': null,
    },
  },
  {
    id: '2',
    name: 'ali.hassan@gmail.com',
    email: 'ali.hassan@gmail.com',
    grades: {
      'unit-1-1': '85',
      'unit-1-2': '90',
      'unit-1-3': null,
      'unit-1-4': '78',
      'unit-1-5': null,
      'unit-1-6': null,
      'unit-1-7': null,
      'unit-1-8': null,
      'unit-1-9': null,
    },
  },
  {
    id: '3',
    name: 'sara.khan@gmail.com',
    email: 'sara.khan@gmail.com',
    grades: {
      'unit-1-1': '92',
      'unit-1-2': null,
      'unit-1-3': '88',
      'unit-1-4': null,
      'unit-1-5': '95',
      'unit-1-6': null,
      'unit-1-7': null,
      'unit-1-8': null,
      'unit-1-9': null,
    },
  },
];

const ACTION_OPTIONS = [
  { value: 'override', label: 'Override grade' },
  { value: 'reset', label: 'Reset to original' },
  { value: 'exempt', label: 'Mark as exempt' },
];

function EditGradeModal({
  target,
  onSave,
  onClose,
}: {
  target: EditTarget;
  onSave: (studentId: string, unitId: string, value: string | null) => void;
  onClose: () => void;
}) {
  const [action, setAction] = useState('override');
  const [gradeValue, setGradeValue] = useState(target.currentGrade ?? '');
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (action === 'override') {
      if (!gradeValue.trim()) {
        toast.error('Please enter a grade value.');
        return;
      }
      onSave(target.studentId, target.unitId, gradeValue.trim());
      toast.success(`Grade updated to ${gradeValue} for ${target.studentEmail} — ${target.unitLabel}`);
    } else if (action === 'reset') {
      onSave(target.studentId, target.unitId, null);
      toast.success(`Grade reset for ${target.studentEmail} — ${target.unitLabel}`);
    } else if (action === 'exempt') {
      onSave(target.studentId, target.unitId, 'Exempt');
      toast.success(`${target.studentEmail} marked as exempt for ${target.unitLabel}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[#27576B] text-[18px] font-semibold">Edit lesson grade</h2>
            <p className="text-[#6a7282] text-[13px] mt-0.5">
              {target.studentEmail} • {target.unitLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6a7282] hover:text-[#364153] transition-colors mt-0.5"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Action */}
          <div>
            <label className="block text-[#364153] text-[13px] font-medium mb-2">Action</label>
            <div className="relative">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full appearance-none px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer pr-10"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" strokeWidth={2} />
            </div>
          </div>

          {/* Grade Value — only for override */}
          {action === 'override' && (
            <div>
              <label className="block text-[#364153] text-[13px] font-medium mb-2">Grade value</label>
              <input
                type="text"
                placeholder="e.g. 85 or 8.5"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[#364153] text-[13px] font-medium mb-2">
              Reason <span className="text-[#9ca3af] font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Add a note for this grade change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e7eb] bg-[#fafafa]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#27aae1] bg-white text-[#27aae1] text-[13px] font-medium hover:bg-[#E8F4F8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#27aae1] text-white text-[13px] font-medium hover:bg-[#1e8fc7] transition-colors"
          >
            Save change
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GradebookModal({
  isOpen,
  onClose,
  courseName,
}: GradebookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentGrade[]>(INITIAL_GRADES);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    toast.success('Gradebook exported as CSV successfully!');
  };

  const openEdit = (student: StudentGrade, col: { id: string; label: string }) => {
    setEditTarget({
      studentId: student.id,
      studentEmail: student.email,
      unitId: col.id,
      unitLabel: col.label,
      currentGrade: student.grades[col.id],
    });
  };

  const handleSaveGrade = (studentId: string, unitId: string, value: string | null) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, grades: { ...s.grades, [unitId]: value } }
          : s
      )
    );
  };

  const getGradeDisplay = (grade: string | null | undefined) => {
    if (grade === null || grade === undefined) return 'Not graded';
    return grade;
  };

  const getGradeColor = (grade: string | null | undefined) => {
    if (grade === null || grade === undefined) return '#9ca3af';
    if (grade === 'Exempt') return '#f97316';
    return '#27aae1';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb]">
            <h2 className="text-[#27576B] text-[20px] font-semibold">Class Gradebook</h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search student here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent placeholder:text-[#9ca3af] w-52"
                />
              </div>
              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#27aae1] text-white text-[13px] font-medium hover:bg-[#1e8fc7] transition-colors"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                Export CSV
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                className="text-[#6a7282] hover:text-[#364153] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full" style={{ minWidth: '960px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#E8F4F8] border-b border-[#e5e7eb]">
                  <th className="px-6 py-4 text-left min-w-[200px]">
                    <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">Student</span>
                  </th>
                  {UNIT_COLUMNS.map((col) => (
                    <th key={col.id} className="px-4 py-4 text-left min-w-[140px]">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                        {col.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e7eb]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={UNIT_COLUMNS.length + 1}
                      className="px-6 py-12 text-center text-[#9ca3af] text-[14px]"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[#364153] text-[13px] font-medium">{student.name}</p>
                          <p className="text-[#6a7282] text-[12px]">{student.email}</p>
                        </div>
                      </td>
                      {UNIT_COLUMNS.map((col) => {
                        const grade = student.grades[col.id];
                        return (
                          <td key={col.id} className="px-4 py-4">
                            <button
                              onClick={() => openEdit(student, col)}
                              className="flex items-center gap-1.5 group/cell rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-[#E8F4F8] transition-colors w-full text-left"
                              title="Click to edit grade"
                            >
                              <span
                                className="text-[13px]"
                                style={{ color: getGradeColor(grade) }}
                              >
                                {getGradeDisplay(grade)}
                              </span>
                              <Pencil
                                className="w-3 h-3 opacity-0 group-hover/cell:opacity-100 transition-opacity flex-shrink-0"
                                style={{ color: '#27aae1' }}
                                strokeWidth={2}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-2.5 border-t border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between">
            <p className="text-[#9ca3af] text-[12px]">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              {courseName ? ` • ${courseName}` : ''}
            </p>
            <p className="text-[#9ca3af] text-[12px]">Click any grade cell to edit  •  Scroll horizontally to see all units →</p>
          </div>
        </div>
      </div>

      {/* Edit Grade Modal */}
      {editTarget && (
        <EditGradeModal
          target={editTarget}
          onSave={handleSaveGrade}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}