import { X, Search, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Student {
  id: string;
  email: string;
  dueDate: string;
  timerHours?: string;
  timerMinutes?: string;
}

interface Unit {
  id: string;
  name: string;
}

interface Subsection {
  id: string;
  name: string;
}

interface ScheduleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
  subsection?: Subsection | null;
}

const mockStudents: Student[] = [
  { id: '1', email: 'a@gmail.com', dueDate: '2026-03-18', timerHours: '00', timerMinutes: '00' },
  { id: '2', email: 'b@gmail.com', dueDate: '2026-03-18', timerHours: '00', timerMinutes: '00' },
  { id: '3', email: 'c@gmail.com', dueDate: '2026-03-18', timerHours: '00', timerMinutes: '00' },
  { id: '4', email: 'd@gmail.com', dueDate: '2026-03-18', timerHours: '00', timerMinutes: '00' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export default function ScheduleAccessModal({
  isOpen,
  onClose,
  unit,
  subsection,
}: ScheduleAccessModalProps) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalDate, setGlobalDate] = useState('2026-03-18');
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStudents = students.filter((student) =>
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateChange = (studentId: string, newDate: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, dueDate: newDate } : student
      )
    );
  };

  const handleTimerChange = (studentId: string, field: 'timerHours' | 'timerMinutes', value: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, [field]: value } : student
      )
    );
  };

  const handleSave = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const timerInfo = student.timerHours !== '00' || student.timerMinutes !== '00' 
        ? ` with a ${student.timerHours}h ${student.timerMinutes}m timer`
        : '';
      toast.success(`Access scheduled for ${student.email} until ${new Date(student.dueDate).toLocaleDateString()}${timerInfo}`);
      setEditingTimerId(null);
    }
  };

  const handleSetAccessForAll = () => {
    setStudents((prev) =>
      prev.map((student) => ({ ...student, dueDate: globalDate }))
    );
    toast.success(`Access scheduled for all students until ${new Date(globalDate).toLocaleDateString()}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[#27576B] text-[20px] font-semibold">
              Schedule lesson access
            </h2>
            <p className="text-[#6a7282] text-[14px] mt-1">
              {unit?.name} • {subsection?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSetAccessForAll}
              className="px-4 py-2 rounded-lg border border-[#d1d5db] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
            >
              Set access for all
            </button>
            <button
              onClick={onClose}
              className="text-[#6a7282] hover:text-[#364153] transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-[#e5e7eb]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search by email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent placeholder:text-[#9ca3af]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#E8F4F8] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Email
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Due date
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                    Individual Timer
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[#364153] text-[14px]">{student.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={student.dueDate}
                      onChange={(e) => handleDateChange(student.id, e.target.value)}
                      className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {editingTimerId === student.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={student.timerHours}
                            onChange={(e) => handleTimerChange(student.id, 'timerHours', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                          >
                            {HOURS.map(h => <option key={h} value={h}>{h}h</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6a7282] pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={student.timerMinutes}
                            onChange={(e) => handleTimerChange(student.id, 'timerMinutes', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                          >
                            {MINUTES.map(m => <option key={m} value={m}>{m}m</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6a7282] pointer-events-none" />
                        </div>
                        <button 
                          onClick={() => setEditingTimerId(null)}
                          className="text-[#6a7282] hover:text-[#364153] p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTimerId(student.id)}
                        className="flex items-center gap-2 text-[#27aae1] text-[13px] font-medium hover:underline"
                      >
                        <Clock className="w-4 h-4" />
                        {student.timerHours !== '00' || student.timerMinutes !== '00' 
                          ? `${student.timerHours}h ${student.timerMinutes}m` 
                          : 'Set Timer'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSave(student.id)}
                      className="px-5 py-2 rounded-lg bg-[#27aae1] text-white text-[13px] font-medium hover:bg-[#1e88c9] transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}