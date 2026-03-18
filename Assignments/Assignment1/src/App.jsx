import { useState } from "react";
import "./App.css";
import WeatherDisplay from "./components/WeatherDisplay/WeatherDisplay";
import locations from "./data/locations.json";

/**
 * App - Root component.
 * Holds the search state and passes the filtered locations list
 * down to the WeatherDisplay component as props.
 */
function App() {
  // Track the user's search input
  const [search, setSearch] = useState("");

  // Filter locations based on search input (case-insensitive, partial match)
  const filteredLocations = locations.filter((location) =>
    location.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="app">
      <h1 className="title">🌤 Weather App</h1>
      <p className="subtitle">
        Search for a city to see current weather conditions.
      </p>

      {/* Search input — filters the city list in real time */}
      <input
        type="text"
        className="search-input"
        placeholder="Search for a city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Pass filtered locations to the dynamic display component */}
      <WeatherDisplay locations={filteredLocations} />
    </div>
  );
}

export default App;
