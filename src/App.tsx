/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeightSelector } from "./components/WeightSelector";
import { Sparkles, Heart } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between py-12 px-4 bg-[#0F0F12] text-white relative overflow-hidden">
      
      {/* Dynamic ambient lights to give high visual depth with white/slate glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-slate-800/20 blur-[130px] -z-10 pointer-events-none" />

      {/* Decorative top badge */}
      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-white/60 tracking-wider uppercase mb-6 shadow-xs select-none backdrop-blur-xs">
        <Sparkles className="w-3.5 h-3.5 text-white/85 animate-spin-slow" />
        Geometric Balance & Physics
      </div>

      {/* Main Interactive Widget */}
      <main className="w-full flex-1 flex items-center justify-center relative">
        <WeightSelector />
      </main>

      {/* Clean high-craft footer */}
      <footer className="mt-8 flex flex-col items-center justify-center gap-2 select-none text-center">
        <div className="flex items-center gap-1.5 text-white/40 font-mono text-[10px] uppercase tracking-wider">
          Crafted with <Heart className="w-3 h-3 text-white/50 animate-pulse fill-white/25" /> for Todd the Sausage Dog
        </div>
        <p className="text-[11px] text-white/30 max-w-md leading-relaxed px-4">
          Interactive weight unit conversion & elastic recoil physics model.
          Released values simulate damped spring motion.
        </p>
      </footer>
    </div>
  );
}
