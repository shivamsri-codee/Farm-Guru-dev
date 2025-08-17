import { useState } from 'react';
import { QueryInput } from '@/components/QueryInput';
import { ResultCard } from '@/components/ResultCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { WeatherCard } from '@/components/WeatherCard';
import { MarketCard } from '@/components/MarketCard';
import { PolicyCard } from '@/components/PolicyCard';
import { ChemRecommender } from '@/components/ChemRecommender';
import { CommunityFeed } from '@/components/CommunityFeed';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { Sprout, Wheat, Leaf, Sun, Phone, HelpCircle, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [showHelpCard, setShowHelpCard] = useState(false);
  const [activeTab, setActiveTab] = useState<'query' | 'policy' | 'chem' | 'community'>('query');

  const handleQuery = async (text: string, imageFile?: File, options?: { showHelpCard?: boolean; result?: QueryResult }) => {
    setIsLoading(true);
    
    if (options?.result) {
      setResult(options.result);
      setShowHelpCard(options.showHelpCard || false);
    } else {
      // Simulate API call with realistic agricultural responses
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: { [key: string]: QueryResult } = {
        "irrigation": {
          answer: "For wheat crops in winter, irrigate every 15-20 days based on soil moisture at 2-3 inch depth.",
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
        "fertilizer": {
          answer: "Apply NPK 12:32:16 at 100kg/acre during tillering stage with organic compost.",
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
        "pest": {
          answer: "Likely aphid infestation detected. Apply neem oil spray in evening for 3 days.",
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
    }

    setIsLoading(false);
  };

  const quickPrompts = [
    "When to irrigate?",
    "Leaf spots on tomato",
    "Best mandi to sell wheat",
    "PM-KISAN eligibility"
  ];
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
          
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              FarmGuru
            </h2>
            <p className="text-white/80 text-lg">
              Ask. Upload. Act. (हिंदी + English)
            </p>
          </div>
          
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            onClick={() => {
              // TODO: Trigger voice input
              console.log('Voice input triggered');
            }}
          >
            <Mic className="w-5 h-5 mr-2" />
            Ask by Voice
          </Button>

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
            
            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery(prompt)}
                  className="bg-white/80 hover:bg-white text-sm"
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Help Card for Expert Consultation */}
          {showHelpCard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-amber-200 bg-amber-50">
                <HelpCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-3">
                    <p>I couldn't find specific information for your query. Here are expert resources:</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700" asChild>
                        <a href="tel:1800-180-1551">
                          <Phone className="w-4 h-4 mr-2" />
                          Call KVK Helpline
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://farmer.gov.in/kvk" target="_blank" rel="noopener noreferrer">
                          Find Local KVK
                        </a>
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <ResultCard result={result} />
              
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: 'query', label: 'Ask Again', icon: Sprout },
                  { key: 'policy', label: 'Schemes', icon: Wheat },
                  { key: 'chem', label: 'Treatment', icon: Leaf },
                  { key: 'community', label: 'Community', icon: Sun }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeTab === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(key as any)}
                    className={activeTab === key ? 'bg-gradient-to-r from-[#2a8f6d] to-[#74c69d]' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'query' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WeatherCard state="Karnataka" district="Bangalore" />
                    <MarketCard commodity="tomato" mandi="Bangalore" />
                  </div>
                )}
                {activeTab === 'policy' && (
                  <PolicyCard state="Karnataka" crop="wheat" userId="anonymous" />
                )}
                {activeTab === 'chem' && (
                  <ChemRecommender crop="tomato" userId="anonymous" />
                )}
                {activeTab === 'community' && (
                  <CommunityFeed userId="anonymous" userState="Karnataka" />
                )}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          {!result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
            >
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
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;