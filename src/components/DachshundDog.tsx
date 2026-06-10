import React, { useMemo } from "react";
import { motion } from "motion/react";

interface DachshundDogProps {
  weight: number; // current pounds value
  isDragging: boolean;
  velocity: number; // movement velocity
  bounceOffset: number; // recoil coordinate offset (left/right)
}

export const DachshundDog: React.FC<DachshundDogProps> = ({
  weight,
  isDragging,
  velocity,
  bounceOffset,
}) => {
  // Map weight to body shapes.
  // Base weights range from 15 to 55 lbs
  const bodyMetrics = useMemo(() => {
    // Standard normal weight is 30 lbs
    // Let's make scaleX (girth) go from 0.65 (underweight) to 1.7 (super chonk)
    const factor = (weight - 15) / (55 - 15); // 0 to 1
    const clampedFactor = Math.max(0, Math.min(1, factor));

    const scaleX = 0.68 + clampedFactor * 0.95; // 0.68 (15lbs) -> 1.63 (55lbs)
    const scaleY = 0.85 + clampedFactor * 0.45; // 0.85 (15lbs) -> 1.3 (55lbs)

    // Adjust color rating: lighter/softer orange to deeper golden brown
    let color = "#eba741"; // default warm golden
    let statusText = "Fit & Happy";
    let breedClass = "Intermediate Todd";

    if (weight <= 20) {
      statusText = "Tiny Teacup Todd 🌸";
      breedClass = "Svelte Slinky";
      color = "#f6b553";
    } else if (weight <= 30) {
      statusText = "Perfect Fit Todd ✨";
      breedClass = "Optimal Athlete";
      color = "#eba741";
    } else if (weight <= 40) {
      statusText = "Slightly Plump Todd 🍟";
      breedClass = "Plush Sausage";
      color = "#df9429";
    } else if (weight <= 50) {
      statusText = "Chunky Champ Todd 🍩";
      breedClass = "Supreme Chonk";
      color = "#cc7d15";
    } else {
      statusText = "Absolute Unit Todd 👑";
      breedClass = "Mega Sausage Model";
      color = "#ba6b04";
    }

    return { scaleX, scaleY, color, statusText, breedClass };
  }, [weight]);

  // Ears rotation based on drag velocity and bounce
  // Base swaying from ambient breathing or wagging
  const earsRotationLeft = -Math.round(velocity * 0.8) + Math.sin(Date.now() / 150) * (isDragging ? 6 : 3) + bounceOffset * 0.5;
  const earsRotationRight = -Math.round(velocity * 0.8) - Math.sin(Date.now() / 150) * (isDragging ? 6 : 3) + bounceOffset * 0.5;

  // Tail wag angle - toned down to look very natural and responsive without spazzing out
  const tailSpeed = isDragging ? 0.012 : 0.008;
  const baseWag = Math.sin(Date.now() * tailSpeed) * (isDragging ? 14 : 7);
  const clampedVelocityEffect = Math.max(-10, Math.min(10, velocity * 0.4));
  const tailWagAngle = baseWag + clampedVelocityEffect;

  // We want the whole body to tilt slightly based on drag momentum (lean into the speed)
  const bodyTiltAngle = Math.max(-8, Math.min(8, velocity * 0.6));

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full select-none pointer-events-none">
      <motion.div
        className="w-[110px] h-[130px] relative flex justify-center items-center overflow-visible"
        style={{
          rotate: bodyTiltAngle,
          transformTemplate: ({ rotate }) => `rotate(${rotate})`,
        }}
        animate={{
          x: bounceOffset * 0.8,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for rich shadows and gradients */}
          <defs>
            {/* Body gradient */}
            <linearGradient id="dogBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffc56c" />
              <stop offset="35%" stopColor={bodyMetrics.color} />
              <stop offset="100%" stopColor="#ca7d18" />
            </linearGradient>

            {/* Ear gradient */}
            <linearGradient id="dogEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={bodyMetrics.color} />
              <stop offset="100%" stopColor="#bc7211" />
            </linearGradient>

            {/* Nose shadow gradient */}
            <radialGradient id="noseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#333333" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Snout gradient */}
            <linearGradient id="snoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed28b" />
              <stop offset="100%" stopColor={bodyMetrics.color} />
            </linearGradient>
            
            {/* Subtle bottom shadow to anchor the dog inside the teardrop bubble */}
            <radialGradient id="dogShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2c1600" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2c1600" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BACKGROUND AMBIENT SHADOW */}
          <ellipse
            cx="50"
            cy="85"
            rx={22 * bodyMetrics.scaleX}
            ry={12}
            fill="url(#dogShadow)"
          />

          {/* DOG TAIL (Sits on layer underneath body, curves outside teardrop point) */}
          {/* In the image, the tail originates from bottom of the body (cy ~85-90) and curves to the left and out. */}
          <g transform="translate(50, 92) scale(1, -1)">
            <motion.path
              d="M 0,0 C -3,12 -12,18 -18,12 C -20,10 -16,6 -12,9 C -8,11 -2,8 0,0"
              fill={bodyMetrics.color}
              stroke="#ca7d18"
              strokeWidth="1"
              strokeLinecap="round"
              style={{
                originX: "50px",
                originY: "92px",
                rotate: tailWagAngle,
              }}
              animate={{
                rotate: tailWagAngle,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
          </g>

          {/* MAIN SAUSAGE BODY */}
          <g>
            <motion.ellipse
              cx="50"
              cy="65"
              rx={18 * bodyMetrics.scaleX}
              ry={32 * bodyMetrics.scaleY}
              fill="url(#dogBodyGrad)"
              stroke="#ca7d18"
              strokeWidth="0.75"
              animate={{
                // Scale width based on chonk index
                scaleX: bodyMetrics.scaleX,
                scaleY: bodyMetrics.scaleY,
              }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 15,
              }}
            />

            {/* Subtle spine line */}
            <motion.path
              d={`M 50,${65 - 24 * bodyMetrics.scaleY} L 50,${65 + 24 * bodyMetrics.scaleY}`}
              stroke="#ca7d18"
              strokeWidth="1.2"
              strokeOpacity="0.32"
              strokeDasharray="4 3"
              animate={{
                scaleY: bodyMetrics.scaleY,
              }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 15,
              }}
            />
          </g>

          {/* HEAD AND EARS (Positions slightly above body midpoint facing top-down) */}
          <g transform={`translate(50, ${65 - 28 * bodyMetrics.scaleY})`}>
            {/* Neck Connection */}
            <ellipse cx="0" cy="5" rx="10" ry="6" fill={bodyMetrics.color} opacity="0.9" />

            {/* Head Sphere */}
            <circle cx="0" cy="-6" r="13" fill="url(#dogBodyGrad)" stroke="#ca7d18" strokeWidth="0.5" />

            {/* Snout pointing straight up (viewer looks down on head) */}
            <path
              d="M -7,-12 C -5,-23 5,-23 7,-12 C 5,-8 -5,-8 -7,-12 Z"
              fill="url(#snoutGrad)"
            />

            {/* Black Nose tip */}
            <ellipse cx="0" cy="-21" rx="3.5" ry="2.2" fill="url(#noseGrad)" />
            <circle cx="0.8" cy="-21.8" r="0.7" fill="#ffffff" opacity="0.7" />

            {/* Two tiny black eyes */}
            <circle cx="-4" cy="-10" r="1.5" fill="#1e1e1e" />
            <circle cx="4" cy="-10" r="1.5" fill="#1e1e1e" />
            {/* Eye shines */}
            <circle cx="-3.5" cy="-10.5" r="0.4" fill="#ffffff" />
            <circle cx="4.5" cy="-10.5" r="0.4" fill="#ffffff" />

            {/* FLOATING FLOPPY EARS */}
            {/* Left Ear */}
            <g transform="translate(-11, -8)">
              <motion.path
                d="M 1,-2 C -3,0 -7,4 -7,10 C -7,16 -2,18 2,12 C 4,9 3,2 1,-2 Z"
                fill="url(#dogEarGrad)"
                stroke="#a66107"
                strokeWidth="0.5"
                style={{ originX: "1px", originY: "-2px" }}
                animate={{ rotate: earsRotationLeft }}
                transition={{ type: "spring", stiffness: 180, damping: 12 }}
              />
            </g>

            {/* Right Ear */}
            <g transform="translate(11, -8)">
              <motion.path
                d="M -1,-2 C 3,0 7,4 7,10 C 7,16 2,18 -2,12 C -4,9 -3,2 -1,-2 Z"
                fill="url(#dogEarGrad)"
                stroke="#a66107"
                strokeWidth="0.5"
                style={{ originX: "-1px", originY: "-2px" }}
                animate={{ rotate: earsRotationRight }}
                transition={{ type: "spring", stiffness: 180, damping: 12 }}
              />
            </g>

            {/* Blush cheeks */}
            <circle cx="-8" cy="-4" r="2" fill="#ff7da4" opacity="0.45" />
            <circle cx="8" cy="-4" r="2" fill="#ff7da4" opacity="0.45" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
