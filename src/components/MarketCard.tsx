import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/Sparkline';

interface MarketData {
  commodity: string;
  mandi: string;
  latest_price: number;
  "7d_ma": number;
  signal: "BUY" | "SELL" | "HOLD";
  analysis: string;
  price_history?: Array<{ price: number; date: string }>;
}

interface MarketCardProps {
  commodity: string;
  mandi: string;
}

export const MarketCard = ({ commodity, mandi }: MarketCardProps) => {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/market?commodity=${commodity}&mandi=${mandi}`);
        const data = await response.json();
        setMarket(data);
      } catch (error) {
        console.error('Market fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [commodity, mandi]);

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

  if (!market) return null;

  const getSignalIcon = () => {
    switch (market.signal) {
      case "BUY": return <TrendingDown className="h-4 w-4" />;
      case "SELL": return <TrendingUp className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getSignalColor = () => {
    switch (market.signal) {
      case "BUY": return "bg-green-100 text-green-800";
      case "SELL": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-green-900 capitalize">{market.commodity} Prices</h3>
        <Badge className={`${getSignalColor()} flex items-center gap-1`}>
          {getSignalIcon()}
          {market.signal}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">{market.mandi} Mandi</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Current Price</div>
            <div className="text-lg font-semibold text-green-700">
              ₹{market.latest_price}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">7-day Average</div>
            <div className="text-lg font-semibold text-green-600">
              ₹{market["7d_ma"]}
            </div>
          </div>
        </div>
        
        {/* Price Trend Sparkline */}
        {market.price_history && market.price_history.length > 1 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">7-day trend</div>
            <div className="flex items-center justify-between">
              <Sparkline
                data={market.price_history.map(p => p.price)}
                width={120}
                height={30}
                color={market.signal === 'SELL' ? '#ef4444' : market.signal === 'BUY' ? '#22c55e' : '#6b7280'}
                className="flex-1"
              />
              <div className="text-xs text-muted-foreground ml-2">
                {market.price_history[0]?.date && new Date(market.price_history[0].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-green-100 rounded-lg p-3">
          <p className="text-xs text-green-700">{market.analysis}</p>
        </div>
      </div>
    </Card>
  );
};