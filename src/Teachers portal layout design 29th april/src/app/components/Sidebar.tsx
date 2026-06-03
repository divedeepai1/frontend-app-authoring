import { Users, BookOpen, FileText, FolderOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'manage-class-students', label: 'Manage Class & Students', icon: Users },
    { id: 'manage-course-curriculum', label: 'Manage Course & Curriculum', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'additional-resources', label: 'Additional Resources', icon: FolderOpen },
  ];

  return (
    <div className="w-72 h-screen bg-white border-r border-[#e5e7eb] flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Logo */}
      <div className="h-16 px-6 border-b border-[#e5e7eb] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#27aae1] rounded-lg flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <span className="text-[18px] font-bold text-[#101828]">Compugrade</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#27aae1] text-white'
                  : 'text-[#364153] hover:bg-[#f9fafb]'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.67} />
              <span className="text-[14px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}