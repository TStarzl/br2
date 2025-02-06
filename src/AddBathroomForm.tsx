import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { X, Star, Loader, Clock } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { LocationConfirmation } from './LocationConfirmation';

import { BathroomFormData, AddBathroomFormProps } from './types';


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

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      address: location.address
    }));
    setShowLocationConfirmation(true);
  };

  const handleLocationAdjust = (newLocation: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      lat: newLocation.lat.toString(),
      lng: newLocation.lng.toString()
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
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="e.g., Central Park Restroom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={3}
              placeholder="Describe the location, condition, etc."
              required
            />
          </div>

          {/* Location Search and Confirmation */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              initialLocation={initialLocation}
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">Initial Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
                >
                  <Star
                    fill={star <= formData.rating ? "gold" : "none"}
                    color={star <= formData.rating ? "gold" : "gray"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Features</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasWheelchairAccess}
                onChange={(e) => setFormData({ ...formData, hasWheelchairAccess: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">♿ Wheelchair Access</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasChangingTables}
                onChange={(e) => setFormData({ ...formData, hasChangingTables: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">🚼 Changing Tables</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isGenderNeutral}
                onChange={(e) => setFormData({ ...formData, isGenderNeutral: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">⚧ Gender Neutral</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresKey}
                onChange={(e) => setFormData({ ...formData, requiresKey: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">🔑 Requires Key/Code</span>
            </label>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Hours of Operation</label>
            <div className="relative">
              <input
                type="text"
                value={formData.hoursOfOperation}
                onChange={(e) => setFormData({ ...formData, hoursOfOperation: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2 pl-8"
                placeholder="e.g., 24/7 or 9 AM - 5 PM"
              />
              <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Add Bathroom'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}