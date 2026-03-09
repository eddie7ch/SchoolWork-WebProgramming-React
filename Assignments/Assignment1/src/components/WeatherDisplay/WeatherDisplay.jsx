import './WeatherDisplay.css'

function WeatherDisplay({ locations }) {
  return (
    <div>
      {locations.map((location, index) => (
        <div key={index} className="weather-display">
          <p className="city">{location.city}</p>
          <p className="weather-info">{location.weather} — {location.temperature}</p>
        </div>
      ))}
    </div>
  )
}

export default WeatherDisplay
