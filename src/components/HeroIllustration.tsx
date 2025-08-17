import { motion } from 'framer-motion';

const HeroIllustration = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <motion.svg
        width="100%"
        height="auto"
        viewBox="0 0 600 320"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        role="img"
        aria-labelledby="heroTitle heroDesc"
      >
        <title id="heroTitle">Farmer and plant illustration</title>
        <desc id="heroDesc">A farmer silhouette and a plant sprouting, representing agriculture</desc>
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a8f6d" />
            <stop offset="100%" stopColor="#74c69d" />
          </linearGradient>
        </defs>
        <g>
          <motion.circle cx="520" cy="60" r="28" fill="#f6a71d" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }} />
          <motion.path d="M80,260 C100,220 150,200 210,210 C230,213 245,220 270,235 L270,260 Z" fill="#c1e3d3" opacity="0.6" />
          <motion.path d="M270,260 L270,200 C280,180 295,165 320,160 C345,155 360,165 370,180 C380,195 385,210 390,230 L390,260 Z" fill="#a7d7c2" opacity="0.7" />

          <motion.path d="M310,180 C315,160 330,145 348,140 C340,158 328,170 310,180 Z" fill="url(#leafGrad)" initial={{ y: 0 }} animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.path d="M300,185 C298,170 295,155 295,140 C305,152 312,165 315,178 Z" fill="#2a8f6d" />

          <motion.rect x="120" y="170" width="80" height="90" rx="12" fill="#7a8b7f" opacity="0.9" />
          <motion.rect x="145" y="150" width="30" height="25" rx="6" fill="#7a8b7f" opacity="0.9" />
          <motion.circle cx="160" cy="250" r="10" fill="#58655d" />
        </g>
      </motion.svg>
    </div>
  );
};

export default HeroIllustration;