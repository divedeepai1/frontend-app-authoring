import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'orange' | 'mint' | 'blue' | 'purple';
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue'
}: StatsCardProps) {
  const colorClasses = {
    orange: {
      bg: 'bg-[#FEF5E7]',
      iconColor: 'text-[#F97316]'
    },
    mint: {
      bg: 'bg-[#E8F8F5]',
      iconColor: 'text-[#10B981]'
    },
    blue: {
      bg: 'bg-[#EBF3FE]',
      iconColor: 'text-[#3B82F6]'
    },
    purple: {
      bg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#A855F7]'
    },
  };

  return (
    <div 
      className={`${colorClasses[color].bg} rounded-xl p-6 transition-all hover:shadow-md`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${colorClasses[color].iconColor}`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
      <div>
        <p className={`${colorClasses[color].iconColor} text-[14px] font-medium mb-2`}>
          {title}
        </p>
        <p className="text-[#101828] text-[36px] font-bold leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}