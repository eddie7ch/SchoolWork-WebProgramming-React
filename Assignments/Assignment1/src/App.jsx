import { useState } from 'react'
import './App.css'
import WeatherDisplay from './components/WeatherDisplay/WeatherDisplay'
import locations from './data/locations.json'

function App() {
  const [search, setSearch] = useState('')

  const filteredLocations = locations.filter((location) =>
    location.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <h1 className="title">Weather App</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Search for a city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <WeatherDisplay locations={filteredLocations} />
    </div>
  )
}

export default App
