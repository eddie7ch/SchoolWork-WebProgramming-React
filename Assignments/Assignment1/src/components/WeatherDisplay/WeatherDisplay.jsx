import './WeatherDisplay.css'
import WeatherCard from './WeatherCard'

/**
 * WeatherDisplay - Dynamically loops over a list of locations
 * and renders a WeatherCard for each one.
 * Props:
 *   locations - array of { city, temperature, weather } objects
 */
function WeatherDisplay({ locations }) {
  return (
    <div>
      {locations.map((location) => (
        // Render a single WeatherCard for each location in the list
        <WeatherCard
          key={location.city}
          city={location.city}
          temperature={location.temperature}
          weather={location.weather}
        />
      ))}
    </div>
  )
}

export default WeatherDisplay
