// src/components/map/BathroomMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
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

export default function BathroomMap() {
  const [bathrooms, setBathrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBathroom, setSelectedBathroom] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    wheelchairAccess: false,
    changingTables: false
  });

  useEffect(() => {
    const bathroomsRef = ref(database, 'bathrooms');
    
    const unsubscribe = onValue(bathroomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bathroomsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          lat: Number(value.lat),
          lng: -Math.abs(Number(value.lng))
        }));
        setBathrooms(bathroomsList);
      } else {
        setBathrooms([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const filterBathrooms = (bathrooms) => {
    return bathrooms.filter(bathroom => {
      const rating = bathroom.totalRating / bathroom.ratingCount;
      return (
        rating >= filters.minRating &&
        (!filters.wheelchairAccess || bathroom.hasWheelchairAccess) &&
        (!filters.changingTables || bathroom.hasChangingTables)
      );
    });
  };

  const handleRecenterMap = () => {
    const map = document.querySelector('.leaflet-container')?._leafletMap;
    if (map && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  };

  const handleNavigateClick = (bathroom) => {
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
                lastReviewed={new Date().toLocaleDateString()}
                distance={userLocation ? 
                  `${calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    bathroom.lat, 
                    bathroom.lng
                  ).toFixed(2)}km` : undefined}
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

      {/* Modals and Overlays */}
      <BathroomSidebar
        bathrooms={filterBathrooms(bathrooms)}
        userLocation={userLocation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onBathroomSelect={(bathroom) => {
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