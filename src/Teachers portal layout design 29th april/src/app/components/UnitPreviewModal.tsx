import { X, Clock, PlayCircle, FileText, CheckCircle2, Award, BookOpen, Layers } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Unit {
  id: string;
  name: string;
}

interface UnitPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
}

export default function UnitPreviewModal({ isOpen, onClose, unit }: UnitPreviewModalProps) {
  if (!isOpen) return null;

  // Determine if it's a lesson or assessment based on name
  const isAssessment = unit?.name.toLowerCase().includes('assessment') || unit?.name.toLowerCase().includes('quiz') || unit?.name.toLowerCase().includes('test');
  const keyTitle = isAssessment ? 'Assessment Key' : 'Lesson Key';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-2xl w-full max-w-[1200px] shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#27aae1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-100">
              <BookOpen className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[#101828] text-[24px] font-bold tracking-tight">{unit?.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-[#64748b]">
                  <Clock className="w-4 h-4 text-[#27aae1]" />
                  <span className="text-[14px] font-medium">Estimated Time: 45-60 Minutes</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-[#f3f4f6] transition-all text-[#64748b] hover:text-[#101828]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-12 overflow-y-auto max-h-[calc(90vh-100px)] bg-gray-50/30">
          
          {/* Top Grid: Video & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lesson Video Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#27aae1] rounded-full" />
                <h3 className="text-[#27576B] text-[18px] font-bold">Lesson Video</h3>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#e5e7eb] bg-black group cursor-pointer shadow-md">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1553525302-38381e3e0c9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2UlMjB2aWRlbyUyMGxlc3NvbnMlMjBsYXB0b3B8ZW58MXx8fHwxNzc4NTc4NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Lesson Video Thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10">
                  <p className="text-white text-[13px] font-medium">Intro to Computer Systems - 08:45</p>
                </div>
              </div>
            </section>

            {/* Foundation & Certification Skills Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#27aae1] rounded-full" />
                <h3 className="text-[#27576B] text-[18px] font-bold">Foundation & Certification Skills</h3>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-cyan-50/50 border border-cyan-100">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#27aae1]" />
                    </div>
                    <div>
                      <h4 className="text-[#101828] text-[15px] font-bold mb-1">Industry Foundation</h4>
                      <p className="text-[#64748b] text-[13px] leading-relaxed">Core competency in hardware identification and operating system navigation essentials.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-[#E8F4F8] border border-[#27aae1]/20">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Layers className="w-6 h-6 text-[#27576B]" />
                    </div>
                    <div>
                      <h4 className="text-[#101828] text-[15px] font-bold mb-1">Certification Track: IC3 GS6</h4>
                      <p className="text-[#64748b] text-[13px] leading-relaxed">Direct alignment with Level 1 Digital Literacy requirements for hardware/software differentiation.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-[#364153] text-[11px] font-bold rounded-full uppercase tracking-wider">Technology Literacy</span>
                  <span className="px-3 py-1 bg-gray-100 text-[#364153] text-[11px] font-bold rounded-full uppercase tracking-wider">Critical Thinking</span>
                </div>
              </div>
            </section>
          </div>

          {/* Lesson/Assessment Key Section (Combined Instructions & Answer Key) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#27aae1] rounded-full" />
              <h3 className="text-[#27576B] text-[18px] font-bold">{keyTitle}</h3>
            </div>
            
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl overflow-hidden">
              <div className="p-6 border-b border-[#e5e7eb] bg-[#fcfcfc] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
                  <div>
                    <h3 className="text-[#27576B] text-[16px] font-bold">Graded Preview</h3>
                    <p className="text-[#64748b] text-[12px]">All correct answers are shown below for teacher review.</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-[#dcfce7] text-[#166534] text-[13px] font-bold rounded-full border border-[#bbf7d0]">
                  Score: 100/100
                </div>
              </div>

              <div className="p-8 space-y-10">
                {/* Step 1: Multiple Choice */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F4F8] border border-[#27aae1] flex items-center justify-center text-[#27aae1] text-[14px] font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h4 className="text-[#101828] text-[16px] font-bold mb-4">Which of the following is considered internal hardware?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['Monitor', 'CPU (Central Processing Unit)', 'Keyboard', 'Printer'].map((option, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${option === 'CPU (Central Processing Unit)' ? 'border-[#22c55e] bg-[#f0fdf4]' : 'border-gray-100 bg-gray-50/50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${option === 'CPU (Central Processing Unit)' ? 'bg-[#22c55e] border-[#22c55e]' : 'border-gray-300 bg-white'}`}>
                              {option === 'CPU (Central Processing Unit)' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-[14px] font-medium ${option === 'CPU (Central Processing Unit)' ? 'text-[#166534]' : 'text-[#64748b]'}`}>{option}</span>
                            {option === 'CPU (Central Processing Unit)' && <CheckCircle2 className="w-4 h-4 text-[#22c55e] ml-auto" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Fill in the Blank with Image */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F4F8] border border-[#27aae1] flex items-center justify-center text-[#27aae1] text-[14px] font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h4 className="text-[#101828] text-[16px] font-bold mb-4">Identify this component and state its primary role.</h4>
                      <div className="flex flex-col md:flex-row gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="w-full md:w-64 aspect-square rounded-xl overflow-hidden shadow-sm border border-white">
                          <ImageWithFallback 
                            src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3B1fHx8fHx8MTY0NjM1Njg3MQ&ixlib=rb-1.2.1&q=80&w=400"
                            alt="CPU Component"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide">Component Name</label>
                            <div className="px-4 py-3 bg-[#f0fdf4] border-b-2 border-[#22c55e] text-[#166534] font-bold text-[15px] rounded-t-lg">
                              Microprocessor / CPU
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide">Primary Role</label>
                            <div className="px-4 py-3 bg-[#f0fdf4] border-b-2 border-[#22c55e] text-[#166534] text-[14px] rounded-t-lg italic">
                              "The central hub that processes instructions and coordinates hardware performance."
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Short Answer Comparison */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F4F8] border border-[#27aae1] flex items-center justify-center text-[#27aae1] text-[14px] font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h4 className="text-[#101828] text-[16px] font-bold mb-4">Explain why an Operating System is necessary for a computer to function.</h4>
                      <div className="p-6 bg-[#f0fdf4] border-l-4 border-[#22c55e] rounded-r-2xl">
                        <p className="text-[#166534] text-[14px] leading-relaxed">
                          The operating system acts as the intermediary between the user and the hardware. Without it, application software cannot communicate with the processor or memory, and the user would have no interface to interact with the machine's resources.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Source Document vs Answer Key Comparison Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#27aae1] rounded-full" />
              <h3 className="text-[#27576B] text-[18px] font-bold">Document Comparison: Source vs Key</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Document */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#64748b]" />
                    <span className="text-[14px] font-bold text-[#364153]">Student Source Document</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#64748b] px-2 py-0.5 bg-gray-100 rounded">UNFILLED</span>
                </div>
                <div className="aspect-[3/4] bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm overflow-hidden p-6 space-y-6">
                  <div className="w-2/3 h-4 bg-gray-100 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-50 rounded-full" />
                    <div className="w-full h-3 bg-gray-50 rounded-full" />
                    <div className="w-4/5 h-3 bg-gray-50 rounded-full" />
                  </div>
                  <div className="w-full h-40 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-[#9ca3af] text-[12px] font-medium">IMAGE PLACEHOLDER</p>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="w-1/4 h-3 bg-gray-100 rounded-full" />
                        <div className="w-full h-10 bg-gray-50 rounded-lg border border-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Answer Key Document */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                    <span className="text-[14px] font-bold text-[#166534]">Master Answer Key</span>
                  </div>
                  <span className="text-[11px] font-bold text-white px-2 py-0.5 bg-[#22c55e] rounded">COMPLETED</span>
                </div>
                <div className="aspect-[3/4] bg-white rounded-2xl border-2 border-[#22c55e] shadow-md overflow-hidden p-6 space-y-6 relative">
                  <div className="w-2/3 h-4 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-100 rounded-full" />
                    <div className="w-full h-3 bg-gray-100 rounded-full" />
                    <div className="w-4/5 h-3 bg-gray-100 rounded-full" />
                  </div>
                  <div className="w-full h-40 bg-[#f0fdf4] rounded-xl border border-[#22c55e] overflow-hidden">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1700887944225-f148dd124305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGludGVyZmFjZSUyMGRvY3VtZW50JTIwY29tcGFyaXNvbnxlbnwxfHx8fDE3Nzg1Nzg0MzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Answer Key Doc Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="w-1/4 h-3 bg-gray-200 rounded-full" />
                        <div className="w-full h-10 bg-[#f0fdf4] rounded-lg border border-[#22c55e] flex items-center px-4">
                          <span className="text-[#166534] text-[12px] font-bold">Sample Correct Answer Text #{i}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none opacity-10">
                    <span className="text-[60px] font-black text-[#22c55e] whitespace-nowrap">ANSWER KEY</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-[#e5e7eb] bg-[#fafafa] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-[#27576B] text-white text-[15px] font-bold hover:bg-[#1e4555] transition-all shadow-lg shadow-[#27576B]/20"
          >
            Finished Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
