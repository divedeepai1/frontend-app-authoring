import { X, ChevronDown, Search } from 'lucide-react';
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

interface Student {
  id: string;
  name: string;
  email: string;
  timerMode: string;
  hours: string;
  minutes: string;
}

interface LessonTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
  subsection?: Subsection | null;
}

const TIMER_MODES = [
  { value: 'display_only', label: 'Display timer only' },
  { value: 'lock_lessons', label: 'Lock lessons when time ends' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Student User', email: 'student41@gmail.com', timerMode: 'display_only', hours: '00', minutes: '30' },
  { id: '2', name: 'Student User', email: 'student42@gmail.com', timerMode: 'display_only', hours: '00', minutes: '30' },
  { id: '3', name: 'Student User', email: 'student43@gmail.com', timerMode: 'display_only', hours: '00', minutes: '30' },
  { id: '4', name: 'Student User', email: 'student44@gmail.com', timerMode: 'display_only', hours: '00', minutes: '30' },
  { id: '5', name: 'Student User', email: 'student45@gmail.com', timerMode: 'display_only', hours: '00', minutes: '30' },
];

export default function LessonTimerModal({
  isOpen,
  onClose,
  unit,
  subsection,
}: LessonTimerModalProps) {
  const [globalMode, setGlobalMode] = useState('display_only');
  const [globalHours, setGlobalHours] = useState('00');
  const [globalMinutes, setGlobalMinutes] = useState('05');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  if (!isOpen) return null;

  const handleApplyToAll = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      timerMode: globalMode,
      hours: globalHours,
      minutes: globalMinutes
    })));
    toast.success('Timer settings applied to all students');
  };

  const handleRemoveAll = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      timerMode: 'display_only',
      hours: '00',
      minutes: '00'
    })));
    toast.success('All timers removed');
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSaveStudent = (student: Student) => {
    toast.success(`Timer saved for ${student.email}`);
  };

  const handleRemoveStudentTimer = (id: string) => {
    handleUpdateStudent(id, { hours: '00', minutes: '00' });
    toast.success('Timer removed for student');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-[#27576B] text-[18px] font-semibold">Lesson timer setup</h2>
            <p className="text-[#6a7282] text-[13px] mt-0.5">
              {unit?.name} • {subsection?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRemoveAll}
              className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[13px] font-medium text-[#364153] hover:bg-gray-50 transition-colors"
            >
              Remove all timers
            </button>
            <button
              onClick={onClose}
              className="text-[#6a7282] hover:text-[#364153] transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Setup for all students */}
          <div className="space-y-4">
            <h3 className="text-[#364153] text-[14px] font-medium">Setup timer for all students</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[#6a7282] text-[12px] mb-1.5 font-medium">Timer mode</label>
                <div className="relative">
                  <select
                    value={globalMode}
                    onChange={(e) => setGlobalMode(e.target.value)}
                    className="w-full appearance-none px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer pr-10"
                  >
                    {TIMER_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                </div>
              </div>
              <div className="w-24">
                <label className="block text-[#6a7282] text-[12px] mb-1.5 font-medium">Hours</label>
                <div className="relative">
                  <select
                    value={globalHours}
                    onChange={(e) => setGlobalHours(e.target.value)}
                    className="w-full appearance-none px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer pr-10"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                </div>
              </div>
              <div className="w-24">
                <label className="block text-[#6a7282] text-[12px] mb-1.5 font-medium">Minutes</label>
                <div className="relative">
                  <select
                    value={globalMinutes}
                    onChange={(e) => setGlobalMinutes(e.target.value)}
                    className="w-full appearance-none px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer pr-10"
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleApplyToAll}
                className="px-6 py-2.5 bg-[#27576B] text-white rounded-lg text-[14px] font-medium hover:bg-[#1e4356] transition-colors"
              >
                Apply to all
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Student Table */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#E8F4F8] border-b border-[#e5e7eb]">
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider">Timer mode</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider text-center">Hours</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider text-center">Minutes</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-[#6a7282] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 text-[13px] text-[#364153] font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-[13px] text-[#6a7282]">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={student.timerMode}
                          onChange={(e) => handleUpdateStudent(student.id, { timerMode: e.target.value })}
                          className="w-full appearance-none pl-3 pr-8 py-2 border border-[#d1d5db] rounded-lg text-[13px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer"
                        >
                          {TIMER_MODES.map((mode) => (
                            <option key={mode.value} value={mode.value}>{mode.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="relative w-20">
                          <select
                            value={student.hours}
                            onChange={(e) => handleUpdateStudent(student.id, { hours: e.target.value })}
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-[#d1d5db] rounded-lg text-[13px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer"
                          >
                            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="relative w-20">
                          <select
                            value={student.minutes}
                            onChange={(e) => handleUpdateStudent(student.id, { minutes: e.target.value })}
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-[#d1d5db] rounded-lg text-[13px] text-[#364153] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent cursor-pointer"
                          >
                            {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRemoveStudentTimer(student.id)}
                          className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[12px] font-medium text-[#364153] hover:bg-[#f9fafb] transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleSaveStudent(student)}
                          className="px-5 py-2 bg-[#27aae1] text-white rounded-lg text-[12px] font-medium hover:bg-[#1e88c9] transition-colors shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e7eb] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#d1d5db] rounded-lg text-[14px] font-medium text-[#364153] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
