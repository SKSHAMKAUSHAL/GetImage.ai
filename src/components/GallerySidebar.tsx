"use client";

import { useEffect } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { History, Image as ImageIcon, Download } from 'lucide-react';

export function GallerySidebar() {
  const { history, loadHistory, loadFromGallery, isHistoryLoading } = useStudioStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="w-[260px] bg-black border-l border-white/5 flex flex-col h-full overflow-hidden backdrop-blur-md text-zinc-300">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <History className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">Recent Generations</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {isHistoryLoading && history.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-white/5 bg-zinc-900 animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 rounded-full bg-white/10" />
                  <div className="h-3 w-1/2 rounded-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 opacity-50">
            <ImageIcon className="w-10 h-10" />
            <p className="text-sm">No recent generations</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => loadFromGallery(item)}
              className="group relative rounded-lg overflow-hidden border border-white/5 cursor-pointer transition-transform hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)] bg-zinc-900"
            >
              <a
                href={item.image_url}
                download="history_generation.jpg"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 bg-black/60 hover:bg-purple-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-md"
              >
                <Download className="w-4 h-4" />
              </a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.prompt}
                className="w-full h-auto aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-xs text-zinc-200 line-clamp-3 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {item.prompt}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
