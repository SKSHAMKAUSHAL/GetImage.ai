import Link from 'next/link';
import { HeroInput } from '@/components/HeroInput';
import { MousePointer2, Sparkles, Zap, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative bg-[#000000] text-white selection:bg-purple-500/30 font-sans min-h-screen">
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-end items-center px-8 py-6">
        <div className="flex items-center gap-6">
          <Link href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/studio" className="text-sm font-semibold bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Enter Studio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Premium Dark Background with Video */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30 scale-105"
          >
            <source src="/enterprise-hero-video.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-5xl mx-auto gap-8 -mt-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white leading-[1.1] drop-shadow-2xl">
              What would you like <br />
              to <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500">create</span> today?
              <span className="inline-flex items-center ml-2 relative">
                <MousePointer2 className="w-8 h-8 text-purple-400 fill-purple-500/30 -rotate-12 absolute -right-2 top-0" />
              </span>
            </h1>
          </div>

          <div className="w-full relative mt-6">
            <HeroInput />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-black flex flex-col items-center justify-center px-6">
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center gap-16">
          <div className="flex flex-col gap-4 items-center">
            <div className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold tracking-wide uppercase">
              The Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">How it works</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mt-2 leading-relaxed">
              We engineered a dual-pipeline generation system that combines instantaneous previews with ultra-high-definition rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-[#050505] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:scale-110 transition-all">
                <Sparkles className="w-7 h-7 text-zinc-300 group-hover:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">LLM Enhancement</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                You type a simple idea. Our LLaMA 3.1 LLM instantly expands it into a highly detailed cinematic prompt, injecting perfect lighting, camera angles, and atmospheric modifiers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-[#050505] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group relative">
              <div className="absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-zinc-800 hidden md:block" />
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:scale-110 transition-all">
                <Zap className="w-7 h-7 text-zinc-300 group-hover:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Turbo Preview</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                We instantly pipe the enhanced prompt into an ultra-fast Turbo generation node. You see a beautiful layout of your requested image on-screen in under 800 milliseconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-[#050505] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group relative">
              <div className="absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-zinc-800 hidden md:block" />
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:scale-110 transition-all">
                <ImageIcon className="w-7 h-7 text-zinc-300 group-hover:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">SDXL Masterpiece</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                While you view the preview, we quietly wake up a massive Flux backend. Within seconds, your preview transforms into a flawless high-resolution masterpeice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
