import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

interface CarouselDigitProps {
  value: number; // Single digit 0-9
}

export const CarouselDigit: React.FC<CarouselDigitProps> = ({ value }) => {
  const [activeValue, setActiveValue] = useState(value);

  // Use framer motion spring for luxurious Apple-like wheel elastic lag
  const springValue = useSpring(value, {
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  });

  useEffect(() => {
    springValue.set(value);
    setActiveValue(value);
  }, [value, springValue]);

  // Height of one digit in the carousel viewport
  const digitHeight = 72;

  // We map the continuous spring value directly to a Y offset to slide the track
  const translateY = useTransform(springValue, (val) => -val * digitHeight);

  // Generate digits list. Let's support 0 to 9.
  const digits = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div
      className="relative w-[48px] h-[72px] overflow-hidden select-none"
      style={{
        perspective: "600px",
      }}
    >
      {/* 3D cylindrical side shading overlays for date picker realism */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#18181F] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#18181F] to-transparent z-10 pointer-events-none" />
      
      {/* Subtle curved horizontal divider lines marking the picker window */}
      <div className="absolute top-[3px] left-0 right-0 h-[1px] bg-white/10 border-t border-white/5 z-10" />
      <div className="absolute bottom-[3px] left-0 right-0 h-[1px] bg-white/10 border-b border-white/5 z-10" />

      <motion.div
        className="absolute left-0 right-0 top-0 flex flex-col items-center"
        style={{
          y: translateY,
          transformStyle: "preserve-3d",
        }}
      >
        {digits.map((digit) => {
          // We can use a custom hook-less transform based on springValue to rotate individual digits,
          // but since writing custom sub-hook transforms can be slow, we can approximate
          // or construct a beautifully responsive reactive list.
          // Let's calculate the distance directly so it renders correctly.
          const digitOffset = digit - activeValue;
          
          return (
            <motion.div
              key={digit}
              className="w-full flex items-center justify-center font-bold text-white tracking-tight"
              style={{
                height: `${digitHeight}px`,
                fontSize: "56px",
                lineHeight: "72px",
                transformStyle: "preserve-3d",
              }}
              animate={{
                // Calculate style attributes on value change to preserve performance
                rotateX: Math.max(-55, Math.min(55, digitOffset * 28)),
                opacity: Math.max(0.12, 1 - Math.abs(digitOffset) * 0.44),
                scale: Math.max(0.72, 1 - Math.abs(digitOffset) * 0.14),
                z: -Math.abs(digitOffset) * 16,
              }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 15,
              }}
            >
              {digit}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
