import { describe, test, expect, vi, beforeEach } from 'vitest';

const { mockApiClient } = vi.hoisted(() => {
  return {
    mockApiClient: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApiClient),
  },
}));
//axios mocked we inport apiService
import { apiService } from './apiService';

describe('apiService', () => {

  beforeEach(() => { 
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    test('should fetch current weather data successfully', async () => {
      const mockData = { name: 'Cannes', main: { temp: 15 } };
      
      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getCurrentWeather('Cannes');

      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledWith('/weather/current/Cannes');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    test('should handle server errors when fetching current weather', async () => {
      const errorMessage = 'City not found';
      //  404 error from the server
      mockApiClient.get.mockRejectedValue({ response: { status: 404, data: { message: errorMessage } } });

      // Aservice throws user-friendly error
      await expect(apiService.getCurrentWeather('InvalidCity')).rejects.toThrow(
        `Server error: 404 - ${errorMessage}`
      );
    });
  });

  describe('getFavorites', () => {
    test('should fetch favorites successfully', async () => {
      const mockData = { favorites: [{ id: 1, city_name: 'Kyoto' }] };
      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getFavorites();

      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledWith('/weather/favorites');
    });
  });

  describe('addFavorite', () => {
    test('should add a favorite city successfully', async () => {
      const mockData = { id: 2, city_name: 'Paris', country_code: 'FR' };
      mockApiClient.post.mockResolvedValue({ data: mockData });

      const result = await apiService.addFavorite('Paris', 'FR');

      expect(result).toEqual(mockData);
      expect(mockApiClient.post).toHaveBeenCalledWith('/weather/favorites', { city_name: 'Paris', country_code: 'FR' });
    });
  });

  describe('deleteFavorite', () => {
    test('should delete a favorite city successfully', async () => {
      const mockData = { message: 'Favorite removed successfully', id: 1 };
      mockApiClient.delete.mockResolvedValue({ data: mockData });

      const result = await apiService.deleteFavorite(1);

      expect(result).toEqual(mockData);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/weather/favorites/1');
    });
  });

  describe('getHistory', () => {
    test('should fetch history successfully', async () => {
      const mockData = { history: [{ id: 1, city_name: 'Cannes' }] };
      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getHistory();

      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledWith('/weather/history');
    });
  });

  describe('handleError', () => {
    test('should handle network errors correctly', async () => {
      // Simulate a network error where no response is received
      mockApiClient.get.mockRejectedValue({ request: {} });

      await expect(apiService.getCurrentWeather('AnyCity')).rejects.toThrow(
        'Network error: Unable to connect to server. Make sure the backend is running on port 5000.'
      );
    });

    test('should handle other generic request errors', async () => {
      const errorMessage = 'Something went wrong';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(apiService.getCurrentWeather('AnyCity')).rejects.toThrow(
        `Request error: ${errorMessage}`
      );
    });
  });
});

