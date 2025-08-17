import { Link, NavLink } from 'react-router-dom';
import { Sprout, User2 } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';

const Header = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-forest text-white">
      <div className="px-4 py-4 sm:py-5 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/70 rounded-lg">
            <div className="bg-accent/20 p-2 rounded-xl">
              <Sprout className="h-7 w-7 text-accent" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold">FarmGuru</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-white/90">
            <NavLink to="/query" className={({isActive}) => isActive ? 'font-semibold' : ''}>Query</NavLink>
            <NavLink to="/weather" className={({isActive}) => isActive ? 'font-semibold' : ''}>Weather</NavLink>
            <NavLink to="/market" className={({isActive}) => isActive ? 'font-semibold' : ''}>Market</NavLink>
            <NavLink to="/schemes" className={({isActive}) => isActive ? 'font-semibold' : ''}>Schemes</NavLink>
            <NavLink to="/community" className={({isActive}) => isActive ? 'font-semibold' : ''}>Community</NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <NavLink
              to="/profile"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Profile"
            >
              <User2 className="w-5 h-5" />
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;