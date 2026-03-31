import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BouquetState } from "../types";
import { BOUQUET_STYLES } from "../constants";
import { Flower } from "./Flower";
import { HowToUse } from "./HowToUse";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";
import { Mail, Heart, Clock, ChevronDown, ChevronUp, Maximize2, Minimize2, Download, Loader2, Gift, Sparkles } from "lucide-react";
import { formatDistanceToNow, isAfter } from "date-fns";
import { toPng } from "html-to-image";

interface ViewerProps {
  initialState: BouquetState;
}

export const Viewer: React.FC<ViewerProps> = ({ initialState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
  const [isLetterMinimized, setIsLetterMinimized] = useState(false);
  const [isLetterFullScreen, setIsLetterFullScreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

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

  // Set default selected flower (first one with a note)
  useEffect(() => {
    if (isOpen && !selectedFlowerId) {
      const firstWithNote = initialState.flowers.find(f => f.note);
      if (firstWithNote) {
        setSelectedFlowerId(firstWithNote.id);
      }
    }
  }, [isOpen, initialState.flowers, selectedFlowerId]);

  const handleOpen = () => {
    if (isLocked) return;
    setIsOpen(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#FDA4AF", "#F472B6", "#FB7185", "#E879F9"],
    });
  };

  const exportRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (!exportRef.current) return;
    
    setIsSaving(true);
    try {
      // Temporarily make the export container visible for capture
      exportRef.current.style.display = 'flex';
      
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
        }
      });
      
      exportRef.current.style.display = 'none';
      
      const link = document.createElement('a');
      link.download = `bouquet-from-${initialState.letter.from || 'someone'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image', err);
      if (exportRef.current) {
        exportRef.current.style.display = 'none';
      }
    } finally {
      setIsSaving(false);
    }
  };

  const minX = initialState.flowers.length > 0 ? Math.min(...initialState.flowers.map(f => f.x)) : 0;
  const maxX = initialState.flowers.length > 0 ? Math.max(...initialState.flowers.map(f => f.x)) : 0;
  const minY = initialState.flowers.length > 0 ? Math.min(...initialState.flowers.map(f => f.y)) : 0;
  const maxY = initialState.flowers.length > 0 ? Math.max(...initialState.flowers.map(f => f.y)) : 0;
  
  const flowersWidth = maxX - minX + 120;
  const flowersHeight = maxY - minY + 120;

  return (
    <div 
      ref={viewerRef}
      className={cn("fixed inset-0 flex flex-col items-center justify-center p-6 transition-colors duration-700 overflow-hidden", currentStyle.bgGradient, currentStyle.bgPattern)}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center space-y-8 relative z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-56 h-56 bg-white flex items-center justify-center relative z-10 cursor-pointer group sketch-border border-stone-800 sketch-shadow"
                onClick={handleOpen}
              >
                {isLocked ? (
                  <Clock className="text-gray-300" size={100} />
                ) : (
                  <>
                    {initialState.revealConfig?.icon === "heart" && <Heart className={cn("group-hover:scale-110 transition-transform", currentStyle.accentText)} size={100} />}
                    {initialState.revealConfig?.icon === "gift" && <Gift className={cn("group-hover:scale-110 transition-transform", currentStyle.accentText)} size={100} />}
                    {initialState.revealConfig?.icon === "sparkles" && <Sparkles className={cn("group-hover:scale-110 transition-transform", currentStyle.accentText)} size={100} />}
                    {(!initialState.revealConfig?.icon || initialState.revealConfig?.icon === "mail") && <Mail className={cn("group-hover:scale-110 transition-transform", currentStyle.accentText)} size={100} />}
                  </>
                )}
                <div className={cn("absolute -bottom-6 -right-6 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl", currentStyle.accentBg)}>
                  <Heart className="text-white fill-current" size={40} />
                </div>
              </motion.div>
              <div className={cn("absolute inset-0 blur-[100px] opacity-40 rounded-full -z-10", currentStyle.secondaryBg)} />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-stone-800 font-sketch tracking-tight">{initialState.revealConfig?.title || "A Special Delivery"}</h1>
              <p className="text-stone-500 font-medium">{initialState.revealConfig?.subtitle || `From ${initialState.letter.from || "Someone Special"}`}</p>
            </div>

            {isLocked && (
              <div className="bg-white/60 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-stone-800/10 shadow-lg">
                <p className="text-sm font-bold text-stone-600 uppercase tracking-widest">Unlocks {timeLeft}</p>
              </div>
            )}

            {!isLocked && (
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className={cn(
                  "text-white font-bold px-12 py-5 rounded-full shadow-2xl sketch-border text-lg tracking-wide",
                  currentStyle.accentBg,
                  currentStyle.accentBorder
                )}
              >
                {initialState.revealConfig?.buttonText || "Reveal Bouquet"}
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex flex-col"
            onClick={() => setSelectedFlowerId(null)}
          >
            {/* Atmosphere Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={cn("absolute top-1/4 left-1/4 w-96 h-96 blur-[120px] opacity-20 rounded-full", currentStyle.secondaryBg)} />
              <div className={cn("absolute bottom-1/4 right-1/4 w-96 h-96 blur-[120px] opacity-20 rounded-full", currentStyle.accentBg)} />
            </div>

            {/* Flowers Canvas */}
            <div className="flex-1 relative overflow-visible">
              <motion.div 
                className="absolute inset-0"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {initialState.flowers.map((flower, i) => (
                  <Flower 
                    key={flower.id} 
                    instance={flower} 
                    showNote={selectedFlowerId === flower.id}
                    onSelect={() => setSelectedFlowerId(flower.id)}
                  />
                ))}
              </motion.div>
            </div>

            {/* Letter Content */}
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ 
                y: isLetterMinimized ? "calc(100% - 80px)" : 0, 
                opacity: 1,
                maxHeight: isLetterFullScreen ? "85vh" : "50vh",
                maxWidth: isLetterFullScreen ? "100%" : "42rem"
              }}
              transition={{ 
                type: "spring", 
                damping: 25,
                stiffness: 120,
                mass: 0.8
              }}
              className={cn(
                "bg-white/95 backdrop-blur-sm p-6 md:p-8 border-t-4 border-stone-800 sketch-shadow sketch-border relative z-50 mt-auto flex flex-col transition-all duration-500",
                isLetterFullScreen ? "rounded-t-none" : "rounded-t-[3rem] mx-auto w-full"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Toggle Buttons Container */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2 z-[60]">
                {/* Minimize Toggle */}
                <button
                  onClick={() => {
                    setIsLetterMinimized(!isLetterMinimized);
                    if (isLetterFullScreen) setIsLetterFullScreen(false);
                  }}
                  className="bg-white border-2 border-stone-800 rounded-full p-1 sketch-shadow hover:scale-110 transition-transform active:scale-95"
                >
                  {isLetterMinimized ? (
                    <ChevronUp className="text-stone-800" size={14} />
                  ) : (
                    <ChevronDown className="text-stone-800" size={14} />
                  )}
                </button>

                {/* Full Screen Toggle */}
                {!isLetterMinimized && (
                  <button
                    onClick={() => setIsLetterFullScreen(!isLetterFullScreen)}
                    className="bg-white border-2 border-stone-800 rounded-full p-1 sketch-shadow hover:scale-110 transition-transform active:scale-95"
                  >
                    {isLetterFullScreen ? (
                      <Minimize2 className="text-stone-800" size={14} />
                    ) : (
                      <Maximize2 className="text-stone-800" size={14} />
                    )}
                  </button>
                )}
              </div>

              {/* Save Image Button */}
              {!isLetterMinimized && (
                <button
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full sketch-border border-stone-800 shadow-sm transition-all active:scale-95 z-[70] save-image-btn"
                  title="Save as Image"
                >
                  {isSaving ? (
                    <Loader2 className="text-stone-800 animate-spin" size={16} />
                  ) : (
                    <Download className="text-stone-800" size={16} />
                  )}
                </button>
              )}

              <div className={cn(
                "space-y-6 overflow-y-auto pr-2 scrollbar-hide font-sketch transition-all duration-500 flex-1",
                isLetterMinimized ? "max-h-[0px] opacity-0 overflow-hidden" : "opacity-100"
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black">To</span>
                    <h2 className="text-2xl font-bold text-stone-800 mt-0.5">{initialState.letter.to || "You"}</h2>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className={cn("fill-current", currentStyle.accentText)} size={24} />
                  </motion.div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-4 top-0 text-4xl text-stone-200 font-serif">“</div>
                  <p className={cn(
                    "text-stone-700 leading-relaxed italic relative z-10 px-2",
                    initialState.letter.content.length > 200 ? "text-lg" : "text-xl"
                  )}>
                    {initialState.letter.content}
                  </p>
                  <div className="absolute -right-1 bottom-0 text-4xl text-stone-200 font-serif">”</div>
                </div>

                <div className="text-right pt-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black">With Love,</span>
                  <p className="text-xl font-bold text-stone-800 mt-0.5">{initialState.letter.from || "Someone Special"}</p>
                </div>
              </div>
              
              <div className={cn(
                "transition-all duration-500 shrink-0",
                isLetterMinimized ? "mt-0" : "mt-6"
              )}>
                <button 
                  onClick={() => window.location.href = window.location.origin}
                  className="w-full py-3 bg-stone-800 text-white rounded-2xl font-bold sketch-border border-stone-900 shadow-lg active:scale-95 transition-all text-sm tracking-wide"
                >
                  {isLetterMinimized ? "Create Bouquet 💐" : "Create your own bouquet 💐"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-sketch text-stone-500/40 pointer-events-none whitespace-nowrap z-[60] uppercase tracking-widest footer-text flex items-center gap-1.5">
        <span>Made By <a href="https://instagram.com/axhilxif" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-stone-500 underline">Muhammed Adhil</a> with Love</span>
        <span>•</span>
        <button onClick={() => setShowHowToUse(true)} className="pointer-events-auto hover:text-stone-500 underline uppercase tracking-widest">How to use</button>
      </div>

      <AnimatePresence>
        {showHowToUse && <HowToUse onClose={() => setShowHowToUse(false)} />}
      </AnimatePresence>

      {/* Hidden Export Container */}
      <div 
        ref={exportRef}
        className={cn(
          "fixed top-0 left-0 w-[800px] flex flex-col items-center justify-start p-12 overflow-visible",
          currentStyle.bgGradient, 
          currentStyle.bgPattern
        )}
        style={{ display: 'none', zIndex: -9999, minHeight: '1200px' }}
      >
        {/* Atmosphere Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn("absolute top-1/4 left-1/4 w-96 h-96 blur-[120px] opacity-20 rounded-full", currentStyle.secondaryBg)} />
          <div className={cn("absolute bottom-1/4 right-1/4 w-96 h-96 blur-[120px] opacity-20 rounded-full", currentStyle.accentBg)} />
        </div>

        <div className="text-center space-y-4 pt-8 relative z-10 w-full shrink-0">
          <h1 className="text-5xl font-bold text-stone-800 font-sketch tracking-tight">{initialState.revealConfig?.title || "A Special Delivery"}</h1>
          <p className="text-xl text-stone-500 font-medium">{initialState.revealConfig?.subtitle || `From ${initialState.letter.from || "Someone Special"}`}</p>
        </div>

        {/* Flowers Canvas */}
        <div className="relative w-full flex items-center justify-center my-12 shrink-0" style={{ minHeight: '500px' }}>
          <div 
            className="relative"
            style={{ 
              width: flowersWidth, 
              height: flowersHeight,
              transform: `scale(${Math.min(1, 700 / flowersWidth)})`,
              transformOrigin: 'center center'
            }}
          >
            {initialState.flowers.map((flower) => (
              <Flower 
                key={flower.id} 
                instance={{...flower, x: flower.x - minX + 12, y: flower.y - minY + 12}} 
                showNote={true}
              />
            ))}
          </div>
        </div>

        {/* Letter Content */}
        <div className="bg-white/95 backdrop-blur-sm p-10 border-4 border-stone-800 sketch-shadow sketch-border relative z-50 w-full max-w-2xl rounded-[3rem] shrink-0 mb-8">
          <div className="space-y-8 font-sketch">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm uppercase tracking-[0.2em] text-stone-400 font-black">To</span>
                <h2 className="text-4xl font-bold text-stone-800 mt-1">{initialState.letter.to || "You"}</h2>
              </div>
              <Heart className={cn("fill-current", currentStyle.accentText)} size={40} />
            </div>
            
            <div className="relative py-4">
              <div className="absolute -left-4 top-0 text-6xl text-stone-200 font-serif">“</div>
              <p className={cn(
                "text-stone-700 leading-relaxed italic relative z-10 px-6",
                initialState.letter.content.length > 200 ? "text-2xl" : "text-3xl"
              )}>
                {initialState.letter.content}
              </p>
              <div className="absolute -right-1 bottom-0 text-6xl text-stone-200 font-serif">”</div>
            </div>

            <div className="text-right pt-4">
              <span className="text-sm uppercase tracking-[0.2em] text-stone-400 font-black">With Love,</span>
              <p className="text-3xl font-bold text-stone-800 mt-1">{initialState.letter.from || "Someone Special"}</p>
            </div>
          </div>
        </div>

        <div className="text-sm font-sketch text-stone-500/60 mt-8 uppercase tracking-widest">
          Made By <a href="https://instagram.com/axhilxif" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-stone-500 underline">Muhammed Adhil</a> with Love
        </div>
      </div>
    </div>
  );
};
