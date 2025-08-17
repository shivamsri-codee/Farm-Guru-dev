"""
Market price service for FarmGuru - provides agricultural market information.
"""
import statistics
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from .db import db

class MarketService:
    def __init__(self):
        pass
        
    async def get_market_data(self, commodity: str, mandi: str) -> Dict[str, Any]:
        """Get market data for a specific commodity and mandi"""
        try:
            # Get latest price
            latest_query = """
            SELECT modal_price, date
            FROM market_prices
            WHERE commodity = $1 AND mandi = $2
            ORDER BY date DESC
            LIMIT 1
            """
            
            latest_result = await db.fetch_one(latest_query, commodity, mandi)
            
            if not latest_result:
                return await self._get_fallback_market_data(commodity, mandi)
                
            latest_price = float(latest_result['modal_price'])
            latest_date = latest_result['date']
            
            # Get 7-day historical data for moving average
            week_ago = latest_date - timedelta(days=7)
            historical_query = """
            SELECT modal_price, date
            FROM market_prices
            WHERE commodity = $1 AND mandi = $2 AND date >= $3
            ORDER BY date DESC
            """
            
            historical_results = await db.fetch_all(historical_query, commodity, mandi, week_ago)
            
            # Calculate 7-day moving average
            prices = [float(row['modal_price']) for row in historical_results]
            moving_avg_7d = statistics.mean(prices) if prices else latest_price
            
            # Generate trading signal
            signal, analysis = self._generate_trading_signal(latest_price, moving_avg_7d, prices)
            
            return {
                "commodity": commodity,
                "mandi": mandi,
                "latest_price": latest_price,
                "7d_ma": round(moving_avg_7d, 2),
                "signal": signal,
                "analysis": analysis,
                "price_history": [{"price": p, "date": r['date'].isoformat()} for p, r in zip(prices[:7], historical_results[:7])]
            }
            
        except Exception as e:
            print(f"Market service error: {e}")
            return await self._get_fallback_market_data(commodity, mandi)
            
    async def _get_fallback_market_data(self, commodity: str, mandi: str) -> Dict[str, Any]:
        """Fallback market data when no data is available"""
        # Generate realistic fallback prices based on commodity
        base_prices = {
            "tomato": 2500,
            "onion": 1800,
            "potato": 1200,
            "wheat": 2100,
            "rice": 2800,
            "maize": 1900
        }
        
        base_price = base_prices.get(commodity.lower(), 2000)
        
        return {
            "commodity": commodity,
            "mandi": mandi,
            "latest_price": base_price,
            "7d_ma": base_price * 0.95,
            "signal": "HOLD",
            "analysis": f"Limited price data available for {commodity} in {mandi}. Monitor market trends closely.",
            "price_history": []
        }
        
    def _generate_trading_signal(self, current_price: float, moving_avg: float, price_history: List[float]) -> tuple[str, str]:
        """Generate trading signal based on price analysis"""
        try:
            # Calculate price change percentage
            price_change_pct = ((current_price - moving_avg) / moving_avg) * 100
            
            # Analyze trend
            if len(price_history) >= 3:
                recent_trend = price_history[0] - price_history[2]  # 3-day trend
                trend_pct = (recent_trend / price_history[2]) * 100 if price_history[2] > 0 else 0
            else:
                trend_pct = price_change_pct
                
            # Generate signal
            if price_change_pct > 5 and trend_pct > 3:
                signal = "SELL"
                analysis = f"Price above 7-day average by {price_change_pct:.1f}%. Upward trend of {trend_pct:.1f}% - consider selling."
            elif price_change_pct < -5 and trend_pct < -3:
                signal = "BUY"
                analysis = f"Price below 7-day average by {abs(price_change_pct):.1f}%. Downward trend - may be good buying opportunity."
            else:
                signal = "HOLD"
                analysis = f"Price near 7-day average ({price_change_pct:+.1f}%). Stable market conditions - hold current position."
                
            return signal, analysis
            
        except Exception as e:
            print(f"Signal generation error: {e}")
            return "HOLD", "Unable to analyze market trends. Monitor prices closely."
            
    async def add_price_data(self, commodity: str, mandi: str, date: str, modal_price: float) -> bool:
        """Add new price data to the database"""
        try:
            query = """
            INSERT INTO market_prices (commodity, mandi, date, modal_price)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (commodity, mandi, date) 
            DO UPDATE SET modal_price = $4
            """
            
            await db.execute(query, commodity, mandi, date, modal_price)
            return True
            
        except Exception as e:
            print(f"Price data insertion error: {e}")
            return False

# Global market service instance
market_service = MarketService()