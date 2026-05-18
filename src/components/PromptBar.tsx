"use client";

import { useStudioStore } from '@/store/useStudioStore';
import { Image as ImageIcon, Video, ArrowUp, Dices, Loader2 } from 'lucide-react';

export function PromptBar() {
  const { prompt, setPrompt, generateImage, isGenerating } = useStudioStore();

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    generateImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleRandomize = () => {
    if (isGenerating) return;
    const randomPrompts = [
      "A cinematic shot of a neon-lit cyberpunk street with flying cars, 8k resolution, highly detailed",
      "An astronaut floating in space surrounded by glowing cosmic dust",
      "A mystical forest with glowing blue mushrooms and a tiny winged fairy",
      "A sleek modern sports car drifting on a rainy mountain road at night",
    ];
    setPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)]);
  };

  return (
    <div className="bg-black p-4 pb-6 border-t border-white/5 z-20">
      <div className="w-full max-w-3xl mx-auto rounded-3xl bg-[#050505] border border-white/5 p-3 shadow-2xl transition-all focus-within:ring-1 focus-within:ring-purple-500/30 flex flex-col gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write what you want to create..."
          disabled={isGenerating}
          className="w-full bg-transparent text-white placeholder-zinc-500 px-3 pt-1 pb-1 outline-none text-base font-medium"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Toggles Container */}
            <div className="flex items-center bg-[#111111] rounded-full p-1">
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#222222] hover:bg-[#333333] text-white transition-all shadow-sm">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Image</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-zinc-500 cursor-not-allowed">
                <Video className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Video</span>
              </button>
            </div>

            <button
              onClick={handleRandomize}
              disabled={isGenerating}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8b5cf6] hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
