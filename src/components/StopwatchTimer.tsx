"use client";

import { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';

export function StopwatchTimer({ isRunning }: { isRunning: boolean }) {
  // Use a ref for the start time to avoid state in the effect
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    startRef.current = Date.now();

    const interval = setInterval(() => {
      setElapsed((Date.now() - (startRef.current ?? Date.now())) / 1000);
    }, 100);

    return () => {
      clearInterval(interval);
      startRef.current = null;
    };
  }, [isRunning]);

  if (!isRunning) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-full border border-purple-500/30 text-purple-300 font-mono shadow-xl animate-fade-in z-20">
      <Timer className="w-4 h-4 animate-pulse text-purple-400" />
      <span>Generating... {elapsed.toFixed(1)}s</span>
    </div>
  );
}
