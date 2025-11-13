import {useState, useEffect} from "react";

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

      /* Group by day
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
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter city name"
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {/* When error */}
      {error && <p className="error">{error}</p>}

      {data && data.main && data.weather && (
        <>
          <div className="header">
            <p className="condition">{data.weather[0].description}</p>
            <p className="temperature">{Math.round((data.main.temp - 273.15))}°C</p>
          </div>

          <div className="weather-details">
            <div>
              <p>Humidity</p>
              <p>{data.main.humidity}%</p>
            </div>
            <div>
              <p>Wind Speed</p>
              <p>{data.wind.speed} m/s</p>
            </div>
          </div>

          <div>
            <svg className="waves" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
              <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g className="parallax">
                <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
                <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                <use href="#gentle-wave" x="48" y="7" fill="#fff" />
              </g>
            </svg>
          </div>

          {forecast.length > 0 && (
            <>
              <div className="forecast">
                <h2 className="city">{data.name}</h2>
                <div className="forecast-days">

                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-day">
                      <p>
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="forecast-details">
                        <img
                          src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                          alt={day.weather[0].description}
                        />
                        <p>{Math.round((data.main.temp - 273.15))}°C</p>
                        <p>/</p>
                        <p>{Math.round((data.main.temp - 273.15))}°C</p>
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