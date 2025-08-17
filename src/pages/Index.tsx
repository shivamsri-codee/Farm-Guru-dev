import { useState } from 'react';
import { QueryInput } from '@/components/QueryInput';
import { ResultCard } from '@/components/ResultCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { WeatherCard } from '@/components/WeatherCard';
import { MarketCard } from '@/components/MarketCard';
import { useTranslation } from 'react-i18next';
import { Sprout, Wheat, Leaf, Sun } from 'lucide-react';

interface QueryResult {
  answer: string;
  confidence: number;
  actions: string[];
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

const Index = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (text: string, imageFile?: File) => {
    setIsLoading(true);
    
    // Simulate API call with realistic agricultural responses
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResults: { [key: string]: QueryResult } = {
      'irrigation': {
        answer: 'For wheat crops in winter, irrigate every 15-20 days based on soil moisture at 2-3 inch depth.',
        confidence: 0.85,
        actions: ['Check soil moisture', 'Water early morning', 'Monitor weather forecast'],
        sources: [
          {
            title: 'IMD Weather Forecast',
            url: 'https://mausam.imd.gov.in',
            snippet: 'Minimal rainfall expected this week. Soil moisture levels dropping in Northern Plains.'
          },
          {
            title: 'Agricultural Guidelines - Wheat',
            url: 'https://farmer.gov.in/wheat',
            snippet: 'Wheat requires 4-6 irrigations during its growth cycle, with critical stages being crown root initiation and grain filling.'
          }
        ]
      },
      'fertilizer': {
        answer: 'Apply NPK 12:32:16 at 100kg/acre during tillering stage with organic compost.',
        confidence: 0.78,
        actions: ['Soil test first', 'Apply in morning', 'Water after application'],
        sources: [
          {
            title: 'Soil Health Card',
            url: 'https://soilhealth.dac.gov.in',
            snippet: 'Current soil analysis shows nitrogen deficiency in your region. Phosphorus levels adequate.'
          },
          {
            title: 'PM-KISAN Fertilizer Subsidy',
            url: 'https://pmkisan.gov.in',
            snippet: 'Eligible farmers can get subsidized fertilizer through registered dealers. Apply with Aadhaar.'
          }
        ]
      },
      'pest': {
        answer: 'Likely aphid infestation detected. Apply neem oil spray in evening for 3 days.',
        confidence: 0.65,
        actions: ['Apply neem oil', 'Remove affected leaves', 'Consult KVK expert'],
        sources: [
          {
            title: 'Pest Management Guide',
            url: 'https://agricoop.nic.in/pest',
            snippet: 'Aphids are common in post-winter crops. Early detection and organic treatment prevent yield loss.'
          },
          {
            title: 'PMFBY Crop Insurance',
            url: 'https://pmfby.gov.in',
            snippet: 'Pest damage covered under crop insurance. Report to local agriculture officer within 72 hours.'
          }
        ]
      }
    };

    // Determine response based on query content
    let selectedResult = mockResults['irrigation']; // default
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('pest') || lowerText.includes('insect') || lowerText.includes('bug') || imageFile) {
      selectedResult = mockResults['pest'];
    } else if (lowerText.includes('fertilizer') || lowerText.includes('nutrient') || lowerText.includes('nitrogen')) {
      selectedResult = mockResults['fertilizer'];
    }

    setResult(selectedResult);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-forest opacity-90"></div>
        <div className="relative px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-xl">
                <Sprout className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-white">FarmGuru</h1>
            </div>
            <LanguageToggle />
          </div>
          
          <p className="text-white/90 text-lg mb-8 max-w-md">
            {t('header.subtitle')}
          </p>

          {/* Floating agricultural icons */}
          <div className="absolute top-4 right-20 float-slow">
            <Wheat className="h-6 w-6 text-white/40" />
          </div>
          <div className="absolute top-16 right-32 float-slow" style={{animationDelay: '2s'}}>
            <Leaf className="h-5 w-5 text-white/30" />
          </div>
          <div className="absolute top-8 right-8 float-slow" style={{animationDelay: '4s'}}>
            <Sun className="h-7 w-7 text-white/35" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Query Input */}
          <div className="mb-8 -mt-8 relative z-10">
            <QueryInput onQuery={handleQuery} isLoading={isLoading} />
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <ResultCard result={result} />
              
              {/* Additional cards for context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherCard state="Karnataka" district="Bangalore" />
                <MarketCard commodity="tomato" mandi="Bangalore" />
              </div>
            </div>
          )}

          {/* Quick Tips */}
          {!result && !isLoading && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('tips.title')}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-1 rounded-lg mt-1">
                    <Sprout className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-muted-foreground">{t('tips.voice')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-1 rounded-lg mt-1">
                    <Leaf className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-muted-foreground">{t('tips.image')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-1 rounded-lg mt-1">
                    <Wheat className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-muted-foreground">{t('tips.schemes')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;