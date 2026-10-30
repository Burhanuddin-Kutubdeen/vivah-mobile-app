import React, { useState } from 'react';
import { CandidateProfile, FilterState } from '../types';
import { toPascalCase } from '../lib/formatters';
import {
  Heart,
  Sparkles,
  SlidersHorizontal,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  RefreshCw,
  X,
  MoreVertical,
  Flag,
  Ban,
  MapPin,
  Check,
  MessageCircle,
  Cake,
  Ruler,
  School,
  Users,
  Utensils,
  Wine,
  Navigation,
  Baby,
  Smile,
  Bell,
  Crown,
  Lock
} from 'lucide-react';

interface DiscoverViewProps {
  candidates: CandidateProfile[];
  filters: FilterState;
  userProfile: CandidateProfile | null;
  onOpenFilterDrawer: () => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onExpressInterest: (candidateId: string) => void;
  onShortlistToggle: (candidateId: string) => void;
  onSkipCandidate: (candidateId: string) => void;
  shortlistedIds: string[];
  interestedIds: string[];
  skippedIds: string[];
  onStartChat: (candidate: CandidateProfile) => void;
  credits: number;
  maxCredits: number;
  timeUntilReset: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  candidates,
  filters,
  userProfile,
  onOpenFilterDrawer,
  onSelectCandidate,
  onExpressInterest,
  onShortlistToggle,
  onSkipCandidate,
  shortlistedIds,
  interestedIds,
  skippedIds,
  onStartChat,
  credits,
  maxCredits,
  timeUntilReset,
}) => {
  const [subscriptionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardPhotoIndex, setCardPhotoIndex] = useState<number>(0);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showAuntyModal, setShowAuntyModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  // Filter candidates based on current filter state (excluding already liked or skipped profiles)
  const discoverCandidates = candidates.filter((c) => {
    if (skippedIds.includes(c.id)) return false;
    if (interestedIds.includes(c.id)) return false;
    if (filters.gender && c.gender !== filters.gender) return false;
    if (c.age < filters.ageMin || (filters.ageMax < 80 && c.age > filters.ageMax)) return false;

    if (filters.religions.length > 0 && !filters.religions.includes(c.religion)) return false;
    if (filters.maritalStatuses.length > 0 && !filters.maritalStatuses.includes(c.maritalStatus)) return false;
    if (filters.verifiedOnly && !c.verified) return false;

    return true;
  });

  const currentCandidate = discoverCandidates[currentIndex % Math.max(1, discoverCandidates.length)];

  const handleNext = () => {
    setShowMoreMenu(false);
    setCardPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLike = (candidateId: string) => {
    setShowMoreMenu(false);
    onExpressInterest(candidateId);
    setActionFeedback(`Liked profile`);
    setTimeout(() => setActionFeedback(null), 1500);
    handleNext();
  };

  const handleSkip = (candidateId: string) => {
    setShowMoreMenu(false);
    onSkipCandidate(candidateId);
    setActionFeedback(`Skipped profile`);
    setTimeout(() => setActionFeedback(null), 1500);
    handleNext();
  };

  const handleReport = (candidateName: string) => {
    setShowMoreMenu(false);
    setActionFeedback(`Reported ${candidateName}`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleBlock = (candidateId: string, candidateName: string) => {
    setShowMoreMenu(false);
    onSkipCandidate(candidateId);
    setActionFeedback(`Blocked ${candidateName}`);
    setTimeout(() => setActionFeedback(null), 2500);
    handleNext();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f0] overflow-y-auto pb-6 font-sans">
      {/* Feedback Toast */}
      {actionFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2A2A2A] text-white text-xs px-4 py-2 rounded-full shadow-lg border border-stone-700 animate-fadeIn font-sans">
          {actionFeedback}
        </div>
      )}

      {/* Top Bar with Filter on Left, Aunty Intelligence in Center, Notifications Bell on Right */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between sticky top-0 z-20 font-sans backdrop-blur-md bg-[#f5f5f0]/80">
        {/* Left: Filter Button */}
        <button
          onClick={onOpenFilterDrawer}
          className="relative min-w-[44px] min-h-[44px] p-3 bg-white/90 hover:bg-white text-[#5A5A40] border border-[#5A5A40]/20 rounded-full transition-all shadow-2xs flex items-center justify-center backdrop-blur-sm active:scale-95"
          title="Filter Preferences"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#5A5A40]" />
          {(filters.religions.length > 0 || filters.verifiedOnly) && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#5A5A40] animate-pulse" />
          )}
        </button>

        {/* Center: Aunty Intelligence Button */}
        <button
          onClick={() => setShowAuntyModal(true)}
          className="flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-white/95 hover:bg-white border border-[#5A5A40]/30 rounded-full shadow-2xs text-sm font-semibold text-[#2A2A2A] transition-all backdrop-blur-sm active:scale-95 cursor-pointer"
          title="Aunty Intelligence"
        >
          <span className="text-lg leading-none">👵</span>
          <span className="text-[#2A2A2A] font-sans font-medium text-sm tracking-tight">Aunty Intelligence</span>
        </button>

        {/* Right: Notifications Bell Button */}
        <button
          onClick={() => setShowNotificationsModal(true)}
          className="relative min-w-[44px] min-h-[44px] p-3 bg-white/90 hover:bg-white text-[#5A5A40] border border-[#5A5A40]/20 rounded-full transition-all shadow-2xs flex items-center justify-center backdrop-blur-sm active:scale-95"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-[#5A5A40]" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
        </button>
      </div>

      {/* Main Content Area */}
      {credits === 0 ? (
        /* ZERO CREDIT STATE */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2A2A2A]">Daily Limit Reached! 🚫</h3>
            <p className="text-sm text-[#5A5A40] leading-relaxed">
              You've used all {maxCredits} free profile views for today. Upgrade to Premium to unlock unlimited swipes and keep finding your perfect match!
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#5A5A40]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Credits refresh in {timeUntilReset}</span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-full transition-all shadow-md flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        </div>
      ) : discoverCandidates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5A5A40]/80">
          <div className="w-16 h-16 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center mb-3 shadow-xs">
            <Heart className="w-8 h-8 text-[#5A5A40]" />
          </div>
          <h3 className="text-xl font-serif text-[#2A2A2A] mb-1">No Profiles to Discover</h3>
          <p className="text-xs text-[#5A5A40]/70 font-sans max-w-xs mb-4">
            Try adjusting your preferences to see more candidates.
          </p>
          <button
            onClick={onOpenFilterDrawer}
            className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-sans text-xs uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-xs"
          >
            Adjust Preferences
          </button>
        </div>
      ) : (
        currentCandidate && (
          /* SINGLE CANDIDATE CARD */
          <div className="flex-1 p-3 flex flex-col max-w-lg mx-auto w-full">
            <div className="bg-white p-5 rounded-[36px] shadow-xl shadow-stone-200/60 border border-[#5A5A40]/15 flex flex-col gap-4 relative transition-all">
              
              {/* Header BEFORE the Image: Name + Verification Pill on Left, 3-dot Menu on Right */}
              <div className="flex items-center justify-between gap-2 border-b border-[#5A5A40]/10 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">
                    {toPascalCase(currentCandidate.name)}
                  </h2>

                  {/* Pill shape: check icon + verification percentage */}
                  <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#5A5A40] stroke-[3]" />
                    <span>{currentCandidate.compatibilityScore || 95}%</span>
                  </div>
                </div>

                {/* 3-Dot Dropdown Options (Report & Block) */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu((prev) => !prev)}
                    className="p-2 hover:bg-stone-100 rounded-full text-[#5A5A40] transition-colors"
                    title="More Options"
                  >
                    <MoreVertical className="w-5 h-5 rotate-90" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 top-10 bg-white border border-[#5A5A40]/20 shadow-lg rounded-2xl p-1.5 w-36 z-30 font-sans text-xs animate-fadeIn">
                      <button
                        onClick={() => handleReport(currentCandidate.name)}
                        className="w-full text-left px-3 py-2 hover:bg-stone-100 rounded-xl text-[#2A2A2A] flex items-center gap-2 font-medium"
                      >
                        <Flag className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>Report</span>
                      </button>
                      <button
                        onClick={() => handleBlock(currentCandidate.id, currentCandidate.name)}
                        className="w-full text-left px-3 py-2 hover:bg-stone-100 rounded-xl text-rose-700 flex items-center gap-2 font-medium"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Block</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Candidate Image Banner */}
              <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200">
                <img
                  src={currentCandidate.avatarUrl}
                  alt={currentCandidate.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Below Image: About Me Section & Detailed Profile Info */}
              <div className="space-y-4 px-1 text-[#2A2A2A]">
                {/* About me Section Header & Bio */}
                <div className="space-y-1.5 px-1">
                  <h3 className="font-sans font-semibold text-[#2A2A2A] text-base">
                    About me
                  </h3>
                  <p className="text-sm text-[#2A2A2A]/90 font-sans leading-relaxed">
                    {currentCandidate.bio || currentCandidate.headline}
                  </p>
                </div>

                {/* Card 1: Key Stats (Age, Height, Degree, University, Profession) */}
                <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-sm text-[#2A2A2A] shadow-2xs font-sans">
                  {/* Row 1: Age */}
                  <div className="py-3 flex items-center gap-3">
                    <Cake className="w-5 h-5 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A] text-base">{currentCandidate.age}</span>
                  </div>

                  <div className="h-px bg-[#5A5A40]/12 mx-1" />

                  {/* Row 2: Height */}
                  <div className="py-3 flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A] text-base">{currentCandidate.height}</span>
                  </div>

                  <div className="h-px bg-[#5A5A40]/12 mx-1" />

                  {/* Row 3: Education Level */}
                  <div className="py-3 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A] text-base">{currentCandidate.career.highestDegree}</span>
                  </div>

                  <div className="h-px bg-[#5A5A40]/12 mx-1" />

                  {/* Row 4: University */}
                  <div className="py-3 flex items-center gap-3">
                    <School className="w-5 h-5 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A] text-base">{currentCandidate.career.collegeName}</span>
                  </div>

                  <div className="h-px bg-[#5A5A40]/12 mx-1" />

                  {/* Row 5: Profession */}
                  <div className="py-3 flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A] text-base">{currentCandidate.career.profession}</span>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-[#2A2A2A] shadow-2xs font-sans">
                  <Navigation className="w-5 h-5 text-[#8a804a] shrink-0 rotate-45" />
                  <span className="text-base">
                    {currentCandidate.location.city}, {currentCandidate.location.state}, {currentCandidate.location.country}
                  </span>
                </div>

                {/* Secondary Candidate Image Banner */}
                <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-2xs">
                  <img
                    src={
                      currentCandidate.photos && currentCandidate.photos.length > 1
                        ? currentCandidate.photos[1]
                        : currentCandidate.avatarUrl
                    }
                    alt={`${currentCandidate.name} second photo`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Section 2: A little more about me... */}
                <div className="pt-2">
                  <h3 className="font-sans font-semibold text-[#2A2A2A] text-base mb-2 px-1">
                    A little more about me...
                  </h3>

                  {/* Card 2: Personal Details & Intentions */}
                  <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-sm text-[#2A2A2A] shadow-2xs font-sans">
                    {/* Religion & Caste */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Sparkles className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Religion & Caste</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A]">
                        {currentCandidate.religion} ({currentCandidate.caste})
                      </span>
                    </div>

                    <div className="h-px bg-[#5A5A40]/12 mx-1" />

                    {/* Dating intentions */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Heart className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Dating intentions</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A] whitespace-nowrap">
                        {currentCandidate.datingIntentions || 'Marriage'}
                      </span>
                    </div>

                    <div className="h-px bg-[#5A5A40]/12 mx-1" />

                    {/* Relationship status */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Users className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Relationship status</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A] whitespace-nowrap">
                        {currentCandidate.maritalStatus}
                      </span>
                    </div>

                    <div className="h-px bg-[#5A5A40]/12 mx-1" />

                    {/* Habits */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Wine className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Habits</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A] whitespace-nowrap">
                        {currentCandidate.habits || `${currentCandidate.drinking === 'No' ? 'Non-drinker' : currentCandidate.drinking} • ${currentCandidate.smoking === 'No' ? 'Non-smoker' : currentCandidate.smoking}`}
                      </span>
                    </div>

                    <div className="h-px bg-[#5A5A40]/12 mx-1" />

                    {/* Wants kids */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Baby className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Wants kids</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A]">
                        {currentCandidate.wantsKids || 'Wants kids'}
                      </span>
                    </div>

                    <div className="h-px bg-[#5A5A40]/12 mx-1" />

                    {/* Has kids */}
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Smile className="w-5 h-5 text-[#8a804a] shrink-0" />
                        <span className="text-base">Has kids</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1.5 bg-[#5A5A40]/5 text-sm font-medium text-[#2A2A2A]">
                        {currentCandidate.hasKids || 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Interests you both share & Other Interests */}
                {(() => {
                  const currentUserHobbies = userProfile ? userProfile.hobbies || [] : [];
                  const allCandidateHobbies =
                    currentCandidate.hobbies && currentCandidate.hobbies.length > 0
                      ? currentCandidate.hobbies
                      : ['Hiking 🥾', 'Reading 📚', 'Travel ✈️', 'Concerts 🎤', 'Cooking 🍳', 'Photography 📸', 'Yoga 🧘‍♀️'];

                  // Find common interests between user and candidate
                  const matchedInterests = allCandidateHobbies.filter((cInterest) =>
                    currentUserHobbies.some((uInterest) => {
                      const cLower = cInterest.toLowerCase().replace(/[^\w\s]/g, '');
                      const uLower = uInterest.toLowerCase().replace(/[^\w\s]/g, '');
                      if (cLower.includes(uLower) || uLower.includes(cLower)) return true;
                      const uWords = uLower.split(/[\s&,/]+/).filter((w) => w.length > 3);
                      const cWords = cLower.split(/[\s&,/]+/).filter((w) => w.length > 3);
                      return uWords.some((uw) => cWords.some((cw) => cw.includes(uw) || uw.includes(cw)));
                    })
                  );

                  // Shared interests list calculation
                  const sharedList =
                    matchedInterests.length > 0
                      ? matchedInterests
                      : allCandidateHobbies.slice(0, 2);

                  // Filter out shared interests so they are not duplicated below
                  const otherHobbies = allCandidateHobbies.filter(
                    (hobby) => !sharedList.some((shared) => shared.toLowerCase() === hobby.toLowerCase())
                  );

                  return (
                    <div className="space-y-3">
                      {/* Shared Interests Box */}
                      {sharedList.length > 0 && (
                        <div className="pt-1">
                          <div className="bg-[#e5e1cd] border border-[#5A5A40]/35 rounded-[22px] p-4 font-sans text-sm text-[#2A2A2A] shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm flex items-center gap-1.5">
                                <Sparkles className="w-5 h-5 text-[#8a804a] shrink-0" />
                                <span>Interests you both share...</span>
                              </h3>
                              <span className="bg-[#5A5A40] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {sharedList.length} Shared
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-0.5">
                              {sharedList.map((interest, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white/95 border border-[#5A5A40]/30 rounded-full px-3 py-2 text-sm font-medium text-[#2A2A2A] flex items-center gap-1.5 shadow-2xs"
                                >
                                  <span className="text-emerald-700 font-bold">✓</span>
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Other Hobbies / Interests Pill Tags Row */}
                      {otherHobbies.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-[#5A5A40] px-1 uppercase tracking-wider font-sans">
                            Other Interests
                          </p>
                          <div className="flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {otherHobbies.map((hobby, index) => (
                              <span
                                key={index}
                                className="shrink-0 whitespace-nowrap border border-[#5A5A40]/35 rounded-full px-4 py-2 text-sm text-[#2A2A2A] bg-white/80 font-medium shadow-2xs font-sans"
                              >
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Tertiary Candidate Image Banner */}
                <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-2xs">
                  <img
                    src={
                      currentCandidate.photos && currentCandidate.photos.length > 2
                        ? currentCandidate.photos[2]
                        : currentCandidate.photos && currentCandidate.photos.length > 0
                        ? currentCandidate.photos[0]
                        : currentCandidate.avatarUrl
                    }
                    alt={`${currentCandidate.name} third photo`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Written Prompt Section */}
                {(() => {
                  const prompt =
                    currentCandidate.prompts && currentCandidate.prompts.length > 0
                      ? currentCandidate.prompts[0]
                      : {
                          question: 'As a kid I was really into...',
                          answer:
                            'Practicing my favorite hobbies, collecting books, and imagining creative projects for the future!'
                        };

                  return (
                    <div className="bg-[#f2efe4] border border-[#5A5A40]/30 rounded-[24px] p-5 font-sans shadow-2xs space-y-2">
                      <p className="text-[11px] font-semibold tracking-wider text-[#8a804a] uppercase">
                        {prompt.question}
                      </p>
                      <p className="text-sm font-medium text-[#2A2A2A] leading-relaxed italic">
                        "{prompt.answer}"
                      </p>
                    </div>
                  );
                })()}

                {/* Action Buttons Bar: Pill Reject (X), Circular Chat, Pill Like (Heart) */}
                <div className="pt-3 flex items-center justify-between gap-4 border-t border-[#5A5A40]/10">
                  {/* Pill Reject Button */}
                  <button
                    onClick={() => handleSkip(currentCandidate.id)}
                    className="flex-1 h-14 bg-stone-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-[#5A5A40]/20 hover:border-rose-300 rounded-full transition-all shadow-xs flex items-center justify-center"
                    title="Reject Candidate"
                  >
                    <X className="w-7 h-7 text-rose-700" />
                  </button>

                  {/* Circular Chat Button */}
                  <button
                    onClick={() => onStartChat(currentCandidate)}
                    className="w-14 h-14 rounded-full bg-stone-100 hover:bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/20 hover:border-[#5A5A40] transition-all flex items-center justify-center shadow-xs shrink-0"
                    title="Chat with Candidate"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </button>

                  {/* Pill Like Button */}
                  <button
                    onClick={() => handleLike(currentCandidate.id)}
                    className="flex-1 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center justify-center shadow-xs active:scale-95"
                    title="Like Candidate"
                  >
                    <Heart className="w-7 h-7 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Aunty Intelligence Modal */}
      {showAuntyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-3xl max-w-sm w-full p-5 text-[#2A2A2A] shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👵</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2A2A] flex items-center gap-1.5">
                    Aunty Intelligence
                    <Sparkles className="w-3.5 h-3.5 text-[#8a804a]" />
                  </h3>
                  <p className="text-[10px] text-[#5A5A40] font-sans">AI Matchmaker & Cultural Compatibility Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuntyModal(false)}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currentCandidate ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 rounded-2xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] block mb-1">
                    Analyzing Match with {currentCandidate.name}
                  </span>
                  <div className="flex items-center justify-between font-medium text-sm text-[#2A2A2A]">
                    <span>Guna Milan Score</span>
                    <span className="bg-[#5A5A40] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {currentCandidate.gunaMilanText}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-[#2A2A2A]">Aunty's Insights:</h4>
                  <ul className="space-y-2 text-[#2A2A2A]/90 text-xs">
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#5A5A40]/15">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span><strong>Astrological Alignment:</strong> Strong horoscope match with compatible Janma Rashi & Nakshatra.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#5A5A40]/15">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span><strong>Family Values:</strong> Shared traditional values & preference for family-oriented lifestyle.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#5A5A40]/15">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span><strong>Career & Education:</strong> High professional synergy with mutual respect for career goals.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/15 rounded-xl p-3 text-stone-700 italic text-[11px] leading-relaxed">
                  "Aunty's Advice: {currentCandidate.name} has a wonderful profile that aligns with your family preferences. Don't wait too long—express interest today!"
                </div>

                <button
                  onClick={() => {
                    setShowAuntyModal(false);
                    handleLike(currentCandidate.id);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Express Interest in {currentCandidate.name}</span>
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-600">
                Aunty Intelligence is analyzing candidates...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Drawer / Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-3xl max-w-sm w-full p-5 text-[#2A2A2A] shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2A2A2A]">Notifications</h3>
                  <p className="text-xs text-[#5A5A40] font-sans">Recent rishta updates & match alerts</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="p-3.5 bg-white border border-[#5A5A40]/15 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                <span className="text-xl">💌</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#2A2A2A]">
                    <span>New Connection Request</span>
                    <span className="text-xs font-normal text-stone-400">2h ago</span>
                  </div>
                  <p className="text-sm text-[#2A2A2A]/80 mt-1">
                    Ananya Sharma sent you an interest request.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-[#5A5A40]/15 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                <span className="text-xl">👵</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#2A2A2A]">
                    <span>Aunty Intelligence Alert</span>
                    <span className="text-xs font-normal text-stone-400">5h ago</span>
                  </div>
                  <p className="text-sm text-[#2A2A2A]/80 mt-1">
                    Guna Milan score of 32/36 matched for your profile!
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-[#5A5A40]/15 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                <span className="text-xl">✨</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#2A2A2A]">
                    <span>Profile Verification</span>
                    <span className="text-xs font-normal text-stone-400">1d ago</span>
                  </div>
                  <p className="text-sm text-[#2A2A2A]/80 mt-1">
                    Priya Patel verified horoscope & academic records.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-[#2A2A2A] rounded-full text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
