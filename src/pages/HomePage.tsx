import { Button } from '@/components/ui/button';
import { Mic, Sprout, Leaf, Wheat, Sun, AlertTriangle } from 'lucide-react';
import HeroIllustration from '@/components/HeroIllustration';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const quickPrompts = [
    'When to irrigate?',
    'Leaf spots on tomato',
    'Best mandi to sell wheat',
    'PM-KISAN eligibility'
  ];
  const demoMode = !import.meta.env.VITE_API_URL;

  return (
    <div className="relative">
      {demoMode && (
        <div className="px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Demo mode: deterministic responses (set VITE_API_URL in .env for live backend)
          </div>
        </div>
      )}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-forest opacity-90"></div>
        <div className="relative px-4 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">FarmGuru</h1>
              <p className="text-white/85 text-base sm:text-lg mb-6">AI agricultural insights – text, voice, or image. हिंदी + English.</p>
              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-[#2a8f6d] hover:bg-white/90"
                  onClick={() => navigate('/query?voice=1')}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Ask by Voice
                </Button>
                <Button size="lg" variant="outline" className="bg-white/20 text-white border-white/50 hover:bg-white/30" asChild>
                  <Link to="/query">Open Query</Link>
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/diagnostics">Diagnostics</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/about">About</Link>
                </Button>
              </div>
            </div>
            <div className="hidden sm:block">
              <HeroIllustration />
            </div>
          </div>

          {/* Floating icons */}
          <div className="absolute top-6 right-24 float-slow"><Wheat className="h-6 w-6 text-white/50" /></div>
          <div className="absolute top-16 right-8 float-slow" style={{animationDelay: '1.6s'}}><Leaf className="h-5 w-5 text-white/40" /></div>
          <div className="absolute top-10 right-48 float-slow" style={{animationDelay: '3.2s'}}><Sun className="h-7 w-7 text-white/45" /></div>
        </div>
      </section>

      <section className="px-4 -mt-8">
        <div className="max-w-3xl mx-auto">
          {/* Quick prompts */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Quick prompts</h2>
              <Sprout className="w-5 h-5 text-[#2a8f6d]" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((q, i) => (
                <Button key={i} size="sm" variant="secondary" className="whitespace-nowrap" onClick={() => navigate(`/query?q=${encodeURIComponent(q)}`)}>
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {/* Feature links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: 'Weather', to: '/weather', desc: 'Forecast & irrigation guidance' },
              { title: 'Market', to: '/market', desc: 'Live prices & signals' },
              { title: 'Schemes', to: '/schemes', desc: 'PM-KISAN, PMFBY matches' },
            ].map((f, idx) => (
              <motion.div key={f.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/90 rounded-2xl p-4 shadow-soft">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{f.desc}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={f.to}>Open</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;