import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, LocationConfirmationProps } from './types';

function MapUpdater({ location }: { location: Location }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([location.lat, location.lng], 18);
  }, [location, map]);
  
  return null;
}

export function LocationConfirmation({ location, onLocationChange }: LocationConfirmationProps) {
  const markerIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const handleMarkerDrag = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    onLocationChange({
      ...location,
      lat: position.lat,
      lng: position.lng
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Confirm Location
      </p>
      <p className="text-sm text-gray-600">
        Drag the marker to adjust the exact location if needed
      </p>
      
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={18}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker
            position={[location.lat, location.lng]}
            draggable={true}
            icon={markerIcon}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          />
          <MapUpdater location={location} />
        </MapContainer>
      </div>
    </div>
  );
}