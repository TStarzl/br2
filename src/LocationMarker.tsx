// src/components/map/LocationMarker.tsx
import React, { useEffect, useState } from 'react';
import { useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { Navigation } from 'lucide-react';

interface LocationMarkerProps {
  onLocationFound: (location: LatLng) => void;
}

export function LocationMarker({ onLocationFound }: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const map = useMap();

  useEffect(() => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
      watch: true, // Continuously watch position
      timeout: 10000 // 10 second timeout
    });
  }, [map]);

  const handleRetry = () => {
    setLocationError('');
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });
  };

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      onLocationFound(e.latlng);
      setLocationError('');
      map.flyTo(e.latlng, 16);
    },
    locationerror(e) {
      console.error("Error finding location:", e);
      setLocationError(
        e.code === 1 ? "Please enable location services to find bathrooms near you." :
        e.code === 2 ? "Unable to determine your location. Please try again." :
        "Location service timed out. Please try again."
      );
    },
  });

  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <Navigation className="w-5 h-5 mx-auto mb-2" />
              <p className="text-sm font-medium">You are here</p>
              <p className="text-xs text-gray-500">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-800 px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">{locationError}</p>
          <button
            onClick={handleRetry}
            className="text-sm font-medium text-red-800 hover:text-red-900 underline mt-1"
          >
            Try Again
          </button>
        </div>
      )}
    </>
  );
}

export default LocationMarker;