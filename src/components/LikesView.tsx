import React, { useState } from 'react';
import { CandidateProfile } from '../types';
import { toPascalCase } from '../lib/formatters';
import { Heart, UserCheck, X, MessageSquare } from 'lucide-react';

interface LikesViewProps {
  candidates: CandidateProfile[];
  interestedIds: string[];
  shortlistedIds: string[];
  skippedIds: string[];
  connectionRequestFromIds: string[];
  onExpressInterest: (candidateId: string) => void;
  onRemoveLike: (candidateId: string) => void;
  onSkipCandidate: (candidateId: string) => void;
  onUnskipCandidate: (candidateId: string) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onStartChat: (candidate: CandidateProfile) => void;
}

export const LikesView: React.FC<LikesViewProps> = ({
  candidates,
  interestedIds,
  shortlistedIds,
  skippedIds,
  connectionRequestFromIds,
  onExpressInterest,
  onRemoveLike,
  onSkipCandidate,
  onUnskipCandidate,
  onSelectCandidate,
  onStartChat
}) => {
  const [activeSubgroup, setActiveSubgroup] = useState<'liked_me' | 'i_liked' | 'skipped'>('liked_me');

  // 1. Liked Me: Candidates who sent a connection request or liked user
  const likedMeCandidates = candidates.filter(
    (c) => connectionRequestFromIds.includes(c.id) || ['vivah-prof-3', 'vivah-prof-6'].includes(c.id)
  );

  // 2. I Liked: Candidates the user liked / expressed interest in or shortlisted
  const iLikedCandidates = candidates.filter(
    (c) => interestedIds.includes(c.id) || shortlistedIds.includes(c.id)
  );

  // 3. Skipped: Candidates the user skipped
  const skippedCandidates = candidates.filter((c) => skippedIds.includes(c.id));

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f0] text-[#2A2A2A] overflow-y-auto font-sans pb-8">
      {/* Subgroup Header Navigation Tabs */}
      <div className="flex border-b border-[#5A5A40]/15 bg-white text-sm sticky top-0 z-10 font-sans shadow-2xs">
        <button
          onClick={() => setActiveSubgroup('liked_me')}
          className={`flex-1 py-3.5 font-bold transition-all border-b-2 uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${
            activeSubgroup === 'liked_me'
              ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
              : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Liked Me ({likedMeCandidates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubgroup('i_liked')}
          className={`flex-1 py-3.5 font-bold transition-all border-b-2 uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${
            activeSubgroup === 'i_liked'
              ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
              : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>I Liked ({iLikedCandidates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubgroup('skipped')}
          className={`flex-1 py-3.5 font-bold transition-all border-b-2 uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${
            activeSubgroup === 'skipped'
              ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
              : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
          }`}
        >
          <X className="w-4 h-4" />
          <span>Skipped ({skippedCandidates.length})</span>
        </button>
      </div>

      {/* Main Grid Container */}
      <div className="p-4 flex-1">
        {/* LIKED ME SUBGROUP */}
        {activeSubgroup === 'liked_me' && (
          likedMeCandidates.length === 0 ? (
            <div className="py-16 text-center text-[#5A5A40]/80 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center mx-auto text-[#5A5A40] shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-[#2A2A2A]">No Likes Received Yet</h4>
              <p className="text-xs text-[#5A5A40]/70 max-w-xs mx-auto">
                Profiles that express interest in you will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
              {likedMeCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate)}
                  className="bg-white rounded-2xl p-2 border border-[#5A5A40]/15 shadow-md hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    {/* Sleek Image Card */}
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200">
                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Bottom Gradient with Info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                        <h4 className="text-base font-serif font-bold text-white truncate">
                          {toPascalCase(candidate.name)}, {candidate.age}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2.5 mt-1.5 flex items-center font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartChat(candidate);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* I LIKED SUBGROUP */}
        {activeSubgroup === 'i_liked' && (
          iLikedCandidates.length === 0 ? (
            <div className="py-16 text-center text-[#5A5A40]/80 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center mx-auto text-[#5A5A40] shadow-xs">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-[#2A2A2A]">No Liked Profiles Yet</h4>
              <p className="text-xs text-[#5A5A40]/70 max-w-xs mx-auto">
                Profiles you like will be saved here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
              {iLikedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate)}
                  className="bg-white rounded-2xl p-2 border border-[#5A5A40]/15 shadow-md hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    {/* Image Card */}
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200">
                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />



                      {/* Bottom Gradient with Info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                        <h4 className="text-base font-serif font-bold text-white truncate">
                          {toPascalCase(candidate.name)}, {candidate.age}
                        </h4>
                      </div>
                    </div>
                  </div>

                      {/* Card Actions */}
                  <div className="pt-2.5 mt-1.5 flex items-center justify-between gap-2 font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartChat(candidate);
                      }}
                      className="p-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full transition-all flex items-center justify-center shadow-xs active:scale-95"
                      title="Start Chat"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLike(candidate.id);
                        onSkipCandidate(candidate.id);
                      }}
                      className="flex-1 py-2.5 px-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-bold font-sans transition-all text-center active:scale-95"
                      title="Unlike Candidate"
                    >
                      Unlike
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* SKIPPED SUBGROUP */}
        {activeSubgroup === 'skipped' && (
          skippedCandidates.length === 0 ? (
            <div className="py-16 text-center text-[#5A5A40]/80 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center mx-auto text-[#5A5A40] shadow-xs">
                <X className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-[#2A2A2A]">No Skipped Profiles</h4>
              <p className="text-xs text-[#5A5A40]/70 max-w-xs mx-auto">
                Profiles you pass on will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
              {skippedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate)}
                  className="bg-white rounded-2xl p-2 border border-[#5A5A40]/15 shadow-md hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    {/* Image Card */}
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200">
                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-black/50 backdrop-blur-md text-stone-200 border border-white/20 px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold tracking-wide uppercase shadow-sm">
                          Skipped
                        </span>
                      </div>

                      {/* Bottom Gradient with Info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                        <h4 className="text-base font-serif font-bold text-white truncate">
                          {toPascalCase(candidate.name)}, {candidate.age}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2.5 mt-1.5 flex items-center font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpressInterest(candidate.id);
                        onUnskipCandidate(candidate.id);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

