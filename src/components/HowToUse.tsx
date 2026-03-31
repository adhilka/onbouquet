import React from "react";
import { motion } from "motion/react";
import { X, Plus, Layout, PenTool, Type, Palette, MessageSquare, Send } from "lucide-react";
import { cn } from "../lib/utils";

interface HowToUseProps {
  onClose: () => void;
}

export const HowToUse: React.FC<HowToUseProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#fff1f2] rounded-3xl shadow-2xl overflow-hidden sketch-border border-2 border-rose-800 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-rose-800/10 bg-white/50">
          <h2 className="text-2xl font-bold font-sketch text-rose-800">How to Use Bouquet Maker 💐</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-200 hover:bg-rose-300 transition-colors text-rose-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
          
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-rose-800 uppercase tracking-wider text-sm">1. Getting Started</h3>
            <p className="text-rose-600 leading-relaxed">
              Welcome to the Bouquet Maker! You can start by adding flowers manually from our collection, or by drawing your own custom flowers from scratch to create a beautiful, personalized arrangement.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-rose-800 uppercase tracking-wider text-sm">2. The Toolbar Features</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0 border border-pink-200">
                  <Plus size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Add Flowers</h4>
                  <p className="text-xs text-rose-500 mt-1">Browse and add different types of flowers to your bouquet. You can drag them around, resize them, and rotate them.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0 border border-blue-200">
                  <Layout size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Layouts</h4>
                  <p className="text-xs text-rose-500 mt-1">Choose a pre-made arrangement shape (like Circle, Heart, or Cascade) to automatically organize your flowers.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center shrink-0 border border-purple-200">
                  <PenTool size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Draw Custom</h4>
                  <p className="text-xs text-rose-500 mt-1">Unleash your creativity! Draw your own custom flowers or decorations and add them directly to the bouquet.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200">
                  <Type size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Write a Letter</h4>
                  <p className="text-xs text-rose-500 mt-1">Attach a heartfelt letter to your bouquet. You can set a "To", "From", and even lock it until a specific date!</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Palette size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Styling</h4>
                  <p className="text-xs text-rose-500 mt-1">Change the overall aesthetic of your bouquet canvas. Choose from themes like Romantic, Vintage, Midnight, and more.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border-2 border-rose-800/5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 border border-rose-200">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Reveal Settings</h4>
                  <p className="text-xs text-rose-500 mt-1">Customize the "envelope" screen that the recipient sees first. Change the title, subtitle, button text, and icon.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-rose-800 uppercase tracking-wider text-sm">3. Interacting with Flowers</h3>
            <ul className="list-disc pl-5 text-rose-600 space-y-2 text-sm">
              <li><strong>Move:</strong> Click and drag any flower to move it around the canvas.</li>
              <li><strong>Select:</strong> Click a flower to select it. A menu will appear allowing you to resize, rotate, duplicate, or delete it.</li>
              <li><strong>Add Notes:</strong> When a flower is selected, you can type a small note that will be attached directly to that specific flower!</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-rose-800 uppercase tracking-wider text-sm">4. Sharing Your Bouquet</h3>
            <div className="bg-rose-800 text-white p-4 rounded-2xl flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Send size={18} />
              </div>
              <p className="text-sm leading-relaxed">
                Once your masterpiece is complete, click the <strong>Send</strong> button (the paper plane icon) in the bottom toolbar. This will generate a unique link that you can copy and send to your special someone!
              </p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
};
