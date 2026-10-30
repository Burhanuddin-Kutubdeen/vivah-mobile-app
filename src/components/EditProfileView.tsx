import React, { useState } from 'react';
import { CandidateProfile } from '../types';
import { toPascalCase } from '../lib/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
  ImagePlus,
  User,
  Cake,
  Ruler,
  GraduationCap,
  Briefcase,
  MapPin,
  Heart,
  MessageCircle,
  Pencil,
} from 'lucide-react';
import { PicturesPage } from './PicturesPage';
import { BioEditPage } from './BioEditPage';
import { InterestsEditPage } from './InterestsEditPage';
import { WrittenPromptPage } from './WrittenPromptPage';

interface EditProfileViewProps {
  userProfile: CandidateProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<CandidateProfile | null>>;
  onClose: () => void;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({
  userProfile,
  setUserProfile,
  onClose,
}) => {
  if (!userProfile) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2A2A2A]">Profile Not Loaded</h3>
            <p className="text-sm text-[#5A5A40] leading-relaxed">Please complete onboarding to edit your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showPictures, setShowPictures] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);
  const [showInterestsEdit, setShowInterestsEdit] = useState(false);
  const [showWrittenPrompt, setShowWrittenPrompt] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);

  if (showWrittenPrompt) {
    return (
      <WrittenPromptPage
        prompts={userProfile.prompts || []}
        onSave={(prompts) => setUserProfile((prev) => ({ ...prev, prompts }))}
        onClose={() => setShowWrittenPrompt(false)}
      />
    );
  }

  if (showInterestsEdit) {
    return (
      <InterestsEditPage
        selected={userProfile.hobbies}
        onSave={(hobbies) => setUserProfile((prev) => ({ ...prev, hobbies }))}
        onClose={() => setShowInterestsEdit(false)}
      />
    );
  }

  if (showBioEdit) {
    return (
      <BioEditPage
        bio={userProfile.bio}
        onSave={(bio) => setUserProfile((prev) => ({ ...prev, bio }))}
        onClose={() => setShowBioEdit(false)}
      />
    );
  }

  if (showPictures) {
    return (
      <PicturesPage
        photos={userProfile.photos}
        setPhotos={(photos) => {
          setUserProfile((prev) => ({
            ...prev,
            photos,
            avatarUrl: photos[0] || prev.avatarUrl,
          }));
        }}
        onClose={() => setShowPictures(false)}
      />
    );
  }

  if (activeTab === 'preview') {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
            <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
          </button>
          <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Edit Profile</h2>
          <div className="w-10" />
        </div>

        {/* Segmented Control */}
        <div className="bg-white px-4 py-2 border-b border-[#5A5A40]/10 shrink-0">
          <div className="flex bg-[#f5f5f0] rounded-xl p-1 border border-[#5A5A40]/10">
            <button
              onClick={() => setActiveTab('edit')}
              className="flex-1 py-2 text-sm font-bold rounded-lg text-[#5A5A40]/60 hover:text-[#5A5A40]"
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className="flex-1 py-2 text-sm font-bold rounded-lg bg-white text-[#2A2A2A] shadow-xs"
            >
              Preview
            </button>
          </div>
        </div>

        {/* Preview: Discover-style card */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-lg mx-auto bg-white rounded-[36px] shadow-xl border border-[#5A5A40]/15 overflow-hidden">
            {userProfile.avatarUrl && (
              <div className="relative aspect-[4/5] w-full">
                <img src={userProfile.avatarUrl} alt={userProfile.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <h3 className="text-xl font-serif font-bold">{toPascalCase(userProfile.name)}, {userProfile.age}</h3>
                </div>
              </div>
            )}
            <div className="p-5 space-y-4">
              {userProfile.bio && (
                <div>
                  <h4 className="font-semibold text-base mb-1">About me</h4>
                  <p className="text-sm text-[#2A2A2A]/90 leading-relaxed">{userProfile.bio}</p>
                </div>
              )}
              <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-3 space-y-2 text-sm">
                <div className="flex items-center gap-3"><Cake className="w-5 h-5 text-[#8a804a] shrink-0" /><span>{userProfile.age} Yrs</span></div>
                <div className="flex items-center gap-3"><Ruler className="w-5 h-5 text-[#8a804a] shrink-0" /><span>{userProfile.height}</span></div>
                <div className="flex items-center gap-3"><GraduationCap className="w-5 h-5 text-[#8a804a] shrink-0" /><span>{userProfile.career.highestDegree}</span></div>
                <div className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-[#8a804a] shrink-0" /><span>{userProfile.career.profession}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleClearName = () => {
    setNameInput('');
    setUserProfile((prev) => ({ ...prev, name: '' }));
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Edit Profile</h2>
        <button className="p-2 rounded-full hover:bg-stone-100">
          <HelpCircle className="w-6 h-6 text-[#5A5A40]" />
        </button>
      </div>

      {/* Segmented Control */}
      <div className="bg-white px-4 py-2 border-b border-[#5A5A40]/10 shrink-0">
        <div className="flex bg-[#f5f5f0] rounded-xl p-1 border border-[#5A5A40]/10">
          <button
            onClick={() => setActiveTab('edit')}
            className="flex-1 py-2 text-sm font-bold rounded-lg bg-white text-[#2A2A2A] shadow-xs border-b-2 border-[#5A5A40]"
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className="flex-1 py-2 text-sm font-bold rounded-lg text-[#5A5A40]/60 hover:text-[#5A5A40]"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-1">
          {/* Top Banner */}
          <div className="mx-4 mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900 leading-snug">
                Get personalized tips to improve your photos, bio, and prompts
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600 shrink-0" />
          </div>

          {/* Photos Section */}
          <div className="px-4 py-3">
            <h3 className="text-base font-bold text-[#2A2A2A] mb-3">Photos</h3>
            <button
              onClick={() => setShowPictures(true)}
              className="w-full bg-white border border-[#5A5A40]/15 rounded-2xl p-3 flex items-center gap-3 hover:bg-stone-50 transition-all"
            >
              <div className="flex items-center gap-2 overflow-x-auto flex-1">
                {userProfile.photos.length > 0 ? (
                  userProfile.photos.slice(0, 4).map((photo, idx) => (
                    <img key={idx} src={photo} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover border border-[#5A5A40]/15 shrink-0" />
                  ))
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#5A5A40]/5 border border-dashed border-[#5A5A40]/30 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-[#5A5A40]/40" />
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0" />
            </button>
          </div>
          {showPictures && (
            <PicturesPage
              photos={userProfile.photos}
              setPhotos={(photos) => {
                setUserProfile((prev) => ({
                  ...prev,
                  photos,
                  avatarUrl: photos[0] || prev.avatarUrl,
                }))
              }}
              onClose={() => setShowPictures(false)}
            />
          )}

          <div className="mx-4 border-t border-[#5A5A40]/15" />

          {/* About Me Section */}
          <div className="px-4 py-3">
            <h3 className="text-base font-bold text-[#2A2A2A] mb-3">About Me</h3>
            <div className="bg-white border border-[#5A5A40]/15 rounded-2xl overflow-hidden divide-y divide-[#5A5A40]/10">
              {/* Bio */}
              <button
                onClick={() => setShowBioEdit(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all"
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[#2A2A2A]">Bio</p>
                  <p className="text-xs text-[#5A5A40] mt-0.5">{userProfile.bio || 'None'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
              {showBioEdit && (
                <BioEditPage
                  bio={userProfile.bio}
                  onSave={(bio) => {
                    setUserProfile((prev) => ({ ...prev, bio }))
                  }}
                  onClose={() => setShowBioEdit(false)}
                />
              )}
              {/* Interests */}
              <button
                onClick={() => setShowInterestsEdit(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all"
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[#2A2A2A]">Interests</p>
                  <p className="text-xs text-[#5A5A40] mt-0.5">
                    {userProfile.hobbies.length > 0
                      ? `${userProfile.hobbies.length} selected`
                      : 'Select Interests'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
              {showInterestsEdit && (
                <InterestsEditPage
                  selected={userProfile.hobbies}
                  onSave={(hobbies) => {
                    setUserProfile((prev) => ({ ...prev, hobbies }))
                  }}
                  onClose={() => setShowInterestsEdit(false)}
                />
              )}
              {/* Personality */}
              <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all">
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[#2A2A2A]">Personality</p>
                  <p className="text-xs text-[#5A5A40] mt-0.5 leading-snug">Share what makes you unique with potential matches.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
            </div>
          </div>

          <div className="mx-4 border-t border-[#5A5A40]/15" />

          {/* Written Prompt Section */}
          <div className="px-4 py-3">
            <h3 className="text-base font-bold text-[#2A2A2A] mb-3">Written Prompt</h3>
            <div className="bg-white border border-[#5A5A40]/15 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowWrittenPrompt(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all"
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[#2A2A2A]">Prompt</p>
                  <p className="text-xs text-[#5A5A40] mt-0.5">
                    {userProfile.prompts?.[0]?.question
                      ? `${userProfile.prompts[0].question}: ${userProfile.prompts[0].answer?.slice(0, 40)}${(userProfile.prompts[0].answer?.length || 0) > 40 ? '...' : ''}`
                      : 'None'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
              {showWrittenPrompt && (
                <WrittenPromptPage
                  prompts={userProfile.prompts || []}
                  onSave={(prompts) => {
                    setUserProfile((prev) => ({ ...prev, prompts }))
                  }}
                  onClose={() => setShowWrittenPrompt(false)}
                />
              )}
            </div>
          </div>

          <div className="mx-4 border-t border-[#5A5A40]/15" />

          {/* My Basics Section */}
          <div className="px-4 py-3">
            <h3 className="text-base font-bold text-[#2A2A2A] mb-3">My Basics</h3>
            <div className="bg-white border border-[#5A5A40]/15 rounded-2xl overflow-hidden divide-y divide-[#5A5A40]/10">
              {/* Name */}
              <div className="p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-[#5A5A40] shrink-0" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setUserProfile((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  className="flex-1 text-sm bg-transparent text-[#2A2A2A] focus:outline-none"
                  placeholder="Your name"
                />
                {nameInput && (
                  <button onClick={handleClearName} className="p-1 hover:bg-stone-100 rounded-full">
                    <X className="w-4 h-4 text-[#5A5A40]" />
                  </button>
                )}
              </div>
              {/* Age (readonly) */}
              <div className="p-4 flex items-center gap-3 bg-stone-50">
                <Cake className="w-5 h-5 text-[#5A5A40]/50 shrink-0" />
                <span className="flex-1 text-sm text-[#5A5A40]/60">{userProfile.age} years</span>
              </div>
              {/* Gender (readonly) */}
              <div className="p-4 flex items-center gap-3 bg-stone-50">
                <Heart className="w-5 h-5 text-[#5A5A40]/50 shrink-0" />
                <span className="flex-1 text-sm text-[#5A5A40]/60">{userProfile.gender}</span>
              </div>
              {/* Location */}
              <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <MapPin className="w-5 h-5 text-[#5A5A40] shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#2A2A2A]">Location + Places I've Lived</p>
                    <p className="text-xs text-[#5A5A40] mt-0.5">
                      {[userProfile.location.city, userProfile.location.state, userProfile.location.country].filter(Boolean).join(', ') || 'Not set'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
              {/* Height */}
              <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <Ruler className="w-5 h-5 text-[#5A5A40] shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#2A2A2A]">Height</p>
                    <p className="text-xs text-[#5A5A40] mt-0.5">{userProfile.height || 'Not set'}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
              {/* Life & Background */}
              <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <GraduationCap className="w-5 h-5 text-[#5A5A40] shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#2A2A2A]">Life & Background</p>
                    <p className="text-xs text-[#5A5A40] mt-0.5">
                      {[userProfile.career.highestDegree, userProfile.career.profession].filter(Boolean).join(' • ') || 'Not set'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A5A40]/50 shrink-0 ml-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
