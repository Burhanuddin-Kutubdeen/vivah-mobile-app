import React from 'react';
import { Smartphone, Monitor, Database, Code, UserCheck, Heart } from 'lucide-react';
import { FlutterDevice } from '../types';
import { toPascalCase } from '../lib/formatters';

interface HeaderBarProps {
  device: FlutterDevice;
  setDevice: (d: FlutterDevice) => void;
  isSupabaseConnected: boolean;
  onOpenAuthModal: () => void;
  onOpenCodeExportModal: () => void;
  userProfileName: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  device,
  setDevice,
  isSupabaseConnected,
  onOpenAuthModal,
  onOpenCodeExportModal,
  userProfileName
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/15 text-[#2A2A2A] px-4 py-3 flex items-center justify-between z-30 sticky top-0 shadow-xs">
      {/* App Logo - Natural Tones Theme */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#5A5A40] flex items-center justify-center shadow-sm">
          <div className="w-3.5 h-3.5 border-2 border-white rounded-xs rotate-45" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl tracking-tight text-[#5A5A40]">Vivah</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 px-2 py-0.5 rounded-full">
              Matrimony
            </span>
          </div>
          <p className="text-[11px] text-[#5A5A40]/70 hidden sm:block font-sans">Natural Matrimonial & Family Matchmaking</p>
        </div>
      </div>

      {/* Middle: Flutter Device Frame Selector */}
      <div className="hidden md:flex items-center bg-[#f5f5f0] border border-[#5A5A40]/15 rounded-full p-1 gap-1">
        <button
          onClick={() => setDevice('iphone')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
            device === 'iphone'
              ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
              : 'text-[#5A5A40]/70 hover:text-[#2A2A2A] hover:bg-white/60'
          }`}
          title="Flutter iOS App Preview"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS (iPhone 16)</span>
        </button>

        <button
          onClick={() => setDevice('pixel')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
            device === 'pixel'
              ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
              : 'text-[#5A5A40]/70 hover:text-[#2A2A2A] hover:bg-white/60'
          }`}
          title="Flutter Android App Preview"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android (Pixel 9)</span>
        </button>

        <button
          onClick={() => setDevice('fullscreen')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
            device === 'fullscreen'
              ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
              : 'text-[#5A5A40]/70 hover:text-[#2A2A2A] hover:bg-white/60'
          }`}
          title="Full Screen Canvas View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Canvas</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Supabase Status Pill */}
        <button
          onClick={onOpenAuthModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
            isSupabaseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/20 hover:bg-[#5A5A40]/20'
          }`}
          title="Configure Supabase Database & Auth"
        >
          <Database className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span className="hidden sm:inline">
            {isSupabaseConnected ? 'Supabase Live' : 'Supabase Setup'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[#5A5A40]'}`} />
        </button>

        {/* Export Flutter Code Modal */}
        <button
          onClick={onOpenCodeExportModal}
          className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#5A5A40] border border-[#5A5A40]/20 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all shadow-2xs"
          title="Export Flutter & Supabase Dart Code"
        >
          <Code className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span className="hidden lg:inline">Flutter Code</span>
        </button>

        {/* Current Profile Avatar / Login */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 bg-[#5A5A40] text-white hover:bg-[#4a4a34] px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all shadow-xs"
        >
          <UserCheck className="w-3.5 h-3.5 text-stone-200" />
          <span className="max-w-[90px] truncate hidden xs:inline">{userProfileName ? toPascalCase(userProfileName) : 'My Profile'}</span>
        </button>
      </div>
    </header>
  );
};
