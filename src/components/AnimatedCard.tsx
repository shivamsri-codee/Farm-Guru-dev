import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const cardVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const hoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};

const AnimatedCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn('bg-white/90 backdrop-blur-md rounded-2xl shadow-soft border-0', className)}
    >
      <motion.div variants={hoverVariants}>{children}</motion.div>
    </motion.div>
  );
};

export default AnimatedCard;