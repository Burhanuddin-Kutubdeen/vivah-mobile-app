import React, { useState, useEffect } from 'react';
import { CandidateProfile, FilterState, ChatMessage, ConnectionRequest, SupabaseConfig, TabType } from './types';
import { getSavedSupabaseConfig, syncLikeToSupabase, syncUnlikeToSupabase, syncMessageToSupabase, syncProfileToSupabase, fetchInitialSupabaseData, getSupabaseClient, getPersistentUserId, setPersistentUserId } from './lib/supabase';
import { toPascalCase } from './lib/formatters';
import { useWebRTCCall } from './hooks/useWebRTCCall';
import { useDailyCredits } from './hooks/useDailyCredits';
import { CallOverlay } from './components/CallOverlay';
import { FlutterDeviceFrame } from './components/FlutterDeviceFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { DiscoverView } from './components/DiscoverView';
import { FilterDrawer } from './components/FilterDrawer';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { SecureChatView } from './components/SecureChatView';
import { LikesView } from './components/LikesView';
import { MyProfileView } from './components/MyProfileView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthLoginScreen } from './components/AuthLoginScreen';

const isCapacitorNative = 
  typeof window !== 'undefined' &&
  Boolean((window as any).Capacitor?.isNativePlatform?.());

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  // Supabase Config State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig());

  // Profiles State
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  // Likes & Skipped State
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // Connection Requests
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatProfile, setActiveChatProfile] = useState<CandidateProfile | null>(null);

  // WebRTC Call State
  const {
    callState,
    callType,
    remotePeerId,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useWebRTCCall('current-user-123');

  // Daily Credits for swipe limits
  const {
    credits,
    maxCredits,
    timeUntilReset,
    spendCredit,
  } = useDailyCredits();

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    gender: 'Female', // Default bride recommendation
    ageMin: 22,
    ageMax: 35,
    heightMinInches: 58,
    heightMaxInches: 74,
    religions: [],
    castes: [],
    maritalStatuses: ['Never Married'],
    minIncome: '',
    city: '',
    state: '',
    manglikPreference: 'All',
    verifiedOnly: false,
    withPhotosOnly: true,
    searchQuery: ''
  });

  // Login / Signup State (set to false to show post-signup onboarding & main views)
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  // Onboarding State (check completion or resume draft)
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vivah_onboarding_completed_v1') !== 'true';
    } catch {
      return true;
    }
  });

  const handleLoginSuccess = async (userEmail?: string, userName?: string) => {
    try { localStorage.setItem('vivah_logged_in_v1', 'true'); } catch { /* ignore */ }
    setShowLoginScreen(false);

    if (supabaseConfig.isConnected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            setPersistentUserId(session.user.id);
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching user profile:', error);
              // Create a new profile if it doesn't exist
              const newProfile = {
                id: session.user.id,
                user_id: session.user.id,
                name: userName || 'New User',
                gender: '',
                age: 0,
                height: '',
                religion: '',
                mother_tongue: '',
                caste: '',
                sub_caste: '',
                marital_status: '',
                diet: '',
                bio: '',
                headline: '',
                city: '',
                state: '',
                country: 'India',
                avatar_url: '',
                photos: [],
                profession: '',
                highest_degree: '',
                annual_income: '',
                company_name: '',
                role: 'user'
              };

              const { data: insertedData, error: insertError } = await supabase
                .from('profiles')
                .insert(newProfile)
                .select();

              if (insertedData && insertedData.length > 0) {
                setUserProfile(insertedData[0]);
              }
            } else if (data) {
              setUserProfile(data);
            }
          }
        } catch (err) {
          console.error('Error fetching or creating user profile:', err);
        }
      }
    }

    if (userName) {
      setUserProfile((prev) => ({
        ...prev,
        name: userName
      }));
    };
    
    if (supabaseConfig.isConnected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching user profile:', error);
              // Create a new profile if it doesn't exist
              const newProfile = {
                id: session.user.id,
                user_id: session.user.id,
                name: userName || 'New User',
                gender: '',
                age: 0,
                height: '',
                religion: '',
                mother_tongue: '',
                caste: '',
                sub_caste: '',
                marital_status: '',
                diet: '',
                bio: '',
                headline: '',
                city: '',
                state: '',
                country: 'India',
                avatar_url: '',
                photos: [],
                profession: '',
                highest_degree: '',
                annual_income: '',
                company_name: '',
                role: 'user'
              };
              
              const { data: insertedData, error: insertError } = await supabase
                .from('profiles')
                .insert(newProfile)
                .select();
              
              if (insertedData && insertedData.length > 0) {
                setUserProfile(insertedData[0]);
              }
            } else if (data) {
              setUserProfile(data);
            }
          }
        } catch (err) {
          console.error('Error fetching or creating user profile:', err);
        }
      }
    }
    
    if (userName) {
      setUserProfile((prev) => ({
        ...prev,
        name: userName
      }));
    }
  };

  const handleCompleteOnboarding = (
    updatedFilters?: Partial<FilterState>,
    userName?: string,
    locationData?: { country?: string; city?: string; state?: string },
    profileData?: {
      name?: string;
      gender?: string;
      age?: number;
      height?: string;
      bio?: string;
      religion?: string;
      ethnicity?: string;
      motherTongue?: string;
      caste?: string;
      maritalStatus?: string;
      diet?: string;
      education?: string;
      profession?: string;
      location?: { country?: string; city?: string; state?: string };
      photos?: string[];
      avatarUrl?: string;
      horoscope?: any;
    }
  ) => {
    try { localStorage.setItem('vivah_onboarding_completed_v1', 'true'); } catch { /* ignore */ }
    setShowOnboarding(false);

    if (updatedFilters) {
      setFilters((prev) => ({
        ...prev,
        ...updatedFilters
      }));
    }

    // Create a complete user profile object
    const currentUserId = userProfile?.id || 'current-user-123';
    const updatedProfile = {
      id: currentUserId,
      user_id: currentUserId,
      name: userName || '',
      gender: profileData?.gender || '',
      age: profileData?.age || 0,
      height: profileData?.height || '',
      religion: profileData?.religion || '',
      ethnicity: profileData?.ethnicity || '',
      mother_tongue: profileData?.motherTongue || '',
      caste: profileData?.caste || '',
      sub_caste: '',
      marital_status: profileData?.maritalStatus || '',
      diet: profileData?.diet || '',
      bio: profileData?.bio || '',
      headline: '',
      city: locationData?.city || profileData?.location?.city || '',
      state: locationData?.state || profileData?.location?.state || '',
      country: locationData?.country || profileData?.location?.country || 'Sri Lanka',
      avatar_url: profileData?.avatarUrl || profileData?.photos?.[0] || '',
      photos: profileData?.photos || [],
      profession: profileData?.profession || '',
      highest_degree: profileData?.education || '',
      rashi: profileData?.horoscope?.rashi || '',
      lagna: profileData?.horoscope?.lagna || '',
      nakshatra: profileData?.horoscope?.nekatha || profileData?.horoscope?.nakshatra || '',
      nekatha_pada: profileData?.horoscope?.nekathaPada || null,
      navamshaya: profileData?.horoscope?.navamshaya || '',
      manglik_status: profileData?.horoscope?.manglikStatus || '',
      horoscope_notes: profileData?.horoscope?.horoscopeNotes || '',
      birth_time: profileData?.horoscope?.birthTime || '',
      birth_place: profileData?.horoscope?.birthPlace || '',
      kendraya_chart_url: profileData?.horoscope?.kendrayaChartUrl || '',
      shani_dosha: profileData?.horoscope?.shaniDosha || false,
      rahu_kethu_dosha: profileData?.horoscope?.rahuKethuDosha || false,
      planetary_positions: profileData?.horoscope?.planetaryPositions || {},
      horoscope: profileData?.horoscope || null,
      role: 'user'
    };

    // Update user profile state
    setUserProfile(updatedProfile);
  };

  // Sync User Profile changes to Supabase
  useEffect(() => {
    if (supabaseConfig.isConnected && userProfile) {
      const syncProfile = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        try {
          const { error } = await supabase
            .from('profiles')
            .update(userProfile)
            .eq('id', userProfile.id);
          if (error) {
            console.error('Error syncing profile to Supabase:', error);
          }
        } catch (err) {
          console.error('Error syncing profile to Supabase:', err);
        }
      };
      syncProfile();
    }
  }, [userProfile, supabaseConfig.isConnected]);

  // Fetch profiles from Supabase when connected
  useEffect(() => {
    if (supabaseConfig.isConnected && userProfile) {
      const fetchProfiles = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        try {
          if (userProfile?.id) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .neq('id', userProfile.id);
            if (error) {
              console.error('Error fetching profiles:', error);
            } else if (data) {
              setCandidates(data);
            }
          }
        } catch (err) {
          console.error('Error fetching profiles:', err);
        }
      };
      fetchProfiles();
    }
  }, [supabaseConfig.isConnected, userProfile]);

  // Fetch user profile and onboarding status from Supabase when connected
  useEffect(() => {
    if (supabaseConfig.isConnected) {
      const fetchUserProfileAndOnboardingStatus = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            setPersistentUserId(session.user.id);
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching user profile:', error);
            } else if (data) {
              setUserProfile(data);
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      };
      fetchUserProfileAndOnboardingStatus();
    }
  }, [supabaseConfig.isConnected]);

  // Load initial Supabase data when connected
  useEffect(() => {
    if (supabaseConfig.isConnected && userProfile) {
      fetchInitialSupabaseData(userProfile.id).then((data) => {
        if (!data) return;
        if (data.interestedCandidateIds && data.interestedCandidateIds.length > 0) {
          setInterestedIds((prev) => Array.from(new Set([...prev, ...data.interestedCandidateIds])));
        }
        if (data.shortlistedCandidateIds && data.shortlistedCandidateIds.length > 0) {
          setShortlistedIds((prev) => Array.from(new Set([...prev, ...data.shortlistedCandidateIds])));
        }
        if (data.chatMessages && data.chatMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.chatMessages.filter((m: any) => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
      });
    }
  }, [supabaseConfig.isConnected, userProfile?.id]);

  // Handlers
  const handleToggleShortlist = (candidateId: string) => {
    setShortlistedIds((prev) => {
      const exists = prev.includes(candidateId);
      if (exists) {
        syncUnlikeToSupabase(userProfile?.id || '', candidateId);
        return prev.filter((id) => id !== candidateId);
      } else {
        syncLikeToSupabase(userProfile?.id || '', candidateId);
        return [...prev, candidateId];
      }
    });
  };

  const handleExpressInterest = (candidateId: string) => {
    if (!spendCredit()) return; // Block if no credits
    setInterestedIds((prev) => {
      if (prev.includes(candidateId)) return prev;
      return [...prev, candidateId];
    });

    // Automatically create a connection request record & sync to Supabase
    setConnectionRequests((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}`,
        fromUserId: userProfile?.id || '',
        toProfileId: candidateId,
        status: 'pending',
        sentAt: 'Just now',
        message: 'Expressed interest in your profile!'
      }
    ]);

    // Supabase sync
    syncLikeToSupabase(userProfile?.id || '', candidateId);
  };

  const handleSkipCandidate = (candidateId: string) => {
    if (!spendCredit()) return; // Block if no credits
    setSkippedIds((prev) => (prev.includes(candidateId) ? prev : [...prev, candidateId]));
  };

  const handleRemoveLike = (candidateId: string) => {
    setInterestedIds((prev) => prev.filter((id) => id !== candidateId));
    setShortlistedIds((prev) => prev.filter((id) => id !== candidateId));

    // Supabase sync
    syncUnlikeToSupabase(userProfile?.id || '', candidateId);
  };

  const handleUnskipCandidate = (candidateId: string) => {
    setSkippedIds((prev) => prev.filter((id) => id !== candidateId));
  };

  const handleSendMessage = (matchId: string, text: string, isIcebreaker = false) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: 'currentUser',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isIcebreaker
    };

    setMessages((prev) => [...prev, newMsg]);

    // Supabase sync
    syncMessageToSupabase('currentUser', matchId, text);

    // Simulate realistic automated reply after 2 seconds
    setTimeout(() => {
      const matchCandidate = candidates.find((c) => c.id === matchId);
      const autoReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        matchId,
        senderId: matchId,
        text: `Thank you for your message! ${matchCandidate?.name || 'I'} will discuss with family and get back to you soon.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 2000);
  };

  const handleAcceptRequest = (requestId: string) => {
    setConnectionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as const } : r))
    );
  };

  const handleDeclineRequest = (requestId: string) => {
    setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleResetFilters = () => {
    setFilters({
      gender: 'Female',
      ageMin: 20,
      ageMax: 50,
      heightMinInches: 54,
      heightMaxInches: 78,
      religions: [],
      castes: [],
      maritalStatuses: [],
      minIncome: '',
      city: '',
      state: '',
      manglikPreference: 'All',
      verifiedOnly: false,
      withPhotosOnly: false,
      searchQuery: ''
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Main Container */}
      <FlutterDeviceFrame device="fullscreen">
        <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950 relative">
          {/* Incomplete Onboarding Resume Banner */}
          {!showOnboarding && !showLoginScreen && localStorage.getItem('vivah_onboarding_completed_v1') !== 'true' && (
            <div className="bg-[#5A5A40] text-white px-3.5 py-2 flex items-center justify-between text-xs z-30 shrink-0 shadow-xs">
              <span className="truncate pr-2 font-medium">Profile setup paused &bull; Continue where you left off</span>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="px-2.5 py-1 bg-white text-[#5A5A40] hover:bg-stone-100 rounded-md font-bold text-[11px] uppercase tracking-wider shrink-0 transition-all shadow-xs cursor-pointer"
              >
                Resume
              </button>
            </div>
          )}

          {/* Active Tab View Render */}
          {activeTab === 'discover' && (
            <DiscoverView
              candidates={candidates}
              filters={filters}
              userProfile={userProfile}
              onOpenFilterDrawer={() => setIsFilterOpen(true)}
              onSelectCandidate={(candidate) => setSelectedCandidate(candidate)}
              onExpressInterest={handleExpressInterest}
              onShortlistToggle={handleToggleShortlist}
              onSkipCandidate={handleSkipCandidate}
              shortlistedIds={shortlistedIds}
              interestedIds={interestedIds}
              skippedIds={skippedIds}
              onStartChat={(candidate) => {
                setActiveChatProfile(candidate);
                setActiveTab('chats');
              }}
              credits={credits}
              maxCredits={maxCredits}
              timeUntilReset={timeUntilReset}
            />
          )}

          {activeTab === 'likes' && (
            <LikesView
              candidates={candidates}
              interestedIds={interestedIds}
              shortlistedIds={shortlistedIds}
              skippedIds={skippedIds}
              connectionRequestFromIds={connectionRequests.map((r) => r.fromUserId)}
              onExpressInterest={handleExpressInterest}
              onRemoveLike={handleRemoveLike}
              onSkipCandidate={handleSkipCandidate}
              onUnskipCandidate={handleUnskipCandidate}
              onSelectCandidate={(candidate) => setSelectedCandidate(candidate)}
              onStartChat={(candidate) => {
                setActiveChatProfile(candidate);
                setActiveTab('chats');
              }}
            />
          )}

          {activeTab === 'chats' && (
            <SecureChatView
              candidates={candidates}
              activeChatProfile={activeChatProfile}
              setActiveChatProfile={setActiveChatProfile}
              messages={messages}
              onSendMessage={handleSendMessage}
              connectionRequests={connectionRequests.filter((r) => r.status === 'pending')}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
              interestedIds={interestedIds}
            />
          )}

          {activeTab === 'my_profile' && (
            <MyProfileView
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              credits={credits}
              maxCredits={maxCredits}
              timeUntilReset={timeUntilReset}
              onContinueOnboarding={() => setShowOnboarding(true)}
            />
          )}

          {/* Bottom Flutter Navigation Bar */}
          <BottomNavBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadChatCount={messages.filter((m) => m.status !== 'read' && m.senderId !== 'currentUser').length}
            discoverCount={candidates.length}
            likesCount={interestedIds.length + shortlistedIds.length}
          />

          {/* Slide-out Filter Drawer (Fit strictly within mobile device frame) */}
          <FilterDrawer
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            onResetFilters={handleResetFilters}
          />

          {/* Candidate Profile Detail Modal (Fit strictly within mobile device frame) */}
          {selectedCandidate && (
            <ProfileDetailModal
              candidate={selectedCandidate}
              userProfile={userProfile}
              onClose={() => setSelectedCandidate(null)}
              onExpressInterest={handleExpressInterest}
              onRemoveLike={handleRemoveLike}
              onShortlistToggle={handleToggleShortlist}
              onStartChat={(candidate) => {
                setActiveChatProfile(candidate);
                setActiveTab('chats');
              }}
              isShortlisted={shortlistedIds.includes(selectedCandidate.id)}
              isInterested={interestedIds.includes(selectedCandidate.id)}
            />
          )}

          {/* Onboarding Screens (Shows after Login/Signup if not completed yet or replayed) */}
          {showOnboarding && !showLoginScreen && (
            <OnboardingScreen
              userId={userProfile?.id || getPersistentUserId()}
              onComplete={handleCompleteOnboarding}
              onExit={() => setShowOnboarding(false)}
            />
          )}

          {/* Login / Signup Screen (Shows BEFORE Onboarding on initial app open or after logout) */}
          {showLoginScreen && (
            <AuthLoginScreen
              onLoginSuccess={handleLoginSuccess}
              supabaseConfig={supabaseConfig}
              setSupabaseConfig={setSupabaseConfig}
            />
          )}

          {/* WebRTC Call Overlay */}
          <CallOverlay
            callState={callState}
            callType={callType}
            remotePeerName={
              incomingCall
                ? incomingCall.callerName
                : remotePeerId
                  ? candidates.find((c) => c.id === remotePeerId)?.name || 'Unknown'
                  : ''
            }
            remotePeerAvatar={
              incomingCall
                ? incomingCall.callerAvatar
                : remotePeerId
                  ? candidates.find((c) => c.id === remotePeerId)?.avatarUrl || ''
                  : ''
            }
            localStream={localStream}
            remoteStream={remoteStream}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onAccept={acceptCall}
            onDecline={declineCall}
            onEnd={endCall}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
          />
        </div>
      </FlutterDeviceFrame>
    </div>
  );
}