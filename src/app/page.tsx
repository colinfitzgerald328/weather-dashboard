"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, CloudRain, Snowflake, Cloud, Droplets, Thermometer, Wind, AlertTriangle, Search, ArrowLeft, Bookmark, X } from 'lucide-react';

interface WeatherData {
  id: number;
  name: string;
  sys: {
    country: string;
  };
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
}

interface SearchResult {
  list: WeatherData[];
}

const API_KEY = '5796abbde9106b7da4febfae8c44c232'; // Note: In a real app, this should be in an environment variable

const WeatherDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherData[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<WeatherData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setError('Please enter a city name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(query.trim())}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data: SearchResult = await response.json();
      if (data.list.length === 0) {
        setError('No results found. Please try a different search term.');
      } else {
        setSearchResults(data.list);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (weather: WeatherData) => {
    setSelectedWeather(weather);
    setSearchResults([]);
  };

  const handleBackToSearch = () => {
    setSelectedWeather(null);
    setSearchResults([]);
    setSearchQuery('');
    setError(null);
  };

  const handleSaveLocation = () => {
    if (selectedWeather && !savedLocations.some(loc => loc.id === selectedWeather.id)) {
      const newSavedLocations = [...savedLocations, selectedWeather];
      setSavedLocations(newSavedLocations);
      localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
    }
  };

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="text-yellow-400" size={24} />;
      case 'clouds':
        return <Cloud className="text-gray-400" size={24} />;
      case 'rain':
        return <CloudRain className="text-blue-400" size={24} />;
      case 'snow':
        return <Snowflake className="text-blue-200" size={24} />;
      default:
        return <Cloud className="text-gray-400" size={24} />;
    }
  };

  const handleRemoveSavedLocation = (locationId: number) => {
    const newSavedLocations = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(newSavedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
  };

  const temperatureData = selectedWeather ? [
    { name: 'Current', temp: celsiusToFahrenheit(selectedWeather.main.temp) },
    { name: 'Feels Like', temp: celsiusToFahrenheit(selectedWeather.main.feels_like) },
    { name: 'Min', temp: celsiusToFahrenheit(selectedWeather.main.temp_min) },
    { name: 'Max', temp: celsiusToFahrenheit(selectedWeather.main.temp_max) },
  ] : [];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">Weather Dashboard</h1>
      
      {!selectedWeather && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Enter city name"
              className="flex-grow p-2 border rounded"
            />
            <button 
              onClick={() => handleSearch(searchQuery)} 
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
              disabled={isLoading}
            >
              <Search size={24} />
            </button>
          </div>
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertTriangle />
              <span>{error}</span>
            </div>
          )}
          {savedLocations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Saved Locations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <button
                        onClick={() => handleSelectLocation(location)}
                        className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-300"
                      >
                        {location.name}, {location.sys.country}
                      </button>
                      <button
                        onClick={() => handleRemoveSavedLocation(location.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                        aria-label="Remove saved location"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getWeatherIcon(location.weather[0].main)}
                        <span className="ml-2 text-sm">{location.weather[0].description}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {celsiusToFahrenheit(location.main.temp).toFixed(0)}°F
                        </p>
                        <p className="text-xs text-gray-600">
                          Feels like {celsiusToFahrenheit(location.main.feels_like).toFixed(0)}°F
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 flex justify-between">
                      <span>
                        <Droplets size={14} className="inline mr-1" />
                        {location.main.humidity}%
                      </span>
                      <span>
                        <Wind size={14} className="inline mr-1" />
                        {(location.wind.speed * 2.237).toFixed(1)} mph
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading && <div className="text-center">Searching...</div>}

      {searchResults.length > 0 && !selectedWeather && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          <ul className="space-y-2">
            {searchResults.map((result) => (
              <li 
                key={result.id} 
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer transition duration-300" 
                onClick={() => handleSelectLocation(result)}
              >
                {result.name}, {result.sys.country} - {celsiusToFahrenheit(result.main.temp).toFixed(1)}°F
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedWeather && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBackToSearch} 
              className="flex items-center text-blue-500 hover:text-blue-700 transition duration-300"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back to Search
            </button>
            <h2 className="text-xl font-semibold">
              {selectedWeather.name}, {selectedWeather.sys.country}
            </h2>
            <button
              onClick={handleSaveLocation}
              className="flex items-center text-yellow-500 hover:text-yellow-700 transition duration-300"
              disabled={savedLocations.some(loc => loc.id === selectedWeather.id)}
            >
              <Bookmark size={20} className="mr-1" />
              {savedLocations.some(loc => loc.id === selectedWeather.id) ? 'Saved' : 'Save'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-2">Temperature Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={temperatureData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}°F`} />
                  <Bar dataKey="temp" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg flex items-center space-x-4">
              <Thermometer className="text-red-500" />
              <div>
                <p className="font-semibold">Temperature</p>
                <p>Current: {celsiusToFahrenheit(selectedWeather.main.temp).toFixed(1)}°F</p>
                <p>Feels like: {celsiusToFahrenheit(selectedWeather.main.feels_like).toFixed(1)}°F</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg flex items-center space-x-4">
              <Cloud className="text-blue-500" />
              <div>
                <p className="font-semibold">Weather</p>
                <p>{selectedWeather.weather[0].main}</p>
                <p>{selectedWeather.weather[0].description}</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg flex items-center space-x-4">
              <Droplets className="text-blue-500" />
              <div>
                <p className="font-semibold">Humidity</p>
                <p>{selectedWeather.main.humidity}%</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg flex items-center space-x-4">
              <Wind className="text-gray-500" />
              <div>
                <p className="font-semibold">Wind</p>
                <p>Speed: {(selectedWeather.wind.speed * 2.237).toFixed(1)} mph</p>
                <p>Direction: {selectedWeather.wind.deg}°</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;