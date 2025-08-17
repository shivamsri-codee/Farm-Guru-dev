import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/AnimatedCard';
import { PolicyCard } from '@/components/PolicyCard';

const SchemesPage = () => {
  const [state, setState] = useState('Karnataka');
  const [crop, setCrop] = useState('wheat');
  const [submitted, setSubmitted] = useState({ state: 'Karnataka', crop: 'wheat' });
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Finding schemes for ${submitted.crop} in ${submitted.state}`;
    }
  }, [submitted]);

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold mb-2">Government Schemes</h1>
        <p className="text-sm text-muted-foreground mb-3">PM-KISAN, PMFBY and more. View eligibility, documents, and apply links.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" aria-label="State" />
          <Input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Crop" aria-label="Crop" />
          <Button onClick={() => setSubmitted({ state, crop })} className="w-full">Find Schemes</Button>
        </div>
        <div ref={liveRef} aria-live="polite" className="sr-only" />
      </AnimatedCard>

      <PolicyCard state={submitted.state} crop={submitted.crop} userId="anonymous" />
    </div>
  );
};

export default SchemesPage;