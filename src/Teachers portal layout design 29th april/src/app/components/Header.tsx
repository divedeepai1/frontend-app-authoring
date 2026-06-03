import { Bell, Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {title && (
        <div>
          <h2 className="text-[#101828] text-[18px] font-bold">{title}</h2>
          {subtitle && (
            <p className="text-[#6a7282] text-[14px] mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#f9fafb] transition-colors">
          <Bell className="w-5 h-5 text-[#364153]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#e5e7eb] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#27aae1] to-[#1e88c9] text-white text-[14px] font-semibold">
              SA
            </div>
          </div>
          <div className="text-left">
            <p className="text-[#101828] text-[14px] font-semibold leading-tight">Super Admin</p>
            <p className="text-[#6a7282] text-[12px] leading-tight">admin@compugrade.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#99A1AF] ml-1" />
        </div>
      </div>
    </header>
  );
}