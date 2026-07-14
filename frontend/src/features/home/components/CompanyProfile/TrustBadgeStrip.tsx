import { CheckCircle2 } from 'lucide-react';

export function TrustBadgeStrip() {
  const badges = [
    "ISO Process",
    "Verified Workforce",
    "PF & ESIC Compliance",
    "Safety First"
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-navy-700/50">
      <div className="w-full text-sm text-navy-300 font-medium mb-2">
        Trusted by Businesses Across India
      </div>
      {badges.map((badge) => (
        <div key={badge} className="flex items-center text-sm text-navy-100 bg-navy-800/50 px-3 py-1.5 rounded-full border border-navy-700/50">
          <CheckCircle2 size={16} className="text-orange-500 mr-2" />
          {badge}
        </div>
      ))}
    </div>
  );
}
