import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react';

export default function Reports() {
  const stats = [
    {
      id: 1,
      title: 'Total Classes',
      value: '24',
      icon: Users,
      color: '#27aae1',
      bgColor: '#E8F4F8',
    },
    {
      id: 2,
      title: 'Total Students',
      value: '486',
      icon: Users,
      color: '#F97316',
      bgColor: '#FFF4ED',
    },
    {
      id: 3,
      title: 'Active Courses',
      value: '12',
      icon: FileText,
      color: '#27576B',
      bgColor: '#EBF0F2',
    },
    {
      id: 4,
      title: 'Avg. Completion Rate',
      value: '78%',
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
  ];

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                    strokeWidth={2}
                  />
                </div>
              </div>
              <h3 className="text-[#6a7282] text-[13px] font-medium mb-2">
                {stat.title}
              </h3>
              <p
                className="text-[32px] font-semibold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Placeholder Message */}
      <div className="bg-[#E8F4F8] rounded-xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-[#27aae1] mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-[#27576B] text-[18px] font-semibold mb-2">
          Detailed Reports Coming Soon
        </h2>
        <p className="text-[#6a7282] text-[14px] max-w-md mx-auto">
          Advanced analytics, student progress tracking, and comprehensive reporting
          features will be available here.
        </p>
      </div>
    </div>
  );
}