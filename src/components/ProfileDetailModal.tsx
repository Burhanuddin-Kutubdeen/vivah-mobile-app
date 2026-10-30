import React from 'react';
import { CandidateProfile } from '../types';
import { toPascalCase } from '../lib/formatters';
import { 
  X, 
  Heart, 
  Sparkles, 
  MessageSquare,
  Users, 
  Cake, 
  Ruler, 
  GraduationCap, 
  School, 
  Briefcase, 
  Navigation, 
  Wine, 
  Baby, 
  Smile,
  Check
} from 'lucide-react';

interface ProfileDetailModalProps {
  candidate: CandidateProfile | null;
  userProfile: CandidateProfile;
  onClose: () => void;
  onExpressInterest: (candidateId: string) => void;
  onShortlistToggle: (candidateId: string) => void;
  onStartChat: (candidate: CandidateProfile) => void;
  onRemoveLike?: (candidateId: string) => void;
  isShortlisted: boolean;
  isInterested: boolean;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  candidate,
  userProfile,
  onClose,
  onExpressInterest,
  onShortlistToggle,
  onStartChat,
  onRemoveLike,
  isShortlisted,
  isInterested
}) => {
  if (!candidate) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 overflow-y-auto animate-fadeIn">
      <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-[32px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-[#2A2A2A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-white/80 hover:bg-white text-[#2A2A2A] rounded-full backdrop-blur-md border border-[#5A5A40]/20 shadow-xs transition-all"
        >
          <X className="w-5 h-5 text-[#5A5A40]" />
        </button>

        {/* Modal Scrollable Body matching Discover Page layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Header BEFORE the Image: Name + Compatibility Pill */}
          <div className="flex items-center justify-between gap-2 border-b border-[#5A5A40]/15 pb-3 pr-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-serif font-bold text-[#2A2A2A]">
                {toPascalCase(candidate.name)}
              </h2>

              {/* Pill shape: check icon + match percentage */}
              <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#5A5A40] stroke-[3]" />
                <span>{candidate.compatibilityScore || 95}% Match</span>
              </div>
            </div>
          </div>

          {/* Primary Profile Image Banner */}
          <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-sm">
            <img
              src={candidate.avatarUrl}
              alt={candidate.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* About me Section & Bio */}
          <div className="space-y-1.5 px-1">
            <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm">
              About me
            </h3>
            <p className="text-xs text-[#2A2A2A]/90 font-sans leading-relaxed whitespace-pre-line">
              {candidate.bio}
            </p>
          </div>

          {/* Card 1: Key Stats (Age, Height, Degree, University, Profession) */}
          <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
            {/* Row 1: Age */}
            <div className="py-3 flex items-center gap-3">
              <Cake className="w-4 h-4 text-[#8a804a] shrink-0" />
              <span className="font-medium text-[#2A2A2A]">{candidate.age} Yrs</span>
            </div>

            <div className="h-px bg-[#5A5A40]/12 mx-1" />

            {/* Row 2: Height */}
            <div className="py-3 flex items-center gap-3">
              <Ruler className="w-4 h-4 text-[#8a804a] shrink-0" />
              <span className="font-medium text-[#2A2A2A]">{candidate.height}</span>
            </div>

            <div className="h-px bg-[#5A5A40]/12 mx-1" />

            {/* Row 3: Education Level */}
            <div className="py-3 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-[#8a804a] shrink-0" />
              <span className="font-medium text-[#2A2A2A]">{candidate.career.highestDegree}</span>
            </div>

            <div className="h-px bg-[#5A5A40]/12 mx-1" />

            {/* Row 4: University */}
            <div className="py-3 flex items-center gap-3">
              <School className="w-4 h-4 text-[#8a804a] shrink-0" />
              <span className="font-medium text-[#2A2A2A]">{candidate.career.collegeName}</span>
            </div>

            <div className="h-px bg-[#5A5A40]/12 mx-1" />

            {/* Row 5: Profession */}
            <div className="py-3 flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-[#8a804a] shrink-0" />
              <span className="font-medium text-[#2A2A2A]">{candidate.career.profession}</span>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-[#2A2A2A] shadow-2xs font-sans">
            <Navigation className="w-4 h-4 text-[#8a804a] shrink-0 rotate-45" />
            <span>
              {candidate.location.city}, {candidate.location.state}, {candidate.location.country}
            </span>
          </div>

          {/* Section 2: A little more about me... */}
          <div className="pt-2">
            <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm mb-2 px-1">
              A little more about me...
            </h3>

            {/* Card 2: Personal Details & Intentions */}
            <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
              {/* Religion & Caste */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                  <Sparkles className="w-4 h-4 text-[#8a804a] shrink-0" />
                  <span>Religion & Caste</span>
                </div>
                <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                  {candidate.religion} ({candidate.caste})
                </span>
              </div>

              <div className="h-px bg-[#5A5A40]/12 mx-1" />

              {/* Dating intentions */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                  <Heart className="w-4 h-4 text-[#8a804a] shrink-0" />
                  <span>Dating intentions</span>
                </div>
                <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                  {candidate.datingIntentions || 'Marriage'}
                </span>
              </div>

              <div className="h-px bg-[#5A5A40]/12 mx-1" />

              {/* Relationship status */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                  <Users className="w-4 h-4 text-[#8a804a] shrink-0" />
                  <span>Relationship status</span>
                </div>
                <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                  {candidate.maritalStatus}
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
                  {candidate.datingIntentions || 'Marriage'}
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
                  {candidate.maritalStatus}
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
                  {candidate.habits || `${candidate.drinking === 'No' ? 'Non-drinker' : candidate.drinking} • ${candidate.smoking === 'No' ? 'Non-smoker' : candidate.smoking}`}
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
                  {candidate.wantsKids || 'Wants kids'}
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
                  {candidate.hasKids || "Doesn't have kids"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Interests you both share & Other Interests */}
          {(() => {
            const currentUserHobbies = userProfile?.hobbies || [];
            const allCandidateHobbies =
              candidate.hobbies && candidate.hobbies.length > 0
                ? candidate.hobbies
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
              <div className="space-y-3 pt-1">
                {/* Shared Interests Box */}
                {sharedList.length > 0 && (
                  <div className="pt-1">
                    <div className="bg-[#e5e1cd] border border-[#5A5A40]/35 rounded-[22px] p-4 font-sans text-xs text-[#2A2A2A] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans font-semibold text-[#2A2A2A] text-xs flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#8a804a] shrink-0" />
                          <span>Interests you both share...</span>
                        </h3>
                        <span className="bg-[#5A5A40] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {sharedList.length} Shared
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {sharedList.map((interest, idx) => (
                          <span
                            key={idx}
                            className="bg-white/95 border border-[#5A5A40]/30 rounded-full px-3 py-1.5 text-xs font-medium text-[#2A2A2A] flex items-center gap-1.5 shadow-2xs"
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
                    <p className="text-[11px] font-semibold text-[#5A5A40] px-1 uppercase tracking-wider font-sans">
                      Other Interests
                    </p>
                    <div className="flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {otherHobbies.map((hobby, index) => (
                        <span
                          key={index}
                          className="shrink-0 whitespace-nowrap border border-[#5A5A40]/35 rounded-full px-3.5 py-1.5 text-xs text-[#2A2A2A] bg-white/80 font-medium shadow-2xs font-sans"
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

          {/* Written Prompt Section */}
          {(() => {
            const prompt =
              candidate.prompts && candidate.prompts.length > 0
                ? candidate.prompts[0]
                : {
                    question: 'As a kid I was really into...',
                    answer:
                      'Practicing my favorite hobbies, collecting books, and imagining creative projects for the future!'
                  };

            return (
              <div className="pt-2">
                <div className="bg-[#f2efe4] border border-[#5A5A40]/30 rounded-[24px] p-5 font-sans shadow-2xs space-y-2">
                  <p className="text-[11px] font-semibold tracking-wider text-[#8a804a] uppercase">
                    {prompt.question}
                  </p>
                  <p className="text-sm font-medium text-[#2A2A2A] leading-relaxed italic">
                    "{prompt.answer}"
                  </p>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3 bg-white border-t border-[#5A5A40]/15 flex items-center justify-between gap-2 font-sans">
          {isInterested ? (
            <>
              <button
                onClick={() => {
                  onStartChat(candidate);
                  onClose();
                }}
                className="p-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full transition-all flex items-center justify-center shadow-xs active:scale-95 shrink-0"
                title="Start Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (onRemoveLike) {
                    onRemoveLike(candidate.id);
                  } else {
                    onExpressInterest(candidate.id);
                  }
                  onClose();
                }}
                className="flex-1 py-3 px-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-bold font-sans transition-all text-center active:scale-95 shadow-2xs"
                title="Unlike Candidate"
              >
                Unlike
              </button>
            </>
          ) : (
            <button
              onClick={() => onExpressInterest(candidate.id)}
              className="w-full font-bold py-3 px-4 rounded-full text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs bg-[#5A5A40] hover:bg-[#4a4a34] text-white"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Like</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

