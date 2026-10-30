import React, { useState } from 'react';
import { X, Crown } from 'lucide-react';
import { CandidateProfile } from '../types';
import { toPascalCase } from '../lib/formatters';
import { CheckCircle2, Pencil, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { EditProfileView } from './EditProfileView';

interface MyProfileViewProps {
  userProfile: CandidateProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<CandidateProfile | null>>;
  credits?: number;
  maxCredits?: number;
  timeUntilReset?: string;
  onContinueOnboarding?: () => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({ userProfile, setUserProfile, credits = 5, maxCredits = 5, timeUntilReset = '', onContinueOnboarding }) => {
  const [subscriptionLoading] = useState(false);

  if (!userProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-[#5A5A40]/20 rounded-3xl p-6 shadow-xl max-w-sm w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#5A5A40]/10 flex items-center justify-center mx-auto text-[#5A5A40]">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2A2A2A]">Profile Setup Incomplete</h3>
          <p className="text-sm text-[#5A5A40] leading-relaxed">
            You paused your onboarding before finishing. Continue where you left off to activate your matrimony profile.
          </p>
          {onContinueOnboarding && (
            <button
              type="button"
              onClick={onContinueOnboarding}
              className="w-full py-3 bg-[#5A5A40] hover:bg-[#4A4A30] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              Continue Onboarding
            </button>
          )}
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'details' | 'preferences'>('details');
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (showEditProfile) {
    return (
      <EditProfileView
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onClose={() => setShowEditProfile(false)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f0] text-[#2A2A2A] overflow-y-auto pb-6 font-sans">
      {/* Profile Header */}
      <div className="bg-white p-6 border-b border-[#5A5A40]/15 flex flex-col items-center justify-center text-center gap-4 shadow-2xs">
        <div
          onClick={() => setShowEditProfile(true)}
          className="relative group cursor-pointer"
          title="View & Edit Profile Information"
        >
          {userProfile.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-full object-cover border-2 border-[#5A5A40]/30 shadow-sm transition-transform group-hover:scale-102"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#5A5A40]/10 border-2 border-[#5A5A40]/30 flex items-center justify-center">
              <span className="text-4xl font-serif font-bold text-[#5A5A40]">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditProfile(true);
            }}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-[#5A5A40]/30 shadow-md flex items-center justify-center text-[#5A5A40] hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Edit Profile Info"
          >
            <Pencil className="w-5 h-5 text-[#5A5A40]" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#2A2A2A]">{toPascalCase(userProfile.name)}</h2>
            {userProfile.verified && <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />}
          </div>
          {(userProfile.career.profession || userProfile.location.city) && (
            <p className="text-sm text-[#5A5A40] font-sans mt-1">
              {userProfile.career.profession}{userProfile.location.city ? ` • ${userProfile.location.city}` : ''}
            </p>
          )}
          <span className="text-xs bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 px-4 py-1 rounded-full font-bold uppercase tracking-wider inline-block mt-2">
            Free Member
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#5A5A40]/15 bg-white text-sm font-sans">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3.5 font-bold transition-all border-b-2 uppercase tracking-wider text-xs ${
            activeTab === 'details'
              ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
              : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
          }`}
        >
          Membership
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-3.5 font-bold transition-all border-b-2 uppercase tracking-wider text-xs ${
            activeTab === 'preferences'
              ? 'border-[#5A5A40] text-[#5A5A40] bg-[#f5f5f0]/50'
              : 'border-transparent text-[#5A5A40]/60 hover:text-[#2A2A2A]'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4 text-sm font-sans">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Membership Card */}
            <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200 p-5 rounded-2xl shadow-xs">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#5A5A40] font-medium">Your Membership</span>
                  <span className="font-bold text-[#2A2A2A] text-base">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5A5A40] font-medium">Profile Views</span>
                  <span className="font-semibold text-[#2A2A2A]">{credits} profiles per day</span>
                </div>
              </div>
            </div>

            {/* Daily Credits Widget */}
            <div className="bg-white border border-[#5A5A40]/15 p-4 rounded-2xl shadow-xs">
              <div className="text-center">
                <span className="font-bold text-[#2A2A2A] text-sm">Daily Profile Views</span>
                <div className="text-4xl font-serif font-bold text-[#5A5A40] mt-1">{credits}</div>
              </div>

              {/* Refresh Timer */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#5A5A40] mt-3 pt-3 border-t border-[#5A5A40]/10">
                <RefreshCw className="w-4 h-4 text-[#5A5A40]" />
                <span>Refreshes in {timeUntilReset}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#5A5A40]/15 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-[#5A5A40] font-bold">
                <SlidersHorizontal className="w-5 h-5 text-[#5A5A40]" />
                <span className="text-sm">Partner Preferences</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Age Range</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.ageMin} – {userProfile.partnerPreferences.ageMax} yrs
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Marital Status</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.maritalStatus.length > 0
                      ? userProfile.partnerPreferences.maritalStatus.join(', ')
                      : 'Any'}
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Religion</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.religion.length > 0
                      ? userProfile.partnerPreferences.religion.join(', ')
                      : 'Any'}
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Mother Tongue</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.motherTongue.length > 0
                      ? userProfile.partnerPreferences.motherTongue.join(', ')
                      : 'Any'}
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Diet</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.diet.length > 0
                      ? userProfile.partnerPreferences.diet.join(', ')
                      : 'Any'}
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40]/80 text-xs uppercase tracking-wider mb-1.5">Min Income</label>
                  <div className="bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl p-2.5 text-sm text-[#2A2A2A]">
                    {userProfile.partnerPreferences.minIncome || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
