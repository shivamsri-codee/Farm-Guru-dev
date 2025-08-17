import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          © {new Date().getFullYear()} FarmGuru
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#2a8f6d]/50 rounded">
            About
          </Link>
          <a href="#sources" onClick={(e) => { e.preventDefault(); window.location.href = '/about#sources'; }} className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#2a8f6d]/50 rounded">
            Data & Sources
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;