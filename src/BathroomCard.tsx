// src/components/ui/BathroomCard.tsx
import React from 'react';
import { Navigation } from 'lucide-react';

interface BathroomCardProps {
  name: string;
  distance?: string;
  rating?: number;
  hasWheelchairAccess: boolean;
  hasChangingTables: boolean;
  lastReviewed: string;
  description: string;
  onNavigateClick?: () => void;
}

export function BathroomCard({
  name,
  distance,
  rating,
  hasWheelchairAccess,
  hasChangingTables,
  lastReviewed,
  description,
  onNavigateClick
}: BathroomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-primary">{name}</h3>
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-sm">
            {typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {hasWheelchairAccess && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            ♿ Wheelchair Access
          </span>
        )}
        {hasChangingTables && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            🚼 Changing Tables
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {distance && (
            <span className="text-gray-500">📍 {distance} away</span>
          )}
          {onNavigateClick && (
            <button
              onClick={onNavigateClick}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Navigation size={14} />
              <span>Directions</span>
            </button>
          )}
        </div>
        <span className="text-gray-500">Last reviewed: {lastReviewed}</span>
      </div>
    </div>
  );
}

export default BathroomCard;