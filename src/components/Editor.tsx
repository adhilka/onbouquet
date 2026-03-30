import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Send, Settings, Trash2, Type, Palette, MessageSquare, X, Eye, Layout, Copy, Share2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { BouquetState, FlowerInstance } from "../types";
import { FLOWER_TYPES, BOUQUET_STYLES, PRESET_LAYOUTS } from "../constants";
import { Flower } from "./Flower";
import { Viewer } from "./Viewer";
import { getShareUrl, getShortUrl } from "../utils/sharing";
import { cn } from "../lib/utils";

export const Editor: React.FC = () => {
  const [state, setState] = useState<BouquetState>({
    flowers: [],
    letter: { to: "", from: "", content: "" },
    styleId: "romantic",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"flowers" | "letter" | "style" | "layouts" | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isShortening, setIsShortening] = useState(false);

  const handleShare = async () => {
    setShowShare(true);
    setIsShortening(true);
    setShortUrl(""); // Clear previous URL
    let longUrl = "";
    try {
      longUrl = getShareUrl(state);
      const short = await getShortUrl(longUrl);
      setShortUrl(short);
    } catch (error) {
      console.error("Error in handleShare:", error);
      if (longUrl) setShortUrl(longUrl);
    } finally {
      setIsShortening(false);
    }
  };
  const [isPreview, setIsPreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const applyLayout = (layoutId: string) => {
    const layout = PRESET_LAYOUTS.find(l => l.id === layoutId);
    if (layout) {
      setState(prev => {
        const newFlowers = [...prev.flowers];
        // If we have existing flowers, try to map them to layout positions
        // Otherwise, create new ones from the layout
        const layoutFlowers = layout.flowers.map((lf, i) => {
          if (newFlowers[i]) {
            return {
              ...newFlowers[i],
              x: lf.x,
              y: lf.y,
              scale: lf.scale,
              rotation: lf.rotation
            };
          }
          return {
            ...lf,
            id: Math.random().toString(36).substr(2, 9)
          };
        });

        return {
          ...prev,
          flowers: layoutFlowers
        };
      });
      setActiveTab(null);
    }
  };

  const currentStyle = BOUQUET_STYLES.find((s) => s.id === state.styleId) || BOUQUET_STYLES[0];

  if (isPreview) {
    return (
      <div className="relative h-full">
        <Viewer initialState={state} />
        <button 
          onClick={() => setIsPreview(false)}
          className={cn(
            "fixed top-6 right-6 z-[100] bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2",
            currentStyle.accentText
          )}
        >
          <X size={20} /> Exit Preview
        </button>
      </div>
    );
  }

  const addFlower = (typeId: string) => {
    const newFlower: FlowerInstance = {
      id: Math.random().toString(36).substr(2, 9),
      typeId,
      x: window.innerWidth / 2 - 50,
      y: window.innerHeight / 2 - 50,
      scale: 1,
      rotation: 0,
    };
    setState((prev) => ({ ...prev, flowers: [...prev.flowers, newFlower] }));
    setSelectedId(newFlower.id);
    setActiveTab(null);
  };

  const updateFlower = (id: string, updates: Partial<FlowerInstance>) => {
    setState((prev) => ({
      ...prev,
      flowers: prev.flowers.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const removeFlower = (id: string) => {
    setState((prev) => ({
      ...prev,
      flowers: prev.flowers.filter((f) => f.id !== id),
    }));
    setSelectedId(null);
  };

  const moveFlower = (id: string | null, dx: number, dy: number) => {
    if (!id) return;
    const flower = state.flowers.find(f => f.id === id);
    if (flower) {
      updateFlower(id, { x: flower.x + dx, y: flower.y + dy });
    }
  };

  const zoomFlower = (id: string | null, delta: number) => {
    if (!id) return;
    const flower = state.flowers.find(f => f.id === id);
    if (flower) {
      updateFlower(id, { scale: Math.max(0.1, Math.min(5, flower.scale + delta)) });
    }
  };

  return (
    <div className={cn("fixed inset-0 flex flex-col transition-colors duration-700", currentStyle.bgGradient, currentStyle.bgPattern)}>
      {/* Canvas Area - Maximum Space */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden touch-none"
        onClick={() => {
          setSelectedId(null);
          setActiveTab(null);
        }}
      >
        <AnimatePresence>
          {state.flowers.map((flower) => (
            <Flower
              key={flower.id}
              instance={flower}
              isEditing
              isSelected={selectedId === flower.id}
              onSelect={() => setSelectedId(flower.id)}
              onUpdate={(updates) => updateFlower(flower.id, updates)}
            />
          ))}
        </AnimatePresence>
        
        {state.flowers.length === 0 && !activeTab && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xs space-y-8"
            >
              <div className="space-y-2">
                <p className="text-2xl font-sketch font-bold text-stone-800">Start your bouquet</p>
                <p className="text-stone-500 font-sketch italic">Choose a layout to begin, or tap + to add flowers manually</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {PRESET_LAYOUTS.slice(0, 4).map((layout) => (
                  <button
                    key={layout.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyLayout(layout.id);
                    }}
                    className={cn(
                      "py-4 rounded-2xl bg-white/80 backdrop-blur-sm font-bold text-stone-600 transition-all text-sm sketch-border border-stone-800 sketch-shadow",
                      `hover:${currentStyle.accentBg} hover:text-white`
                    )}
                  >
                    {layout.name}
                  </button>
                ))}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("flowers");
                }}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-white transition-all sketch-border sketch-shadow",
                  currentStyle.accentBg,
                  currentStyle.accentBorder
                )}
              >
                Add Flowers Manually
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 bg-white/50 backdrop-blur-md p-2 rounded-full sketch-border border-stone-800 shadow-xl">
        <button 
          onClick={() => setActiveTab(activeTab === "flowers" ? null : "flowers")}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 sketch-border",
            activeTab === "flowers" 
              ? cn(currentStyle.accentBg, "text-white", currentStyle.accentBorder) 
              : "bg-white text-gray-600 border-stone-800"
          )}
        >
          <Plus size={24} />
        </button>
        
        <button 
          onClick={() => setActiveTab(activeTab === "layouts" ? null : "layouts")}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 sketch-border",
            activeTab === "layouts" 
              ? cn(currentStyle.accentBg, "text-white", currentStyle.accentBorder) 
              : "bg-white text-gray-600 border-stone-800"
          )}
        >
          <Layout size={20} />
        </button>

        <button 
          onClick={() => setActiveTab(activeTab === "letter" ? null : "letter")}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 sketch-border",
            activeTab === "letter" 
              ? cn(currentStyle.accentBg, "text-white", currentStyle.accentBorder) 
              : "bg-white text-gray-600 border-stone-800"
          )}
        >
          <Type size={20} />
        </button>

        <button 
          onClick={() => setActiveTab(activeTab === "style" ? null : "style")}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 sketch-border",
            activeTab === "style" 
              ? cn(currentStyle.accentBg, "text-white", currentStyle.accentBorder) 
              : "bg-white text-gray-600 border-stone-800"
          )}
        >
          <Palette size={20} />
        </button>

        <div className="w-px h-8 bg-stone-300 mx-1" />

        <button 
          onClick={handleShare}
          className={cn(
            "text-white px-6 h-12 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-all sketch-border",
            currentStyle.accentBg,
            currentStyle.accentBorder
          )}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>

      {/* Floating Toolbars */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-26 left-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 z-50 border-2 border-stone-800 sketch-border sketch-shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{activeTab}</h3>
              <button onClick={() => setActiveTab(null)} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
            </div>

            {activeTab === "flowers" && (
              <div className="grid grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                {FLOWER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addFlower(type.id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn("w-full aspect-square rounded-2xl bg-gray-50 flex items-center justify-center transition-colors", `group-hover:${currentStyle.secondaryBg}`)}>
                      <svg viewBox="0 0 100 100" className="w-10 h-10" style={{ fill: type.color }}>
                        <path d={type.path} stroke="black" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center">{type.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "layouts" && (
              <div className="grid grid-cols-2 gap-3">
                {PRESET_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => applyLayout(layout.id)}
                    className={cn(
                      "py-4 rounded-2xl bg-gray-50 font-bold text-gray-600 transition-all text-sm",
                      `hover:${currentStyle.accentBg} hover:text-white`
                    )}
                  >
                    {layout.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (confirm("Clear all flowers?")) {
                      setState(prev => ({ ...prev, flowers: [] }));
                      setActiveTab(null);
                    }
                  }}
                  className="py-4 rounded-2xl bg-red-50 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm"
                >
                  Clear All
                </button>
              </div>
            )}

            {activeTab === "letter" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">To</label>
                    <input
                      placeholder="Name"
                      className={cn("w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none", `focus:ring-2 focus:${currentStyle.secondaryBg.replace('bg-', 'ring-')}`)}
                      value={state.letter.to}
                      onChange={(e) => setState(prev => ({ ...prev, letter: { ...prev.letter, to: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">From</label>
                    <input
                      placeholder="Name"
                      className={cn("w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none", `focus:ring-2 focus:${currentStyle.secondaryBg.replace('bg-', 'ring-')}`)}
                      value={state.letter.from}
                      onChange={(e) => setState(prev => ({ ...prev, letter: { ...prev.letter, from: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Message</label>
                  <textarea
                    placeholder="Write something sweet..."
                    rows={4}
                    className={cn("w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none", `focus:ring-2 focus:${currentStyle.secondaryBg.replace('bg-', 'ring-')}`)}
                    value={state.letter.content}
                    onChange={(e) => setState(prev => ({ ...prev, letter: { ...prev.letter, content: e.target.value } }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Unlock Time (Optional)</label>
                  <input
                    type="datetime-local"
                    className={cn("w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none", `focus:ring-2 focus:${currentStyle.secondaryBg.replace('bg-', 'ring-')}`)}
                    value={state.letter.unlockAt || ""}
                    onChange={(e) => setState(prev => ({ ...prev, letter: { ...prev.letter, unlockAt: e.target.value } }))}
                  />
                </div>
              </div>
            )}

            {activeTab === "style" && (
              <div className="grid grid-cols-2 gap-3">
                {BOUQUET_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setState(prev => ({ ...prev, styleId: style.id }))}
                    className={cn(
                      "py-4 rounded-2xl font-bold text-sm transition-all border-2",
                      state.styleId === style.id 
                        ? cn(style.accentBorder, style.secondaryBg, style.secondaryText) 
                        : "border-transparent bg-gray-50 text-gray-500"
                    )}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flower Context Menu */}
      <AnimatePresence>
        {selectedId && !activeTab && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10, x: "-50%" }}
            animate={{ scale: 1, opacity: 1, y: 0, x: "-50%" }}
            exit={{ scale: 0.8, opacity: 0, y: 10, x: "-50%" }}
            className="fixed bottom-22 left-1/2 bg-white/95 backdrop-blur-md rounded-lg px-2 py-2 z-50 border border-stone-800 sketch-border shadow-lg flex flex-col gap-1.5 w-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 items-center">
                <button onClick={() => removeFlower(selectedId)} className="p-1 text-red-400 hover:text-red-500"><Trash2 size={12} /></button>
                <div className="w-[1px] h-3 bg-stone-100" />
                <span className="text-[7px] font-bold text-stone-300 uppercase">Edit</span>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-stone-300 hover:text-stone-500"><X size={12} /></button>
            </div>

            <div className="flex gap-2 items-center bg-stone-50/50 p-1 rounded-md border border-stone-100/50">
              {/* Ultra Compact PTZ */}
              <div className="grid grid-cols-3 gap-0.5">
                <div />
                <button onClick={() => moveFlower(selectedId, 0, -2)} className="p-0.5 bg-white rounded border border-stone-200"><ChevronUp size={10} /></button>
                <div />
                <button onClick={() => moveFlower(selectedId, -2, 0)} className="p-0.5 bg-white rounded border border-stone-200"><ChevronLeft size={10} /></button>
                <div className="w-3 h-3 flex items-center justify-center text-[5px] text-stone-300">2px</div>
                <button onClick={() => moveFlower(selectedId, 2, 0)} className="p-0.5 bg-white rounded border border-stone-200"><ChevronRight size={10} /></button>
                <div />
                <button onClick={() => moveFlower(selectedId, 0, 2)} className="p-0.5 bg-white rounded border border-stone-200"><ChevronDown size={10} /></button>
                <div />
              </div>
              <div className="w-[1px] h-6 bg-stone-200" />
              <div className="flex flex-col gap-0.5">
                <button onClick={() => zoomFlower(selectedId, 0.1)} className="p-0.5 bg-white rounded border border-stone-200"><Plus size={10} /></button>
                <button onClick={() => zoomFlower(selectedId, -0.1)} className="p-0.5 bg-white rounded border border-stone-200"><Minus size={10} /></button>
              </div>
              <div className="w-[1px] h-6 bg-stone-200" />
              <div className="flex-1 space-y-1">
                <input 
                  type="range" min="0" max="360" step="10"
                  className="w-full h-0.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                  value={state.flowers.find(f => f.id === selectedId)?.rotation || 0}
                  onChange={(e) => updateFlower(selectedId, { rotation: parseInt(e.target.value) })}
                />
                <input 
                  type="range" min="0.5" max="2.5" step="0.2"
                  className="w-full h-0.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                  value={state.flowers.find(f => f.id === selectedId)?.scale || 1}
                  onChange={(e) => updateFlower(selectedId, { scale: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <input 
              type="text"
              placeholder="Note..."
              className="w-full bg-stone-50 border border-stone-100 rounded px-1.5 py-0.5 text-[9px] focus:border-stone-800 outline-none"
              value={state.flowers.find(f => f.id === selectedId)?.note || ""}
              onChange={(e) => updateFlower(selectedId, { note: e.target.value })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl relative text-center border-4 border-stone-800 sketch-border sketch-shadow"
            >
              <button 
                onClick={() => setShowShare(false)}
                className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-500 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-stone-800 sketch-border">
                <Send className="text-stone-800" size={40} />
              </div>
              
              <h3 className="text-3xl font-sketch font-black text-stone-800 mb-4 tracking-tight">Send Love</h3>
              <p className="text-stone-500 mb-6 leading-relaxed font-sketch">Your digital bouquet is ready to be delivered. Choose how you'd like to send it!</p>
              
              <div className="space-y-6">
                {/* QR Code Section */}
                {shortUrl && !isShortening && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border-2 border-stone-800 sketch-border shadow-sm"
                  >
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}`} 
                      alt="Bouquet QR Code"
                      className="w-32 h-32 mb-2"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[10px] font-sketch text-stone-400 uppercase tracking-widest">Scan to open</p>
                  </motion.div>
                )}

                {isShortening ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className={cn("w-10 h-10 border-4 border-stone-100 rounded-full animate-spin", currentStyle.accentBorder.replace('border-', 'border-t-'))} />
                    <p className="text-sm font-sketch text-stone-500">Creating your link...</p>
                  </div>
                ) : shortUrl && (
                  <div className="bg-stone-50 p-5 rounded-3xl border-2 border-stone-800 sketch-border overflow-hidden relative">
                    <p className="text-sm font-bold text-stone-800 truncate mb-1 pr-8">
                      {shortUrl}
                    </p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(shortUrl);
                        const btn = document.getElementById('copy-indicator');
                        if (btn) {
                          btn.classList.remove('opacity-0');
                          setTimeout(() => btn.classList.add('opacity-0'), 2000);
                        }
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                    <div id="copy-indicator" className="absolute right-12 top-1/2 -translate-y-1/2 text-green-600 font-sketch text-xs opacity-0 transition-opacity">
                      Copied!
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={!shortUrl || isShortening}
                    onClick={() => {
                      navigator.clipboard.writeText(shortUrl);
                      const btn = document.getElementById('copy-btn-modal');
                      if (btn) {
                        const originalText = btn.innerText;
                        btn.innerText = "Copied!";
                        setTimeout(() => btn.innerText = originalText, 2000);
                      }
                    }}
                    id="copy-btn-modal"
                    className="flex items-center justify-center gap-2 bg-stone-800 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 sketch-border border-stone-900"
                  >
                    <Copy size={18} />
                    <span>Copy Link</span>
                  </button>

                  <button 
                    disabled={!shortUrl || isShortening}
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'A Digital Bouquet for You',
                            text: 'I made this digital bouquet for you! 💐',
                            url: shortUrl,
                          });
                        } catch (err) {
                          console.error('Error sharing:', err);
                        }
                      } else {
                        // Fallback for browsers that don't support Web Share API
                        window.open(`https://wa.me/?text=${encodeURIComponent('I made this digital bouquet for you! 💐 ' + shortUrl)}`, '_blank');
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-white text-stone-800 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 sketch-border border-stone-800"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Toggle */}
      <button 
        onClick={() => setIsPreview(true)}
        className={cn(
          "fixed top-6 right-6 z-40 bg-white/80 backdrop-blur-xl w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-gray-400 transition-colors",
          `hover:${currentStyle.accentText}`
        )}
      >
        <Eye size={24} />
      </button>

      {/* Footer */}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-sketch text-stone-400/60 pointer-events-none whitespace-nowrap z-50">
        Made By Muhammed Adhil with Love
      </div>
    </div>
  );
};
