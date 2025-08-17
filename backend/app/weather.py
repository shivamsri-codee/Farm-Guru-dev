"""
Weather service for FarmGuru - provides agricultural weather information.
"""
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from .db import db

class WeatherService:
    def __init__(self):
        pass
        
    async def get_weather(self, state: str, district: str) -> Dict[str, Any]:
        """Get weather forecast for a specific state and district"""
        try:
            # Get latest weather data from cache
            query = """
            SELECT json_payload, forecast_date, created_at
            FROM weather
            WHERE state = $1 AND district = $2
            ORDER BY forecast_date DESC, created_at DESC
            LIMIT 1
            """
            
            result = await db.fetch_one(query, state, district)
            
            if not result:
                return await self._get_fallback_weather(state, district)
                
            weather_data = result['json_payload']
            last_updated = result['created_at']
            
            # Generate recommendation based on weather data
            recommendation = self._generate_weather_recommendation(weather_data)
            
            return {
                "forecast": weather_data,
                "last_updated": last_updated.isoformat(),
                "recommendation": recommendation
            }
            
        except Exception as e:
            print(f"Weather service error: {e}")
            return await self._get_fallback_weather(state, district)
            
    async def _get_fallback_weather(self, state: str, district: str) -> Dict[str, Any]:
        """Fallback weather data when no cached data is available"""
        return {
            "forecast": {
                "location": f"{district}, {state}",
                "temperature": {"min": 18, "max": 28},
                "humidity": 65,
                "rainfall_probability": 30,
                "wind_speed": 8,
                "conditions": "Partly cloudy"
            },
            "last_updated": datetime.now().isoformat(),
            "recommendation": "Monitor soil moisture and consider light irrigation if no rain in 2-3 days."
        }
        
    def _generate_weather_recommendation(self, weather_data: Dict[str, Any]) -> str:
        """Generate agricultural recommendation based on weather data"""
        try:
            temp_max = weather_data.get('temperature', {}).get('max', 25)
            rainfall_prob = weather_data.get('rainfall_probability', 0)
            humidity = weather_data.get('humidity', 50)
            
            recommendations = []
            
            # Temperature-based recommendations
            if temp_max > 30:
                recommendations.append("High temperature expected - water crops early morning")
            elif temp_max < 15:
                recommendations.append("Cool weather - protect sensitive crops from cold")
                
            # Rainfall-based recommendations
            if rainfall_prob > 70:
                recommendations.append("High chance of rain - delay irrigation and fertilizer application")
            elif rainfall_prob < 20 and humidity < 40:
                recommendations.append("Dry conditions expected - ensure adequate irrigation")
                
            # Humidity-based recommendations
            if humidity > 80:
                recommendations.append("High humidity - monitor for fungal diseases")
                
            return ". ".join(recommendations) or "Monitor crop conditions and adjust management practices accordingly."
            
        except Exception as e:
            print(f"Recommendation generation error: {e}")
            return "Monitor weather conditions and adjust farming activities accordingly."
            
    async def cache_weather_data(self, state: str, district: str, forecast_data: Dict[str, Any], forecast_date: str) -> bool:
        """Cache weather data for later retrieval"""
        try:
            query = """
            INSERT INTO weather (state, district, forecast_date, json_payload)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (state, district, forecast_date) 
            DO UPDATE SET json_payload = $4, created_at = NOW()
            """
            
            await db.execute(query, state, district, forecast_date, json.dumps(forecast_data))
            return True
            
        except Exception as e:
            print(f"Weather caching error: {e}")
            return False

# Global weather service instance
weather_service = WeatherService()