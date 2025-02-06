// src/components/map/BathroomMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Menu, Navigation } from 'lucide-react';

// Import our components
import { FilterBar } from './FilterBar';
import { LocationMarker } from './LocationMarker';
import { AddBathroomForm } from './AddBathroomForm';
import { BathroomSidebar } from './BathroomSidebar';
import { BathroomCard } from './BathroomCard';
import { NavigationModal } from './src/components/navigation/NavigationModal';
import { toiletIcon } from './src/utils/icons';
import { calculateDistance } from './src/utils/distance';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjmaDA7_2XiHvlIlBokDLc3_wOE_2ZqqA",
  authDomain: "bathroom-finder-e51e0.firebaseapp.com",
  projectId: "bathroom-finder-e51e0",
  storageBucket: "bathroom-finder-e51e0.appspot.com",
  messagingSenderId: "169719086282",
  appId: "1:169719086282:web:c11f3709cecbd48fa00833",
  measurementId: "G-V7DP0ZJ82Y",
  databaseURL: "https://bathroom-finder-e51e0-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * This component is rendered inside the MapContainer.
 * It uses the useMap hook to get the map instance and then calls the
 * setMapInstance callback passed from the parent.
 */
function SetMapInstance({ setMapInstance }: { setMapInstance: (map: any) => void }) {
  const map = useMap();
  React.useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

export default function BathroomMap() {
  const [bathrooms, setBathrooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBathroom, setSelectedBathroom] = useState<any>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    wheelchairAccess: false,
    changingTables: false,
  });
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    const bathroomsRef = ref(database, 'bathrooms');
    const unsubscribe = onValue(bathroomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bathroomsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          lat: Number(value.lat),
          // Ensure lng is negative (if needed for your region)
          lng: -Math.abs(Number(value.lng)),
        }));
        console.log("Fetched bathrooms:", bathroomsList);
        setBathrooms(bathroomsList);
      } else {
        setBathrooms([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filterBathrooms = (bathrooms: any[]) => {
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

  // This function flies the map to the selected bathroom.
  const flyToBathroom = (bathroom: any) => {
    if (mapInstance) {
      console.log("Flying to bathroom at:", bathroom.lat, bathroom.lng);
      mapInstance.flyTo([bathroom.lat, bathroom.lng], 16, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } else {
      console.log("Map instance not available");
    }
  };

  // This function opens the navigation modal for the given bathroom.
  const handleNavigateClick = (bathroom: any) => {
    setSelectedBathroom(bathroom);
    setShowNavigation(true);
  };

  return (
    <div className="h-screen w-full relative">
      {/* Filter Bar */}
      <div className="absolute top-4 left-16 right-20 z-[1001] flex justify-center">
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Main Map */}
      <MapContainer
        center={[47.6062, -122.3321]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationFound={setUserLocation} />
        {/* Set the map instance using our helper component */}
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
                hasWheelchairAccess={bathroom.hasWheelchairAccess || false}
                hasChangingTables={bathroom.hasChangingTables || false}
                isGenderNeutral={bathroom.isGenderNeutral || false}
                requiresKey={bathroom.requiresKey || false}
                hoursOfOperation={bathroom.hoursOfOperation || '24/7'}
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
                // In the Popup, clicking "Directions" opens the navigation modal.
                onNavigateClick={() => handleNavigateClick(bathroom)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Control Buttons */}
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

      {/* Sidebar for Bathrooms */}
      <BathroomSidebar
        bathrooms={filterBathrooms(bathrooms)}
        userLocation={userLocation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        // When a card is clicked (outside the Directions button), fly the map to that bathroom.
        onBathroomSelect={(bathroom) => {
          console.log("Selected bathroom for flyTo:", bathroom);
          flyToBathroom(bathroom);
          setIsSidebarOpen(false);
        }}
        // When the Directions button is clicked, open the navigation modal.
        onNavigateClick={(bathroom) => {
          handleNavigateClick(bathroom);
          setIsSidebarOpen(false);
        }}
      />

      {showForm && (
        <AddBathroomForm
          onClose={() => setShowForm(false)}
          initialLocation={userLocation}
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
