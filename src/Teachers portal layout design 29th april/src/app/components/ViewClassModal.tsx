import { X, Search, Trash2, MessageSquare, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Teacher {
  id: number;
  name: string;
  email: string;
  lastLogin: string;
}

interface Student {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ViewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: {
    id: number;
    name: string;
    grade: number;
    period: number;
    students: number;
    assignedCourses: string;
    status: 'Active' | 'Inactive';
  } | null;
}

const mockTeachers: Teacher[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@school.edu', lastLogin: '2024-04-05 09:30 AM' },
  { id: 2, name: 'Michael Chen', email: 'michael.chen@school.edu', lastLogin: '2024-04-05 08:15 AM' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@school.edu', lastLogin: '2024-04-04 02:45 PM' },
];

const mockStudents: Student[] = [
  { id: 1, username: 'jdoe01', firstName: 'John', lastName: 'Doe', email: 'john.doe@student.edu' },
  { id: 2, username: 'asmith02', firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@student.edu' },
  { id: 3, username: 'bwilson03', firstName: 'Bob', lastName: 'Wilson', email: 'bob.wilson@student.edu' },
  { id: 4, username: 'cjohnson04', firstName: 'Carol', lastName: 'Johnson', email: 'carol.johnson@student.edu' },
  { id: 5, username: 'dbrown05', firstName: 'David', lastName: 'Brown', email: 'david.brown@student.edu' },
];

export default function ViewClassModal({ isOpen, onClose, selectedClass }: ViewClassModalProps) {
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [addStudentMethod, setAddStudentMethod] = useState<'single' | 'import' | null>(null);
  const [studentForm, setStudentForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleAddTeacher = () => {
    if (!newTeacherEmail) {
      toast.error('Please enter a teacher email');
      return;
    }
    toast.success('Teacher added successfully!');
    setNewTeacherEmail('');
    setShowAddTeacher(false);
  };

  const handleAddStudent = () => {
    if (!studentForm.username || !studentForm.password || !studentForm.firstName || !studentForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Student added successfully!');
    setStudentForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
    setAddStudentMethod(null);
    setShowAddStudents(false);
  };

  const handleImportStudents = () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    toast.success('Students imported successfully!');
    setCsvFile(null);
    setAddStudentMethod(null);
    setShowAddStudents(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl w-[95vw] max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#e5e7eb] bg-[#fafafa]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#101828] text-[24px] font-semibold">View Class Details</h2>
              <p className="text-[#6a7282] text-[14px] mt-1">Class: {selectedClass?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#e5e7eb] transition-colors"
            >
              <X className="w-5 h-5 text-[#6a7282]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Assigned Teachers Table */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#101828] text-[18px] font-semibold">Assigned Teachers</h3>
                <button 
                  onClick={() => setShowAddTeacher(!showAddTeacher)}
                  className="px-4 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add More Teachers
                </button>
              </div>
              
              {/* Add Teacher Form */}
              {showAddTeacher && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-[#d1d5db]">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#364153] text-[14px] font-medium mb-2">
                        Teacher Email <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="email"
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        placeholder="teacher@school.edu"
                        className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAddTeacher}
                        className="px-4 py-2 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                      >
                        Add Teacher
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTeacher(false);
                          setNewTeacherEmail('');
                        }}
                        className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search teachers by name or email..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent bg-white"
                />
              </div>
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Teacher Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Email
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Last Login
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e5e7eb]">
                  {mockTeachers
                    .filter(teacher => 
                      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
                    )
                    .map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="w-4 h-4" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#101828] text-[14px] font-medium">{teacher.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#6a7282] text-[14px]">{teacher.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#6a7282] text-[14px]">{teacher.lastLogin}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toast.success(`Message sent to ${teacher.name}!`)}
                              className="p-1.5 rounded hover:bg-[#fef3e7] transition-colors group"
                              title="Send Message"
                            >
                              <MessageSquare className="w-5 h-5 text-[#27aae1] group-hover:text-[#1e88c9]" strokeWidth={1.5} />
                            </button>
                            <button 
                              onClick={() => toast.info(`Removing ${teacher.name}...`)}
                              className="p-1.5 rounded hover:bg-[#fee] transition-colors group"
                              title="Remove Teacher"
                            >
                              <Trash2 className="w-5 h-5 text-[#ef4444] group-hover:text-[#dc2626]" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Information Table */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#101828] text-[18px] font-semibold">Student Information</h3>
                <button 
                  onClick={() => setShowAddStudents(!showAddStudents)}
                  className="px-4 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add More Students
                </button>
              </div>
              
              {/* Add Students Section */}
              {showAddStudents && (
                <div className="mb-4 p-6 bg-white rounded-lg border border-[#d1d5db] space-y-6">
                  <div>
                    <h4 className="text-[#101828] text-[16px] font-semibold mb-1">Add Students</h4>
                    <p className="text-[#6a7282] text-[14px]">Select how would you like to add new students to this class.</p>
                  </div>
                  
                  {/* Selection Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <button
                      onClick={() => setAddStudentMethod('single')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        addStudentMethod === 'single'
                          ? 'border-[#27aae1] bg-[#f0f9ff]'
                          : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
                      }`}
                    >
                      <Plus className="w-6 h-6 text-[#364153] mx-auto mb-3" strokeWidth={2} />
                      <div className="text-[#364153] text-[14px] font-semibold text-center">Add a Single Student</div>
                    </button>

                    <button
                      disabled
                      className="p-6 rounded-lg border-2 border-[#e5e7eb] bg-[#f9fafb] cursor-not-allowed opacity-60"
                    >
                      <Plus className="w-6 h-6 text-[#9ca3af] mx-auto mb-3" strokeWidth={2} />
                      <div className="text-[#9ca3af] text-[14px] font-semibold text-center">Add Bulk Students</div>
                    </button>

                    <button
                      disabled
                      className="p-6 rounded-lg border-2 border-[#e5e7eb] bg-[#f9fafb] cursor-not-allowed opacity-60"
                    >
                      <Plus className="w-6 h-6 text-[#9ca3af] mx-auto mb-3" strokeWidth={2} />
                      <div className="text-[#9ca3af] text-[14px] font-semibold text-center">Self-Joining Link</div>
                    </button>

                    <button
                      onClick={() => setAddStudentMethod('import')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        addStudentMethod === 'import'
                          ? 'border-[#27aae1] bg-[#f0f9ff]'
                          : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
                      }`}
                    >
                      <Plus className="w-6 h-6 text-[#364153] mx-auto mb-3" strokeWidth={2} />
                      <div className="text-[#364153] text-[14px] font-semibold text-center">Import List of Students</div>
                    </button>
                  </div>

                  {/* Single Student Form */}
                  {addStudentMethod === 'single' && (
                    <div className="pt-4 border-t border-[#e5e7eb]">
                      <h4 className="text-[#27576B] text-[16px] font-semibold mb-4">Add a Single Student to your class</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#364153] text-[14px] font-medium mb-2">
                              Student's Username <span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              value={studentForm.username}
                              onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-[#364153] text-[14px] font-medium mb-2">
                              Student's Password <span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="password"
                              value={studentForm.password}
                              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#364153] text-[14px] font-medium mb-2">
                              Student's First Name <span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              value={studentForm.firstName}
                              onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-[#364153] text-[14px] font-medium mb-2">
                              Student's Last Name <span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              value={studentForm.lastName}
                              onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#364153] text-[14px] font-medium mb-2">
                            Student Email Address <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="email"
                            value={studentForm.email}
                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={handleAddStudent}
                            className="px-5 py-2.5 rounded-lg bg-[#27576B] text-white text-[14px] font-medium hover:bg-[#1e4555] transition-colors"
                          >
                            Add Student
                          </button>
                          <button
                            onClick={() => {
                              setAddStudentMethod(null);
                              setStudentForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
                            }}
                            className="px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Import Students Form */}
                  {addStudentMethod === 'import' && (
                    <div className="pt-4 border-t border-[#e5e7eb]">
                      <h4 className="text-[#27576B] text-[16px] font-semibold mb-4">Import List of Students</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#364153] text-[14px] font-medium mb-2">
                            Upload CSV File <span className="text-[#ef4444]">*</span>
                          </label>
                          <div className="border-2 border-dashed border-[#d1d5db] rounded-lg p-6 text-center bg-[#fafafa] hover:bg-[#f3f4f6] transition-colors">
                            <Upload className="w-8 h-8 text-[#6a7282] mx-auto mb-2" strokeWidth={1.5} />
                            <input
                              type="file"
                              accept=".csv"
                              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id="csv-upload"
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                              <div className="text-[#27aae1] text-[14px] font-medium hover:underline">
                                Click to upload CSV file
                              </div>
                              <div className="text-[#6a7282] text-[12px] mt-1">
                                {csvFile ? csvFile.name : 'or drag and drop'}
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleImportStudents}
                            className="px-5 py-2.5 rounded-lg bg-[#27576B] text-white text-[14px] font-medium hover:bg-[#1e4555] transition-colors"
                          >
                            Import Students
                          </button>
                          <button
                            onClick={() => {
                              setAddStudentMethod(null);
                              setCsvFile(null);
                            }}
                            className="px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search students by name, username or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent bg-white"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        User Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        First Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Last Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                        Email Address
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e5e7eb]">
                  {mockStudents
                    .filter(student => 
                      student.username.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.email.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map((student) => (
                      <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="w-4 h-4" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#101828] text-[14px] font-medium">{student.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#6a7282] text-[14px]">{student.firstName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#6a7282] text-[14px]">{student.lastName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#6a7282] text-[14px]">{student.email}</div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-[#e5e7eb] bg-[#fafafa] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}