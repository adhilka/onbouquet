import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HugSceneProps {
  isHugging: boolean;
}

export default function HugScene({ isHugging }: HugSceneProps) {
  // Spring physics configuration for a natural, weighty feel
  const springConfig = { type: 'spring', stiffness: 50, damping: 14, mass: 1 };

  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
      
      {/* Floating Hearts (Only visible when hugging) */}
      {isHugging && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0, scale: 0.5, x: (Math.random() - 0.5) * 40 }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -150 - Math.random() * 50, 
                scale: 1 + Math.random() * 0.5,
                x: (Math.random() - 0.5) * 80
              }}
              transition={{ 
                duration: 2.5 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeOut"
              }}
              className="absolute text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]"
            >
              <Heart fill="currentColor" size={24} />
            </motion.div>
          ))}
        </div>
      )}

      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl z-10 overflow-visible">
        {/* Floor Line */}
        <line x1="60" y1="350" x2="340" y2="350" stroke="#0f0f13" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

        {/* --- MAN (Left Side) --- */}
        <motion.g
          animate={{ 
            x: isHugging ? 48 : 0, 
            rotate: isHugging ? 6 : 0,
            y: isHugging ? 0 : [0, -2, 0] // Breathing when idle
          }}
          transition={isHugging ? springConfig : { y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          style={{ originX: "140px", originY: "350px" }}
        >
          {/* Back Arm (Visible during hug) */}
          <motion.rect 
            x="128" y="155" width="14" height="90" rx="7" fill="#0a0a0d"
            animate={{ rotate: isHugging ? -60 : 5 }}
            transition={springConfig}
            style={{ originX: "135px", originY: "162px" }}
          />

          {/* Torso */}
          <rect x="122" y="145" width="36" height="110" rx="18" fill="#0f0f13" />
          
          {/* Legs */}
          <rect x="125" y="240" width="14" height="110" rx="7" fill="#0f0f13" />
          <rect x="141" y="240" width="14" height="110" rx="7" fill="#0f0f13" />
          
          {/* Head */}
          <circle cx="140" cy="120" r="22" fill="#0f0f13" />

          {/* Front Arm */}
          <motion.rect 
            x="128" y="155" width="14" height="90" rx="7" fill="#14141a"
            animate={{ rotate: isHugging ? -80 : 0 }}
            transition={springConfig}
            style={{ originX: "135px", originY: "162px" }}
          />
        </motion.g>

        {/* --- WOMAN (Right Side) --- */}
        <motion.g
          animate={{ 
            x: isHugging ? -48 : 0, 
            rotate: isHugging ? -6 : 0,
            y: isHugging ? 0 : [0, -2, 0] // Breathing when idle (slightly offset)
          }}
          transition={isHugging ? springConfig : { y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          style={{ originX: "260px", originY: "350px" }}
        >
          {/* Back Arm */}
          <motion.rect 
            x="258" y="160" width="12" height="85" rx="6" fill="#0a0a0d"
            animate={{ rotate: isHugging ? 60 : -5 }}
            transition={springConfig}
            style={{ originX: "264px", originY: "166px" }}
          />

          {/* Torso */}
          <rect x="244" y="150" width="32" height="100" rx="16" fill="#0f0f13" />
          
          {/* Legs */}
          <rect x="246" y="240" width="12" height="110" rx="6" fill="#0f0f13" />
          <rect x="262" y="240" width="12" height="110" rx="6" fill="#0f0f13" />
          
          {/* Head & Hair */}
          <circle cx="260" cy="125" r="20" fill="#0f0f13" />
          <circle cx="278" cy="120" r="13" fill="#0f0f13" /> {/* Hair bun */}

          {/* Front Arm */}
          <motion.rect 
            x="258" y="160" width="12" height="85" rx="6" fill="#14141a"
            animate={{ rotate: isHugging ? 80 : 0 }}
            transition={springConfig}
            style={{ originX: "264px", originY: "166px" }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
