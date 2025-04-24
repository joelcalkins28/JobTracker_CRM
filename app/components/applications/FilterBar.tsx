'use client';

import { ApplicationStatus } from 'app/lib/types';

/**
 * Props for the FilterBar component
 */
interface FilterBarProps {
  statusFilter: ApplicationStatus | 'all';
  setStatusFilter: (status: ApplicationStatus | 'all') => void;
  sortBy: 'dateApplied' | 'company' | 'status';
  setSortBy: (field: 'dateApplied' | 'company' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

/**
 * Component for filtering and sorting job applications
 * Extracted from ApplicationList for reusability
 */
export default function FilterBar({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: FilterBarProps) {
  /**
   * Toggle sort order between ascending and descending
   */
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Change sort field and reset order to desc if field changes
   */
  const changeSortBy = (field: 'dateApplied' | 'company' | 'status') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            {Object.values(ApplicationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sorting */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => changeSortBy(e.target.value as 'dateApplied' | 'company' | 'status')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="dateApplied">Date Applied</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
            </select>
            <button
              type="button"
              onClick={toggleSortOrder}
              className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 