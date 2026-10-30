import React from 'react';
import { Heart, Sparkles, MessageSquare, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadChatCount: number;
  discoverCount: number;
  likesCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  unreadChatCount,
  discoverCount,
  likesCount
}) => {
  const tabs = [
    {
      id: 'discover' as TabType,
      label: 'Discover',
      icon: Sparkles,
      badge: null
    },
    {
      id: 'likes' as TabType,
      label: 'Like',
      icon: Heart,
      badge: null
    },
    {
      id: 'chats' as TabType,
      label: 'Chat',
      icon: MessageSquare,
      badge: null
    },
    {
      id: 'my_profile' as TabType,
      label: 'Profile',
      icon: User,
      badge: null
    }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-t border-[#5A5A40]/15 px-2 py-2 flex items-center justify-around z-30 shadow-xs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all font-sans ${
              isActive
                ? 'text-[#5A5A40] font-semibold'
                : 'text-[#5A5A40]/60 hover:text-[#2A2A2A] hover:bg-[#5A5A40]/5'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-[#5A5A40] rounded-full shadow-2xs" />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-[#5A5A40] fill-[#5A5A40]/15' : ''
                }`}
              />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#5A5A40] text-white text-[10px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className="text-[11px] mt-1 tracking-tight font-medium uppercase font-sans">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
