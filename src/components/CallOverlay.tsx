import React, { useRef, useEffect } from 'react';
import { CallState, CallType } from '../types';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, PhoneCall } from 'lucide-react';

interface CallOverlayProps {
  callState: CallState;
  callType: CallType | null;
  remotePeerName: string;
  remotePeerAvatar: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  callType,
  remotePeerName,
  remotePeerAvatar,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  onAccept,
  onDecline,
  onEnd,
  onToggleMute,
  onToggleCamera,
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream && callType === 'video') {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, callType]);

  if (callState === 'idle' || callState === 'ended') return null;

  // Incoming call screen
  if (callState === 'ringing') {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#2A2A2A] to-[#1a1a14] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-6">
          <img
            src={remotePeerAvatar}
            alt={remotePeerName}
            className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl animate-pulse"
          />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold">{remotePeerName}</h2>
            <p className="text-sm text-white/70 flex items-center gap-2 justify-center">
              {callType === 'video' ? <Video className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
              Incoming {callType} call...
            </p>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <button
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl transition-all active:scale-95"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-xl transition-all active:scale-95 animate-bounce"
            >
              <Phone className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing call screen (calling)
  if (callState === 'calling') {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#2A2A2A] to-[#1a1a14] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-6">
          <img
            src={remotePeerAvatar}
            alt={remotePeerName}
            className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl"
          />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold">{remotePeerName}</h2>
            <p className="text-sm text-white/70 flex items-center gap-2 justify-center">
              <PhoneCall className="w-4 h-4 animate-pulse" />
              Calling...
            </p>
          </div>
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl transition-all active:scale-95"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Active call screen (connected)
  if (callState === 'connected') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1a1a14] flex flex-col">
        {/* Remote video (full screen) or audio placeholder */}
        <div className="flex-1 relative">
          {callType === 'video' ? (
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2A2A2A] to-[#1a1a14]">
              <img
                src={remotePeerAvatar}
                alt={remotePeerName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
              />
              <h2 className="text-2xl font-serif font-bold text-white mt-6">{remotePeerName}</h2>
              <p className="text-sm text-white/70 mt-2 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                Audio call in progress
              </p>
            </div>
          )}

          {/* Local video (picture-in-picture for video calls) */}
          {callType === 'video' && localStream && (
            <div className="absolute bottom-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-[#2A2A2A]">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#2A2A2A]">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="bg-black/60 backdrop-blur-md p-6 flex items-center justify-center gap-6">
          <button
            onClick={onToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl transition-all active:scale-95"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>

          {callType === 'video' && (
            <button
              onClick={onToggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isCameraOff ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isCameraOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
