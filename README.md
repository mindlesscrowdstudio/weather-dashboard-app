# Weather Dashboard Application

## Overview

A full-stack weather dashboard application that uses the OpenWeatherMap API to provide real-time weather information and 5-day forecasts for cities worldwide. It features a responsive interface and a backend with user-specific data persistence.
<!-- -->
![image alt](dashboard_app.png).

## ✨ Features

- **Current Weather**: Real-time data including temperature, "feels like", humidity, wind speed, and more.
- **5-Day Forecast**: Extended weather predictions with daily summaries.
- **Favorites**: Logged-in users can save, view, and remove their favorite cities.
- **Search History**: Automatically tracks the last 10 unique cities searched by a user.
- **Temperature Units**: Switch between Celsius and Fahrenheit.
- **API Caching**: High-speed backend caching with Redis to reduce latency and minimize external API calls.
- **Responsive Design**: A clean, mobile-first design that scales to desktop screens.
- **Accessibility**: Implementation of ARIA roles and labels for an enhanced user experience.

## 🏗️ Tech Stack

| Area           | Technology                                                      |
| :------------- | :-------------------------------------------------------------- |
| **Frontend**   | [React], [Tailwind CSS], [shadcn/ui]                            |
| **Backend**    | [Node.js], [Express], [TypeScript], [PostgreSQL], [Redis]       |
| **Container**  | [Docker]                                                        |
| **Testing**    | [Vitest] & [React Testing Library] (Frontend), [Jest] (Backend) |
| **Deployment** | [Vercel] (Frontend), [Render] (Backend & Database)              |

### Prerequisites

- Node.js (v24.3.0)
- npm
- Docker & Docker Compose
- OpenWeatherMap API key

## 🏗️ Architecture

weather-dashboard/
├── frontend/ # React + Vite + TypeScript
├── backend/ # Node.js + Express + TypeScript
├── docker-compose.yml # Docker setup for development
└── README.md

## Backend Architecture

backend/
├── src/
│ ├── config/
│ │ └── database.ts  
│ ├── migrations/  
│ │ ├── 001_create_tables.sql
│ │ └── migrate.ts  
│ ├── controllers/
│ ├── routes/
│ ├── services/
│ ├── types/
│ └── utils/
├── tests/
│ ├── setup/  
│ │ └── testDb.ts  
│ └── weather.test.ts
└──
For a visual representation of the data model, see the [Database Schema Diagram](backend/documentation/database-schema.md).

Preview image of database 
![image alt](weather-app-diagram-db.png).

### Installation

1. **Clone the repository**
   ```bash
   https://github.com/mindlesscrowdstudio/weather-dashboard-app
   cd weather-dashboard-app
   ```

2. **Set Up Environment Variables**
   - **Backend**: Create a `.env` file in the `/backend` directory. You can copy the contents from `.env.example` if it exists.
     ```env
     # Connects to the PostgreSQL container defined in docker-compose.yml
     DATABASE_URL="postgresql://mel:tofu@localhost:5432/weatherapp"
     # Connects to the Redis container
     REDIS_URL="redis://localhost:6379"
     
     OPENWEATHER_API_KEY="your_openweathermap_api_key"
     FRONTEND_URL="http://localhost:5173"
     ```
   - **Frontend**: Create a `.env.local` file in the `/frontend` directory.
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     ```

3. **Start Development Services**
   Use Docker Compose to start the PostgreSQL database and Redis cache.
   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies & Set Up Database**
   In separate terminals, navigate to the `backend` and `frontend` directories and install their dependencies.
   ```bash
   # In /backend directory
   npm install
   npm run db:setup # This runs the SQL migrations for you
   ```
```bash

# Navigate to the frontend directory from the root

    cd frontend

# Install dependencies

    npm install

# Create a .env.local file for the backend URL

    ```
    Create and update the `frontend/.env.local` file with the backend URL:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    ```

### Running the Application

You can run both the frontend and backend servers in separate terminals.

- **Run the Backend Server**:
  ```bash
  # In the /backend directory
  npm run dev
  ```
- **Run the Frontend Server**:
  `bash
    # In the /frontend directory
    npm run dev
    `
  Open your browser and navigate to `http://localhost:5173`.

---

## Endpoints

All endpoints are prefixed with `/api/weather`. A valid `x-user-id` header is required for all routes except `/health`.

| Method   | Endpoint          | Description                                        |
| :------- | :---------------- | :------------------------------------------------- |
| `GET`    | `/health`         | Checks server and database health.                 |
| `GET`    | `/current/:city`  | Fetches current weather for a specified city.      |
| `GET`    | `/forecast/:city` | Fetches the 5-day forecast for a city.             |
| `POST`   | `/favorites`      | Adds a city to the user's favorites list.          |
| `GET`    | `/favorites`      | Retrieves the user's list of favorite cities.      |
| `DELETE` | `/favorites/:id`  | Removes a favorite city by its ID.                 |
| `GET`    | `/history`        | Retrieves the user's last 10 search history items. |
