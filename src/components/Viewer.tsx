import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BouquetState } from "../types";
import { BOUQUET_STYLES } from "../constants";
import { Flower } from "./Flower";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";
import { Mail, Heart, Clock } from "lucide-react";
import { formatDistanceToNow, isAfter } from "date-fns";

interface ViewerProps {
  initialState: BouquetState;
}

export const Viewer: React.FC<ViewerProps> = ({ initialState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const currentStyle = BOUQUET_STYLES.find((s) => s.id === initialState.styleId) || BOUQUET_STYLES[0];

  useEffect(() => {
    if (initialState.letter.unlockAt) {
      const unlockDate = new Date(initialState.letter.unlockAt);
      if (isAfter(unlockDate, new Date())) {
        setIsLocked(true);
        const timer = setInterval(() => {
          if (isAfter(unlockDate, new Date())) {
            setTimeLeft(formatDistanceToNow(unlockDate, { addSuffix: true }));
          } else {
            setIsLocked(false);
            clearInterval(timer);
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [initialState.letter.unlockAt]);

  const handleOpen = () => {
    if (isLocked) return;
    setIsOpen(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FDA4AF", "#F472B6", "#FB7185"],
    });
  };

  return (
    <div className={cn("fixed inset-0 flex flex-col items-center justify-center p-6 transition-colors duration-700", currentStyle.bgGradient, currentStyle.bgPattern)}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center space-y-8"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-48 h-48 bg-white flex items-center justify-center relative z-10 cursor-pointer group sketch-border border-stone-800 sketch-shadow"
                onClick={handleOpen}
              >
                {isLocked ? (
                  <Clock className="text-gray-300" size={80} />
                ) : (
                  <Mail className={cn("group-hover:scale-110 transition-transform", currentStyle.accentText)} size={80} />
                )}
                <div className={cn("absolute -bottom-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-lg", currentStyle.accentBg)}>
                  <Heart className="text-white fill-current" size={32} />
                </div>
              </motion.div>
              <div className={cn("absolute inset-0 blur-3xl opacity-30 rounded-full -z-10", currentStyle.secondaryBg)} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">A Gift for You</h1>
              <p className="text-gray-500">From {initialState.letter.from || "Someone Special"}</p>
            </div>

            {isLocked && (
              <div className="bg-white/50 backdrop-blur px-6 py-3 rounded-2xl border border-white/50 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Unlocks {timeLeft}</p>
              </div>
            )}

            {!isLocked && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className={cn(
                  "text-white font-bold px-10 py-4 rounded-full shadow-xl sketch-border",
                  currentStyle.accentBg,
                  currentStyle.accentBorder
                )}
              >
                Open Bouquet
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex flex-col"
          >
            {/* Flowers Canvas */}
            <div className="flex-1 relative overflow-hidden">
              {initialState.flowers.map((flower, i) => (
                <motion.div
                  key={flower.id}
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    scale: flower.scale, 
                    y: 0,
                    transition: { delay: i * 0.1 + 0.5 }
                  }}
                >
                  <Flower instance={flower} />
                </motion.div>
              ))}
            </div>

            {/* Letter Content */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              className="bg-white p-8 rounded-t-[3rem] max-w-2xl mx-auto w-full border-t-4 border-stone-800 sketch-shadow sketch-border"
            >
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide font-sketch">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">To</span>
                    <h2 className="text-2xl font-bold text-stone-800">{initialState.letter.to || "You"}</h2>
                  </div>
                  <Heart className={cn("fill-current", currentStyle.accentText)} size={24} />
                </div>
                
                <p className="text-stone-700 leading-relaxed text-xl italic">
                  "{initialState.letter.content}"
                </p>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">With Love,</span>
                  <p className="text-xl font-bold text-stone-800">{initialState.letter.from || "Someone Special"}</p>
                </div>
              </div>
              
              <button 
                onClick={() => window.location.href = window.location.origin}
                className="mt-8 w-full py-4 bg-stone-800 text-white rounded-2xl font-bold sketch-border border-stone-900 shadow-lg active:scale-95 transition-all"
              >
                Create your own bouquet 💐
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-sketch text-stone-400/60 pointer-events-none whitespace-nowrap z-50">
        Made By Muhammed Adhil with Love
      </div>
    </div>
  );
};
