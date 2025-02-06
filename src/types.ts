// Basic location interface used across components
export interface Location {
    lat: number;
    lng: number;
    address?: string;
    distance?: number;
  }
  
  // Base bathroom interface
  export interface Bathroom {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    totalRating: number;
    ratingCount: number;
    rating?: number;
    hasWheelchairAccess: boolean;
    hasChangingTables: boolean;
    isGenderNeutral: boolean;
    requiresKey: boolean;
    hoursOfOperation: string;
    distance?: number;
    address?: string;
  }
  
  // Props for BathroomCard component
  export interface BathroomCardProps {
    name: string;
    distance?: string;
    rating?: number;
    hasWheelchairAccess: boolean;
    hasChangingTables: boolean;
    isGenderNeutral: boolean;
    requiresKey: boolean;
    hoursOfOperation: string;
    description: string;
    lastReviewed?: string;
    onNavigateClick?: () => void;
  }
  
  // Props for LocationSearch component
  export interface LocationSearchProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
  }
  
  // Props for LocationConfirmation component
  export interface LocationConfirmationProps {
    location: Location;
    onLocationChange: (newLocation: Location) => void;
  }
  
  // Props for BathroomSidebar component
  export interface BathroomSidebarProps {
    bathrooms: Bathroom[];
    userLocation: Location | null;
    isOpen: boolean;
    onClose: () => void;
    onBathroomSelect?: (bathroom: Bathroom) => void;
    onNavigateClick?: (bathroom: Bathroom) => void;
  }
  
  // Props for NavigationModal component
  export interface NavigationModalProps {
    bathroom: {
      name: string;
      lat: number;
      lng: number;
    };
    userLocation: Location | null;
    onClose: () => void;
  }
  
  // Props for FilterBar component
  export interface FilterBarProps {
    filters: {
      minRating: number;
      wheelchairAccess: boolean;
      changingTables: boolean;
    };
    onFilterChange: (filters: FilterBarProps['filters']) => void;
  }
  
  // Form data interface for AddBathroomForm
  export interface BathroomFormData {
    name: string;
    description: string;
    lat: string;
    lng: string;
    address: string;
    rating: number;
    ratingCount: number;
    totalRating: number;
    hasWheelchairAccess: boolean;
    hasChangingTables: boolean;
    isGenderNeutral: boolean;
    requiresKey: boolean;
    hoursOfOperation: string;
  }
  
  // Props for AddBathroomForm component
  export interface AddBathroomFormProps {
    onClose: () => void;
    initialLocation?: Location;
  }
  
  // Props for LocationMarker component
  export interface LocationMarkerProps {
    onLocationFound: (location: Location) => void;
  }