// src/services/apiService.ts
import axios, { type AxiosResponse } from 'axios';
import type { WeatherData, ForecastData, FavoriteCity, SearchHistoryItem } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// For this project, we'll hardcode the user ID. In a real app, this would
// come from an authentication context.
const USER_ID = '2';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': USER_ID,
  },
  timeout: 10000,
});

// With axios, the actual data is on the `data` property of the response.
const handleResponse = <T>(response: AxiosResponse<T>) => response.data;

const handleError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.request);
    throw new Error('Network error: Unable to connect to server. Make sure the backend is running on port 5000.');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error(`Request error: ${error.message}`);
  }
};


export const apiService = {
  getCurrentWeather: (city: string): Promise<WeatherData> => {
    return apiClient.get<WeatherData>(`/weather/current/${city}`).then(handleResponse).catch(handleError);
  },

  getForecast: (city: string): Promise<ForecastData> => {
    return apiClient.get<ForecastData>(`/weather/forecast/${city}`).then(handleResponse).catch(handleError);
  },

  getFavorites: (): Promise<{ favorites: FavoriteCity[] }> => {
    return apiClient.get<{ favorites: FavoriteCity[] }>('/weather/favorites').then(handleResponse).catch(handleError);
  },

  addFavorite: (city_name: string, country_code: string): Promise<FavoriteCity> => {
    return apiClient.post<FavoriteCity>('/weather/favorites', { city_name, country_code }).then(handleResponse).catch(handleError);
  },

  deleteFavorite: (id: number): Promise<{ message: string; id: number }> => {
    return apiClient.delete<{ message: string; id: number }>(`/weather/favorites/${id}`).then(handleResponse).catch(handleError);
  },

  getHistory: (): Promise<{ history: SearchHistoryItem[] }> => {
    return apiClient.get<{ history: SearchHistoryItem[] }>('/weather/history').then(handleResponse).catch(handleError);
  },
};
