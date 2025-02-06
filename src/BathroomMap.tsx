import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Menu, Navigation } from 'lucide-react';

import { FilterBar } from './FilterBar';
import { LocationMarker } from './LocationMarker';
import { AddBathroomForm } from './AddBathroomForm';
import { BathroomSidebar } from './BathroomSidebar';
import { BathroomCard } from './BathroomCard';
import { NavigationModal } from './NavigationModal';
import { toiletIcon } from './src/utils/icons';
import { calculateDistance } from './src/utils/distance';
import { Bathroom, Location } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function SetMapInstance({ setMapInstance }: { setMapInstance: (map: any) => void }) {
  const map = useMap();
  React.useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

export default function BathroomMap() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBathroom, setSelectedBathroom] = useState<Bathroom | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    wheelchairAccess: false,
    changingTables: false,
  });

  useEffect(() => {
    const bathroomsRef = ref(database, 'bathrooms');
    const unsubscribe = onValue(bathroomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bathroomsList = Object.entries(data).map(([id, value]) => ({
          id,
          name: (value as any).name || '',
          description: (value as any).description || '',
          lat: Number((value as any).lat),
          lng: Number((value as any).lng),
          totalRating: (value as any).totalRating || 0,
          ratingCount: (value as any).ratingCount || 0,
          hasWheelchairAccess: Boolean((value as any).hasWheelchairAccess),
          hasChangingTables: Boolean((value as any).hasChangingTables),
          isGenderNeutral: Boolean((value as any).isGenderNeutral),
          requiresKey: Boolean((value as any).requiresKey),
          hoursOfOperation: (value as any).hoursOfOperation || '24/7',
          address: (value as any).address || ''
        }));
        setBathrooms(bathroomsList);
      } else {
        setBathrooms([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filterBathrooms = (bathrooms: Bathroom[]) => {
    return bathrooms.filter((bathroom) => {
      const rating = bathroom.totalRating / bathroom.ratingCount;
      return (
        rating >= filters.minRating &&
        (!filters.wheelchairAccess || bathroom.hasWheelchairAccess) &&
        (!filters.changingTables || bathroom.hasChangingTables)
      );
    });
  };

  const handleRecenterMap = () => {
    if (mapInstance && userLocation) {
      mapInstance.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  };

  const flyToBathroom = (bathroom: Bathroom) => {
    if (mapInstance) {
      mapInstance.flyTo([bathroom.lat, bathroom.lng], 16, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  const handleNavigateClick = (bathroom: Bathroom) => {
    setSelectedBathroom(bathroom);
    setShowNavigation(true);
  };

  const handleLocationFound = (location: Location) => {
    setUserLocation(location);
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-16 right-20 z-[1001] flex justify-center">
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      <MapContainer
        center={[47.6062, -122.3321]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationFound={handleLocationFound} />
        <SetMapInstance setMapInstance={setMapInstance} />
        
        {filterBathrooms(bathrooms).map((bathroom) => (
          <Marker
            key={bathroom.id}
            position={[bathroom.lat, bathroom.lng]}
            icon={toiletIcon}
          >
            <Popup>
              <BathroomCard
                name={bathroom.name}
                description={bathroom.description}
                rating={bathroom.totalRating / bathroom.ratingCount}
                hasWheelchairAccess={bathroom.hasWheelchairAccess}
                hasChangingTables={bathroom.hasChangingTables}
                isGenderNeutral={bathroom.isGenderNeutral}
                requiresKey={bathroom.requiresKey}
                hoursOfOperation={bathroom.hoursOfOperation}
                lastReviewed={new Date().toLocaleDateString()}
                distance={
                  userLocation
                    ? `${calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        bathroom.lat,
                        bathroom.lng
                      ).toFixed(2)}km`
                    : undefined
                }
                onNavigateClick={() => handleNavigateClick(bathroom)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[1001] bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      <button
        onClick={() => setShowForm(true)}
        className="absolute top-4 right-4 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
      >
        Add Bathroom
      </button>

      {userLocation && (
        <button
          onClick={handleRecenterMap}
          className="absolute bottom-8 right-4 z-[1001] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          aria-label="Recenter map"
        >
          <Navigation size={24} />
        </button>
      )}

      <BathroomSidebar
        bathrooms={filterBathrooms(bathrooms).map(bathroom => ({
          ...bathroom,
          distance: userLocation ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            bathroom.lat,
            bathroom.lng
          ) : undefined
        }))}
        userLocation={userLocation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onBathroomSelect={(bathroom) => {
          flyToBathroom(bathroom);
          setIsSidebarOpen(false);
        }}
        onNavigateClick={(bathroom) => {
          handleNavigateClick(bathroom);
          setIsSidebarOpen(false);
        }}
      />

      {showForm && (
        <AddBathroomForm
          onClose={() => setShowForm(false)}
          initialLocation={userLocation ? {
            lat: userLocation.lat,
            lng: userLocation.lng
          } : undefined}
        />
      )}

      {showNavigation && selectedBathroom && (
        <NavigationModal
          bathroom={selectedBathroom}
          userLocation={userLocation}
          onClose={() => {
            setShowNavigation(false);
            setSelectedBathroom(null);
          }}
        />
      )}
    </div>
  );
}