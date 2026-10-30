import React, { useState } from 'react';
import { FlutterDeviceFrame } from './components/FlutterDeviceFrame';
import { BottomNavBar } from './components/BottomNavBar';

const AppMinimal = () => {
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <FlutterDeviceFrame device="fullscreen">
      <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950 relative">
        <div className="flex-1 p-3">
          <h1>Welcome to Vivah Matrimony</h1>
        </div>
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadChatCount={0}
          discoverCount={0}
          likesCount={0}
        />
      </div>
    </FlutterDeviceFrame>
  );
};

export default AppMinimal;