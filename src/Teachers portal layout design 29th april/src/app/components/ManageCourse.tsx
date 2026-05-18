import { ChevronDown, ChevronRight, BookOpen, Eye, Clock, ListChecks, Calendar } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import AddResourcesModal from './AddResourcesModal';
import ScheduleAccessModal from './ScheduleAccessModal';
import LessonTimerModal from './LessonTimerModal';
import SetupAttemptsModal from './SetupAttemptsModal';
import GradebookModal from './GradebookModal';
import UnitPreviewModal from './UnitPreviewModal';
import { toast } from 'sonner';

interface Unit {
  id: string;
  name: string;
}

interface Subsection {
  id: string;
  name: string;
  units?: Unit[];
  hasExpand?: boolean;
}

interface Section {
  id: string;
  name: string;
  subsections: Subsection[];
}

const mockCourseData: Section[] = [
  {
    id: 'section-1',
    name: 'Section',
    subsections: [
      {
        id: 'be-publishing',
        name: 'B.E. Publishing',
        hasExpand: true,
        units: [
          { id: 'unit-1-1', name: 'Unit 1.1 Word 1.1' },
          { id: 'unit-1-2', name: 'Unit 1.2 Word 1.2' },
          { id: 'unit-1-3', name: 'Unit 1.3 Word 1.3' },
          { id: 'unit-1-4', name: 'Unit 1.4 Word 1.4' },
          { id: 'unit-1-5', name: 'Unit 1.5 Word 1.5' },
          { id: 'unit-1-6', name: 'Unit 1.6 Word 1.6' },
          { id: 'unit-1-7', name: 'Unit 1.7 Word 1.7' },
          { id: 'unit-1-8', name: 'Unit 1.8 Word 1.8' },
          { id: 'unit-1-9', name: 'Unit 1.9 Word 1.9' },
          { id: 'unit-2-33', name: 'Unit 2.33 Unit' },
          { id: 'unit-2-34', name: 'Unit 2.34 Unit' },
          { id: 'unit-2-35', name: 'Unit 2.35 Unit' },
          { id: 'unit-2-36', name: 'Unit 2.36 Unit' },
        ],
      },
      {
        id: 'course-builder',
        name: 'Course Builder Sandbox',
        hasExpand: true,
        units: [
          { id: 'unit-3-1', name: 'Unit 3.1 Unit' },
          { id: 'unit-3-2', name: 'Unit 3.2 Unit' },
          { id: 'unit-3-3', name: 'Unit 3.3 Unit' },
          { id: 'unit-3-4', name: 'Unit 3.4 Unit' },
          { id: 'unit-3-5', name: 'Unit 3.5 trail' },
        ],
      },
      {
        id: 'subsection-1',
        name: 'Subsection',
        hasExpand: true,
      },
    ],
  },
  {
    id: 'section-2',
    name: 'Section',
    subsections: [],
  },
  {
    id: 'testing',
    name: 'testing',
    subsections: [
      {
        id: 'lesson-testing',
        name: 'lesson testing',
        hasExpand: true,
      },
    ],
  },
];

const mockClasses = [
  { id: '1', name: 'arooj' },
  { id: '2', name: 'Test Class Csv Import' },
  { id: '3', name: 'Test Class Taimoor' },
];

const mockCourses = [
  { id: '1', name: 'LBD WORD 365 - DiveDeepAI' },
  { id: '2', name: 'LBD Google Docs - DiveDeepAI' },
  { id: '3', name: 'LBD Google Sheets - DiveDeepAI' },
  { id: '4', name: 'Excel 365 (Free Trial)' },
];

export default function ManageCourse() {
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'section-1': true,
    'be-publishing': true,
  });
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({
    'be-publishing': true,
  });
  const [isAddResourcesModalOpen, setIsAddResourcesModalOpen] = useState(false);
  const [isScheduleAccessModalOpen, setIsScheduleAccessModalOpen] = useState(false);
  const [isLessonTimerModalOpen, setIsLessonTimerModalOpen] = useState(false);
  const [isSetupAttemptsModalOpen, setIsSetupAttemptsModalOpen] = useState(false);
  const [isGradebookModalOpen, setIsGradebookModalOpen] = useState(false);
  const [isUnitPreviewModalOpen, setIsUnitPreviewModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ unit: Unit; subsection: Subsection } | null>(null);
  const [previewUnit, setPreviewUnit] = useState<Unit | null>(null);
  const [timerUnit, setTimerUnit] = useState<{ unit: Unit; subsection: Subsection } | null>(null);
  const [attemptsUnit, setAttemptsUnit] = useState<{ unit: Unit; subsection: Subsection } | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSubsection = (subsectionId: string) => {
    setExpandedSubsections(prev => ({
      ...prev,
      [subsectionId]: !prev[subsectionId],
    }));
  };

  const handleUploadResource = (uploadType: string, file: File | null) => {
    if (file) {
      const typeLabels: Record<string, string> = {
        'general-resource': 'General Resource',
        'upload-by-class': 'Resource by Class',
        'upload-by-course': 'Resource by Course',
      };
      toast.success(`${typeLabels[uploadType]} "${file.name}" uploaded successfully!`);
    }
    setIsAddResourcesModalOpen(false);
  };

  const handleScheduleAccess = (unit: Unit, subsection: Subsection) => {
    setSelectedUnit({ unit, subsection });
    setIsScheduleAccessModalOpen(true);
  };

  const handleSetupTimer = (unit: Unit, subsection: Subsection) => {
    setTimerUnit({ unit, subsection });
    setIsLessonTimerModalOpen(true);
  };

  const handleSetupAttempts = (unit: Unit, subsection: Subsection) => {
    setAttemptsUnit({ unit, subsection });
    setIsSetupAttemptsModalOpen(true);
  };

  const selectedCourseData = mockCourses.find(c => c.id === selectedCourse);

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#27aae1] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[#101828] text-[16px] font-semibold">Manage Course & Curriculum</h3>
              <p className="text-[#6a7282] text-[13px]">Configure course content and curriculum structure</p>
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-[#364153] text-[14px] font-medium whitespace-nowrap">
              Select Class:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent min-w-[200px]"
            >
              {mockClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[#364153] text-[14px] font-medium whitespace-nowrap">
              Select Course:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent min-w-[250px]"
            >
              {mockCourses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Content Header */}
      <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
        <h2 className="text-[#27576B] text-[20px] font-semibold">
          {selectedCourseData?.name || 'LBD WORD 365 - DiveDeepAI'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGradebookModalOpen(true)}
            className="px-5 py-2.5 rounded-lg border border-[#27aae1] text-[#27aae1] text-[14px] font-medium hover:bg-[#E8F4F8] transition-colors"
          >
            View Gradebook
          </button>
        </div>
      </div>

      {/* Add Resources Modal */}
      <AddResourcesModal
        isOpen={isAddResourcesModalOpen}
        onClose={() => setIsAddResourcesModalOpen(false)}
        onUpload={handleUploadResource}
      />

      {/* Schedule Access Modal */}
      <ScheduleAccessModal
        isOpen={isScheduleAccessModalOpen}
        onClose={() => setIsScheduleAccessModalOpen(false)}
        unit={selectedUnit?.unit}
        subsection={selectedUnit?.subsection}
      />

      {/* Lesson Timer Modal */}
      <LessonTimerModal
        isOpen={isLessonTimerModalOpen}
        onClose={() => setIsLessonTimerModalOpen(false)}
        unit={timerUnit?.unit}
        subsection={timerUnit?.subsection}
      />

      {/* Setup Attempts Modal */}
      <SetupAttemptsModal
        isOpen={isSetupAttemptsModalOpen}
        onClose={() => setIsSetupAttemptsModalOpen(false)}
        unit={attemptsUnit?.unit}
        subsection={attemptsUnit?.subsection}
      />

      {/* Gradebook Modal */}
      <GradebookModal
        isOpen={isGradebookModalOpen}
        onClose={() => setIsGradebookModalOpen(false)}
        courseName={selectedCourseData?.name}
      />

      {/* Unit Preview Modal */}
      <UnitPreviewModal
        isOpen={isUnitPreviewModalOpen}
        onClose={() => setIsUnitPreviewModalOpen(false)}
        unit={previewUnit}
      />

      {/* Course Structure Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#E8F4F8] border-b border-[#e5e7eb]">
              <th className="px-6 py-4 text-left">
                <span className="text-[#6a7282] text-[11px] font-semibold uppercase tracking-wide">
                  Course Structure
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
            {mockCourseData.map((section) => (
              <React.Fragment key={section.id}>
                {/* Section Row */}
                <tr className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4" colSpan={2}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2"
                    >
                      {expandedSections[section.id] ? (
                        <ChevronDown className="w-4 h-4 text-[#27576B]" strokeWidth={2} />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#27576B]" strokeWidth={2} />
                      )}
                      <span className="text-[#27576B] text-[15px] font-semibold">{section.name}</span>
                    </button>
                  </td>
                </tr>

                {/* Subsections */}
                {expandedSections[section.id] && section.subsections.map((subsection) => (
                  <React.Fragment key={subsection.id}>
                    {/* Subsection Row */}
                    <tr className="hover:bg-[#f9fafb] transition-colors bg-[#fafafa]">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSection(subsection.id)}
                          className="flex items-center gap-2 pl-6"
                        >
                          {expandedSections[subsection.id] ? (
                            <ChevronDown className="w-4 h-4 text-[#364153]" strokeWidth={2} />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#364153]" strokeWidth={2} />
                          )}
                          <span className="text-[#364153] text-[14px] font-medium">• {subsection.name}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {subsection.hasExpand && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[#27aae1] text-[13px] font-medium">Expand subsection</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubsection(subsection.id);
                              }}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                expandedSubsections[subsection.id] ? 'bg-[#27aae1]' : 'bg-[#d1d5db]'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                  expandedSubsections[subsection.id] ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Units */}
                    {expandedSections[subsection.id] && expandedSubsections[subsection.id] && subsection.units && subsection.units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4 pl-20" colSpan={2}>
                          <div className="flex items-center justify-between">
                            <span className="text-[#364153] text-[14px] font-medium">{unit.name}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setPreviewUnit(unit);
                                  setIsUnitPreviewModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-[#E8F4F8] text-[#27aae1] flex items-center justify-center hover:bg-[#27aae1] hover:text-white transition-all shadow-sm"
                                title="Preview Unit"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSetupTimer(unit, subsection)}
                                className="w-8 h-8 rounded-lg bg-[#f0f9ff] text-[#0ea5e9] flex items-center justify-center hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm"
                                title="Setup Timer"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSetupAttempts(unit, subsection)}
                                className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#f97316] flex items-center justify-center hover:bg-[#f97316] hover:text-white transition-all shadow-sm"
                                title="Setup Attempts"
                              >
                                <ListChecks className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleScheduleAccess(unit, subsection)}
                                className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#22c55e] flex items-center justify-center hover:bg-[#22c55e] hover:text-white transition-all shadow-sm"
                                title="Schedule Access"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}