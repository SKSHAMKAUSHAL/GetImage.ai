"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudioStore } from "@/store/useStudioStore";
import { Image as ImageIcon, Video, ArrowUp, Dices } from "lucide-react";

export function HeroInput() {
  const [localPrompt, setLocalPrompt] = useState("");
  const { setPrompt, generateImage } = useStudioStore();
  const router = useRouter();

  const handleGenerate = () => {
    if (!localPrompt.trim()) return;
    
    // Set the prompt in the global store
    setPrompt(localPrompt);
    
    // Call generate and redirect
    generateImage();
    router.push("/studio");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleRandomize = () => {
    const randomPrompts = [
      "A futuristic cyberpunk city in the rain, neon lights, 4k",
      "A majestic lion in a spacesuit on Mars",
      "A cute red panda exploring an enchanted forest, glowing mushrooms",
      "A vintage car driving through an underwater tunnel",
    ];
    setLocalPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[2rem] bg-[#1a1a1c] border border-white/5 p-4 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-purple-500/30 flex flex-col gap-2">
      <input
        type="text"
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write what you want to create..."
        className="w-full bg-transparent text-white placeholder-zinc-500 px-2 pt-2 pb-2 outline-none text-lg font-medium"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Toggles Container */}
          <div className="flex items-center bg-[#252528] rounded-full p-1">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#353538] hover:bg-[#454548] text-white transition-all shadow-sm">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Image</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-zinc-500 cursor-not-allowed">
              <Video className="w-4 h-4" />
              <span className="text-sm font-semibold">Video</span>
            </button>
          </div>

          <button
            onClick={handleRandomize}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!localPrompt.trim()}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8b5cf6] hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
