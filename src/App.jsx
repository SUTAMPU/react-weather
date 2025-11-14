import { useState, useEffect } from "react";
import { Icons } from "./Components/Icons";

function App() {

  const API_KEY = "d7f3dd593b43da63df84a92e279742f5";
  
  const [city, setCity] = useState("London");
  const [search, setSearch] = useState("");

  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)

  const fetchWeatherData = async (cityName) => {
    try {
      setLoading(true)
      setError(null)

      // Weather data
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setData(data)

      // Forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      /* ======== Group by day to find min/max throughout the week
      const dailyForecast = Object.groupBy(forecastData.list, day =>
        new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
      );
      */

      const dailyForecast  = forecastData.list.filter(
        (_, index) => index % 8 === 0
        // Updates every 3 hours, get 1 per day: 3 hours × 8 = 24 hours
      );
      setForecast(dailyForecast)

    } catch (error) {
      setError("Couldn't fetch data at the moment. Please try again!")
      console.log(error.message);

    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  function handleSearch(event) {
    event.preventDefault();
    fetchWeatherData(search);
    setSearch("");
  }

  // During load
  if (loading)
    return (
    <div className="wrapper">Loading...</div>
    );
  
  // After load
  return (
    <div className="wrapper">

      <form onSubmit={handleSearch} className="search-form">
        <button type="submit" className="search-button"><img alt="search-btn" src="src/assets/search-icon.svg" /></button>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a city"
          className="search-input"
        />
      </form>

      {/* ======== When error */} 
      {error && <p className="error">{error}</p>}

      {/* When no error */}
      {data && data.main && data.weather && (
        <>
          <div className="header">
            <h3 className="location">{data.name}, {data.sys.country}</h3>
            <p className="update">Last Updated: {new Date(data.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' })}</p>
          </div>

          <div className="weather-simple">
            <h1 className="temperature">{Math.round((data.main.temp - 273.15))}°</h1>
            <div className="weather-details">
              <h2 className="condition">{data.weather[0].description}</h2>
              <p className="min-max-temp">▲ {Math.round((data.main.temp_max - 273.15))}°</p>
              <p className="min-max-temp">▼ {Math.round((data.main.temp_min - 273.15))}°</p>
            </div>
          </div>

          <img className="condition-img" alt={data.weather[0].description} src={`src/assets/${Icons[data.weather[0].icon] || "01d.svg"}`} />

          <div className="other-details">
            <div className="detail">
              <h3>{data.wind.speed}m/s</h3>
              <p>Wind Speed</p>
            </div>
            <div className="detail">
              <h3>{data.main.humidity}%</h3>
              <p>Humidity</p>
            </div>
            <div className="detail">
              <h3>{Math.round(data.visibility / 1000) / 10}km</h3>
              <p>Visibility</p>
            </div>
          </div>

          <div className="separator">
            <img alt="separator-icon" src="src/assets/separator-icon.svg" />
          </div>

          {forecast.length > 0 && (
            <>
              <div className="forecast">
                <div className="forecast-days">
                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-day">
                      <p>
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>

                      <img
                        className="forecast-condition-img"
                        alt={day.weather[0].description}
                        src={`src/assets/${Icons[day.weather[0].icon] || "01d.svg"}`}
                      />

                      {/* ======== Adjust value */} 
                      <div className="forecast-details">
                        <p>{Math.round((day.main.temp_min - 273.15))}°C</p>
                        <p>|</p>
                        <p>{Math.round((day.main.temp_max - 273.15))}°C</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
    
        </>
      )}
      
    </div>
  );
}

export default App;