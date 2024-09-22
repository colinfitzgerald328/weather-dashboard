"use client";
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, Search, ArrowLeft } from 'lucide-react';

interface WeatherData {
  id: number;
  name: string;
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
  sys: {
    country: string;
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

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setError('Please enter a city name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(searchQuery.trim())}&appid=${API_KEY}&units=metric`
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter city name"
              className="flex-grow p-2 border rounded"
            />
            <button 
              onClick={handleSearch} 
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