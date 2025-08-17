import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/AnimatedCard';
import { WeatherCard } from '@/components/WeatherCard';

const WeatherPage = () => {
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bangalore');
  const [submitted, setSubmitted] = useState({ state: 'Karnataka', district: 'Bangalore' });
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Loading forecast for ${submitted.district}, ${submitted.state}`;
    }
  }, [submitted]);

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold mb-2">Weather</h1>
        <p className="text-sm text-muted-foreground mb-3">District-level forecasts with irrigation guidance.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" aria-label="State" />
          <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" aria-label="District" />
          <Button onClick={() => setSubmitted({ state, district })} className="w-full">Get Forecast</Button>
        </div>
        <div ref={liveRef} aria-live="polite" className="sr-only" />
      </AnimatedCard>

      <WeatherCard state={submitted.state} district={submitted.district} />
    </div>
  );
};

export default WeatherPage;