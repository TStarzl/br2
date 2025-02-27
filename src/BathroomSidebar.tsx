// src/components/map/BathroomSidebar.tsx
import React, { useState, useMemo } from 'react';
import { X, ArrowUpDown, Search } from 'lucide-react';
import { BathroomCard } from './BathroomCard';

import { Bathroom, BathroomSidebarProps } from './types';
type SortOption = 'distance' | 'rating' | 'name';

export function BathroomSidebar({
  bathrooms,
  userLocation,
  isOpen,
  onClose,
  onBathroomSelect,
  onNavigateClick,
}: BathroomSidebarProps) {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedAndFilteredBathrooms = useMemo(() => {
    let processed = bathrooms
      .map(bathroom => ({
        ...bathroom,
        rating: bathroom.totalRating / bathroom.ratingCount,
      }))
      .filter(bathroom =>
        bathroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bathroom.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

    switch (sortBy) {
      case 'distance':
        return processed.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      case 'rating':
        return processed.sort((a, b) => b.rating - a.rating);
      case 'name':
        return processed.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return processed;
    }
  }, [bathrooms, sortBy, searchQuery]);

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  // Instead of searching for the map instance here, simply call the callback.
  const handleBathroomClick = (bathroom: Bathroom) => {
    onBathroomSelect?.(bathroom);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        z-[1000] w-80 flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nearby Bathrooms</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search bathrooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="p-2 border-b">
        <div className="flex gap-2">
          <SortButton
            active={sortBy === 'distance'}
            onClick={() => handleSortChange('distance')}
            disabled={!userLocation}
          >
            Distance
          </SortButton>
          <SortButton
            active={sortBy === 'rating'}
            onClick={() => handleSortChange('rating')}
          >
            Rating
          </SortButton>
          <SortButton
            active={sortBy === 'name'}
            onClick={() => handleSortChange('name')}
          >
            Name
          </SortButton>
        </div>
      </div>

      {/* Bathroom List */}
      <div className="flex-1 overflow-y-auto">
        {sortedAndFilteredBathrooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No bathrooms match your search' : 'No bathrooms found'}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sortedAndFilteredBathrooms.map((bathroom) => (
              <div
                key={bathroom.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBathroomClick(bathroom)}
              >
                <BathroomCard
                  name={bathroom.name}
                  description={bathroom.description}
                  rating={bathroom.rating}
                  hasWheelchairAccess={bathroom.hasWheelchairAccess}
                  hasChangingTables={bathroom.hasChangingTables}
                  isGenderNeutral={bathroom.isGenderNeutral || false}
                  requiresKey={bathroom.requiresKey || false}
                  hoursOfOperation={bathroom.hoursOfOperation || '24/7'}
                  lastReviewed={new Date().toLocaleDateString()}
                  distance={bathroom.distance ? `${bathroom.distance.toFixed(2)}km` : undefined}
                  onNavigateClick={() => onNavigateClick?.(bathroom)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-gray-50 border-t text-sm text-gray-500 text-center">
        {sortedAndFilteredBathrooms.length} bathrooms found
      </div>
    </div>
  );
}

function SortButton({
  children,
  active,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 px-3 py-1 rounded-md text-sm font-medium
        transition-colors flex items-center justify-center gap-1
        ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
      {active && <ArrowUpDown size={14} />}
    </button>
  );
}

export default BathroomSidebar;
