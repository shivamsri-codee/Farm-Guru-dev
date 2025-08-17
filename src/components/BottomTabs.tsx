import { NavLink } from 'react-router-dom';
import { Home, Mic, ShoppingBasket, Users, User2 } from 'lucide-react';

const Tab = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${isActive ? 'text-[#2a8f6d]' : 'text-slate-500'} focus:outline-none focus:ring-2 focus:ring-[#2a8f6d]/40`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs mt-1">{label}</span>
  </NavLink>
);

const BottomTabs = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex">
        <Tab to="/" label="Home" icon={Home} />
        <Tab to="/query" label="Query" icon={Mic} />
        <Tab to="/market" label="Market" icon={ShoppingBasket} />
        <Tab to="/community" label="Community" icon={Users} />
        <Tab to="/profile" label="Profile" icon={User2} />
      </div>
    </nav>
  );
};

export default BottomTabs;