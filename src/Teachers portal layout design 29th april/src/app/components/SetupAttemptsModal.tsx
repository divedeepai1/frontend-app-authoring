import { X, ChevronDown, Search, RotateCcw, Plus, Infinity } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Unit {
  id: string;
  name: string;
}

interface Subsection {
  id: string;
  name: string;
}

interface SetupAttemptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
  subsection?: Subsection | null;
}

const ATTEMPT_OPTIONS = [
  ...Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
  { value: 'unlimited', label: 'Unlimited' },
];

const MOCK_STUDENTS = [
  { id: '1', name: 'sharyar.nadeem@gmail.com', email: 'sharyar.nadeem@gmail.com', attemptsUsed: 1, lastAttempt: '2024-04-25', status: 'Completed' },
  { id: '2', name: 'ali.hassan@gmail.com', email: 'ali.hassan@gmail.com', attemptsUsed: 0, lastAttempt: '-', status: 'Not Started' },
  { id: '3', name: 'sara.khan@gmail.com', email: 'sara.khan@gmail.com', attemptsUsed: 2, lastAttempt: '2024-04-28', status: 'In Progress' },
];

export default function SetupAttemptsModal({
  isOpen,
  onClose,
  unit,
  subsection,
}: SetupAttemptsModalProps) {
  const [attempts, setAttempts] = useState('unlimited');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAttempt = (studentName: string) => {
    toast.success(`Additional attempt granted to ${studentName}`);
  };

  const handleResetAttempts = (studentName: string) => {
    toast.success(`All attempts reset for ${studentName}`);
  };

  const handleUnlimitedAttempts = (studentName: string) => {
    toast.success(`${studentName} now has unlimited attempts`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[#27576B] text-[18px] font-semibold">Setup attempts</h2>
            <p className="text-[#6a7282] text-[13px] mt-0.5">
              {unit?.name} • {subsection?.name}
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
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Top Controls */}
          <div className="max-w-xs">
            {/* Attempts Allowed */}
            <div>
              <label className="block text-[#364153] text-[14px] font-medium mb-2">
                Attempts allowed
              </label>
              <div className="relative">
                <select
                  value={attempts}
                  onChange={(e) => setAttempts(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer pr-10"
                >
                  {ATTEMPT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#e5e7eb] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#27576B] text-[15px] font-semibold">Student Attempt Status</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent placeholder:text-[#9ca3af] w-64"
                />
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#E8F4F8] border-b border-[#e5e7eb]">
                    <th className="px-4 py-3 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider">Attempts Used</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-[#364153]">{student.name}</div>
                          <div className="text-[11px] text-[#6a7282]">{student.email}</div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#364153]">
                          {student.attemptsUsed}
                          <span className="text-[#9ca3af] text-[11px] ml-2">(Last: {student.lastAttempt})</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAddAttempt(student.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#27aae1] text-[#27aae1] text-[12px] font-medium hover:bg-[#E8F4F8] transition-colors"
                              title="Add attempt"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Add
                            </button>
                            <button 
                              onClick={() => handleResetAttempts(student.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#27aae1] text-[#27aae1] text-[12px] font-medium hover:bg-[#E8F4F8] transition-colors"
                              title="Reset attempts"
                            >
                              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Reset
                            </button>
                            <button 
                              onClick={() => handleUnlimitedAttempts(student.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#27aae1] text-[#27aae1] text-[12px] font-medium hover:bg-[#E8F4F8] transition-colors"
                              title="Unlimited attempts"
                            >
                              <Infinity className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Unlimited
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#9ca3af] text-[13px]">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
