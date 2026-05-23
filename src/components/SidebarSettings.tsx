"use client";

import { useState, useEffect } from 'react';
import { Settings, Layers, Image as ImageIcon, SlidersHorizontal, Sparkles, Crown, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
import { useStudioStore } from '@/store/useStudioStore';

export function SidebarSettings() {
  const { aspectRatio, setAspectRatio, aiModel, setAiModel, creativity, setCreativity } = useStudioStore();
  const [hfReady, setHfReady] = useState(false);

  useEffect(() => {
    // Simulate Hugging Face cold start warmup
    const timer = setTimeout(() => {
      setHfReady(true);
      // Auto-select Hugging Face SDXL when it becomes ready
      setAiModel('Hugging Face SDXL');
    }, 8000);
    return () => clearTimeout(timer);
  }, [setAiModel]);

  return (
    <div className="w-[260px] bg-[#050505] border-r border-[#1a1a1a] p-5 flex flex-col gap-8 h-full text-zinc-300 relative z-20 shadow-2xl">
      {/* Header */}
      <Link href="/" className="flex items-center gap-3 pb-2 border-b border-white/5 hover:opacity-80 transition-opacity">
        <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        <h2 className="font-bold text-white tracking-wide text-sm bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          Studio Canvas
        </h2>
      </Link>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" /> Dimensions
        </label>
        <select 
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl p-3 text-sm outline-none focus:border-purple-500/50 hover:border-[#333] transition-all cursor-pointer appearance-none text-zinc-200">
          <option value="16:9">16:9 (Landscape)</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="9:16">9:16 (Portrait)</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" /> Generation Engine
        </label>
        <select 
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl p-3 text-sm outline-none focus:border-purple-500/50 hover:border-[#333] transition-all cursor-pointer appearance-none text-zinc-200">
          <option value="Pollinations AI">Pollinations AI (Fast)</option>
          <option value="Hugging Face SDXL" disabled={!hfReady}>
            {hfReady ? 'Hugging Face SDXL (Pro)' : 'Hugging Face SDXL (Warming up...)'}
          </option>
        </select>
        {!hfReady && (
          <p className="text-[10px] text-amber-500/80 font-medium flex items-center gap-1.5 mt-1">
            <Lock className="w-3 h-3" /> SDXL cluster is booting up.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Creativity
        </label>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[11px] font-medium text-zinc-400">
            <span>Temperature</span>
            <span className="text-purple-400">{creativity.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="0.1" max="1.0" step="0.1" 
            value={creativity}
            onChange={(e) => setCreativity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#222] rounded-full appearance-none cursor-pointer accent-purple-500" 
          />
        </div>
      </div>

      <div className="mt-auto relative group cursor-default">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50"></div>
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#11081f] to-[#0a0512] border border-purple-500/20 text-left overflow-hidden flex flex-col gap-2 shadow-2xl">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Crown className="w-12 h-12 text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Pro Active</span>
          </div>
          <p className="text-[11px] text-purple-200/60 leading-relaxed font-medium mt-1">
            Unlimited ultra-fast generations. You are on the premium tier.
          </p>
        </div>
      </div>
    </div>
  );
}
