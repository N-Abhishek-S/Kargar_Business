import CountUpModule from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Star, ShieldCheck, Users, Briefcase } from 'lucide-react';
import { useReviewStats } from '@/features/reviews/hooks';

// Handle dynamic import of react-countup correctly
const CountUp =
  typeof CountUpModule === 'function'
    ? CountUpModule
    : (CountUpModule as unknown as { default: typeof CountUpModule }).default;

export function ReviewStats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const statsQuery = useReviewStats({ enabled: inView });

  const averageRating = statsQuery.data?.averageRating ?? 4.9;
  const totalReviews = statsQuery.data?.totalReviews ?? 200;

  return (
    <div 
      ref={ref} 
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-12 mb-8 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60" aria-hidden="true" />
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Rating Stat */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <div className="flex gap-1 mb-3 text-orange-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24} fill="currentColor" />
            ))}
          </div>
          <div className="text-4xl font-extrabold text-navy-900 mb-1 flex items-baseline gap-1">
            {inView ? <CountUp end={averageRating} decimals={1} duration={2} /> : averageRating}
            <span className="text-xl text-gray-400 font-medium">/5</span>
          </div>
          <p className="text-gray-500 font-medium">Average Rating</p>
        </div>

        {/* Verified Reviews Stat */}
        <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <div className="text-4xl font-extrabold text-navy-900 mb-1 flex items-baseline gap-1">
            {inView ? <CountUp end={totalReviews} duration={2.5} /> : totalReviews}
            <span className="text-orange-500">+</span>
          </div>
          <p className="text-gray-500 font-medium">Verified Reviews</p>
        </div>

        {/* Projects Completed Stat */}
        <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Briefcase size={24} />
          </div>
          <div className="text-4xl font-extrabold text-navy-900 mb-1 flex items-baseline gap-1">
            {inView ? <CountUp end={500} duration={2} /> : '0'}
            <span className="text-orange-500">+</span>
          </div>
          <p className="text-gray-500 font-medium">Projects Completed</p>
        </div>

        {/* Enterprise Clients Stat */}
        <div className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <div className="text-4xl font-extrabold text-navy-900 mb-1 flex items-baseline gap-1">
            {inView ? <CountUp end={50} duration={2.5} /> : '0'}
            <span className="text-orange-500">+</span>
          </div>
          <p className="text-gray-500 font-medium">Enterprise Clients</p>
        </div>

      </div>
    </div>
  );
}
