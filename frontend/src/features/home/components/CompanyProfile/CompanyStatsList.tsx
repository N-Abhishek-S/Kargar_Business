import { Users, Building2, MapPin, Clock } from 'lucide-react';

export function CompanyStatsList() {
  const stats = [
    { icon: Users, value: "150+", label: "Expert Workforce" },
    { icon: Building2, value: "100+", label: "Happy Clients" },
    { icon: MapPin, value: "25+", label: "Cities Covered" },
    { icon: Clock, value: "10+", label: "Years of Excellence" },
  ];

  return (
    <div className="w-full h-auto sm:h-[110px] bg-[#FFFFFF] rounded-[16px] border border-[#F3F4F6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between px-[40px] py-[24px] sm:py-0 gap-[24px] sm:gap-0 mt-auto transition-transform hover:-translate-y-[2px]">
      
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="flex flex-row items-center gap-[16px] flex-1 justify-start sm:justify-center w-full sm:w-auto relative group">
            
            <div className="flex-shrink-0 w-[48px] h-[48px] rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#A74423] transition-transform group-hover:scale-105">
              <Icon size={24} strokeWidth={2} />
            </div>

            <div className="flex flex-col items-start">
              <span className="text-[28px] font-[800] text-[#111827] leading-none mb-[4px]">{stat.value}</span>
              <span className="text-[14px] text-[#6B7280] font-[500] leading-none">{stat.label}</span>
            </div>

            {/* Separator line for all but the last item (desktop only) */}
            {idx < stats.length - 1 && (
              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[40px] bg-[#E5E7EB]" />
            )}
          </div>
        );
      })}

    </div>
  );
}
