import { BadgeCheck, Clock, ShieldCheck, Users } from 'lucide-react';

export function ReviewTrustBar() {
  const trustItems = [
    {
      icon: <BadgeCheck className="text-(--text-accent)" size={24} />,
      title: 'Verified Clients',
      description: 'Trusted by 500+ businesses',
    },
    {
      icon: <Users className="text-(--text-accent)" size={24} />,
      title: 'Trained Professionals',
      description: 'Well-trained & background verified',
    },
    {
      icon: <ShieldCheck className="text-(--text-accent)" size={24} />,
      title: 'Quality Assured',
      description: 'Consistent quality every time',
    },
    {
      icon: <Clock className="text-(--text-accent)" size={24} />,
      title: 'Timely & Reliable',
      description: 'Always on time, every time',
    },
  ];

  return (
    <div className="w-full bg-(--surface-primary) rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-12 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 sm:px-6 transition-transform duration-300 hover:-translate-y-1 group"
          >
            <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors">
              {item.icon}
            </div>
            <div>
              <h4 className="text-(--text-primary) font-bold text-[15px] mb-0.5">
                {item.title}
              </h4>
              <p className="text-(--text-muted) text-[13px] leading-tight">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
