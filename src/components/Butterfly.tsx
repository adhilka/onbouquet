import React from "react";
import { motion } from "motion/react";
import { ButterflyInstance } from "../types";

interface ButterflyProps {
  instance: ButterflyInstance;
}

export const Butterfly: React.FC<ButterflyProps> = ({ instance }) => {
  return (
    <motion.div
      initial={{ x: instance.x, y: instance.y, rotate: instance.rotation, scale: 0 }}
      animate={{
        x: [instance.x - 20, instance.x + 20, instance.x - 10, instance.x + 15, instance.x],
        y: [instance.y - 15, instance.y + 10, instance.y - 20, instance.y + 5, instance.y],
        rotate: [instance.rotation - 10, instance.rotation + 10, instance.rotation],
        scale: instance.scale,
      }}
      transition={{
        duration: 4 / instance.speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute pointer-events-none z-30"
      style={{ width: 30, height: 30 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <motion.path
          d="M50 50 C20 20 10 40 10 60 C10 80 30 90 50 70 C70 90 90 80 90 60 C90 40 80 20 50 50"
          fill={instance.color}
          stroke="black"
          strokeWidth="2"
          animate={{
            d: [
              "M50 50 C20 20 10 40 10 60 C10 80 30 90 50 70 C70 90 90 80 90 60 C90 40 80 20 50 50",
              "M50 50 C35 35 30 45 30 55 C30 65 40 70 50 60 C60 70 70 65 70 55 C70 45 65 35 50 50",
              "M50 50 C20 20 10 40 10 60 C10 80 30 90 50 70 C70 90 90 80 90 60 C90 40 80 20 50 50",
            ],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
};
