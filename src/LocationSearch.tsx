import React, { useState, useEffect } from 'react';
import { Search, Loader, MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
  distance?: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationSearch({ onLocationSelect, initialLocation }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation ? {
      lat: initialLocation.lat,
      lng: initialLocation.lng,
      address: 'Current Location'
    } : null
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        console.log('Location access denied or unavailable');
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const params = new URLSearchParams({
        format: 'json',
        q: searchTerm,
        countrycodes: 'us',
        limit: '5',
        addressdetails: '1'
      });

      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lng.toString());
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`
      );
      
      const data = await response.json();
      
      if (data && data[0]) {
        let location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name
        };

        if (userLocation) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            location.lat,
            location.lng
          );
          location = { ...location, distance };
        }

        setSelectedLocation(location);
        onLocationSelect(location);
      } else {
        setErrorMessage('No location found. Please try a different search term.');
      }
    } catch (err) {
      setErrorMessage('Error searching location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a location or place..."
          className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-label="Search location"
        />
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={18} 
        />
        {isLoading ? (
          <Loader 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-primary" 
            size={18} 
          />
        ) : (
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Search"
          >
            <MapPin size={18} />
          </button>
        )}
      </div>
      
      {errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {selectedLocation && (
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-sm text-gray-600 truncate">{selectedLocation.address}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
            {selectedLocation.distance && (
              <p className="text-xs text-gray-500">
                {selectedLocation.distance.toFixed(1)} km away
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}