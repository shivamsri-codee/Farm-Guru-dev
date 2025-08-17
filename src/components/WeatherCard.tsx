import { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WeatherData {
  forecast: {
    location: string;
    temperature: { min: number; max: number };
    humidity: number;
    rainfall_probability: number;
    conditions: string;
  };
  recommendation: string;
  last_updated: string;
}

interface WeatherCardProps {
  state: string;
  district: string;
}

export const WeatherCard = ({ state, district }: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/weather?state=${state}&district=${district}`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [state, district]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
      <div className="flex items-center gap-3 mb-3">
        <Cloud className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Weather Forecast</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{weather.forecast.location}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(weather.last_updated).toLocaleDateString()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="text-sm">
              {weather.forecast.temperature.min}°-{weather.forecast.temperature.max}°C
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{weather.forecast.rainfall_probability}% rain</span>
          </div>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium">Recommendation:</p>
          <p className="text-xs text-blue-700 mt-1">{weather.recommendation}</p>
        </div>
      </div>
    </Card>
  );
};