import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/AnimatedCard';
import { MarketCard } from '@/components/MarketCard';

const MarketPage = () => {
  const [commodity, setCommodity] = useState('tomato');
  const [mandi, setMandi] = useState('Bangalore');
  const [submitted, setSubmitted] = useState({ commodity: 'tomato', mandi: 'Bangalore' });
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Loading market for ${submitted.commodity} in ${submitted.mandi}`;
    }
  }, [submitted]);

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold mb-2">Market</h1>
        <p className="text-sm text-muted-foreground mb-3">Live commodity prices, 7-day trend sparkline and BUY/SELL/HOLD signals.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input value={commodity} onChange={(e) => setCommodity(e.target.value)} placeholder="Commodity" aria-label="Commodity" />
          <Input value={mandi} onChange={(e) => setMandi(e.target.value)} placeholder="Mandi" aria-label="Mandi" />
          <Button onClick={() => setSubmitted({ commodity, mandi })} className="w-full">Get Prices</Button>
        </div>
        <div ref={liveRef} aria-live="polite" className="sr-only" />
      </AnimatedCard>

      <MarketCard commodity={submitted.commodity} mandi={submitted.mandi} />
    </div>
  );
};

export default MarketPage;