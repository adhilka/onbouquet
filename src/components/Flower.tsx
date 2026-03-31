import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FlowerInstance, FlowerType } from "../types";
import { FLOWER_TYPES } from "../constants";
import { cn } from "../lib/utils";

interface FlowerProps {
  instance: FlowerInstance;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<FlowerInstance>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  showNote?: boolean;
  dragConstraints?: React.RefObject<HTMLDivElement>;
}

export const Flower: React.FC<FlowerProps> = ({
  instance,
  isEditing,
  onUpdate,
  onSelect,
  isSelected,
  showNote,
  dragConstraints,
}) => {
  const type = FLOWER_TYPES.find((t) => t.id === instance.typeId) || FLOWER_TYPES[0];

  return (
    <motion.div
      drag={isEditing}
      dragMomentum={false}
      dragElastic={0}
      dragTransition={{ power: 0, timeConstant: 0 }}
      dragConstraints={dragConstraints}
      onDragEnd={(_, info) => {
        if (onUpdate) {
          onUpdate({
            x: instance.x + info.offset.x,
            y: instance.y + info.offset.y,
          });
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      style={{
        position: "absolute",
        x: instance.x,
        y: instance.y,
        rotate: instance.rotation,
        scale: instance.scale,
        cursor: isEditing ? (isSelected ? "grabbing" : "grab") : "default",
        userSelect: "none",
        touchAction: "none",
      }}
      className={cn(
        "relative transition-shadow",
        isSelected && "ring-2 ring-blue-400 ring-offset-4 rounded-full"
      )}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: instance.opacity ?? 1, 
        scale: instance.scale,
        x: instance.x,
        y: instance.y,
        rotate: instance.rotation
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        opacity: { duration: 0.3 },
        x: { duration: 0 }, // No animation for position updates to avoid "jumping"
        y: { duration: 0 }
      }}
      whileHover={isEditing ? { scale: instance.scale * 1.05 } : {}}
      whileDrag={{ scale: instance.scale * 1.1, cursor: "grabbing" }}
    >
      {instance.customImageUrl ? (
        <div className="w-24 h-24 flex items-center justify-center">
          <img 
            src={instance.customImageUrl} 
            alt="Custom Flower"
            className="w-full h-full object-contain drop-shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : type.imageUrl ? (
        <div className="w-24 h-24 flex items-center justify-center">
          <img 
            src={type.imageUrl} 
            alt={type.name}
            className="w-full h-full object-contain drop-shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-24 h-24 drop-shadow-lg"
          style={{ fill: type.color }}
        >
          <path
            d={type.path}
            stroke="black"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fillOpacity="0.8"
          />
        </svg>
      )}
      
      <AnimatePresence>
        {instance.note && showNote && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.8, x: "-50%" }}
            className="absolute -top-12 left-1/2 bg-white px-3 py-1.5 rounded-xl text-[10px] font-sketch shadow-xl whitespace-nowrap pointer-events-none border-2 border-rose-800 sketch-border z-50"
            style={{ 
              boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
              transformOrigin: "bottom center",
              scale: 1 / instance.scale // Counteract flower scale to keep text readable
            }}
          >
            {instance.note}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-rose-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
