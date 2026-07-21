import React, { useState } from 'react';
import { useSearchMentors } from '../hooks/useMentors';
import { UIError } from '../../sdk/v1/errors';


export function MentorSearch() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input to prevent excessive RPC calls
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // CQRS Query Hook
  const { data: mentors, isLoading, error } = useSearchMentors({
    search: debouncedSearch,
    page,
    pageSize: 10
  });

  return (
    <div className="space-y-6">
      {/* Accessible Search Input */}
      <div className="max-w-md relative">
        <label htmlFor="mentor-search" className="sr-only">Search Mentors</label>
        <input 
          id="mentor-search"
          type="search" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, or bio..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
          aria-describedby={error ? "search-error" : undefined}
        />
      </div>

      {/* Error Boundary */}
      {error && (
        <div id="search-error" className="text-sm text-red-600 font-medium" role="alert">
          {error instanceof UIError ? error.message : 'An unknown error occurred.'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-lg w-full" />
          ))}
        </div>
      )}

      {/* Results Grid */}
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mentors?.map((mentor) => (
          <li key={mentor.mentor_id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {mentor.first_name} {mentor.last_name}
                  </h3>
                  <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    ★ {mentor.average_rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{mentor.headline}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <button 
          disabled={!mentors || mentors.length < 10}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
