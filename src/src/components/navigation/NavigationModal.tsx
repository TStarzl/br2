import React, { useState, useEffect } from 'react';
import { Navigation, Map, X } from 'lucide-react';

interface NavigationModalProps {
  bathroom: {
    name: string;
    lat: number;
    lng: number;
  };
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  onClose: () => void;
}

export function NavigationModal({ bathroom, userLocation, onClose }: NavigationModalProps) {
  const [locationTimedOut, setLocationTimedOut] = useState(false);

  useEffect(() => {
    if (!userLocation) {
      const timer = setTimeout(() => {
        setLocationTimedOut(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  if (!userLocation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          {locationTimedOut ? (
            <p className="text-gray-600">
              Please enable location services to get directions.
            </p>
          ) : (
            <p className="text-gray-600">Fetching your location...</p>
          )}
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const destination = `${bathroom.lat},${bathroom.lng}`;
  const origin = `${userLocation.lat},${userLocation.lng}`;

  const navigationUrls = {
    google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`,
    apple: `maps://?saddr=${origin}&daddr=${destination}&dirflg=w`,
    waze: `https://waze.com/ul?ll=${destination}&navigate=yes&zoom=17`,
    here: `https://share.here.com/r/${destination}?ref=${origin}`,
    browser: `https://www.openstreetmap.org/directions?from=${origin}&to=${destination}`
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const walkingDistance = (calculateDistance(
    userLocation.lat,
    userLocation.lng,
    bathroom.lat,
    bathroom.lng
  ) * 1000).toFixed(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Get Directions</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{bathroom.name}</p>
        </div>

        <div className="p-4 space-y-3">
          {/* Primary Navigation Option based on platform */}
          {isIOS && !isStandalone && (
            <a
              href={navigationUrls.apple}
              className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span className="flex items-center gap-2">
                <Navigation size={20} />
                Open in Apple Maps
              </span>
              <Map size={20} />
            </a>
          )}

          <a
            href={navigationUrls.google}
            className={`flex items-center justify-between p-3 
              ${isAndroid ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} 
              rounded-lg hover:opacity-90`}
          >
            <span className="flex items-center gap-2">
              <Navigation size={20} />
              Open in Google Maps
            </span>
            <Map size={20} />
          </a>

          {/* Additional Navigation Options */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <a
              href={navigationUrls.waze}
              className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Open in Waze
            </a>
            <a
              href={navigationUrls.here}
              className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Open in HERE
            </a>
          </div>

          {/* Option to open in browser (using OpenStreetMap) */}
          <a
            href={navigationUrls.browser}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 mt-2"
          >
            Open in Browser
          </a>

          {/* Walking distance information */}
          <div className="text-sm text-gray-500 text-center mt-4">
            Walking distance: Approx. {walkingDistance}m
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full p-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavigationModal;