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
  abortController: AbortController | null;
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
  stopGeneration: () => void;
  loadHistory: () => Promise<void>;
  loadFromGallery: (item: Generation) => void;
}

const HISTORY_CACHE_KEY = 'jinxed-network-history-cache';
const HISTORY_LIMIT = 50;

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
  abortController: null,
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

    const currentController = get().abortController;
    if (currentController) {
      currentController.abort(); // Kill old pending requests instantly
    }
    const newController = new AbortController();
    set({ abortController: newController, isGenerating: true, isUpgrading: false, error: null, activeSource: null });
    let savedGeneration: Generation | null = null;
    let finalImageToSave: string | null = null;
    let imageSource = "None";
    let finalEnhancedPrompt = prompt;

    const persistGeneration = async (imageUrl: string, source: string) => {
      const { data: saved, error: dbError } = await supabase
        .from('generations')
        .insert([{ 
          prompt: prompt.trim(), 
          image_url: imageUrl, 
          settings: { source }
        }])
        .select('id, created_at, prompt, image_url, settings')
        .single();

      if (dbError || !saved) {
        throw dbError || new Error('Failed to save generation');
      }

      savedGeneration = saved;
      set((state) => {
        const nextHistory = [saved, ...state.history].slice(0, HISTORY_LIMIT);
        writeCachedHistory(nextHistory);
        return { history: nextHistory };
      });
    };

    const updatePersistedGeneration = async (imageUrl: string, source: string) => {
      if (!savedGeneration) {
        await persistGeneration(imageUrl, source);
        return;
      }

      const { data: updated, error: updateError } = await supabase
        .from('generations')
        .update({ image_url: imageUrl, settings: { source } })
        .eq('id', savedGeneration.id)
        .select('id, created_at, prompt, image_url, settings')
        .single();

      if (updateError || !updated) {
        throw updateError || new Error('Failed to update generation');
      }

      savedGeneration = updated;
      set((state) => {
        const nextHistory = [updated, ...state.history.filter((item) => item.id !== updated.id)].slice(0, HISTORY_LIMIT);
        writeCachedHistory(nextHistory);
        return { history: nextHistory };
      });
    };

    try {
      // STEP 1: Fetch Preview (Pollinations)
      const previewRes = await fetch("/api/generate/preview", {
        method: "POST", 
        signal: newController.signal,
        body: JSON.stringify({ prompt, aspectRatio, creativity, aiModel })
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

      // Save the fast preview immediately so the gallery/database updates right away.
      try {
        await persistGeneration(finalImageToSave, imageSource);
      } catch (dbError) {
        console.warn("Failed to save preview generation:", (dbError as Error)?.message || String(dbError));
      }

      // STEP 2: Attempt HQ Upgrade only for a short window.
      try {
        const hqController = new AbortController();
        const hqTimeout = window.setTimeout(() => hqController.abort(), 15000);

        const hqRes = await fetch("/api/generate/hq", {
          method: "POST",
          signal: hqController.signal,
          body: JSON.stringify({ enhanced_prompt: finalEnhancedPrompt, aspectRatio, creativity, aiModel })
        });

        window.clearTimeout(hqTimeout);

        const hqData: HQResponse = await hqRes.json();

        if (hqData && hqData.success === true && hqData.image_url) {
          finalImageToSave = hqData.image_url;
          imageSource = "Hugging Face SDXL (HQ)";
          set({ currentImage: finalImageToSave });
          await updatePersistedGeneration(finalImageToSave, imageSource);
          console.info("🌟 UI UPGRADED: Displaying Hugging Face SDXL Image");
        } else {
          console.info(`ℹ️ HQ Upgrade Skipped (${hqData?.message || 'Unknown issue'}). Keeping ${imageSource}.`);
        }
      } catch (hqError) {
        if ((hqError as Error)?.name === 'AbortError') {
          console.info('HQ upgrade timed out; keeping fast preview.');
        } else {
          console.warn("⚠️ HQ Upgrade threw an error (e.g., network failed). Keeping Pollinations preview.", hqError);
        }
      }

    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        console.log("🛑 Previous generation cancelled by user.");
        return; // Do nothing, let the new generation take over
      }
      console.warn("Generation failed:", (error as Error)?.message || String(error));
      set({ error: (error as Error)?.message || "Failed to generate image.", isGenerating: false });
      return; // Exit early
    } finally {
      console.info(`✅ FINAL IMAGE SAVED. Source: [${imageSource}]`);
      set({ isUpgrading: false, activeSource: imageSource });
    }
  },

  stopGeneration: () => {
    const { abortController, isGenerating } = get();
    if (isGenerating && abortController) {
      abortController.abort();
      set({ isGenerating: false, isUpgrading: false });
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
        .limit(HISTORY_LIMIT);

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
