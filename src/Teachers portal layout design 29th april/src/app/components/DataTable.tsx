import { Eye, Edit, Trash2, School as SchoolIcon } from 'lucide-react';

interface School {
  id: number;
  name: string;
  email: string;
  district: string;
  type: 'High' | 'Middle' | 'Elementary';
  principal: {
    name: string;
    phone: string;
  };
  students: number;
  teachers: number;
  status: 'Active' | 'Inactive';
}

const mockSchools: School[] = [
  {
    id: 1,
    name: 'Lincoln High School',
    email: 'lincoln@district.edu',
    district: 'Oakland District',
    type: 'High',
    principal: { name: 'Dr. James Wilson', phone: '(555) 123-4567' },
    students: 1250,
    teachers: 65,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Washington Middle School',
    email: 'washington@district.edu',
    district: 'Oakland District',
    type: 'Middle',
    principal: { name: 'Ms. Sarah Martinez', phone: '(555) 234-5678' },
    students: 890,
    teachers: 48,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Jefferson Elementary',
    email: 'jefferson@district.edu',
    district: 'Springfield District',
    type: 'Elementary',
    principal: { name: 'Mr. Robert Chen', phone: '(555) 345-6789' },
    students: 620,
    teachers: 32,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Roosevelt Academy',
    email: 'roosevelt@district.edu',
    district: 'Oakland District',
    type: 'High',
    principal: { name: 'Dr. Emily Roberts', phone: '(555) 455-7890' },
    students: 1450,
    teachers: 78,
    status: 'Active',
  },
];

export default function DataTable() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'High':
        return 'bg-[#D1E7F8] text-[#1E88E5]';
      case 'Middle':
        return 'bg-[#B2EBF2] text-[#00838F]';
      case 'Elementary':
        return 'bg-[#C5E1A5] text-[#558B2F]';
      default:
        return 'bg-[#E0E0E0] text-[#616161]';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Table Header */}
      <div className="p-6 border-b border-[#e5e7eb] bg-[#E8F4F8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#27aae1] rounded-lg flex items-center justify-center">
            <SchoolIcon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[#101828] text-[16px] font-semibold">All Schools</h3>
            <p className="text-[#6a7282] text-[13px]">Manage and monitor school information</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                School Name
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Principal
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Teachers
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-[#6a7282] text-[11px] font-semibold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {mockSchools.map((school, index) => (
              <tr key={school.id} className={`border-b border-[#e5e7eb] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} hover:bg-[#f9fafb] transition-colors`}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-[#101828] text-[14px] font-medium">{school.name}</div>
                    <div className="text-[#6a7282] text-[13px]">{school.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#364153] text-[14px]">{school.district}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium ${getTypeColor(school.type)}`}>
                    {school.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-[#101828] text-[14px] font-medium">{school.principal.name}</div>
                    <div className="text-[#6a7282] text-[13px]">{school.principal.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#364153] text-[14px]">{school.students.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#364153] text-[14px]">{school.teachers}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#10B981] text-[14px] font-medium">
                    {school.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-[#27aae1] hover:text-[#1e88c9] transition-colors">
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <button className="text-[#6a7282] hover:text-[#364153] transition-colors">
                      <Edit className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <button className="text-[#ef4444] hover:text-[#dc2626] transition-colors">
                      <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between bg-[#fafafa]">
        <div className="text-[#6a7282] text-[13px]">
          Showing 4 of 4 schools
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-[#6a7282] text-[13px] font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-[#6a7282] text-[13px] font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}