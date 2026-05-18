import { SidebarSettings } from '@/components/SidebarSettings';
import { PromptBar } from '@/components/PromptBar';
import { GallerySidebar } from '@/components/GallerySidebar';
import { MainCanvas } from '@/components/MainCanvas';

export default function StudioPage() {
  return (
    <div className="h-screen w-full bg-[#000000] text-white overflow-hidden flex flex-col selection:bg-purple-500/30">
      <div className="flex-1 flex overflow-hidden bg-black">
        {/* Left Sidebar (hidden on small screens, opened via MainCanvas hamburger) */}
        <div className="hidden md:flex">
          <SidebarSettings />
        </div>

        {/* Center Zone */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Canvas Area */}
          <MainCanvas />

          {/* Bottom Prompt Bar */}
          <PromptBar />
        </div>

        {/* Right Sidebar (hidden on small screens) */}
        <div className="hidden md:flex">
          <GallerySidebar />
        </div>
      </div>
    </div>
  );
}
