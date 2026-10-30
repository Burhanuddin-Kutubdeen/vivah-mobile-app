import React, { useState } from 'react';
import { CandidateProfile, ChatMessage, ConnectionRequest } from '../types';
import { ShieldCheck, Send, CheckCheck, Sparkles, ChevronLeft, UserCheck, Paperclip } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface SecureChatViewProps {
  candidates: CandidateProfile[];
  activeChatProfile: CandidateProfile | null;
  setActiveChatProfile: (c: CandidateProfile | null) => void;
  messages: ChatMessage[];
  onSendMessage: (matchId: string, text: string, isIcebreaker?: boolean) => void;
  connectionRequests: ConnectionRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  interestedIds: string[];
}

export const SecureChatView: React.FC<SecureChatViewProps> = ({
  candidates,
  activeChatProfile,
  setActiveChatProfile,
  messages,
  onSendMessage,
  connectionRequests,
  onAcceptRequest,
  onDeclineRequest,
  interestedIds
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');

  // Active matches where connection is established or interested
  const activeMatches = candidates.filter(
    (c) => interestedIds.includes(c.id) || connectionRequests.some((r) => r.fromUserId === c.id || r.toProfileId === c.id)
  );

  const currentChatMessages = activeChatProfile
    ? messages.filter((m) => m.matchId === activeChatProfile.id)
    : [];

  const handleSend = (overrideText?: string, isIcebreaker = false) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !activeChatProfile) return;

    onSendMessage(activeChatProfile.id, textToSend.trim(), isIcebreaker);
    if (!overrideText) setInputText('');
  };

  const icebreakers = [
    "Namaste! I reviewed your profile and loved your career background.",
    "Hello! Loved your profile and values. Would love to connect!",
    "Hi there! Would your family be open to a casual introductory call?",
    "Hello! Loved your photos and shared passion for travel and culture."
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f0] text-[#2A2A2A] overflow-hidden">
      {!activeChatProfile ? (
        /* CONVERSATION LIST / CONNECTIONS MANAGER */
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[#5A5A40]/15 bg-white text-xs font-sans">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 font-bold transition-all border-b-2 uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 ${
                activeTab === 'chats'
                  ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
                  : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
              }`}
            >
              <span>Active Chats</span>
              {activeMatches.length > 0 && (
                <span className="bg-[#5A5A40] text-white text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold">
                  {activeMatches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 font-bold transition-all border-b-2 uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
                  : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
              }`}
            >
              <span>Requests</span>
              {connectionRequests.length > 0 && (
                <span className="bg-[#5A5A40] text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full font-sans">
                  {connectionRequests.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'chats' ? (
            <div className="p-3 space-y-2">
              {activeMatches.length === 0 ? (
                <div className="p-8 text-center text-[#5A5A40]/80 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center mx-auto text-[#5A5A40]">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-sans">
                    No active chats yet. Express interest in candidate profiles to unlock secure messaging!
                  </p>
                </div>
              ) : (
                activeMatches.map((candidate) => {
                  const candidateMsgs = messages.filter((m) => m.matchId === candidate.id);
                  const lastMsg = candidateMsgs[candidateMsgs.length - 1];

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setActiveChatProfile(candidate)}
                      className="bg-white border border-[#5A5A40]/15 hover:border-[#5A5A40]/40 p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="relative">
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border border-[#5A5A40]/20"
                        />
                        {candidate.onlineNow && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-600 ring-2 ring-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 font-sans">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-serif text-[#2A2A2A] font-light group-hover:text-[#5A5A40] truncate">
                            {candidate.name}
                          </h4>
                          <span className="text-[10px] text-[#5A5A40]/60">
                            {lastMsg ? lastMsg.timestamp : 'New Match'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A5A40]/80 truncate mt-0.5">
                          {lastMsg ? lastMsg.text : `Connected • ${candidate.location.city}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* CONNECTION REQUESTS TAB */
            <div className="p-3 space-y-2 font-sans">
              {connectionRequests.length === 0 ? (
                <div className="p-8 text-center text-[#5A5A40]/80">
                  <p className="text-xs">No pending connection requests.</p>
                </div>
              ) : (
                connectionRequests.map((req) => {
                  const profile = candidates.find((c) => c.id === req.fromUserId || c.id === req.toProfileId);
                  if (!profile) return null;

                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-[#5A5A40]/15 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-serif text-[#2A2A2A]">{profile.name}</h4>
                          <p className="text-[10px] text-[#5A5A40]/70">
                            {profile.location.city} • {profile.career.profession}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeclineRequest(req.id)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-[#5A5A40] text-xs rounded-full transition-all border border-[#5A5A40]/20 font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="px-4 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold text-xs rounded-full transition-all uppercase tracking-wider shadow-2xs"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE CONVERSATION SCREEN */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white border-b border-[#5A5A40]/15 p-3.5 flex items-center justify-between font-sans">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatProfile(null)}
                className="p-1.5 text-[#5A5A40] hover:text-[#2A2A2A] rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <img
                src={activeChatProfile.avatarUrl}
                alt={activeChatProfile.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#5A5A40]/30"
              />
              <div>
                <h3 className="text-sm font-serif text-[#2A2A2A] font-bold flex items-center gap-1.5">
                  {activeChatProfile.name}
                  {activeChatProfile.verified && (
                    <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
                  )}
                </h3>
                <span className="text-xs text-[#5A5A40] flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40] animate-pulse" />
                  Online • {activeChatProfile.location.city}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f5f5f0]">
            {currentChatMessages.length === 0 ? (
              <div className="py-6 text-center space-y-3 font-sans">
                <p className="text-sm text-[#5A5A40]/80">
                  You are now connected with <span className="text-[#2A2A2A] font-serif font-bold">{activeChatProfile.name}</span>!
                </p>

                {/* Icebreaker Recommendations */}
                <div className="space-y-2 max-w-xs mx-auto">
                  <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    Suggested Icebreakers
                  </span>
                  {icebreakers.map((ib, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(ib, true)}
                      className="w-full text-left bg-white hover:bg-stone-50 border border-[#5A5A40]/20 p-3 rounded-2xl text-sm text-[#2A2A2A] transition-all shadow-2xs font-sans"
                    >
                      "{ib}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              currentChatMessages.map((msg) => {
                const isMe = msg.senderId === 'currentUser';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed font-sans ${
                        isMe
                          ? 'bg-[#5A5A40] text-white rounded-br-none shadow-2xs'
                          : 'bg-white text-[#2A2A2A] rounded-bl-none border border-[#5A5A40]/15 shadow-2xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${isMe ? 'text-white/80' : 'text-[#5A5A40]/60'}`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-[#5A5A40]/15 flex items-center gap-2.5 font-sans">
            <button
              onClick={async () => {
                try {
                  const image = await Camera.getPhoto({
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Photos,
                    quality: 90
                  });
                  // TODO: Send image to chat - image.webPath has the file path
                  console.log('Image selected:', image.webPath);
                } catch (err) {
                  console.log('User canceled photo selection');
                }
              }}
              className="p-2.5 text-[#5A5A40] hover:bg-stone-100 rounded-full transition-all"
              title="Attach Photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Type encrypted matrimony message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-full px-4 py-2.5 text-sm text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40]"
            />
            <button
              onClick={() => handleSend()}
              className="p-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold rounded-full transition-all shadow-xs"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
