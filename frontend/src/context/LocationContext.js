import React, { createContext, useState, useContext, useCallback } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    // Check if the Geolocation API is supported by the browser
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // Don't use a cached position
    };

    // This is the core function that triggers the browser's permission prompt
    navigator.geolocation.getCurrentPosition(
      // Success Callback: This runs if the user clicks "Allow".
      // It's now an async function to handle the reverse geocoding API call.
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse Geocoding with Nominatim API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error('Reverse geocoding request failed');
          }
          const data = await response.json();
          
          // Set the full location object, including address details
          setLocation({
            latitude,
            longitude,
            address: data.address,
          });
        } catch (reverseGeocodeError) {
          console.error("Reverse geocoding failed:", reverseGeocodeError);
          // Fallback: still provide coordinates even if address lookup fails
          setLocation({ latitude, longitude, address: null });
          setError('Could not fetch address details for your location.');
        } finally {
          setIsLoading(false);
        }
      },
      // Error Callback: This runs if the user clicks "Block" or an error occurs
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('You denied the request for Geolocation.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location is unavailable. Please enable location services on your device.');
            break;
          case err.TIMEOUT:
            setError('Request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
        setIsLoading(false);
      },
      options
    );
  }, []);

  const value = { location, isLoading, error, getLocation };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};