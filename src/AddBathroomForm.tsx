import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { X, Star, Loader, Clock } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { LocationConfirmation } from './LocationConfirmation';
import { BathroomFormData, AddBathroomFormProps, Location } from './types';

export function AddBathroomForm({ onClose, initialLocation }: AddBathroomFormProps) {
  const [formData, setFormData] = useState<BathroomFormData>({
    name: '',
    description: '',
    lat: initialLocation?.lat.toString() || '',
    lng: initialLocation?.lng.toString() || '',
    address: '',
    rating: 5,
    ratingCount: 1,
    totalRating: 5,
    hasWheelchairAccess: false,
    hasChangingTables: false,
    isGenderNeutral: false,
    requiresKey: false,
    hoursOfOperation: '24/7'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showLocationConfirmation, setShowLocationConfirmation] = useState(false);

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => ({
      ...prev,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      address: location.address
    }));
    setShowLocationConfirmation(true);
  };

  const handleLocationAdjust = (newLocation: Location) => {
    setFormData(prev => ({
      ...prev,
      lat: newLocation.lat.toString(),
      lng: newLocation.lng.toString(),
      address: newLocation.address
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.lat || !formData.lng) return "Location is required";
    if (isNaN(Number(formData.lat)) || isNaN(Number(formData.lng))) {
      return "Invalid coordinates";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    const database = getDatabase();
    const bathroomsRef = ref(database, 'bathrooms');
    
    const dataToSubmit = {
      ...formData,
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      rating: Number(formData.rating),
      ratingCount: 1,
      totalRating: Number(formData.rating),
      createdAt: new Date().toISOString()
    };

    try {
      await push(bathroomsRef, dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error adding bathroom:", error);
      setError("Failed to add bathroom. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Bathroom</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Form fields remain the same ... */}
          
          {/* Location Search and Confirmation */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              initialLocation={initialLocation ? {
                lat: initialLocation.lat,
                lng: initialLocation.lng,
                address: 'Current Location'
              } : undefined}
            />
            {showLocationConfirmation && formData.lat && formData.lng && (
              <div className="mt-4">
                <LocationConfirmation
                  location={{
                    lat: Number(formData.lat),
                    lng: Number(formData.lng),
                    address: formData.address
                  }}
                  onLocationChange={handleLocationAdjust}
                />
              </div>
            )}
          </div>

          {/* Rest of the form fields... */}
          
        </form>
      </div>
    </div>
  );
}