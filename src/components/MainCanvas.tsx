"use client";

import { useState, useRef, useEffect } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { SidebarSettings } from './SidebarSettings';
import { GallerySidebar } from './GallerySidebar';
import { StopwatchTimer } from './StopwatchTimer';
import { Crop, AlertCircle, RefreshCcw, Download, Sparkles } from 'lucide-react';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export function MainCanvas() {
  const { currentImage, isGenerating, isUpgrading, error, generateImage, setCurrentImage, setError, enhancedPrompt, activeSource } = useStudioStore();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
    
    // Convert the initial percentage crop to a pixel crop immediately for completion state
    if (initialCrop.unit === '%') {
      setCompletedCrop({
        unit: 'px',
        x: (initialCrop.x / 100) * width,
        y: (initialCrop.y / 100) * height,
        width: (initialCrop.width / 100) * width,
        height: (initialCrop.height / 100) * height,
      });
    } else {
      setCompletedCrop(initialCrop as unknown as PixelCrop);
    }
    
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  const handleSaveCrop = () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) return;
    try {
      const canvas = document.createElement('canvas');
      const pixelRatio = window.devicePixelRatio || 1;

      // completedCrop is ALWAYS in CSS display pixels relative to the DOM image width/height.
      // We must scale it to the natural intrinsic dimensions of the actual image file.
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      canvas.width = Math.floor(cropWidth * pixelRatio);
      canvas.height = Math.floor(cropHeight * pixelRatio);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(
        imgRef.current,
        cropX, cropY,
        cropWidth, cropHeight,
        0, 0,
        cropWidth, cropHeight
      );
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.95);
      setCurrentImage(base64Image);
      setIsCropModalOpen(false);
    } catch (e) {
      console.warn("Crop failed, possibly tainted canvas:", e);
      setError("Failed to crop image.");
      setIsCropModalOpen(false);
    }
  };

  // Track when a new image URL arrives so we can show a loading skeleton
  const prevImageRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentImage && currentImage !== prevImageRef.current) {
      prevImageRef.current = currentImage;
      setIsImageLoading(true);
    }
  }, [currentImage]);

  const showSkeleton = isGenerating || isImageLoading;

  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useStudioStore();

  return (
    <div className="flex-1 bg-black relative flex items-center justify-center p-8 overflow-hidden">
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Error Toast */}
      {error && !isGenerating && (
        <div className="absolute top-6 z-50 flex items-center gap-3 bg-red-950/80 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-medium text-sm">{error}</span>
          <button
            onClick={() => { setError(null); generateImage(); }}
            className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      <div className="relative w-full h-full max-w-4xl flex items-center justify-center">

        {/* Mobile sidebar toggles */}
        <div className="absolute top-4 left-4 md:hidden z-50">
          <button onClick={toggleLeft} className="p-2 bg-zinc-900/80 rounded-lg border border-white/5">
            ☰
          </button>
        </div>
        <div className="absolute top-4 right-4 md:hidden z-50">
          <button onClick={toggleRight} className="p-2 bg-zinc-900/80 rounded-lg border border-white/5">
            ◻
          </button>
        </div>

        {/* Skeleton + Stopwatch (shown while API is running OR image is loading in browser) */}
        {showSkeleton && (
          <div className="absolute inset-0 flex items-center justify-center z-10 flex-col gap-6">
            <div className="relative w-full max-w-2xl aspect-[4/3] bg-zinc-800/50 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/20 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <StopwatchTimer isRunning={showSkeleton} />
              </div>
            </div>
          </div>
        )}

        {/* Finished Image — always render. If loading new image, stay visible but dimmed! */}
        {currentImage && (
          <div
            className={`relative group transition-all duration-500 flex items-center justify-center w-full h-full ${showSkeleton ? 'opacity-40 blur-sm pointer-events-none' : 'opacity-100'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Generated Result"
              crossOrigin="anonymous"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl ring-1 ring-zinc-700/50 object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Action Buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
              <button
                onClick={() => setIsCropModalOpen(true)}
                className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 hover:border-purple-500/50 text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-xl transition-all"
              >
                <Crop className="w-4 h-4" />
                <span className="text-sm font-medium">Crop & Edit</span>
              </button>
              <a
                href={currentImage}
                download="generation.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 hover:border-purple-500/50 text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-xl transition-all"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>

            {/* AI Source Badge - Removed per instructions */}
            
            {/* AI Enhanced Prompt Badge - Removed per instructions */}
            
            {/* Upgrading to HQ Badge */}
            {isUpgrading && (
              <div className="absolute bottom-4 left-0 right-0 mx-auto w-[90%] max-w-sm p-4 bg-zinc-900/90 border border-purple-500/50 rounded-xl backdrop-blur-md text-sm text-zinc-300 shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-pulse shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                  <p className="font-medium text-purple-200">✨ Preview generated. Waking up SDXL for High-Res Masterpiece...</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700">
                  <StopwatchTimer isRunning={true} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && !currentImage && !error && (
          <div className="text-center space-y-4 text-zinc-500 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900/50">
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">Ready to create.</p>
            <p className="text-sm opacity-60">Type a prompt below to generate an image.</p>
          </div>
        )}
      </div>

      {/* Mobile overlays for sidebars */}
      {isLeftOpen && (
        <div className="fixed inset-0 z-[90] bg-black/80 md:hidden">
          <div className="w-4/5 max-w-xs h-full bg-[#050505]">
            <SidebarSettings />
          </div>
          <div className="absolute top-4 right-4">
            <button onClick={toggleLeft} className="p-2 bg-zinc-900/80 rounded-lg border border-white/5">Close</button>
          </div>
        </div>
      )}
      {isRightOpen && (
        <div className="fixed inset-0 z-[90] bg-black/80 md:hidden">
          <div className="ml-auto w-4/5 max-w-xs h-full bg-black">
            <GallerySidebar />
          </div>
          <div className="absolute top-4 left-4">
            <button onClick={toggleRight} className="p-2 bg-zinc-900/80 rounded-lg border border-white/5">Close</button>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {isCropModalOpen && currentImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 w-full max-w-5xl flex flex-col gap-6 shadow-2xl relative h-[85vh] max-h-[95vh]">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-white">Crop Image</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Close</button>
            </div>
            <div className="flex-1 min-h-0 bg-black/80 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center relative">
              <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                <ReactCrop 
                  crop={crop} 
                  onChange={(c) => setCrop(c)} 
                  onComplete={(c) => setCompletedCrop(c)}
                  className="max-h-full max-w-full flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={currentImage}
                    alt="Crop"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                    className="max-h-[65vh] w-auto h-auto object-contain mx-auto shadow-xl"
                  />
                </ReactCrop>
              </div>
            </div>
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsCropModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveCrop} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all">
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
