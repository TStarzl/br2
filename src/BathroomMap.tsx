import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { Star } from 'lucide-react';
import BathroomCard from '@/components/ui/BathroomCard';
import L from 'leaflet';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjmaDA7_2XiHvlIlBokDLc3_wOE_2ZqqA",
  authDomain: "bathroom-finder-e51e0.firebaseapp.com",
  databaseURL: "https://bathroom-finder-e51e0-default-rtdb.firebaseio.com",
  projectId: "bathroom-finder-e51e0",
  storageBucket: "bathroom-finder-e51e0.firebasestorage.app",
  messagingSenderId: "169719086282",
  appId: "1:169719086282:web:c11f3709cecbd48fa00833",
  measurementId: "G-V7DP0ZJ82Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 13);
    });
  }, [map]);

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
    
    // Ensure coordinates are parsed as numbers
    const dataToSubmit = {
      ...formData,
      lat: Number(formData.lat),
      lng: -Math.abs(Number(formData.lng)), // Ensure longitude is negative for Western Hemisphere
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
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="wheelchair"
                className="mr-2"
                checked={formData.hasWheelchairAccess}
                onChange={(e) => setFormData({ ...formData, hasWheelchairAccess: e.target.checked })}
              />
              <label htmlFor="wheelchair" className="text-sm font-medium">Wheelchair Accessible</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="changingTables"
                className="mr-2"
                checked={formData.hasChangingTables}
                onChange={(e) => setFormData({ ...formData, hasChangingTables: e.target.checked })}
              />
              <label htmlFor="changingTables" className="text-sm font-medium">Has Changing Tables</label>
            </div>
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

// Main Map Component
export default function BathroomMap() {
  const [bathrooms, setBathrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const bathroomsRef = ref(database, 'bathrooms');
    
    const unsubscribe = onValue(bathroomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bathroomsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          lat: Number(value.lat),
          lng: -Math.abs(Number(value.lng)) // Ensure longitude is negative for Western Hemisphere
        }));
        setBathrooms(bathroomsList);
      } else {
        setBathrooms([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={[47.6062, -122.3321]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        
        {bathrooms.map((bathroom) => (
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
                lastReviewed={new Date().toLocaleDateString()} // You might want to add this to your database
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={() => setShowForm(true)}
        className="absolute top-4 right-4 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
      >
        Add Bathroom
      </button>

      {showForm && <AddBathroomForm onClose={() => setShowForm(false)} />}
    </div>
  );
}