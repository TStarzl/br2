import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { Star, Menu, X, Navigation } from 'lucide-react';
import BathroomCard from '@/components/ui/BathroomCard';
import L from 'leaflet';

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

// Filter Bar Component
function FilterBar({ filters, onFilterChange }) {
  return (
    <div className="bg-white p-2 rounded-lg shadow-md flex gap-4 items-center">
      {/* Minimum Rating Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Min Rating:</label>
        <select 
          value={filters.minRating}
          onChange={(e) => onFilterChange({ ...filters, minRating: Number(e.target.value) })}
          className="rounded-md border border-gray-300 p-1"
        >
          <option value={0}>Any</option>
          <option value={1}>★</option>
          <option value={2}>★★</option>
          <option value={3}>★★★</option>
          <option value={4}>★★★★</option>
          <option value={5}>★★★★★</option>
        </select>
      </div>

      {/* Amenities Filters */}
      <div className="flex gap-3">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.wheelchairAccess}
            onChange={(e) => onFilterChange({ ...filters, wheelchairAccess: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">♿ Wheelchair Access</span>
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.changingTables}
            onChange={(e) => onFilterChange({ ...filters, changingTables: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">🚼 Changing Tables</span>
        </label>
      </div>
    </div>
  );
}

// Utility function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Create custom icon for markers
const toiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 22V20C8 19 9 18 11 18H13C15 18 16 19 16 20V22" />
      <path d="M6 18H18" />
      <path d="M12 4C13.1046 4 14 4.89543 14 6V12H10V6C10 4.89543 10.8954 4 12 4Z" />
      <path d="M16 12H8" />
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// Location finder component
function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });
  }, [map]);

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, 16);
    },
    locationerror(e) {
      console.error("Error finding location:", e);
      alert("Unable to find your location. Please enable location services.");
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here!</Popup>
    </Marker>
  );
}

// Add Bathroom Form Component
function AddBathroomForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    rating: 5,
    ratingCount: 1,
    totalRating: 5,
    hasWheelchairAccess: false,
    hasChangingTables: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bathroomsRef = ref(database, 'bathrooms');
    
    const dataToSubmit = {
      ...formData,
      lat: Number(formData.lat),
      lng: -Math.abs(Number(formData.lng)),
      rating: Number(formData.rating),
      ratingCount: 1,
      totalRating: Number(formData.rating)
    };

    try {
      await push(bathroomsRef, dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error adding bathroom:", error);
      alert("Error adding bathroom. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Add New Bathroom</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Latitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Longitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasWheelchairAccess}
                onChange={(e) => setFormData({ ...formData, hasWheelchairAccess: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">♿ Wheelchair Access</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasChangingTables}
                onChange={(e) => setFormData({ ...formData, hasChangingTables: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">🚼 Changing Tables</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add Bathroom
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sidebar Component
function BathroomSidebar({ bathrooms, userLocation, isOpen, onClose }) {
  const sortedBathrooms = bathrooms
    .map(bathroom => ({
      ...bathroom,
      distance: userLocation 
        ? calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            bathroom.lat, 
            bathroom.lng
          )
        : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-[1000] w-80 overflow-y-auto`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nearby Bathrooms</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        {sortedBathrooms.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bathrooms found</p>
        ) : (
          <div className="space-y-4">
            {sortedBathrooms.map(bathroom => (
              <BathroomCard
                key={bathroom.id}
                name={bathroom.name}
                description={bathroom.description}
                rating={bathroom.totalRating / bathroom.ratingCount}
                hasWheelchairAccess={bathroom.hasWheelchairAccess || false}
                hasChangingTables={bathroom.hasChangingTables || false}
                lastReviewed={new Date().toLocaleDateString()}
                distance={userLocation ? 
                  `${bathroom.distance.toFixed(2)}km` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Map Component
export default function BathroomMap() {
  const [bathrooms, setBathrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  return (
    <div className="h-screen w-full relative">
      {/* Add FilterBar at the top */}
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
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[1001] bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
      >
        <Menu size={24} />
      </button>

      {/* Add Bathroom Button */}
      <button
        onClick={() => setShowForm(true)}
        className="absolute top-4 right-4 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
      >
        Add Bathroom
      </button>

      {/* Recenter Button */}
      {userLocation && (
        <button
          onClick={() => {
            const map = document.querySelector('.leaflet-container')?._leafletMap;
            if (map) {
              map.flyTo([userLocation.lat, userLocation.lng], 16);
            }
          }}
          className="absolute bottom-8 right-4 z-[1001] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        >
          <Navigation size={24} />
        </button>
      )}

      {/* Sidebar */}
      <BathroomSidebar
        bathrooms={filterBathrooms(bathrooms)}
        userLocation={userLocation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {showForm && <AddBathroomForm onClose={() => setShowForm(false)} />}
    </div>
  );
}