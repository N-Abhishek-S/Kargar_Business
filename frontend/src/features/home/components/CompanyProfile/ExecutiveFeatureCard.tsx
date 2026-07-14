import type { TrustCard } from './companyTrust';

export function ExecutiveFeatureCard({ card }: { card: TrustCard }) {
  const Icon = card.icon;

  return (
    <article className="group flex-1 flex items-center p-[24px] bg-[#FFFFFF] rounded-[16px] border border-[#F3F4F6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-250 ease-out hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
      
      {/* Decorative accent line on the right edge */}
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[4px] h-[40%] bg-[#A74423] rounded-l-full opacity-100" />

      {/* Icon 60px circle */}
      <div className="flex-shrink-0 w-[56px] h-[56px] rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#A74423] mr-[20px] transition-transform duration-250 ease-out group-hover:scale-105">
        <Icon size={24} strokeWidth={2} />
      </div>

      <div className="flex flex-col flex-1 pr-[20px]">
        <h4 className="text-[18px] font-[700] text-[#111827] mb-[4px]">{card.title}</h4>
        <p className="text-[14px] text-[#4B5563] leading-relaxed">
          {card.description ?? card.features.join(", ")}
        </p>
      </div>
      
    </article>
  );
}
