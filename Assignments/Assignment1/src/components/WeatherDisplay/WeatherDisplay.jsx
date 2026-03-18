import "./WeatherDisplay.css";
import WeatherCard from "./WeatherCard";

/**
 * WeatherDisplay - Dynamically loops over a list of locations
 * and renders a WeatherCard for each one.
 * Props:
 *   locations - array of { city, temperature, weather } objects
 */
function WeatherDisplay({ locations }) {
  // Show a friendly message when no cities match the search
  if (locations.length === 0) {
    return (
      <p className="no-results">No cities found. Try a different search.</p>
    );
  }

  return (
    <div className="weather-list">
      {locations.map((location) => (
        // Use city name as a stable, unique key — best practice over array index
        <WeatherCard
          key={location.city}
          city={location.city}
          temperature={location.temperature}
          weather={location.weather}
        />
      ))}
    </div>
  );
}

export default WeatherDisplay;
