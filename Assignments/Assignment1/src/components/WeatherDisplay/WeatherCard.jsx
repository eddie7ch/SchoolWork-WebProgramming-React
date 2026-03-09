import './WeatherDisplay.css'

/**
 * WeatherCard - Renders a single weather item card.
 * Receives city, temperature, and weather as props.
 */
function WeatherCard({ city, temperature, weather }) {
  return (
    <div className="weather-display">
      <p className="city">{city}</p>
      <p className="weather-info">{weather} — {temperature}</p>
    </div>
  )
}

export default WeatherCard
