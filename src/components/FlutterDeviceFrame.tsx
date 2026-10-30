import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { FlutterDevice } from '../types';

interface FlutterDeviceFrameProps {
  device: FlutterDevice;
  children: React.ReactNode;
}

export const FlutterDeviceFrame: React.FC<FlutterDeviceFrameProps> = ({ device, children }) => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (device === 'fullscreen') {
    return (
      <div className="w-full h-screen min-h-screen bg-[#f5f5f0] overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  const isIphone = device === 'iphone';

  return (
    <div className="w-full min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-0 sm:p-6 overflow-x-hidden">
      {/* Frame Wrapper */}
      <div
        className={`relative transition-all duration-300 shadow-2xl ${
          isIphone
            ? 'w-[390px] h-[812px] rounded-[50px] border-[12px] border-stone-800 bg-white ring-1 ring-stone-900/10 shadow-stone-300/60'
            : 'w-[400px] h-[820px] rounded-[42px] border-[10px] border-stone-800 bg-white ring-1 ring-stone-900/10 shadow-stone-300/60'
        }`}
      >
        {/* Dynamic Island / Camera Notch */}
        {isIphone ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-stone-900 rounded-full z-50 flex items-center justify-between px-2.5 shadow-xs pointer-events-none">
            <div className="w-3.5 h-3.5 rounded-full bg-stone-800 ring-1 ring-stone-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]/60 ring-1 ring-[#5A5A40]/80" />
          </div>
        ) : (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 rounded-full z-50 ring-2 ring-stone-800 pointer-events-none" />
        )}

        {/* Mobile Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-11 px-7 pt-2 flex items-center justify-between z-40 text-[#2A2A2A] text-[13px] font-medium select-none pointer-events-none">
          <span className="font-sans font-bold tracking-tight text-[#2A2A2A]">{time}</span>
          <div className="flex items-center gap-1.5 text-[#2A2A2A]">
            <Signal className="w-3.5 h-3.5 text-[#5A5A40]" />
            <Wifi className="w-3.5 h-3.5 text-[#5A5A40]" />
            <Battery className="w-4 h-4 fill-[#5A5A40] text-[#5A5A40]" />
          </div>
        </div>

        {/* Flutter App Content Screen Container */}
        <div className="w-full h-full pt-11 pb-6 rounded-[38px] overflow-hidden bg-[#f5f5f0] flex flex-col relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-400/60 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};
