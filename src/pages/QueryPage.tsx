import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryInput } from '@/components/QueryInput';
import { ResultCard } from '@/components/ResultCard';
import AnimatedCard from '@/components/AnimatedCard';
import { Button } from '@/components/ui/button';

interface QueryResult {
  answer: string;
  confidence: number;
  actions: string[];
  sources: Array<{ title: string; url: string; snippet: string }>;
}

const QueryPage = () => {
  const [params] = useSearchParams();
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const initialQuery = params.get('q') || '';
  const quickPrompts = [
    'When to irrigate?',
    'Leaf spots on tomato',
    'Best mandi to sell wheat',
    'PM-KISAN eligibility'
  ];

  const handleQuery = async (text: string, _imageFile?: File, options?: { result?: QueryResult }) => {
    setIsLoading(true);
    if (options?.result) {
      setResult(options.result);
    } else {
      // Fallback: simple deterministic mock
      await new Promise(r => setTimeout(r, 600));
      setResult({
        answer: `Answer for: ${text}`,
        confidence: 0.7,
        actions: ['Check soil moisture', 'Review weather', 'Plan irrigation'],
        sources: [
          { title: 'IMD', url: 'https://mausam.imd.gov.in', snippet: 'Official weather service' },
        ],
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (initialQuery) {
      handleQuery(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    if (result && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Result loaded with confidence ${Math.round(result.confidence * 100)} percent`;
    }
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Ask FarmGuru</h1>
        <p className="text-sm text-muted-foreground">Text, voice, or image upload. Hindi/English supported.</p>
      </div>

      <AnimatedCard className="p-4">
        <QueryInput onQuery={handleQuery} isLoading={isLoading} />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {quickPrompts.map((q, i) => (
            <Button key={i} size="sm" variant="secondary" onClick={() => handleQuery(q)} disabled={isLoading}>
              {q}
            </Button>
          ))}
        </div>
      </AnimatedCard>

      {/* aria-live for screen reader announcements */}
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {result && (
        <AnimatedCard className="p-0">
          <ResultCard result={result} />
        </AnimatedCard>
      )}
    </div>
  );
};

export default QueryPage;