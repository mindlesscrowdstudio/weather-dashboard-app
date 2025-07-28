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
- **API Caching**: Backend caching with PostgreSQL to reduce redundant API calls and improve performance.
- **Responsive Design**: A clean, mobile-first design that scales to desktop screens.
- **Accessibility**: Implementation of ARIA roles and labels for an enhanced user experience.

## 🏗️ Tech Stack

| Area           | Technology                                                      |
| :------------- | :-------------------------------------------------------------- |
| **Frontend**   | [React], [Tailwind CSS], [shadcn/ui](https://ui.shadcn.com/)    |
| **Backend**    | [Node.js], [Express], [TypeScript], [PostgreSQL]                |
| **Testing**    | [Vitest] & [React Testing Library] (Frontend), [Jest] (Backend) |
| **Deployment** | [Vercel] (Frontend), [Render] (Backend & Database)              |

### Prerequisites

- Node.js (v24.3.0)
- npm
- OpenWeatherMap API key
- PostgreSQL instance

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
2. **Backend Setup**
   ```bash
   # Navigate to the backend directory
   cd backend
   ```

# Install dependencies

npm install

# Create a .env file and add your environment variables

# You can copy from a .env.example

````
Create and update the `backend/.env` file with your credentials:
```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/weather_dashboard"
OPENWEATHER_API_KEY="your_openweathermap_api_key"
FRONTEND_URL="http://localhost:5173"
````

**Run Database Migrations**:
Connect to your PostgreSQL instance and run the SQL script to create the necessary tables.
`bash
    psql -U YOUR_DB_USER -d weather_dashboard -f src/migrations/001_create_tables.sql
    ` 3. **Frontend Setup**
```bash

# Navigate to the frontend directory from the root

    cd frontend

# Install dependencies

    npm install

# Create a .env.local file for the backend URL

    ```
    Create and update the `frontend/.env.local` file with the backend URL:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
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
