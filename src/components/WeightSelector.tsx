import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkles, Footprints, Flame, Trophy, Scale, RotateCcw, HelpCircle } from "lucide-react";
import { DachshundDog } from "./DachshundDog";
import { CarouselDigit } from "./CarouselDigit";
import { WeightUnit } from "../types";

export const WeightSelector: React.FC = () => {
  // State variables
  const [selectedIdx, setSelectedIdx] = useState<number>(3); // Default index 3 (which represents 30 lbs)
  const [unit, setUnit] = useState<WeightUnit>("lbs");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Stats / state tracking
  const [treatsFed, setTreatsFed] = useState<number>(0);
  const [walksTaken, setWalksTaken] = useState<number>(0);
  const [activePlaytime, setActivePlaytime] = useState<boolean>(false);

  // Physics animation values for the pointer/teardrop bubble
  const [visualPercent, setVisualPercent] = useState<number>(0.375); // 0 (left) to 1 (right). Default index 3 of 8 is 3/8 = 0.375
  const [pointerVelocity, setPointerVelocity] = useState<number>(0);
  const [bounceOffset, setBounceOffset] = useState<number>(0); // Left/Right offset in pixels for recoil

  // References
  const trackRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const physicsFrameRef = useRef<number | null>(null);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Map slider steps to base values in lbs
  // The weight should change 5 pounds per horizontal tick
  const baseLbsValues = [15, 20, 25, 30, 35, 40, 45, 50, 55];
  
  // Current raw lbs based on index and items fed
  const currentLbsRaw = baseLbsValues[selectedIdx] + treatsFed * 2 - walksTaken * 1.5;
  const currentLbs = Math.max(10, Math.min(75, currentLbsRaw));

  // Conversions
  const currentKg = currentLbs * 0.45359237;

  // Derive the target percent based on the selected index
  const targetPercent = selectedIdx / 8;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Recoil physics solver loop
  useEffect(() => {
    let lastStamp = performance.now();

    const updatePhysics = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastStamp) / 1000); // capped to 50ms to avoid explosion
      lastStamp = now;

      // If dragging, visual percent follows the target percent instantly. 
      // Velocity is calculated from actual manual movement.
      if (isDragging) {
        setVisualPercent((prev) => {
          const diff = targetPercent - prev;
          // Smooth follow while dragging to prevent jagged frames
          return prev + diff * 0.45;
        });
        setBounceOffset(0);
      } else {
        // Physics recoil mode (Damped Harmonic Spring) when released
        const stiffness = 220; // Tension parameter
        const damping = 12;   // Friction parameter

        setVisualPercent((prevPercent) => {
          const displacement = prevPercent - targetPercent;
          const force = -stiffness * displacement;
          
          setPointerVelocity((prevVel) => {
            const nextVel = prevVel + (force - damping * prevVel) * dt;
            
            // Limit velocity to prevent extreme jitter
            const clampVel = Math.max(-5, Math.min(5, nextVel));
            return clampVel;
          });

          const nextPercent = prevPercent + pointerVelocity * dt;

          // Convert displacement to visual pixel bounce offset for character ears & body bending
          if (trackRef.current) {
            const trackWidth = trackRef.current.clientWidth;
            const pxOffset = displacement * trackWidth;
            setBounceOffset(pxOffset);
          }

          // If the difference is extremely low, snap and halt animation
          if (Math.abs(displacement) < 0.0005 && Math.abs(pointerVelocity) < 0.02) {
            setPointerVelocity(0);
            setBounceOffset(0);
            return targetPercent;
          }

          return nextPercent;
        });
      }

      physicsFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    physicsFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (physicsFrameRef.current) {
        cancelAnimationFrame(physicsFrameRef.current);
      }
    };
  }, [isDragging, targetPercent, pointerVelocity, selectedIdx]);

  // Handle Dragging Interactions
  const handleDragUpdate = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const width = rect.width;
    const relativeX = clientX - rect.left;
    const rawPercent = Math.max(0, Math.min(1, relativeX / width));

    // Determine nearest step (0 to 8)
    const nearestIdx = Math.round(rawPercent * 8);
    setSelectedIdx(nearestIdx);

    // Calculate velocity based on change
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 1) {
      const dx = clientX - lastXRef.current;
      const speed = dx / dt; // pixels per millisecond
      setPointerVelocity(speed * 8); // Scaled for physics
    }
    lastXRef.current = clientX;
    lastTimeRef.current = now;
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    handleDragUpdate(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleDragUpdate(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const touch = e.touches[0];
    lastXRef.current = touch.clientX;
    lastTimeRef.current = performance.now();
    handleDragUpdate(touch.clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        handleDragUpdate(moveEvent.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Convert the weight decimal positions for digits carousel
  // e.g. 30 -> digits: ["3", "0"], decimal: null
  // average 13.6 -> digits: ["1", "3"], decimal: "6"
  const getCarouselData = () => {
    const value = unit === "lbs" ? Math.round(currentLbs) : Math.round(currentKg * 10) / 10;
    const strVal = value.toString();

    if (strVal.includes(".")) {
      const [intPart, decPart] = strVal.split(".");
      // Pad to ensure 2 digit intPart
      const paddedInt = intPart.padStart(2, "0");
      return {
        digits: [parseInt(paddedInt[0]), parseInt(paddedInt[1])],
        decimal: parseInt(decPart[0]),
        original: value,
      };
    } else {
      const paddedInt = strVal.padStart(2, "0");
      return {
        digits: [parseInt(paddedInt[0]), parseInt(paddedInt[1])],
        decimal: null,
        original: value,
      };
    }
  };

  const carouselData = getCarouselData();

  // Reset Playground actions
  const handleReset = () => {
    setTreatsFed(0);
    setWalksTaken(0);
    setSelectedIdx(3);
    setUnit("lbs");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 select-none">
      {/* Container holding the playground background and core UI */}
      <div className="w-full max-w-[620px] bg-[#141419]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,255,255,0.03)] relative overflow-hidden backdrop-blur-md">
        
        {/* Soft elegant subtle glow to emulate modern geometric background */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-white/[0.02] -translate-x-12 -translate-y-20 -z-10 blur-2xl pointer-events-none" />

        {/* Top bar with toddler title name and status */}
        <div className="w-full flex justify-between items-center mb-16">
          <div className="flex flex-col">
            <h1 className="text-white font-light text-5xl tracking-normal leading-none">
              Todd
            </h1>
            <p className="text-white/40 font-mono text-[9px] mt-2.5 uppercase tracking-[0.3em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              Scale Calibration
            </p>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="flex flex-col items-end text-right">
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-all duration-200 shadow-xs border border-white/10"
                title="Reset Todd's scale"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN SLIDER AND TEARDROP SYSTEM */}
        <div className="relative w-full h-56 mt-6 mb-2 flex items-end select-none">
          
          {/* SLIDER PROGRESS AND TRACK (THE LONG COLOURED BAR) */}
          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full h-11 bg-white/[0.05] border border-white/10 rounded-full flex items-center px-4 cursor-pointer select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:scale-[0.99] transition-transform duration-100"
          >
            {/* White progress fill track inside the bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/10 border-r border-white/20 rounded-full pointer-events-none"
              style={{
                width: `calc(16px + ${visualPercent} * (100% - 32px))`,
                opacity: 0.95,
              }}
            />

            {/* THE TEARDROP FLOATING SELECTION BUBBLE - Positioned absolute inside/relative to track */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `calc(16px + ${visualPercent} * (100% - 32px) - 70px)`,
                bottom: "35px", // hovers beautifully right above the track lines, point aligned
                width: "140px",
                height: "172px",
                zIndex: 30,
              }}
            >
              {/* Dynamic Status Tooltip floating elegantly ABOVE the teardrop container */}
              <div className="absolute top-[-38px] left-0 right-0 flex justify-center z-40">
                <span className="bg-white text-stone-950 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-[0_6px_20px_rgba(0,0,0,0.6)] select-none whitespace-nowrap">
                  {currentLbs <= 20
                    ? "Tiny Teacup Todd 🌸"
                    : currentLbs <= 30
                    ? "Perfect Fit Todd ✨"
                    : currentLbs <= 40
                    ? "Slightly Plump Todd 🍟"
                    : currentLbs <= 50
                    ? "Chunky Champ Todd 🍩"
                    : "Absolute Unit Todd 👑"}
                </span>
              </div>

              {/* The white rounded droplet container */}
              <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)]">
                {/* Droplet bottom tail SVG background to perfectly match standard speech pointer */}
                <svg
                  viewBox="0 0 140 160"
                  className="absolute inset-0 w-full h-full fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Custom smooth rounded speech bubble path ending in sharp point at bottom tip (70, 155) */}
                  <path d="M 70,10 C 105,10 135,36 135,72 C 135,98 115,116 70,154 C 25,116 5,98 5,72 C 5,36 35,10 70,10 Z" />
                </svg>

                {/* Inside the Droplet: Custom interactive Animated Sausage Dog */}
                <div className="absolute inset-x-2 top-3 bottom-[26px] overflow-visible rounded-full">
                  <DachshundDog
                    weight={currentLbs}
                    isDragging={isDragging}
                    velocity={pointerVelocity}
                    bounceOffset={bounceOffset}
                  />
                </div>
              </div>
            </div>

            {/* Render stopping locations inside track */}
            <div className="w-full flex justify-between items-center relative z-10 pointer-events-none">
              {Array.from({ length: 9 }).map((_, idx) => {
                const isMajor = idx % 2 === 0; // Check if it is a main stopping Circle
                const isActive = idx <= selectedIdx;

                if (isMajor) {
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-center w-5 h-5"
                    >
                      <motion.div
                        className="rounded-full border-[3px]"
                        style={{
                          width: "18px",
                          height: "18px",
                        }}
                        animate={{
                          backgroundColor: isActive ? "#ffffff" : "transparent",
                          borderColor: isActive ? "#ffffff" : "rgba(255,255,255,0.2)",
                          scale: idx === selectedIdx ? 1.25 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-center w-1.5 h-6"
                    >
                      {/* Vertical ticks */}
                      <motion.div
                        className="w-[2.5px] rounded-full"
                        style={{
                          height: "14px",
                        }}
                        animate={{
                          backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.2)",
                          opacity: isActive ? 0.95 : 0.4,
                        }}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>

        {/* WEIGHT AND UNITS FOOTER DISPLAY SECTION */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 pb-2 border-t border-white/10 pt-6">
          
          {/* Left panel instructions details */}
          <div className="text-white/45 font-mono text-[9px] uppercase tracking-[0.18em] mb-4 sm:mb-0 text-center sm:text-left leading-relaxed">
            Drag track to update weight<br />
            <span className="text-white/70 font-semibold">+5 {unit} increments on tick points</span>
          </div>

          {/* Core Weight readout display using carousel and unit dropdown */}
          <div className="flex items-center gap-3">
            
            {/* CAROUSEL DIGITAL READOUTS IN PERSPECTIVE BOX */}
            <div className="flex items-center bg-[#18181F] px-3 py-1 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center overflow-hidden h-[72px]">
                {/* Digit 1 */}
                <CarouselDigit value={carouselData.digits[0]} />

                {/* Digit 2 */}
                <CarouselDigit value={carouselData.digits[1]} />

                {/* Decimal Dot and digit if KG */}
                <AnimatePresence mode="popLayout">
                  {carouselData.decimal !== null && (
                    <motion.div
                      key="decimal-container"
                      initial={{ width: 0, opacity: 0, scale: 0 }}
                      animate={{ width: "auto", opacity: 1, scale: 1 }}
                      exit={{ width: 0, opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 150, damping: 15 }}
                      className="flex items-center overflow-hidden"
                    >
                      {/* Dot symbol */}
                      <span className="text-white font-bold text-[56px] leading-[72px] mx-1 z-10">
                        .
                      </span>
                      {/* Decimal Digit */}
                      <CarouselDigit value={carouselData.decimal} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CUSTOM DROPDOWN UNIT TICKER SELECTOR (LBS / KG) */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-2xl px-4 py-2 rounded-xl cursor-pointer select-none transition-all duration-150 active:scale-95 shadow-xs"
              >
                <span>{unit}</span>
                <ChevronDown className="w-5 h-5 text-white/50 transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-[#18181F] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="text-[9px] font-mono text-white/40 px-3 py-1.5 uppercase tracking-wider">
                      Select Unit
                    </div>
                    <button
                      onClick={() => {
                        setUnit("lbs");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                        unit === "lbs"
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>Pounds (lbs)</span>
                      {unit === "lbs" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    </button>
                    <button
                      onClick={() => {
                        setUnit("kg");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                        unit === "kg"
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>Kilograms (kg)</span>
                      {unit === "kg" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* PLAYGROUND ACTIVITY INTERACTIONS PANEL */}
        <div className="mt-8 bg-white/[0.02] rounded-2xl p-4 sm:p-5 border border-white/5">
          <h3 className="text-white/90 font-medium text-sm tracking-wide mb-3.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-white/70 animate-pulse" />
            Playground Activities
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setTreatsFed((prev) => prev + 1);
              }}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl border border-white/10 active:scale-[0.98] transition-all duration-150 text-left cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/5 text-xl group-hover:scale-110 transition-transform duration-200">
                🦴
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-white">Feed Treat</span>
                <span className="text-[10px] text-white/40">+2 lbs sausage chonk</span>
              </div>
              <span className="ml-auto bg-white/10 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                x{treatsFed}
              </span>
            </button>

            <button
              onClick={() => {
                setWalksTaken((prev) => prev + 1);
              }}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl border border-white/10 active:scale-[0.98] transition-all duration-150 text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-white/80 group-hover:scale-110 transition-transform duration-200">
                <Footprints className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-white">Go for Walk</span>
                <span className="text-[10px] text-white/40">-1.5 lbs fitness burn</span>
              </div>
              <span className="ml-auto bg-white/10 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                x{walksTaken}
              </span>
            </button>
          </div>
        </div>

        {/* FUN TRIVIA CARD: SEAMLESS VALUE RESPONSIVE FEEDBACK */}
        <div className="mt-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
          <div className="flex flex-col text-xs text-white/60 leading-relaxed">
            <span className="font-bold text-white mb-0.5">Todd's Interactive Tip:</span>
            {currentLbs <= 20 ? (
              <span>Your Todd is super light! Tiny Dachshunds require gentle cuddles, light play, and regular meals to grow strong.</span>
            ) : currentLbs <= 35 ? (
              <span>Looking incredibly svelte! This is the ideal shape and body length for an adult Dachshund. Standard weight prevents back stress.</span>
            ) : currentLbs <= 50 ? (
              <span>Starting to get some solid sausage insulation. A few outdoor walking sessions and fewer meat treats will help him reclaim Olympic athletic shape!</span>
            ) : (
              <span>Absolute mega chonker! Todd is majestic and round. Please consult a digital veterinary assistant to avoid over-sausage-ification! 😅</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
