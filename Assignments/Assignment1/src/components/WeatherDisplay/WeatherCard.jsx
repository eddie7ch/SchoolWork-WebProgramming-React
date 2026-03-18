import "./WeatherDisplay.css";

// Maps weather condition to a descriptive emoji
const WEATHER_EMOJI = {
  Sunny: "☀️",
  Cloudy: "⛅",
  Rainy: "🌧️",
  Snowy: "❄️",
};

/**
 * WeatherCard - Renders a single weather item card.
 * Receives city, temperature, and weather as props.
 * Applies a condition-specific colour class for visual differentiation.
 */
function WeatherCard({ city, temperature, weather }) {
  const emoji = WEATHER_EMOJI[weather] ?? "🌡️";

  return (
    <div className={`weather-display weather-${weather.toLowerCase()}`}>
      <p className="city">{city}</p>
      <p className="weather-info">
        {emoji} {weather} — {temperature}
      </p>
    </div>
  );
}

export default WeatherCard;
