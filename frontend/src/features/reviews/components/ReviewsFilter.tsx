import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ReviewListParams } from '@/services/reviews.service';

export interface ReviewsFilterProps {
  onFilterChange: (params: ReviewListParams) => void;
  className?: string;
}

export function ReviewsFilter({ onFilterChange, className = '' }: ReviewsFilterProps) {
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = useCallback(
    (newSearch: string, newRating: string, newSort: string) => {
      const params: ReviewListParams = { fetchAll: true };
      
      if (newSearch) params.search = newSearch;
      if (newRating) params.rating = parseInt(newRating, 10);
      if (newSort) params.sortBy = newSort as 'featured' | 'newest' | 'rating';

      if (newSort === 'featured' && !newSearch && !newRating) {
        params.featured = true;
      }

      onFilterChange(params);
    },
    [onFilterChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    applyFilters(val, rating, sortBy);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRating(val);
    applyFilters(search, val, sortBy);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    applyFilters(search, rating, val);
  };

  const clearFilters = () => {
    setSearch('');
    setRating('');
    setSortBy('featured');
    applyFilters('', '', 'featured');
  };

  const hasActiveFilters = search || rating || sortBy !== 'featured';

  return (
    <div className={`w-full max-w-screen-2xl mx-auto px-[clamp(24px,4vw,80px)] mt-4 mb-8 ${className}`}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 transition-all duration-300">
        
        {/* Mobile Header / Desktop Main Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Search Input (Takes up most space) */}
          <div className="w-full sm:flex-1 max-w-2xl">
            <Input
              placeholder="Search reviews by company, name, or keyword..."
              value={search}
              onChange={handleSearchChange}
              leftIcon={<Search className="h-5 w-5" />}
              className="h-12 text-base rounded-xl"
            />
          </div>

          {/* Mobile Toggle for Filters */}
          <div className="flex w-full sm:w-auto gap-3 sm:hidden">
            <Button 
              variant="outline" 
              onClick={() => { setIsExpanded(!isExpanded); }}
              className="flex-1 h-12 rounded-xl"
              leftIcon={<SlidersHorizontal size={18} />}
            >
              Filters
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-12 px-4 rounded-xl text-gray-500"
                aria-label="Clear filters"
              >
                <X size={20} />
              </Button>
            )}
          </div>

          {/* Desktop Filters (Always visible on SM and up) */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="w-40">
              <Select
                value={rating}
                onChange={handleRatingChange}
                options={[
                  { label: 'All Ratings', value: '' },
                  { label: '5 Stars', value: '5' },
                  { label: '4 Stars', value: '4' },
                  { label: '3 Stars', value: '3' },
                ]}
                className="h-12 rounded-xl border-gray-200 font-medium"
                aria-label="Filter by rating"
              />
            </div>
            <div className="w-44">
              <Select
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { label: 'Featured First', value: 'featured' },
                  { label: 'Newest First', value: 'newest' },
                  { label: 'Highest Rated', value: 'rating' },
                ]}
                className="h-12 rounded-xl border-gray-200 font-medium"
                aria-label="Sort reviews"
              />
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Mobile Expanded Filters */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-4 pt-2 border-t border-gray-100">
            <Select
              label="Rating"
              value={rating}
              onChange={handleRatingChange}
              options={[
                { label: 'All Ratings', value: '' },
                { label: '5 Stars', value: '5' },
                { label: '4 Stars', value: '4' },
                { label: '3 Stars', value: '3' },
              ]}
              className="h-12 rounded-xl"
            />
            <Select
              label="Sort By"
              value={sortBy}
              onChange={handleSortChange}
              options={[
                { label: 'Featured First', value: 'featured' },
                { label: 'Newest First', value: 'newest' },
                { label: 'Highest Rated', value: 'rating' },
              ]}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
