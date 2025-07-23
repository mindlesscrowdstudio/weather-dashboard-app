# weather-dashboard-app
 
# Weather Dashboard Application
Weather dashboard application that uses OpenWeatherMap API to see weather.
Provides current weather information and 5-day forecasts for cities worldwide. 
Built with React (frontend) and Node.js/Express (backend), integrating with the OpenWeatherMap API.

## 🏗️ Architecture
weather-dashboard/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + TypeScript
├── docker-compose.yml # Docker setup for development
└── README.md


## ✨ Features

- **Current Weather**: Real-time weather data for any city
- **5-Day Forecast**: Extended weather predictions
- **Favorites Management**: Save and manage favorite cities
- **Search History**: Track previously searched locations
- **Responsive Design**: Mobile-first responsive approach
- **Temperature Units**: Celsius and Fahrenheit
- **API Caching**: Redis-based caching to optimize API calls
- **Rate Limiting**: Protection against API abuse


## 🚀 Quick Start

### Prerequisites

- Node.js (v24.3.0)
- npm
- OpenWeatherMap API key
- PostgreSQL 
- Redis

## Endpoints


### Installation

1. **Clone the repository**
   ```bash
   git clone <weather-dashboard-app>
   cd weather-dashboard