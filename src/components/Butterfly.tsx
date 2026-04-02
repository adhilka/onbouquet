import React, { useMemo } from "react";
import { motion } from "motion/react";
import { ButterflyInstance } from "../types";

interface ButterflyProps {
  instance: ButterflyInstance;
}

export const Butterfly: React.FC<ButterflyProps> = ({ instance }) => {
  // Create a more organic, randomized flight path based on the instance's initial position
  const flightPath = useMemo(() => {
    const points = 8;
    const xValues = [];
    const yValues = [];
    const rotateValues = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      xValues.push(instance.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 40);
      yValues.push(instance.y + Math.sin(angle) * radius + (Math.random() - 0.5) * 40);
      rotateValues.push(instance.rotation + (Math.random() - 0.5) * 60);
    }
    
    // Close the loop
    xValues.push(xValues[0]);
    yValues.push(yValues[0]);
    rotateValues.push(rotateValues[0]);
    
    return { x: xValues, y: yValues, rotate: rotateValues };
  }, [instance.x, instance.y, instance.rotation]);

  return (
    <motion.div
      initial={{ x: instance.x, y: instance.y, rotate: instance.rotation, scale: 0 }}
      animate={{
        x: flightPath.x,
        y: flightPath.y,
        rotate: flightPath.rotate,
        scale: instance.scale,
      }}
      transition={{
        duration: (8 + Math.random() * 4) / instance.speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute pointer-events-none z-30"
      style={{ width: 40, height: 40 }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left Wing */}
        <motion.div
          className="absolute right-1/2 w-[45%] h-[80%] origin-right"
          animate={{
            rotateY: [0, -70, 0],
          }}
          transition={{
            duration: 0.2 + Math.random() * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 50 100" className="w-full h-full drop-shadow-md">
            <path
              d="M50 50 C50 20 10 10 5 30 C0 50 20 60 50 50 C20 60 10 90 30 95 C50 100 50 80 50 50"
              fill={instance.color}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
            {/* Wing Pattern */}
            <circle cx="20" cy="35" r="4" fill="white" fillOpacity="0.3" />
            <circle cx="30" cy="75" r="3" fill="white" fillOpacity="0.2" />
          </svg>
        </motion.div>

        {/* Right Wing */}
        <motion.div
          className="absolute left-1/2 w-[45%] h-[80%] origin-left"
          animate={{
            rotateY: [0, 70, 0],
          }}
          transition={{
            duration: 0.2 + Math.random() * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 50 100" className="w-full h-full drop-shadow-md">
            <path
              d="M0 50 C0 20 40 10 45 30 C50 50 30 60 0 50 C30 60 40 90 20 95 C0 100 0 80 0 50"
              fill={instance.color}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
            {/* Wing Pattern */}
            <circle cx="30" cy="35" r="4" fill="white" fillOpacity="0.3" />
            <circle cx="20" cy="75" r="3" fill="white" fillOpacity="0.2" />
          </svg>
        </motion.div>

        {/* Body */}
        <div 
          className="absolute w-[10%] h-[60%] bg-stone-800 rounded-full z-10 shadow-sm"
          style={{ transform: 'translateY(-10%)' }}
        />
        
        {/* Antennae */}
        <div className="absolute top-0 w-full h-full pointer-events-none">
          <div className="absolute top-[15%] left-[45%] w-[1px] h-[20%] bg-stone-800 origin-bottom -rotate-[20deg]" />
          <div className="absolute top-[15%] right-[45%] w-[1px] h-[20%] bg-stone-800 origin-bottom rotate-[20deg]" />
        </div>
      </div>
    </motion.div>
  );
};
