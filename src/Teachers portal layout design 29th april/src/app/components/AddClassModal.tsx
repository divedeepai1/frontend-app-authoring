import { useState, useEffect } from 'react';
import { X, Plus, UserPlus, Users, Link2, Upload, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface EditClass {
  id: number;
  name: string;
  grade: number;
  period: number;
  students: number;
  assignedCourses: string;
  status: 'Active' | 'Inactive';
}

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  editClass?: EditClass | null;
}

export default function AddClassModal({ isOpen, onClose, editClass }: AddClassModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [periodNumber, setPeriodNumber] = useState('');
  const [showAddTeachers, setShowAddTeachers] = useState(false);
  const [teacherEmails, setTeacherEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [addStudentMode, setAddStudentMode] = useState<'tiles' | 'single' | 'import'>('tiles');
  const [studentForm, setStudentForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [classPreferences, setClassPreferences] = useState({
    cantRedoLessons: false,
    enableScoreboard: false,
    disableAccountChanges: false,
    hidePauseButton: false,
    studentsChangePassword: false,
    showRestartButton: false
  });
  const [classMessage, setClassMessage] = useState('');

  // Pre-populate form when editing
  useEffect(() => {
    if (editClass) {
      setClassName(editClass.name);
      setGrade(editClass.grade.toString());
      setPeriodNumber(editClass.period.toString());
      // Parse assigned courses and select them
      const courses = editClass.assignedCourses.split(', ').map(course => {
        // Find matching course ID
        const found = coursesList.find(c => c.name === course);
        return found?.id || '';
      }).filter(id => id !== '');
      setSelectedCourses(courses);
    }
  }, [editClass]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setClassName('');
      setGrade('');
      setPeriodNumber('');
      setShowAddTeachers(false);
      setTeacherEmails([]);
      setEmailInput('');
      setAddStudentMode('tiles');
      setStudentForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
      setCsvFile(null);
      setSelectedCourses([]);
      setClassPreferences({
        cantRedoLessons: false,
        enableScoreboard: false,
        disableAccountChanges: false,
        hidePauseButton: false,
        studentsChangePassword: false,
        showRestartButton: false
      });
      setClassMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const coursesList = [
    { id: '1', name: 'LBD Google Docs - DiveDeepAI' },
    { id: '2', name: 'LBD Google Sheets - DiveDeepAI' },
    { id: '3', name: 'LBD Google Slides - DiveDeepAI' },
    { id: '4', name: 'Compugrade Tutorial: Getting Started' },
    { id: '5', name: 'Excel 365 (Free Trial)' },
    { id: '6', name: 'PowerPoint 365 (Free Trial)' },
    { id: '7', name: 'Word 365 – Level 1 (beta)' },
    { id: '8', name: 'DiveDeep (Free Trial)' },
    { id: '9', name: 'DiveDeep Word 365 (Free Trial)' },
  ];

  const courses = coursesList;

  const handleToggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const steps = [
    { id: 1, label: 'Class Details' },
    { id: 2, label: 'Add Students' },
    { id: 3, label: 'Assign Course(s)' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setClassName('');
    setGrade('');
    setPeriodNumber('');
    onClose();
  };

  const handleAddTeacher = () => {
    if (!emailInput.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (teacherEmails.includes(emailInput.trim())) {
      toast.error('This teacher has already been added');
      return;
    }
    
    setTeacherEmails([...teacherEmails, emailInput.trim()]);
    setEmailInput('');
    toast.success('Teacher added successfully');
  };

  const handleRemoveTeacher = (email: string) => {
    setTeacherEmails(teacherEmails.filter((teacherEmail) => teacherEmail !== email));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showAddTeachers ? (
                <button 
                  onClick={() => {
                    setShowAddTeachers(false);
                    setEmailInput('');
                  }}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-[#f9fafb] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#27aae1]" strokeWidth={2} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-[#27aae1] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              )}
              <div>
                <h3 className="text-[#101828] text-[16px] font-semibold">{editClass ? 'Edit Class' : 'Class Name'}</h3>
                <p className="text-[#6a7282] text-[13px]">{editClass ? `Update information for ${editClass.name}` : 'Create and configure your new class'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!showAddTeachers && (
                <button 
                  onClick={() => setShowAddTeachers(true)}
                  className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add More Teachers
                </button>
              )}
              <button onClick={handleCancel} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6a7282]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        {!showAddTeachers && (
          <div className="px-8 py-6 bg-white border-b border-[#e5e7eb]">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle and Label */}
                  <button 
                    onClick={() => setCurrentStep(step.id)}
                    className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > step.id 
                        ? 'bg-[#27aae1]' 
                        : currentStep === step.id 
                        ? 'bg-[#27aae1] ring-4 ring-[#27aae1]/20' 
                        : 'bg-[#e5e7eb] group-hover:bg-[#d1d5db]'
                    } transition-all duration-300`}>
                      <span className={`text-[14px] font-semibold ${
                        currentStep >= step.id ? 'text-white' : 'text-[#6a7282]'
                      }`}>
                        {step.id}
                      </span>
                    </div>
                    <span className={`mt-2 text-[12px] font-medium text-center ${
                      currentStep >= step.id ? 'text-[#27aae1]' : 'text-[#6a7282] group-hover:text-[#364153]'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 mb-6 ${
                      currentStep > step.id ? 'bg-[#27aae1]' : 'bg-[#e5e7eb]'
                    } transition-all duration-300`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Add More Teachers Section */}
          {showAddTeachers ? (
            <div className="p-6 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
              <h3 className="text-[#101828] text-[18px] font-semibold mb-4">Add More Teachers</h3>
              
              <div className="mb-4">
                <label className="block text-[#101828] text-[14px] font-semibold mb-2">
                  Email Address <span className="text-[#ef4444]">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2 w-full px-4 py-3 border border-[#d1d5db] rounded-lg bg-white">
                  {teacherEmails.map((email) => (
                    <span key={email} className="inline-flex items-center gap-1 px-3 py-1 bg-[#f0f4f8] text-[#101828] text-[14px] rounded-md">
                      {email}
                      <button
                        onClick={() => handleRemoveTeacher(email)}
                        className="ml-1 text-[#6a7282] hover:text-[#ef4444] transition-colors"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTeacher();
                      }
                    }}
                    className="flex-1 min-w-[200px] outline-none text-[14px] bg-transparent"
                    placeholder="Search by email..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddTeachers(false);
                    setEmailInput('');
                  }}
                  className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTeacher}
                  className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-[#101828] text-[18px] font-semibold">Class Details</h3>
                  
                  <div>
                    <label className="block text-[#101828] text-[14px] font-medium mb-2">
                      Class Name <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                      placeholder="Enter class name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[#101828] text-[14px] font-medium mb-2">
                        Grade<span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <label className="block text-[#101828] text-[14px] font-medium mb-2">
                        Period Number<span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={periodNumber}
                        onChange={(e) => setPeriodNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                        placeholder="Enter period number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {addStudentMode === 'tiles' && (
                    <>
                      <div>
                        <h3 className="text-[#101828] text-[18px] font-semibold mb-2">Add Students</h3>
                        <p className="text-[#6a7282] text-[14px]">Select how would you like to add new students to this class.</p>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <button 
                          onClick={() => setAddStudentMode('single')}
                          className="p-6 border-2 border-[#e5e7eb] rounded-xl hover:border-[#27aae1] hover:bg-[#f0f9ff] transition-all group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#f0f9ff] group-hover:bg-[#27aae1] flex items-center justify-center transition-colors">
                              <UserPlus className="w-6 h-6 text-[#27aae1] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <span className="text-[#101828] text-[14px] font-medium text-center">Add a Single Student</span>
                          </div>
                        </button>

                        <button 
                          disabled
                          className="p-6 border-2 border-[#e5e7eb] rounded-xl opacity-50 cursor-not-allowed"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#f0f9ff] flex items-center justify-center">
                              <Users className="w-6 h-6 text-[#6a7282]" strokeWidth={1.5} />
                            </div>
                            <span className="text-[#6a7282] text-[14px] font-medium text-center">Add Bulk Students</span>
                          </div>
                        </button>

                        <button 
                          disabled
                          className="p-6 border-2 border-[#e5e7eb] rounded-xl opacity-50 cursor-not-allowed"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#f0f9ff] flex items-center justify-center">
                              <Link2 className="w-6 h-6 text-[#6a7282]" strokeWidth={1.5} />
                            </div>
                            <span className="text-[#6a7282] text-[14px] font-medium text-center">Self-Joining Link</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => setAddStudentMode('import')}
                          className="p-6 border-2 border-[#e5e7eb] rounded-xl hover:border-[#27aae1] hover:bg-[#f0f9ff] transition-all group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#f0f9ff] group-hover:bg-[#27aae1] flex items-center justify-center transition-colors">
                              <Upload className="w-6 h-6 text-[#27aae1] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <span className="text-[#101828] text-[14px] font-medium text-center">Import List of Students</span>
                          </div>
                        </button>
                      </div>
                    </>
                  )}

                  {addStudentMode === 'single' && (
                    <div className="space-y-6">
                      <h3 className="text-[#2C5F6F] text-[20px] font-semibold mb-4">Add a Single Student to your class</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#101828] text-[14px] font-medium mb-2">
                            Student's Username <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentForm.username}
                            onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                            className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-[#101828] text-[14px] font-medium mb-2">
                            Student's Password <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="password"
                            value={studentForm.password}
                            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                            className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#101828] text-[14px] font-medium mb-2">
                            Student's First Name <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentForm.firstName}
                            onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                            className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-[#101828] text-[14px] font-medium mb-2">
                            Student's Last Name <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentForm.lastName}
                            onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                            className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#101828] text-[14px] font-medium mb-2">
                          Student Email Address <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            // Validate student form
                            if (!studentForm.username.trim()) {
                              toast.error('Please enter student username');
                              return;
                            }
                            if (!studentForm.password.trim()) {
                              toast.error('Please enter student password');
                              return;
                            }
                            if (!studentForm.firstName.trim()) {
                              toast.error('Please enter student first name');
                              return;
                            }
                            if (!studentForm.lastName.trim()) {
                              toast.error('Please enter student last name');
                              return;
                            }
                            if (!studentForm.email.trim()) {
                              toast.error('Please enter student email');
                              return;
                            }
                            
                            // Email validation
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(studentForm.email.trim())) {
                              toast.error('Please enter a valid email address');
                              return;
                            }
                            
                            // Handle add student logic
                            console.log('Add student:', studentForm);
                            toast.success('Student added successfully');
                            setAddStudentMode('tiles');
                            setStudentForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
                          }}
                          className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                        >
                          Add Student
                        </button>
                        <button
                          onClick={() => {
                            setAddStudentMode('tiles');
                            setStudentForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
                          }}
                          className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {addStudentMode === 'import' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[#2C5F6F] text-[20px] font-semibold">Import CSV file</h3>
                        <a href="#" className="text-[#27aae1] text-[14px] font-medium hover:underline">
                          Download CSV Template
                        </a>
                      </div>
                      
                      <div>
                        <label className="block text-[#101828] text-[14px] font-semibold mb-2">
                          Your file
                        </label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[14px] file:font-medium file:bg-[#f9fafb] file:text-[#364153] hover:file:bg-[#f3f4f6]"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            // Validate file selection
                            if (!csvFile) {
                              toast.error('Please select a CSV file to import');
                              return;
                            }
                            
                            // Validate file type
                            if (!csvFile.name.endsWith('.csv')) {
                              toast.error('Please select a valid CSV file');
                              return;
                            }
                            
                            // Handle CSV import logic
                            console.log('Import CSV:', csvFile.name);
                            toast.success('Students imported successfully from CSV');
                            setAddStudentMode('tiles');
                            setCsvFile(null);
                          }}
                          className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                        >
                          Add Students
                        </button>
                        <button
                          onClick={() => {
                            setAddStudentMode('tiles');
                            setCsvFile(null);
                          }}
                          className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[#101828] text-[18px] font-semibold mb-2">Assign Course(s)</h3>
                    <p className="text-[#6a7282] text-[14px]">Select the courses you want to assign to this class.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`relative p-6 border-2 rounded-xl transition-all group ${
                          selectedCourses.includes(course.id)
                            ? 'border-[#27aae1] bg-[#f0f9ff]'
                            : 'border-[#e5e7eb] bg-white hover:border-[#27aae1] hover:shadow-md'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="absolute top-4 right-4">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedCourses.includes(course.id)
                              ? 'bg-[#27aae1] border-[#27aae1]'
                              : 'bg-white border-[#d1d5db] group-hover:border-[#27aae1]'
                          }`}>
                            {selectedCourses.includes(course.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Course Icon */}
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${
                            selectedCourses.includes(course.id)
                              ? 'bg-[#27aae1]'
                              : 'bg-[#f0f9ff] group-hover:bg-[#27aae1]'
                          }`}>
                            <FileText className={`w-8 h-8 transition-colors ${
                              selectedCourses.includes(course.id)
                                ? 'text-white'
                                : 'text-[#27aae1] group-hover:text-white'
                            }`} strokeWidth={1.5} />
                          </div>

                          {/* Course Name */}
                          <span className="text-[#101828] text-[14px] font-medium leading-snug">
                            {course.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedCourses.length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-[#f0f9ff] border border-[#27aae1] rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-[#27aae1] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[12px] font-semibold">{selectedCourses.length}</span>
                      </div>
                      <p className="text-[#2C5F6F] text-[14px] font-medium">
                        {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!showAddTeachers && (
          <div className="px-8 py-4 border-t border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between">
            {(currentStep === 2) && (
              <button className="text-[#27aae1] text-[14px] font-medium hover:underline">
                Save Information for Later
              </button>
            )}
            {(currentStep !== 2) && <div />}
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep === 1 && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
                >
                  Cancel
                </button>
              )}
              {currentStep === 3 ? (
                <button
                  onClick={() => {
                    // Handle create/update class logic
                    if (editClass) {
                      console.log('Update class with all data', editClass.id);
                      toast.success('Class updated successfully!');
                    } else {
                      console.log('Create class with all data');
                      toast.success('Class created successfully!');
                    }
                    handleCancel();
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                >
                  {editClass ? 'Update Class' : 'Create Class'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-[#27aae1] text-white text-[14px] font-medium hover:bg-[#1e88c9] transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}