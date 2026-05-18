import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { PreviewResponse, HQResponse } from '@/types/api';

export interface Generation {
  id: string;
  created_at: string;
  prompt: string;
  image_url: string;
  settings: Record<string, unknown>;
}

interface StudioState {
  prompt: string;
  aspectRatio: string;
  aiModel: string;
  creativity: number;
  isGenerating: boolean;
  isUpgrading: boolean;
  isHistoryLoading: boolean;
  currentImage: string | null;
  enhancedPrompt: string | null;
  error: string | null;
  history: Generation[];
  activeSource: string | null;
  // Mobile UI toggles
  isLeftOpen: boolean;
  isRightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setPrompt: (text: string) => void;
  setAspectRatio: (ratio: string) => void;
  setAiModel: (model: string) => void;
  setCreativity: (val: number) => void;
  setCurrentImage: (url: string) => void;
  setError: (error: string | null) => void;
  generateImage: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadFromGallery: (item: Generation) => void;
}

const HISTORY_CACHE_KEY = 'jinxed-network-history-cache';

function readCachedHistory(): Generation[] {
  if (typeof window === 'undefined') return [];

  try {
    const cached = window.localStorage.getItem(HISTORY_CACHE_KEY);
    if (!cached) return [];

    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedHistory(history: Generation[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures and keep the live app running.
  }
}

export const useStudioStore = create<StudioState>((set, get) => ({
  prompt: '',
  aspectRatio: '16:9',
  aiModel: 'Pollinations AI',
  creativity: 0.7,
  isGenerating: false,
  isUpgrading: false,
  isHistoryLoading: false,
  currentImage: null,
  enhancedPrompt: null,
  error: null,
  history: [],
  activeSource: null,
  isLeftOpen: false,
  isRightOpen: false,

  setPrompt: (text) => set({ prompt: text }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setAiModel: (model) => set({ aiModel: model }),
  setCreativity: (val) => set({ creativity: val }),
  setCurrentImage: (url) => set({ currentImage: url }),
  setError: (error) => set({ error }),

  toggleLeft: () => set((s) => ({ isLeftOpen: !s.isLeftOpen })),
  toggleRight: () => set((s) => ({ isRightOpen: !s.isRightOpen })),

  generateImage: async () => {
    const { prompt, aspectRatio, aiModel, creativity } = get();
    if (!prompt.trim()) return;

    set({ isGenerating: true, isUpgrading: false, error: null, activeSource: null });
    let finalImageToSave: string | null = null;
    let imageSource = "None";
    let finalEnhancedPrompt = prompt;

    try {
      // STEP 1: Fetch Preview (Pollinations)
      const previewRes = await fetch("/api/generate/preview", {
        method: "POST", body: JSON.stringify({ prompt, aspectRatio, creativity, aiModel })
      });

      const previewData: PreviewResponse = await previewRes.json();
      if (!previewData || !previewData.success || !previewData.image_url) {
        throw new Error(previewData?.message || "Failed to generate preview image.");
      }

      finalImageToSave = previewData.image_url;
      finalEnhancedPrompt = previewData.enhanced_prompt || prompt;
      imageSource = "Pollinations (Preview)";

      // Update UI instantly with the Preview
      set({ 
        currentImage: finalImageToSave, 
        isGenerating: false, 
        isUpgrading: true,
        enhancedPrompt: finalEnhancedPrompt,
        activeSource: imageSource
      });

      // STEP 2: Attempt HQ Upgrade (Hugging Face / Pollinations HQ)
      try {
        const hqRes = await fetch("/api/generate/hq", {
          method: "POST", body: JSON.stringify({ enhanced_prompt: finalEnhancedPrompt, aspectRatio, creativity, aiModel })
        });

        const hqData: HQResponse = await hqRes.json();

        if (hqData && hqData.success === true && hqData.image_url) {
          finalImageToSave = hqData.image_url;
          imageSource = "Hugging Face SDXL (HQ)";
          set({ currentImage: finalImageToSave });
          // strategic UI log kept intentionally
          console.info("🌟 UI UPGRADED: Displaying Hugging Face SDXL Image");
        } else {
          console.info(`ℹ️ HQ Upgrade Skipped (${hqData?.message || 'Unknown issue'}). Keeping ${imageSource}.`);
        }
      } catch (hqError) {
        console.warn("⚠️ HQ Upgrade threw an error (e.g., network failed). Keeping Pollinations preview.", hqError);
      }

    } catch (error) {
      console.warn("Generation failed:", (error as Error)?.message || String(error));
      set({ error: (error as Error)?.message || "Failed to generate image.", isGenerating: false });
      return; // Exit early
    } finally {
      console.info(`✅ FINAL IMAGE SAVED. Source: [${imageSource}]`);
      set({ isUpgrading: false, activeSource: imageSource });

      // STEP 3: Save to Database ONLY IF we have an image
      if (finalImageToSave) {
        
        try {
          const { data: saved, error: dbError } = await supabase
            .from('generations')
            .insert([{ 
              prompt: prompt.trim(), 
              image_url: finalImageToSave, 
              settings: { source: imageSource } 
            }])
            .select()
            .single();

          if (!dbError && saved) {
            set((state) => {
              const nextHistory = [saved, ...state.history].slice(0, 6);
              writeCachedHistory(nextHistory);
              return { history: nextHistory };
            });
          } else if (dbError) {
            console.warn("Failed to save to database:", dbError?.message || dbError);
          }
        } catch (dbError) {
          console.warn("Failed to save to database exception:", (dbError as Error)?.message || String(dbError));
        }
      }
    }
  },

  loadHistory: async () => {
    // Start with cached history for instant UI, then refresh from server
    const cachedHistory = readCachedHistory();
    if (cachedHistory.length > 0) {
      set({ history: cachedHistory, isHistoryLoading: true });
    } else {
      set({ isHistoryLoading: true });
    }

    try {
      const { data, error } = await supabase
        .from('generations')
        .select('id, created_at, prompt, image_url, settings')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        writeCachedHistory(data);
        set((state) => {
          const nextState: Partial<StudioState> = { history: data, isHistoryLoading: false };
          if (!state.currentImage && data.length > 0) {
            nextState.currentImage = data[0].image_url;
          }
          return nextState as StudioState;
        });
      } else {
        set({ isHistoryLoading: false });
        console.warn('Failed to load history', (error as Error)?.message || String(error));
      }
    } catch (err) {
      set({ isHistoryLoading: false });
      console.warn('Failed to load history', (err as Error)?.message || String(err));
    }
  },

  loadFromGallery: (item) => {
    set({ prompt: item.prompt, currentImage: item.image_url, error: null });
  },
}));
