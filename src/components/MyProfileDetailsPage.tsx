import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CandidateProfile } from '../types';
import { toPascalCase } from '../lib/formatters';
import {
  ArrowLeft,
  ImagePlus,
  Check,
  Cake,
  Ruler,
  GraduationCap,
  School,
  Briefcase,
  Navigation,
  Sparkles,
  Heart,
  Users,
  Wine,
  Smile,
  Baby,
} from 'lucide-react';

interface MyProfileDetailsPageProps {
  userProfile: CandidateProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  onClose: () => void;
}

function useAutoSave(
  userProfile: CandidateProfile,
  setUserProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>
) {
  const [formData, setFormData] = useState<CandidateProfile>({ ...userProfile });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Sync when userProfile changes from outside
  useEffect(() => {
    setFormData({ ...userProfile });
  }, [userProfile]);

  const commitSave = useCallback((data: CandidateProfile) => {
    setSaveStatus('saving');
    // Simulate async save
    setTimeout(() => {
      setUserProfile(data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 300);
  }, [setUserProfile]);

  const updateField = useCallback(<K extends keyof CandidateProfile>(
    key: K,
    value: CandidateProfile[K],
    immediate = false
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (immediate) {
        commitSave(next);
      }
      return next;
    });

    if (!immediate) {
      // Debounce save
      const timerKey = String(key);
      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey]);
      }
      debounceTimers.current[timerKey] = setTimeout(() => {
        setFormData((prev) => commitSave({ ...prev, [key]: value }));
      }, 800);
    }
  }, [commitSave]);

  const updateNestedField = useCallback(<K extends keyof CandidateProfile, SK extends keyof CandidateProfile[K]>(
    key: K,
    subKey: SK,
    value: CandidateProfile[K][SK],
    immediate = false
  ) => {
    setFormData((prev) => {
      const nested = { ...(prev[key] as object), [subKey]: value };
      const next = { ...prev, [key]: nested };
      if (immediate) {
        commitSave(next);
      }
      return next;
    });

    if (!immediate) {
      const timerKey = `${String(key)}.${String(subKey)}`;
      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey]);
      }
      debounceTimers.current[timerKey] = setTimeout(() => {
        setFormData((prev) => {
          const nested = { ...(prev[key] as object), [subKey]: value };
          commitSave({ ...prev, [key]: nested });
          return { ...prev, [key]: nested };
        });
      }, 800);
    }
  }, [commitSave]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  return { formData, setFormData, saveStatus, updateField, updateNestedField };
}

export const MyProfileDetailsPage: React.FC<MyProfileDetailsPageProps> = ({
  userProfile,
  setUserProfile,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const { formData, setFormData, saveStatus, updateField, updateNestedField } = useAutoSave(userProfile, setUserProfile);

  const photos = formData.photos.filter(Boolean);
  const hasUploadSlot = photos.length < 6;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col text-[#2A2A2A] font-sans overflow-hidden animate-fadeIn">
      {/* Minimal Navigation Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shadow-2xs shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-stone-100 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-[#5A5A40]" />
        </button>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-[10px] font-bold text-[#5A5A40]/60">Saving…</span>
          )}
        </div>
      </div>

      {/* Edit / Preview Toggle */}
      <div className="bg-white px-4 py-2 border-b border-[#5A5A40]/10 shrink-0">
        <div className="flex bg-[#f5f5f0] rounded-xl p-1 border border-[#5A5A40]/10">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'edit'
                ? 'bg-white text-[#2A2A2A] shadow-xs'
                : 'text-[#5A5A40]/60 hover:text-[#5A5A40]'
            }`}
          >
            Edit Info
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-[#2A2A2A] shadow-xs'
                : 'text-[#5A5A40]/60 hover:text-[#5A5A40]'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
        {viewMode === 'preview' ? (
          /* ===== PREVIEW MODE — Discover Page Card ===== */
          <div className="p-4 sm:p-5 space-y-4">
            {/* Header: Name + Verification Pill */}
            <div className="flex items-center justify-between gap-2 border-b border-[#5A5A40]/15 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-serif font-bold text-[#2A2A2A]">
                  {toPascalCase(formData.name)}
                </h2>
                {formData.verified && (
                  <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#5A5A40] stroke-[3]" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Profile Image */}
            {formData.avatarUrl && (
              <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-sm">
                <img
                  src={formData.avatarUrl}
                  alt={formData.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* About Me */}
            {formData.bio && (
              <div className="space-y-1.5 px-1">
                <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm">About me</h3>
                <p className="text-xs text-[#2A2A2A]/90 font-sans leading-relaxed whitespace-pre-line">
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Key Stats Card */}
            <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
              {formData.age > 0 && (
                <>
                  <div className="py-3 flex items-center gap-3">
                    <Cake className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">{formData.age} Yrs</span>
                  </div>
                  <div className="h-px bg-[#5A5A40]/12 mx-1" />
                </>
              )}

              {formData.height && (
                <>
                  <div className="py-3 flex items-center gap-3">
                    <Ruler className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">{formData.height}</span>
                  </div>
                  <div className="h-px bg-[#5A5A40]/12 mx-1" />
                </>
              )}

              {formData.career.highestDegree && (
                <>
                  <div className="py-3 flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">{formData.career.highestDegree}</span>
                  </div>
                  <div className="h-px bg-[#5A5A40]/12 mx-1" />
                </>
              )}

              {formData.career.collegeName && (
                <>
                  <div className="py-3 flex items-center gap-3">
                    <School className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">{formData.career.collegeName}</span>
                  </div>
                  <div className="h-px bg-[#5A5A40]/12 mx-1" />
                </>
              )}

              {formData.career.profession && (
                <div className="py-3 flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-[#8a804a] shrink-0" />
                  <span className="font-medium text-[#2A2A2A]">{formData.career.profession}</span>
                </div>
              )}
            </div>

            {/* Location Card */}
            {(formData.location.city || formData.location.state || formData.location.country) && (
              <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-[#2A2A2A] shadow-2xs font-sans">
                <Navigation className="w-4 h-4 text-[#8a804a] shrink-0 rotate-45" />
                <span>
                  {[formData.location.city, formData.location.state, formData.location.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Personal Details Card */}
            {(formData.religion || formData.caste || formData.maritalStatus) && (
              <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
                {(formData.religion || formData.caste) && (
                  <>
                    <div className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                        <Sparkles className="w-4 h-4 text-[#8a804a] shrink-0" />
                        <span>Religion & Caste</span>
                      </div>
                      <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                        {formData.religion}{formData.caste ? ` (${formData.caste})` : ''}
                      </span>
                    </div>
                    <div className="h-px bg-[#5A5A40]/12 mx-1" />
                  </>
                )}

                {formData.maritalStatus && (
                  <div className="py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                      <Users className="w-4 h-4 text-[#8a804a] shrink-0" />
                      <span>Marital Status</span>
                    </div>
                    <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                      {formData.maritalStatus}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm px-1">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#5A5A40]/15 bg-stone-100"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== EDIT MODE ===== */
          <div className="px-4 sm:px-6 py-5 space-y-0">
            {/* Photos Section */}
            <h3 className="font-serif font-bold text-[#2A2A2A] text-base mb-3">
              Photos
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#5A5A40]/15 bg-stone-100"
                >
                  <img
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {hasUploadSlot && (
                <button
                  type="button"
                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#5A5A40]/30 bg-[#5A5A40]/5 flex flex-col items-center justify-center gap-2 text-[#5A5A40]/60 hover:border-[#5A5A40]/50 hover:bg-[#5A5A40]/10 hover:text-[#5A5A40] transition-all active:scale-95"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                </button>
              )}
            </div>

            {/* Inset Divider */}
            <div className="mx-6 border-t border-[#5A5A40]/15" />

            {/* About Me Section */}
            <div className="pt-5 space-y-3">
              <h3 className="font-serif font-bold text-[#2A2A2A] text-base">
                About Me
              </h3>

              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                onBlur={() => updateField('bio', formData.bio, true)}
                placeholder="Tell others about yourself..."
                className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-3 text-xs text-[#2A2A2A] leading-relaxed focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            {/* Basic Personal Details */}
            <div className="pt-5 space-y-3">
              <h3 className="font-serif font-bold text-[#2A2A2A] text-base">
                Basic Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    onBlur={() => updateField('name', formData.name, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                    onBlur={() => updateField('age', formData.age, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    onBlur={() => updateField('height', formData.height, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => updateField('maritalStatus', e.target.value as any)}
                    onBlur={() => updateField('maritalStatus', formData.maritalStatus, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  >
                    <option value="">Select</option>
                    <option value="Never Married">Never Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education & Career */}
            <div className="pt-5 space-y-3">
              <h3 className="font-serif font-bold text-[#2A2A2A] text-base">
                Education & Career
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Profession</label>
                  <input
                    type="text"
                    value={formData.career.profession}
                    onChange={(e) => updateNestedField('career', 'profession', e.target.value)}
                    onBlur={() => updateNestedField('career', 'profession', formData.career.profession, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Highest Degree</label>
                  <input
                    type="text"
                    value={formData.career.highestDegree}
                    onChange={(e) => updateNestedField('career', 'highestDegree', e.target.value)}
                    onBlur={() => updateNestedField('career', 'highestDegree', formData.career.highestDegree, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-5 space-y-3">
              <h3 className="font-serif font-bold text-[#2A2A2A] text-base">
                Location
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => updateNestedField('location', 'city', e.target.value)}
                    onBlur={() => updateNestedField('location', 'city', formData.location.city, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => updateNestedField('location', 'state', e.target.value)}
                    onBlur={() => updateNestedField('location', 'state', formData.location.state, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) => updateNestedField('location', 'country', e.target.value)}
                    onBlur={() => updateNestedField('location', 'country', formData.location.country, true)}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl p-2 text-xs text-[#2A2A2A]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Done Button */}
            <div className="pt-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
