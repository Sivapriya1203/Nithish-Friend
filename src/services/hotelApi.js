import { SEED_HOTELS } from '../data/seedHotels.js';

const STORAGE_KEY = 'hotel_explorer_hotels_v1';

/**
 * Backend Integration Configuration
 * Switch USE_REMOTE_API to true when connecting to the Node.js + Express + PostgreSQL server.
 * Expected Express endpoints:
 *   GET    /api/hotels
 *   POST   /api/hotels        (multipart/form-data with image file + fields)
 *   PUT    /api/hotels/:id    (multipart/form-data or JSON)
 *   DELETE /api/hotels/:id
 */
const API_CONFIG = {
  baseUrl: '/api/hotels',
  useRemoteApi: false,
};

function readStoredHotels() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HOTELS));
      return [...SEED_HOTELS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HOTELS));
      return [...SEED_HOTELS];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read hotels from localStorage:', error);
    return [...SEED_HOTELS];
  }
}

function writeStoredHotels(hotels) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  } catch (error) {
    console.error('Failed to persist hotels to localStorage:', error);
    throw new Error(
      'Unable to save hotel changes in browser storage. Please use a smaller image file.'
    );
  }
}

function buildHotelFormData(hotelInput) {
  const formData = new FormData();
  formData.append('title', hotelInput.title);
  formData.append('description', hotelInput.description);
  formData.append('latitude', String(hotelInput.latitude));
  formData.append('longitude', String(hotelInput.longitude));
  formData.append('price', String(hotelInput.price));
  if (hotelInput.imageFile instanceof File) {
    formData.append('image', hotelInput.imageFile);
  } else if (hotelInput.imageUrl) {
    formData.append('imageUrl', hotelInput.imageUrl);
  }
  return formData;
}

export async function fetchHotels() {
  if (API_CONFIG.useRemoteApi) {
    const response = await fetch(API_CONFIG.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to load hotels from server.');
    }
    return response.json();
  }
  return readStoredHotels();
}

export async function createHotel(hotelInput) {
  if (API_CONFIG.useRemoteApi) {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      body: buildHotelFormData(hotelInput),
    });
    if (!response.ok) {
      throw new Error('Failed to create hotel on server.');
    }
    return response.json();
  }

  const hotels = readStoredHotels();
  const newHotel = {
    id: `hotel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: hotelInput.title.trim(),
    description: hotelInput.description.trim(),
    latitude: Number(hotelInput.latitude),
    longitude: Number(hotelInput.longitude),
    price: Number(hotelInput.price),
    imageUrl: hotelInput.imageUrl,
    createdAt: new Date().toISOString(),
  };

  const updatedHotels = [newHotel, ...hotels];
  writeStoredHotels(updatedHotels);
  return newHotel;
}

export async function updateHotel(hotelId, hotelInput) {
  if (API_CONFIG.useRemoteApi) {
    const response = await fetch(`${API_CONFIG.baseUrl}/${encodeURIComponent(hotelId)}`, {
      method: 'PUT',
      body: buildHotelFormData(hotelInput),
    });
    if (!response.ok) {
      throw new Error('Failed to update hotel on server.');
    }
    return response.json();
  }

  const hotels = readStoredHotels();
  const existingIndex = hotels.findIndex((item) => item.id === hotelId);
  if (existingIndex === -1) {
    throw new Error('Hotel listing could not be found.');
  }

  const updatedHotel = {
    ...hotels[existingIndex],
    title: hotelInput.title.trim(),
    description: hotelInput.description.trim(),
    latitude: Number(hotelInput.latitude),
    longitude: Number(hotelInput.longitude),
    price: Number(hotelInput.price),
    imageUrl: hotelInput.imageUrl,
    updatedAt: new Date().toISOString(),
  };

  const updatedHotels = hotels.map((item) => (item.id === hotelId ? updatedHotel : item));
  writeStoredHotels(updatedHotels);
  return updatedHotel;
}

export async function deleteHotel(hotelId) {
  if (API_CONFIG.useRemoteApi) {
    const response = await fetch(`${API_CONFIG.baseUrl}/${encodeURIComponent(hotelId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete hotel on server.');
    }
    return true;
  }

  const hotels = readStoredHotels();
  const updatedHotels = hotels.filter((item) => item.id !== hotelId);
  writeStoredHotels(updatedHotels);
  return true;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}
