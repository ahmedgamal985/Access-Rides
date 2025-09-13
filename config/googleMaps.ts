// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBvOkBwv9yTZ4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4';

// Google Maps API URLs
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  region: 'US',
  language: 'en',
};

// Google Places API Configuration
export const PLACES_API_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  language: 'en',
  types: 'establishment',
  components: 'country:us',
};

// Google Geocoding API Configuration
export const GEOCODING_API_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  language: 'en',
  region: 'us',
};
