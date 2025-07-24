import request from "supertest"
import app from "../src/app"
import { weatherService } from "../src/services/weatherService"
import { weatherController } from "../src/controllers/weatherController"
import type { WeatherData } from "../src/types"


jest.mock("../src/services/weatherService")
const mockedWeatherService = weatherService as jest.Mocked<typeof weatherService>
const mockNotFoundError = { status: 404, message: "city not found" }

//Create a reusable, complete mock object
// This object satisfies the full WeatherData interface. We'll use it as a base.
const BASE_MOCK_WEATHER_DATA: WeatherData = {
  coord: { lon: 0, lat: 0 },
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  base: "stations",
  main: {
    temp: 20,
    feels_like: 20,
    temp_min: 18,
    temp_max: 22,
    pressure: 1012,
    humidity: 50,
  },
  visibility: 10000,
  wind: { speed: 5, deg: 180 },
  clouds: { all: 0 },
  dt: 1661870400,
  sys: {
    type: 1,
    id: 9000,
    country: "XX", 
    sunrise: 1661834187,
    sunset: 1661882248,
  },
  timezone: 0,
  id: 12345,
  name: "Default City",
  cod: 200,
}

describe("Weather API Endpoints", () => {
  beforeEach(() => {
    weatherController._resetState()
    jest.clearAllMocks()
  })

  describe("GET /api/weather/current/:city", () => {
    test("should return 200 and weather data for a valid city", async () => {
      // Use the base mock and override only what's needed
      const mockTokyoData = {
        ...BASE_MOCK_WEATHER_DATA,
        name: "Tokyo",
        sys: {
          ...BASE_MOCK_WEATHER_DATA.sys,
          country: "JP",
        },
      }
      mockedWeatherService.fetchCurrentWeather.mockResolvedValue(mockTokyoData)

      const response = await request(app).get("/api/weather/current/Tokyo")

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockTokyoData)
    })

    test("should return 404 if the city is NOT found", async () => {
      mockedWeatherService.fetchCurrentWeather.mockRejectedValue(mockNotFoundError)
      const response = await request(app).get("/api/weather/current/Narnia")
      expect(response.status).toBe(404)
    })
  })

  describe("GET /api/weather/forecast/:city", () => {
    test("should return 200 and forecast data for a valid city", async () => {
      const mockForecastData = {
        list: [
          { dt: 1661871600, main: { temp: 22.8 } },
          { dt: 1661958000, main: { temp: 21.5 } },
        ],
        city: { name: "Tokyo" },
      }
      mockedWeatherService.fetchWeatherForecast.mockResolvedValue(mockForecastData as any)

      const response = await request(app).get("/api/weather/forecast/Tokyo")

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockForecastData)
      expect(mockedWeatherService.fetchWeatherForecast).toHaveBeenCalledWith("Tokyo")
    })

    test("should return 404 if the city is NOT found", async () => {
      mockedWeatherService.fetchWeatherForecast.mockRejectedValue(mockNotFoundError)
      const response = await request(app).get("/api/weather/forecast/Narnia")
      expect(response.status).toBe(404)
      expect(response.body).toEqual({ message: "city not found" })
    })
  })

  describe("Favorites Endpoints", () => {
    test("POST /favorites - should create a new favorite and return it", async () => {
      const newFavoritePayload = { city_name: "Kyoto", country_code: "JP" }
      const response = await request(app).post("/api/weather/favorites").send(newFavoritePayload)
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id", 1)
      expect(response.body).toHaveProperty("city_name", "Kyoto")
    })

    test("GET /favorites - should return an array of favorite city objects", async () => {
      await request(app).post("/api/weather/favorites").send({ city_name: "Kyoto", country_code: "JP" })
      const response = await request(app).get("/api/weather/favorites")
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("favorites")
      const favoritesList = response.body.favorites
      expect(favoritesList).toHaveLength(1)
      expect(favoritesList[0].city_name).toBe("Kyoto")
      expect(favoritesList[0]).toHaveProperty("id")
    })

    test("DELETE /favorites/:id - should remove a favorite city by its ID", async () => {
      const postResponse = await request(app)
        .post("/api/weather/favorites")
        .send({ city_name: "Tokyo", country_code: "JP" })
      const newFavoriteId = postResponse.body.id

      const deleteResponse = await request(app).delete(`/api/weather/favorites/${newFavoriteId}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body).toEqual({
        message: "Favorite removed successfully",
        id: newFavoriteId,
      })

      const getResponse = await request(app).get("/api/weather/favorites")
      expect(getResponse.body.favorites).toHaveLength(0)
    })
  })

  describe("GET /api/weather/history", () => {
    test("should return a list of previously searched cities", async () => {
      // Use the same  for the history test 
      const mockParisData = {
        ...BASE_MOCK_WEATHER_DATA,
        name: "Paris",
        sys: {
          ...BASE_MOCK_WEATHER_DATA.sys,
          country: "FR",
        },
      }
      mockedWeatherService.fetchCurrentWeather.mockResolvedValue(mockParisData)

      await request(app).get("/api/weather/current/Paris")
      const historyResponse = await request(app).get("/api/weather/history")

      expect(historyResponse.status).toBe(200)
      const historyItem = historyResponse.body.history[0]
      expect(historyItem.city_name).toBe("Paris")
      expect(historyItem.country_code).toBe("FR")
      expect(historyItem.weather_data).toEqual(mockParisData)
    })

    test("should return an empty list of search history initially", async () => {
      const response = await request(app).get("/api/weather/history")
      expect(response.status).toBe(200)
      expect(response.body.history).toEqual([])
    })
  })
})
