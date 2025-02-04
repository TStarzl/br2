// src/components/map/FilterBar.tsx
import React from 'react';

interface FilterBarProps {
  filters: {
    minRating: number;
    wheelchairAccess: boolean;
    changingTables: boolean;
  };
  onFilterChange: (filters: FilterBarProps['filters']) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  // Helper function to generate rating stars
  const renderStars = (count: number) => "★".repeat(count);

  // Handle individual filter changes
  const handleRatingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      minRating: Number(event.target.value)
    });
  };

  const handleWheelchairChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      wheelchairAccess: event.target.checked
    });
  };

  const handleChangingTablesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      changingTables: event.target.checked
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      minRating: 0,
      wheelchairAccess: false,
      changingTables: false
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap gap-6 items-center">
        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="rating-filter" className="text-sm font-medium text-gray-700">
            Min Rating:
          </label>
          <select
            id="rating-filter"
            value={filters.minRating}
            onChange={handleRatingChange}
            className="rounded-md border border-gray-300 p-2 text-sm focus:ring-primary focus:border-primary"
          >
            <option value={0}>Any Rating</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {renderStars(rating)}
              </option>
            ))}
          </select>
        </div>

        {/* Accessibility Filters */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.wheelchairAccess}
              onChange={handleWheelchairChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              <span className="mr-1">♿</span>
              Wheelchair Access
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.changingTables}
              onChange={handleChangingTablesChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              <span className="mr-1">🚼</span>
              Changing Tables
            </span>
          </label>
        </div>

        {/* Clear Filters Button */}
        {(filters.minRating > 0 || filters.wheelchairAccess || filters.changingTables) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;