import React, { useState, useRef, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import CountryFlag from 'react-country-flag';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { loadOnboardingDraft, saveOnboardingDraft, clearOnboardingDraft, setOnboardingCompleted } from '../lib/onboardingDraft';
import { syncOnboardingEntryToSupabase, resetOnboardingProfileInSupabase, getPersistentUserId } from '../lib/supabase';

export interface CountryCallingInfo {
  code: string;
  flag: string;
  countryCode: CountryCode;
  name: string;
}

export const COUNTRIES_LIST: CountryCallingInfo[] = [
  { code: '+94', flag: '🇱🇰', countryCode: 'LK', name: 'Sri Lanka' },
  { code: '+91', flag: '🇮🇳', countryCode: 'IN', name: 'India' },
  { code: '+1', flag: '🇺🇸', countryCode: 'US', name: 'United States' },
  { code: '+44', flag: '🇬🇧', countryCode: 'GB', name: 'United Kingdom' },
  { code: '+1', flag: '🇨🇦', countryCode: 'CA', name: 'Canada' },
  { code: '+61', flag: '🇦🇺', countryCode: 'AU', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', countryCode: 'AE', name: 'United Arab Emirates' },
  { code: '+974', flag: '🇶🇦', countryCode: 'QA', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', countryCode: 'KW', name: 'Kuwait' },
  { code: '+968', flag: '🇴🇲', countryCode: 'OM', name: 'Oman' },
  { code: '+966', flag: '🇸🇦', countryCode: 'SA', name: 'Saudi Arabia' },
  { code: '+65', flag: '🇸🇬', countryCode: 'SG', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', countryCode: 'MY', name: 'Malaysia' },
  { code: '+49', flag: '🇩🇪', countryCode: 'DE', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', countryCode: 'FR', name: 'France' },
  { code: '+39', flag: '🇮🇹', countryCode: 'IT', name: 'Italy' },
  { code: '+64', flag: '🇳🇿', countryCode: 'NZ', name: 'New Zealand' },
  { code: '+92', flag: '🇵🇰', countryCode: 'PK', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', countryCode: 'BD', name: 'Bangladesh' }
];

export const isValidEmailAddress = (email: string): boolean => {
  if (!email) return false;
  const trimmed = email.trim();
  // Standard RFC 5322 regex validation
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(trimmed);
};

export const getPhoneValidation = (
  number: string,
  countryCode: CountryCode,
  dialCode: string
): { isValid: boolean; formatted: string; message: string } => {
  const clean = number.trim();
  if (!clean) {
    return { isValid: false, formatted: '', message: 'Phone number is required.' };
  }
  try {
    const full = clean.startsWith('+') ? clean : `${dialCode}${clean.replace(/^0+/, '')}`;
    const parsed = parsePhoneNumberFromString(full, countryCode);
    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.formatInternational(),
        message: `Valid phone number (${parsed.formatInternational()})`
      };
    }
  } catch {
    // fallback check
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 7 && digits.length <= 15) {
    return {
      isValid: true,
      formatted: `${dialCode} ${digits}`,
      message: `Valid number format (${dialCode} ${digits})`
    };
  }
  return {
    isValid: false,
    formatted: '',
    message: `Please enter a valid phone number for ${countryCode}.`
  };
};
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Calendar,
  Check,
  MapPin,
  AlertCircle,
  Loader2,
  Navigation,
  Bell,
  Globe,
  Ruler,
  GraduationCap,
  Briefcase,
  User,
  Building,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  Star,
  XCircle,
  X,
  AlertTriangle,
  Settings,
  CheckCircle2,
  GripVertical,
  ArrowLeftRight,
  FileText,
  Smile,
  Trophy,
  Palette,
  Music,
  Compass,
  Utensils,
  Mail,
  Phone,
  ScanFace,
  BadgeCheck,
  Lock,
  Quote,
  Eye,
  HelpCircle,
  RotateCcw,
  FileCheck,
  Cake,
  School,
  MoreVertical,
  Baby,
  SlidersHorizontal,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { FilterState } from '../types';
import { toPascalCase, isValidNameString, calculateAge, getDaysInMonth } from '../lib/formatters';
import {
  RELIGION_OPTIONS,
  ETHNICITY_OPTIONS,
  SRI_LANKAN_LAGNA_SIGNS,
  SRI_LANKAN_NEKATH,
  validateSriLankanHoroscopeText
} from '../lib/sriLankanHoroscope';

interface OnboardingScreenProps {
  onComplete: (
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
  ) => void;
  onExit?: () => void;
  userId?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface SwipeablePickerColumnProps {
  label: string;
  prevText: string;
  currentText: string;
  nextText: string;
  onUp: () => void;
  onDown: () => void;
  options: { value: number | string; label: string }[];
  currentValue: number | string;
  onChange: (val: any) => void;
  disabledUp?: boolean;
  disabledDown?: boolean;
}

const SwipeablePickerColumn: React.FC<SwipeablePickerColumnProps> = ({
  label,
  prevText,
  nextText,
  onUp,
  onDown,
  options,
  currentValue,
  onChange,
  disabledUp,
  disabledDown,
}) => {
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (diffY < -18) {
      if (!disabledDown) onDown();
      touchStartY.current = e.touches[0].clientY;
    } else if (diffY > 18) {
      if (!disabledUp) onUp();
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const diffY = e.clientY - dragStartY.current;
    if (diffY < -20) {
      if (!disabledDown) onDown();
      dragStartY.current = e.clientY;
    } else if (diffY > 20) {
      if (!disabledUp) onUp();
      dragStartY.current = e.clientY;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    dragStartY.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      if (!disabledDown) onDown();
    } else if (e.deltaY < 0) {
      if (!disabledUp) onUp();
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A5A40]/70 mb-1.5">
        {label}
      </span>

      <button
        type="button"
        disabled={disabledUp}
        onClick={onUp}
        className={`p-1.5 rounded-lg transition-all active:scale-90 ${
          disabledUp ? 'text-stone-300 cursor-not-allowed' : 'text-[#5A5A40] hover:bg-[#5A5A40]/10'
        }`}
        title={`Previous ${label}`}
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full my-1.5 py-2 px-2 bg-[#5A5A40]/8 border border-[#5A5A40]/20 rounded-xl text-center cursor-grab active:cursor-grabbing flex flex-col items-center justify-center space-y-1 touch-none"
      >
        <button
          type="button"
          disabled={disabledUp}
          onClick={onUp}
          className="text-xs sm:text-sm text-[#5A5A40]/50 font-semibold truncate w-full hover:text-[#5A5A40] transition-colors cursor-pointer py-1"
        >
          {prevText}
        </button>

        <div className="relative w-full py-1.5 bg-[#5A5A40] text-white rounded-lg shadow-xs flex items-center justify-center">
          <select
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-white text-center focus:outline-none cursor-pointer appearance-none px-2"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-[#2A2A2A] bg-white text-sm">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={disabledDown}
          onClick={onDown}
          className="text-xs sm:text-sm text-[#5A5A40]/50 font-semibold truncate w-full hover:text-[#5A5A40] transition-colors cursor-pointer py-1"
        >
          {nextText}
        </button>
      </div>

      <button
        type="button"
        disabled={disabledDown}
        onClick={onDown}
        className={`p-1.5 rounded-lg transition-all active:scale-90 ${
          disabledDown ? 'text-stone-300 cursor-not-allowed' : 'text-[#5A5A40] hover:bg-[#5A5A40]/10'
        }`}
        title={`Next ${label}`}
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onExit, userId }) => {
  const effectiveUserId = userId || getPersistentUserId();
  const initialDraftRef = useRef(loadOnboardingDraft());
  const saved = initialDraftRef.current;
  const isResumed = Boolean(saved && typeof saved.currentStep === 'number' && saved.currentStep > 0);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (saved && typeof saved.currentStep === 'number' && saved.currentStep >= 0 && saved.currentStep < 16) {
      return saved.currentStep;
    }
    return 0;
  });
  
  // Mandatory Location State
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>(saved?.locationStatus || 'idle');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(saved?.locationCoords ?? null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mandatory Notification State
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>(saved?.notificationStatus || 'idle');
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // User Profile Name & DOB Carousel State
  const [firstName, setFirstName] = useState<string>(saved?.firstName || '');
  const [nameError, setNameError] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();
  const maxYearAllowed = currentYear - 18; // Maximum year to meet 18+ requirement

  const [selectedDay, setSelectedDay] = useState<number>(saved?.selectedDay ?? 15);
  const [selectedMonth, setSelectedMonth] = useState<number>(saved?.selectedMonth ?? 8); // 8 = August
  const [selectedYear, setSelectedYear] = useState<number>(saved?.selectedYear ?? (currentYear - 25)); // e.g., 2001

  const [dob, setDob] = useState<string>(saved?.dob || '');
  const [dobError, setDobError] = useState<string | null>(null);

  const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);
  const currentEffectiveDay = Math.min(selectedDay, daysInCurrentMonth);
  const calculatedAge = calculateAge(selectedYear, selectedMonth, currentEffectiveDay);
  const isUnder18 = calculatedAge < 18;


  // Interactive Onboarding Preferences
  const [lookingForGender, setLookingForGender] = useState<'Female' | 'Male' | 'All'>(saved?.lookingForGender || 'Female');
  const [maritalStatus, setMaritalStatus] = useState<string>(saved?.maritalStatus || 'Never Married');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(saved?.verifiedOnly ?? false);
  const [ageRange, setAgeRange] = useState<{ min: number; max: number }>(saved?.ageRange || { min: 22, max: 32 });

  // Extended Profile Onboarding States
  const [userGender, setUserGender] = useState<'Male' | 'Female' | ''>(saved?.userGender || '');
  const [genderError, setGenderError] = useState<string | null>(null);

  const [heightFeet, setHeightFeet] = useState<number | ''>(saved?.heightFeet ?? '');
  const [heightInches, setHeightInches] = useState<number | ''>(saved?.heightInches ?? '');
  const [heightError, setHeightError] = useState<string | null>(null);

  const [country, setCountry] = useState<string>(saved?.country || '');
  const [pulledLocation, setPulledLocation] = useState<string>(saved?.pulledLocation || '');
  const [hasPulledLocation, setHasPulledLocation] = useState<boolean>(saved?.hasPulledLocation ?? false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [isDetectingCountry, setIsDetectingCountry] = useState<boolean>(false);

  const [educationLevel, setEducationLevel] = useState<string>(saved?.educationLevel || '');
  const [schoolOrUniversity, setSchoolOrUniversity] = useState<string>(saved?.schoolOrUniversity || '');
  const [profession, setProfession] = useState<string>(saved?.profession || '');
  const [userRelationshipStatus, setUserRelationshipStatus] = useState<'Never Married' | 'Divorced' | 'Widowed' | ''>(saved?.userRelationshipStatus || '');
  const [showRelationshipOnProfile, setShowRelationshipOnProfile] = useState<boolean>(saved?.showRelationshipOnProfile ?? true);

  const [haveKids, setHaveKids] = useState<'Yes' | 'No' | ''>(saved?.haveKids || '');
  const [showHaveKidsOnProfile, setShowHaveKidsOnProfile] = useState<boolean>(saved?.showHaveKidsOnProfile ?? true);

  const [wantKids, setWantKids] = useState<'Yes' | 'No' | ''>(saved?.wantKids || '');
  const [showWantKidsOnProfile, setShowWantKidsOnProfile] = useState<boolean>(saved?.showWantKidsOnProfile ?? true);

  const [datingIntentions, setDatingIntentions] = useState<'Marriage Focused' | 'Figuring It Out' | ''>(saved?.datingIntentions || '');
  const [showDatingIntentionsOnProfile, setShowDatingIntentionsOnProfile] = useState<boolean>(saved?.showDatingIntentionsOnProfile ?? true);

  const [marriageConfirmation, setMarriageConfirmation] = useState<boolean>(saved?.marriageConfirmation ?? false);
  const [lifeBackgroundError, setLifeBackgroundError] = useState<string | null>(null);

  // Faith & Heritage State (Religion, Ethnicity, and Optional Sri Lankan Horoscope)
  const [religion, setReligion] = useState<string>(saved?.religion || '');
  const [customReligion, setCustomReligion] = useState<string>(saved?.customReligion || '');
  const [ethnicity, setEthnicity] = useState<string>(saved?.ethnicity || '');
  const [customEthnicity, setCustomEthnicity] = useState<string>(saved?.customEthnicity || '');
  const [caste, setCaste] = useState<string>(saved?.caste || '');
  const [manglikStatus, setManglikStatus] = useState<string>(saved?.manglikStatus || '');
  const [lagna, setLagna] = useState<string>(saved?.lagna || '');
  const [nekatha, setNekatha] = useState<string>(saved?.nekatha || '');
  const [horoscopeNotes, setHoroscopeNotes] = useState<string>(saved?.horoscopeNotes || '');
  const [faithHeritageError, setFaithHeritageError] = useState<string | null>(null);
  const [horoscopeTextError, setHoroscopeTextError] = useState<string | null>(null);

  // Photos state (3 mandatory photos: 1 main + 2 additional)
  const [mainPhoto, setMainPhoto] = useState<string>(saved?.mainPhoto || '');
  const [photo2, setPhoto2] = useState<string>(saved?.photo2 || '');
  const [photo3, setPhoto3] = useState<string>(saved?.photo3 || '');
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [galleryPermissionEnabled, setGalleryPermissionEnabled] = useState<boolean>(true);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // About Me State (Optional, max 750 characters)
  const [aboutMe, setAboutMe] = useState<string>(saved?.aboutMe || '');

  // Interests State (Choose up to 3 per section, select at least 6 total - NOT pre-selected)
  const [selectedInterests, setSelectedInterests] = useState<Record<string, string[]>>(saved?.selectedInterests || {});
  const [interestsError, setInterestsError] = useState<string | null>(null);

  // Personality Prompts State (Optional)
  const [selectedPrompt, setSelectedPrompt] = useState<string>(saved?.selectedPrompt || '');
  const [promptAnswer, setPromptAnswer] = useState<string>(saved?.promptAnswer || '');

  // Contact Info State
  const [emailAddress, setEmailAddress] = useState<string>(saved?.emailAddress || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(saved?.phoneNumber || '');
  const [detectedPhoneInfo, setDetectedPhoneInfo] = useState<{ code: string; flag: string; countryCode: string }>(() => {
    if (saved?.detectedPhoneInfo) return saved.detectedPhoneInfo;
    return { code: '+94', flag: '🇱🇰', countryCode: 'LK' };
  });
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);

  // Auto-detect user's country based on Step 6 location selection
  useEffect(() => {
    if (!country) return;
    const cName = country.trim().toLowerCase();
    const match = COUNTRIES_LIST.find(
      (c) =>
        c.name.toLowerCase() === cName ||
        (cName.includes('lanka') && c.countryCode === 'LK') ||
        (cName.includes('india') && c.countryCode === 'IN') ||
        ((cName.includes('united states') || cName === 'usa' || cName === 'us') && c.countryCode === 'US') ||
        ((cName.includes('united kingdom') || cName === 'uk') && c.countryCode === 'GB') ||
        (cName.includes('canada') && c.countryCode === 'CA') ||
        (cName.includes('australia') && c.countryCode === 'AU') ||
        ((cName.includes('emirates') || cName === 'uae') && c.countryCode === 'AE') ||
        (cName.includes('qatar') && c.countryCode === 'QA') ||
        (cName.includes('kuwait') && c.countryCode === 'KW') ||
        (cName.includes('oman') && c.countryCode === 'OM') ||
        (cName.includes('saudi') && c.countryCode === 'SA') ||
        (cName.includes('singapore') && c.countryCode === 'SG') ||
        (cName.includes('malaysia') && c.countryCode === 'MY') ||
        (cName.includes('germany') && c.countryCode === 'DE') ||
        (cName.includes('france') && c.countryCode === 'FR') ||
        (cName.includes('italy') && c.countryCode === 'IT') ||
        (cName.includes('pakistan') && c.countryCode === 'PK')
    );
    if (match) {
      setDetectedPhoneInfo({ code: match.code, flag: match.flag, countryCode: match.countryCode });
    }
  }, [country]);

  // Handle phone number input with automatic international dialing code detection
  const handlePhoneInputChange = (rawVal: string) => {
    let val = rawVal;
    if (val.startsWith('+') || val.startsWith('00')) {
      const formatted = val.startsWith('00') ? '+' + val.slice(2) : val;
      try {
        const parsed = parsePhoneNumberFromString(formatted);
        if (parsed && parsed.country) {
          const found = COUNTRIES_LIST.find((c) => c.countryCode === parsed.country);
          if (found) {
            setDetectedPhoneInfo({ code: found.code, flag: found.flag, countryCode: found.countryCode });
            setPhoneNumber(parsed.nationalNumber);
            if (contactError) setContactError(null);
            return;
          }
        }
      } catch {}
    }

    // Check if user entered dial prefix without plus sign
    for (const c of COUNTRIES_LIST) {
      const prefix = c.code.replace('+', '');
      if (val.length > prefix.length + 5 && val.startsWith(prefix)) {
        setDetectedPhoneInfo({ code: c.code, flag: c.flag, countryCode: c.countryCode });
        setPhoneNumber(val.slice(prefix.length));
        if (contactError) setContactError(null);
        return;
      }
    }

    const digitsOnly = val.replace(/[^0-9]/g, '');
    setPhoneNumber(digitsOnly);
    if (contactError) setContactError(null);
  };

  const phoneValidationStatus = getPhoneValidation(
    phoneNumber,
    (detectedPhoneInfo.countryCode as CountryCode) || 'LK',
    detectedPhoneInfo.code
  );

  const [contactError, setContactError] = useState<string | null>(null);

  // Verification State
  const [selfieVerified, setSelfieVerified] = useState<boolean>(saved?.selfieVerified ?? false);
  const [idUploaded, setIdUploaded] = useState<boolean>(saved?.idUploaded ?? false);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(saved?.idFrontImage ?? null);
  const [idBackImage, setIdBackImage] = useState<string | null>(saved?.idBackImage ?? null);
  const [activeIdPicker, setActiveIdPicker] = useState<'front' | 'back' | null>(null);
  const [showIdOptionsModal, setShowIdOptionsModal] = useState<boolean>(false);
  const [idCameraMode, setIdCameraMode] = useState<'front' | 'back' | null>(null);

  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<'info' | 'selfie_scan' | 'id_upload'>('info');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [faceAligned, setFaceAligned] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Live Front Camera & AI Face Verification State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [isVerifyingFace, setIsVerifyingFace] = useState<boolean>(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<{
    approved: boolean;
    confidenceScore: number;
    reason: string;
  } | null>(null);
  const [aiVerificationError, setAiVerificationError] = useState<string | null>(null);

  // Stop camera tracks cleanly
  const stopFrontCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      setCameraStream(null);
    }
    setCameraStatus('idle');
  };

  const selfieFileInputRef = useRef<HTMLInputElement>(null);

  // Reusable AI face verification against reference profile photo
  const runAIFaceVerification = async (selfieBase64: string) => {
    setIsVerifyingFace(true);
    setAiVerificationError(null);
    setAiVerificationResult(null);

    try {
      const referencePhoto = mainPhoto || photo2 || photo3 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

      const response = await fetch('/api/gemini/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadedPhoto: referencePhoto,
          capturedFace: selfieBase64
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Face verification service was unable to process the comparison.');
      }

      setAiVerificationResult({
        approved: Boolean(data.approved),
        confidenceScore: data.confidenceScore ?? (data.approved ? 94 : 32),
        reason: data.reason || (data.approved ? 'Face match approved with your uploaded profile photo.' : 'Facial comparison does not match profile photo.')
      });

      if (data.approved) {
        setSelfieVerified(true);
        stopFrontCamera();
      }
    } catch (err: any) {
      console.error('Face verification request error:', err);
      setAiVerificationError(err?.message || 'Face verification failed. Please try again.');
    } finally {
      setIsVerifyingFace(false);
    }
  };

  // Start front-facing camera with multi-tier fallback
  const startFrontCamera = async () => {
    setCameraStatus('starting');
    setCameraError(null);
    setAiVerificationError(null);
    setAiVerificationResult(null);
    setCapturedSelfie(null);

    // If mediaDevices is missing in this browser environment
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraError('Live browser camera is not directly available in this environment. You can use your device camera or upload a selfie directly.');
      return;
    }

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }

      let stream: MediaStream | null = null;
      // Tier 1: Try front camera with facingMode: 'user'
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 640 }
          },
          audio: false
        });
      } catch {
        // Tier 2: Try basic video constraints without resolution/facingMode specifics
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (stream) {
        setCameraStream(stream);
        setCameraStatus('active');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('Front camera access notice:', err?.name || err?.message || err);
      setCameraStatus('denied');
      setCameraError(
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.message?.includes('Permission denied')
          ? 'Front camera permission is currently blocked by your browser settings or iframe security. You can click Retry Camera or take a selfie using your native device camera below.'
          : 'Could not connect to front camera. You can take a selfie directly using your device camera.'
      );
    }
  };

  // Attach camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream && cameraStatus === 'active') {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, cameraStatus]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Capture face snapshot from video feed and verify with Gemini AI
  const handleCaptureAndVerifyFace = async () => {
    if (!videoRef.current || cameraStatus !== 'active') return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally to match selfie mirror
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const selfieBase64 = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedSelfie(selfieBase64);

    await runAIFaceVerification(selfieBase64);
  };

  // Handle native camera capture or image selection fallback
  const handleSelfieFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedSelfie(dataUrl);
        setCameraStatus('idle');
        stopFrontCamera();
        await runAIFaceVerification(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetakeFrontSelfie = () => {
    setCapturedSelfie(null);
    setAiVerificationResult(null);
    setAiVerificationError(null);
    startFrontCamera();
  };

  const handleCloseVerificationModal = () => {
    stopFrontCamera();
    setIsVerificationModalOpen(false);
  };

  // Auto-save draft on any change
  useEffect(() => {
    saveOnboardingDraft({
      currentStep,
      locationStatus,
      locationCoords,
      notificationStatus,
      firstName,
      selectedDay,
      selectedMonth,
      selectedYear,
      dob,
      lookingForGender,
      maritalStatus,
      verifiedOnly,
      ageRange,
      userGender,
      heightFeet,
      heightInches,
      country,
      pulledLocation,
      hasPulledLocation,
      educationLevel,
      schoolOrUniversity,
      profession,
      userRelationshipStatus,
      showRelationshipOnProfile,
      haveKids,
      showHaveKidsOnProfile,
      wantKids,
      showWantKidsOnProfile,
      datingIntentions,
      showDatingIntentionsOnProfile,
      marriageConfirmation,
      religion,
      customReligion,
      ethnicity,
      customEthnicity,
      caste,
      manglikStatus,
      lagna,
      nekatha,
      horoscopeNotes,
      mainPhoto,
      photo2,
      photo3,
      aboutMe,
      selectedInterests,
      selectedPrompt,
      promptAnswer,
      emailAddress,
      phoneNumber,
      detectedPhoneInfo,
      selfieVerified,
      idUploaded,
      idFrontImage,
      idBackImage,
    });
  }, [
    currentStep,
    locationStatus,
    locationCoords,
    notificationStatus,
    firstName,
    selectedDay,
    selectedMonth,
    selectedYear,
    dob,
    lookingForGender,
    maritalStatus,
    verifiedOnly,
    ageRange,
    userGender,
    heightFeet,
    heightInches,
    country,
    pulledLocation,
    hasPulledLocation,
    educationLevel,
    schoolOrUniversity,
    profession,
    userRelationshipStatus,
    showRelationshipOnProfile,
    haveKids,
    showHaveKidsOnProfile,
    wantKids,
    showWantKidsOnProfile,
    datingIntentions,
    showDatingIntentionsOnProfile,
    marriageConfirmation,
    religion,
    customReligion,
    ethnicity,
    customEthnicity,
    caste,
    manglikStatus,
    lagna,
    nekatha,
    horoscopeNotes,
    mainPhoto,
    photo2,
    photo3,
    aboutMe,
    selectedInterests,
    selectedPrompt,
    promptAnswer,
    emailAddress,
    phoneNumber,
    detectedPhoneInfo,
    selfieVerified,
    idUploaded,
    idFrontImage,
    idBackImage,
  ]);

  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);

  // Sync to Supabase profiles table on every entry (overwrites/updates the exact same row by id)
  useEffect(() => {
    const heightStr = heightFeet !== '' && heightInches !== '' ? `${heightFeet}' ${heightInches}"` : '';
    const parts = (pulledLocation || '').split(',').map((p) => p.trim());
    const city = parts[0] || '';
    const state = parts[1] || '';
    const photosList = [mainPhoto, photo2, photo3].filter(Boolean);
    const effectiveReligion = religion === 'Other' ? customReligion.trim() : religion;
    const effectiveEthnicity = ethnicity === 'Other' ? customEthnicity.trim() : ethnicity;

    const debounceTimer = setTimeout(() => {
      const dobFormatted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(currentEffectiveDay).padStart(2, '0')}`;
      syncOnboardingEntryToSupabase(effectiveUserId, {
        onboarding_step: currentStep,
        onboarding_completed: false,
        name: firstName ? toPascalCase(firstName) : '',
        gender: userGender || '',
        age: calculatedAge || 0,
        dob: dobFormatted,
        birth_date: dobFormatted,
        date_of_birth: dobFormatted,
        height: heightStr,
        city,
        state,
        country: country || 'Sri Lanka',
        education: educationLevel || '',
        highest_degree: educationLevel || '',
        school_or_university: schoolOrUniversity || '',
        profession: profession || '',
        marital_status: userRelationshipStatus || maritalStatus || '',
        religion: effectiveReligion || '',
        ethnicity: effectiveEthnicity || '',
        caste: caste.trim() || '',
        manglik_status: manglikStatus || '',
        rashi: lagna || '',
        nakshatra: nekatha || '',
        horoscope_notes: horoscopeNotes || '',
        photos: photosList,
        avatar_url: mainPhoto || '',
        bio: aboutMe || '',
      });
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [
    effectiveUserId,
    currentStep,
    firstName,
    calculatedAge,
    userGender,
    heightFeet,
    heightInches,
    country,
    pulledLocation,
    educationLevel,
    schoolOrUniversity,
    profession,
    userRelationshipStatus,
    maritalStatus,
    religion,
    customReligion,
    ethnicity,
    customEthnicity,
    caste,
    manglikStatus,
    lagna,
    nekatha,
    horoscopeNotes,
    mainPhoto,
    photo2,
    photo3,
    aboutMe,
  ]);

  const confirmRestart = async () => {
    setShowRestartModal(false);
    clearOnboardingDraft();

    // Overwrite the EXACT SAME line in profiles and user_details tables in Supabase so no extra rows are created
    await resetOnboardingProfileInSupabase(effectiveUserId);

    setCurrentStep(0);
    setLocationStatus('idle');
    setLocationCoords(null);
    setLocationError(null);
    setNotificationStatus('idle');
    setNotificationError(null);
    setFirstName('');
    setNameError(null);
    setSelectedDay(15);
    setSelectedMonth(8);
    setSelectedYear(currentYear - 25);
    setDob('');
    setDobError(null);
    setLookingForGender('Female');
    setMaritalStatus('Never Married');
    setVerifiedOnly(false);
    setAgeRange({ min: 22, max: 32 });
    setUserGender('');
    setGenderError(null);
    setHeightFeet('');
    setHeightInches('');
    setHeightError(null);
    setCountry('');
    setPulledLocation('');
    setHasPulledLocation(false);
    setCountryError(null);
    setEducationLevel('');
    setSchoolOrUniversity('');
    setProfession('');
    setUserRelationshipStatus('');
    setShowRelationshipOnProfile(true);
    setHaveKids('');
    setShowHaveKidsOnProfile(true);
    setWantKids('');
    setShowWantKidsOnProfile(true);
    setDatingIntentions('');
    setShowDatingIntentionsOnProfile(true);
    setMarriageConfirmation(false);
    setLifeBackgroundError(null);
    setReligion('');
    setCustomReligion('');
    setEthnicity('');
    setCustomEthnicity('');
    setCaste('');
    setManglikStatus('');
    setLagna('');
    setNekatha('');
    setHoroscopeNotes('');
    setFaithHeritageError(null);
    setHoroscopeTextError(null);
    setMainPhoto('');
    setPhoto2('');
    setPhoto3('');
    setPhotosError(null);
    setAboutMe('');
    setSelectedInterests({});
    setInterestsError(null);
    setSelectedPrompt('');
    setPromptAnswer('');
    setEmailAddress('');
    setPhoneNumber('');
    setContactError(null);
    setSelfieVerified(false);
    setIdUploaded(false);
    setIdFrontImage(null);
    setIdBackImage(null);
    setVerificationError(null);
    initialDraftRef.current = null;
  };

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (side === 'front') {
          setIdFrontImage(result);
        } else {
          setIdBackImage(result);
        }
        setIdUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const swapPhotos = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx > 2 || toIdx > 2) return;
    const list = [mainPhoto, photo2, photo3];
    const temp = list[fromIdx];
    list[fromIdx] = list[toIdx];
    list[toIdx] = temp;
    setMainPhoto(list[0]);
    setPhoto2(list[1]);
    setPhoto3(list[2]);
    setPhotosError(null);
  };

  const totalSteps = 16;

  const INTEREST_CATEGORIES = [
    {
      name: 'Sports',
      icon: Trophy,
      items: [
        'Badminton',
        'Tennis',
        'Cricket',
        'Cycling',
        'Running',
        'Gym',
        'Pickleball',
        'Soccer',
        'Padel',
        'Swimming',
        'Basketball',
        'Yoga',
        'F1 Racing'
      ]
    },
    {
      name: 'Creative & Hobbies',
      icon: Palette,
      items: [
        'Photography',
        'Painting',
        'Cooking',
        'Baking',
        'Writing',
        'Gardening',
        'Crafts',
        'Pottery'
      ]
    },
    {
      name: 'Music & Entertainment',
      icon: Music,
      items: [
        'Concerts',
        'Pop Music',
        'Rock Music',
        'Podcasts',
        'Movies',
        'Comedy',
        'Theater',
        'Gaming'
      ]
    },
    {
      name: 'Travel & Outdoors',
      icon: Compass,
      items: [
        'Hiking',
        'Camping',
        'Beach',
        'Road Trips',
        'Backpacking',
        'Exploring Cities',
        'Nature Walks'
      ]
    },
    {
      name: 'Food & Drink',
      icon: Utensils,
      items: [
        'Coffee',
        'Fine Dining',
        'Street Food',
        'Tea Lover',
        'Wine Tasting',
        'Boba',
        'Home Cooking'
      ]
    }
  ];

  const handleDetectCountryFromDevice = () => {
    setIsDetectingCountry(true);
    setCountryError(null);
    setHasPulledLocation(true);

    const tryReverseGeocode = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const addr = data?.address || {};
          
          if (addr.country) {
            setCountry(addr.country);
          }

          const localArea = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.city_district;
          const cityOrTown = addr.city || addr.town || addr.village || addr.municipality || addr.county;
          const stateOrProvince = addr.state || addr.province || addr.region || addr.state_district;
          const countryName = addr.country;

          const locationParts = [localArea, cityOrTown, stateOrProvince, countryName]
            .filter((part, idx, arr) => Boolean(part) && arr.indexOf(part) === idx);

          if (locationParts.length > 0) {
            setPulledLocation(locationParts.join(', '));
          } else if (data?.display_name) {
            setPulledLocation(data.display_name.split(', ').slice(0, 4).join(', '));
          } else {
            setPulledLocation(`${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
          }
          return true;
        }
      } catch (e) {
        console.warn('Reverse geocode fetch failed:', e);
      }
      return false;
    };

    const tryIPLocationFallback = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.country_name) setCountry(data.country_name);
          const parts = [data.city, data.region, data.country_name].filter(Boolean);
          if (parts.length > 0) {
            setPulledLocation(parts.join(', '));
            return;
          }
        }
      } catch (err) {
        console.warn('IP location fallback failed:', err);
      }
      setCountry((prev) => prev || 'Sri Lanka');
      setPulledLocation((prev) => prev || 'Sri Lanka');
    };

    const isNative = (window as any)?.Capacitor?.isNativePlatform?.() ?? false;

    const getLocationPosition = async () => {
      if (isNative) {
        return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 });
      }
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        });
      });
    };

    getLocationPosition().then(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const success = await tryReverseGeocode(lat, lon);
        if (!success) {
          await tryIPLocationFallback();
        }
        setIsDetectingCountry(false);
      },
      async () => {
        await tryIPLocationFallback();
        setIsDetectingCountry(false);
      }
    );
  };

  const handleRequestLocation = async (autoAdvance = false) => {
    setLocationStatus('requesting');
    setLocationError(null);

    const isNative = (window as any)?.Capacitor?.isNativePlatform?.() ?? false;

    try {
      const position = isNative
        ? await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
        : await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'));
              return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });

      setLocationStatus('granted');
      setLocationCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      if (autoAdvance) {
        setCurrentStep(1);
      }
    } catch (err: any) {
      setLocationStatus('denied');
      if (err.code === 1 || (err.message && err.message.toLowerCase().includes('permission'))) {
        setLocationError('Location permission was denied. Please allow location access in your phone settings.');
      } else {
        setLocationError('Unable to retrieve location. Please check your phone\'s location settings.');
      }
    }
  };

  const handleRequestNotification = async (autoAdvance = false) => {
    setNotificationStatus('requesting');
    setNotificationError(null);

    const isNative = (window as any)?.Capacitor?.isNativePlatform?.() ?? false;

    try {
      if (isNative) {
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted' || (result.receive as string) === 'provisional') {
          setNotificationStatus('granted');
        } else {
          setNotificationStatus('denied');
          setNotificationError('Notifications permission declined. You can enable it later in your phone settings.');
        }
      } else {
        // Web fallback
        if (!('Notification' in window)) {
          setNotificationStatus('granted');
        } else {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationStatus('granted');
          } else {
            setNotificationStatus('denied');
            setNotificationError('Notifications permission declined.');
          }
        }
      }
    } catch {
      // On native, if permission was already decided, requestPermissions returns the current state
      setNotificationStatus('granted');
    }

    if (autoAdvance) {
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (locationStatus === 'granted') {
        setCurrentStep(1);
      } else {
        handleRequestLocation(true);
      }
      return;
    }

    if (currentStep === 1) {
      if (notificationStatus === 'granted') {
        setCurrentStep(2);
      } else {
        handleRequestNotification(true);
      }
      return;
    }

    if (currentStep === 2) {
      const rawName = String(firstName || '').trim();
      if (!rawName) {
        setNameError('First name is required to build your profile.');
        return;
      }
      if (/\d/.test(rawName)) {
        setNameError('Name cannot contain numbers. Please enter letters only.');
        return;
      }
      if (!isValidNameString(rawName)) {
        setNameError('Name can only contain alphabetic letters.');
        return;
      }
      const formatted = toPascalCase(rawName);
      setFirstName(formatted);
      setNameError(null);
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      const daysInM = getDaysInMonth(selectedYear, selectedMonth);
      const effectiveDay = Math.min(selectedDay, daysInM);
      const age = calculateAge(selectedYear, selectedMonth, effectiveDay);
      if (age < 18) {
        setDobError('You must be at least 18 years old to build your profile.');
        return;
      }
      setDobError(null);
      const formattedDob = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(effectiveDay).padStart(2, '0')}`;
      setDob(formattedDob);
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!userGender) {
        setGenderError('Please select your gender to proceed.');
        return;
      }
      setGenderError(null);
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      if (heightFeet === '' || heightInches === '') {
        setHeightError('Please select a valid height (feet and inches) to proceed.');
        return;
      }
      setHeightError(null);
      setCurrentStep(6);
      return;
    }

    if (currentStep === 6) {
      if (!hasPulledLocation || !country.trim() || !pulledLocation.trim()) {
        setCountryError('Please click "Pull Location From Device" to verify your location before proceeding.');
        return;
      }
      setCountryError(null);
      setCurrentStep(7);
      return;
    }

    if (currentStep === 7) {
      if (!educationLevel) {
        setLifeBackgroundError('Please select your highest education level.');
        return;
      }
      if (!userRelationshipStatus) {
        setLifeBackgroundError('Please select your relationship status.');
        return;
      }
      if (!haveKids) {
        setLifeBackgroundError('Please select if you have kids.');
        return;
      }
      if (!wantKids) {
        setLifeBackgroundError('Please select if you want kids.');
        return;
      }
      if (!datingIntentions) {
        setLifeBackgroundError('Please select your dating intentions.');
        return;
      }
      if (!marriageConfirmation) {
        setLifeBackgroundError('Please check the confirmation box at the bottom to proceed.');
        return;
      }
      setLifeBackgroundError(null);
      setCurrentStep(8);
      return;
    }

    if (currentStep === 8) {
      if (!religion) {
        setFaithHeritageError('Please select your religion to proceed.');
        return;
      }
      if (religion === 'Other' && !customReligion.trim()) {
        setFaithHeritageError('Please specify your religion in the provided field.');
        return;
      }
      if (!ethnicity) {
        setFaithHeritageError('Please select your ethnicity to proceed.');
        return;
      }
      if (ethnicity === 'Other' && !customEthnicity.trim()) {
        setFaithHeritageError('Please specify your ethnicity in the provided field.');
        return;
      }
      if (horoscopeNotes.trim()) {
        const validation = validateSriLankanHoroscopeText(horoscopeNotes);
        if (!validation.isValid) {
          setHoroscopeTextError(validation.message || 'Please enter valid Sri Lankan astrological/Kendraya details or leave blank.');
          return;
        }
      }
      setFaithHeritageError(null);
      setHoroscopeTextError(null);
      setCurrentStep(9);
      return;
    }

    if (currentStep === 9) {
      if (!mainPhoto || !photo2 || !photo3) {
        setPhotosError('All 3 photos are mandatory (1 Main Photo and 2 Additional Photos). Please upload or select 3 photos.');
        return;
      }
      setPhotosError(null);
      setCurrentStep(10);
      return;
    }

    if (currentStep === 10) {
      // Step 10: Share something about yourself (Optional)
      setCurrentStep(11);
      return;
    }

    if (currentStep === 11) {
      // Step 11: What are your interests? (Max 6 total, up to 3 per section)
      const totalSelected = Object.values(selectedInterests).flat().length;
      if (totalSelected > 6) {
        setInterestsError('Maximum 6 interests allowed. Please deselect some to continue.');
        return;
      }
      if (totalSelected === 0) {
        setInterestsError('Please select at least 1 interest to continue.');
        return;
      }
      setInterestsError(null);
      setCurrentStep(12);
      return;
    }

    if (currentStep === 12) {
      // Step 12: Show your personality off! (Prompts - Optional)
      setCurrentStep(13);
      return;
    }

    if (currentStep === 13) {
      // Step 13 (Step 14 to user): Email & Phone Number Validation
      if (!emailAddress.trim()) {
        setContactError('Please enter your email address to proceed.');
        return;
      }
      if (!isValidEmailAddress(emailAddress)) {
        setContactError('Please enter a valid email address format (e.g. name@domain.com).');
        return;
      }
      if (!phoneNumber.trim()) {
        setContactError('Please enter your phone number to proceed.');
        return;
      }
      const phoneValidation = getPhoneValidation(
        phoneNumber,
        (detectedPhoneInfo.countryCode as CountryCode) || 'LK',
        detectedPhoneInfo.code
      );
      if (!phoneValidation.isValid) {
        setContactError(phoneValidation.message || 'Please enter a valid phone number for the selected country code.');
        return;
      }
      setContactError(null);
      setCurrentStep(14);
      return;
    }

    if (currentStep === 14) {
      // Step 14 (Step 15 to user): Complete profile verification (Front camera & AI face match required)
      if (!selfieVerified) {
        setVerificationError('Live face verification is required to confirm your identity.');
        setIsVerificationModalOpen(true);
        setVerificationStep('selfie_scan');
        startFrontCamera();
        return;
      }
      setVerificationError(null);
      setCurrentStep(15);
      return;
    }

    if (currentStep === 15) {
      // Step 15: Profile Preview -> Complete
      handleFinish();
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const COUNTRY_PHONE_CODES: Record<string, { code: string; flag: string }> = {
    'United States': { code: '+1', flag: '🇺🇸' },
    'India': { code: '+91', flag: '🇮🇳' },
    'United Kingdom': { code: '+44', flag: '🇬🇧' },
    'Canada': { code: '+1', flag: '🇨🇦' },
    'United Arab Emirates': { code: '+971', flag: '🇦🇪' },
    'Saudi Arabia': { code: '+966', flag: '🇸🇦' },
    'Pakistan': { code: '+92', flag: '🇵🇰' },
    'Australia': { code: '+61', flag: '🇦🇺' },
    'Germany': { code: '+49', flag: '🇩🇪' },
    'France': { code: '+33', flag: '🇫🇷' },
    'Singapore': { code: '+65', flag: '🇸🇬' },
    'Malaysia': { code: '+60', flag: '🇲🇾' },
    'Qatar': { code: '+974', flag: '🇶🇦' },
    'Kuwait': { code: '+965', flag: '🇰🇼' },
    'Oman': { code: '+968', flag: '🇴🇲' },
    'Bahrain': { code: '+973', flag: '🇧🇭' }
  };


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    const formattedName = toPascalCase(firstName);
    // Parse pulledLocation into city/state (format: "City, State, Country")
    const parts = pulledLocation.split(',').map((p) => p.trim());
    const locationData = {
      country: country || 'Sri Lanka',
      city: parts[0] || undefined,
      state: parts[1] || undefined
    };
    const effectiveReligion = religion === 'Other' ? customReligion.trim() : religion;
    const effectiveEthnicity = ethnicity === 'Other' ? customEthnicity.trim() : ethnicity;

    const profileData = {
      name: formattedName,
      gender: userGender || undefined,
      age: calculatedAge,
      height: heightFeet !== '' && heightInches !== '' ? `${heightFeet}' ${heightInches}"` : undefined,
      bio: aboutMe.trim() || undefined,
      religion: effectiveReligion || undefined,
      ethnicity: effectiveEthnicity || undefined,
      motherTongue: undefined,
      caste: caste.trim() || undefined,
      maritalStatus: userRelationshipStatus || maritalStatus || undefined,
      diet: undefined,
      education: educationLevel || undefined,
      profession: profession || undefined,
      location: locationData,
      photos: [mainPhoto, photo2, photo3].filter(Boolean) as string[],
      avatarUrl: mainPhoto || undefined,
      horoscope: {
        rashi: lagna || '',
        nakshatra: nekatha || '',
        gotra: '',
        manglikStatus: (manglikStatus === 'Manglik' ? 'Manglik' : manglikStatus === 'Non-Manglik' ? 'No Dosha' : 'Don\'t Know') as any,
        lagna,
        nekatha,
        horoscopeNotes
      }
    };

    // Mark onboarding complete & clear draft
    setOnboardingCompleted();

    // Final write into Supabase profiles and user_details on the exact same row (overwriting in-place)
    const dobFormatted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(currentEffectiveDay).padStart(2, '0')}`;
    syncOnboardingEntryToSupabase(effectiveUserId, {
      onboarding_step: 15,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      name: formattedName,
      first_name: formattedName,
      gender: userGender || '',
      user_gender: userGender || '',
      age: calculatedAge,
      dob: dobFormatted,
      birth_date: dobFormatted,
      date_of_birth: dobFormatted,
      height_feet: heightFeet !== '' ? Number(heightFeet) : null,
      height_inches: heightInches !== '' ? Number(heightInches) : null,
      height: heightFeet !== '' && heightInches !== '' ? `${heightFeet}' ${heightInches}"` : '',
      city: locationData.city || '',
      state: locationData.state || '',
      country: locationData.country || 'Sri Lanka',
      pulled_location: pulledLocation || null,
      education: educationLevel || '',
      education_level: educationLevel || '',
      highest_degree: educationLevel || '',
      school_or_university: schoolOrUniversity || '',
      profession: profession || '',
      marital_status: userRelationshipStatus || maritalStatus || '',
      user_relationship_status: userRelationshipStatus || maritalStatus || '',
      have_kids: haveKids || '',
      show_have_kids_on_profile: showHaveKidsOnProfile,
      want_kids: wantKids || '',
      show_want_kids_on_profile: showWantKidsOnProfile,
      dating_intentions: datingIntentions || '',
      show_dating_intentions_on_profile: showDatingIntentionsOnProfile,
      religion: effectiveReligion || '',
      ethnicity: effectiveEthnicity || '',
      caste: caste.trim() || '',
      manglik_status: manglikStatus || '',
      rashi: lagna || '',
      nakshatra: nekatha || '',
      horoscope_notes: horoscopeNotes || '',
      bio: aboutMe.trim() || '',
      about_me: aboutMe.trim() || '',
      selected_interests: selectedInterests,
      selected_prompt: selectedPrompt || '',
      prompt_answer: promptAnswer || '',
      email_address: emailAddress || '',
      phone_number: phoneNumber || '',
      selfie_verified: selfieVerified,
      id_uploaded: idUploaded,
      id_front_image: idFrontImage,
      id_back_image: idBackImage,
      photos: [mainPhoto, photo2, photo3].filter(Boolean) as string[],
      main_photo: mainPhoto || '',
      photo_2: photo2 || null,
      photo_3: photo3 || null,
      avatar_url: mainPhoto || '',
    });

    onComplete(
      {
        gender: lookingForGender,
        maritalStatuses: maritalStatus === 'All' ? [] : [maritalStatus],
        verifiedOnly,
        ageMin: ageRange.min,
        ageMax: ageRange.max,
        city: locationData.city || '',
        state: locationData.state || '',
        manglikPreference: 'All',
        withPhotosOnly: true,
        searchQuery: ''
      },
      formattedName,
      locationData,
      profileData
    );
  };

  const isNextDisabled =
    (currentStep === 2 && (!firstName.trim() || /\d/.test(firstName) || !isValidNameString(firstName))) ||
    (currentStep === 3 && isUnder18) ||
    (currentStep === 4 && !userGender) ||
    (currentStep === 5 && (heightFeet === '' || heightInches === '')) ||
    (currentStep === 6 && (!hasPulledLocation || !country.trim() || !pulledLocation.trim())) ||
    (currentStep === 7 && (!educationLevel || !userRelationshipStatus || !haveKids || !wantKids || !datingIntentions || !marriageConfirmation)) ||
    (currentStep === 8 && (!religion || (religion === 'Other' && !customReligion.trim()) || !ethnicity || (ethnicity === 'Other' && !customEthnicity.trim()))) ||
    (currentStep === 9 && (!mainPhoto || !photo2 || !photo3));

  return (
    <div className="absolute inset-0 z-50 bg-[#f8f7f2] text-[#2A2A2A] flex flex-col justify-between overflow-hidden animate-fadeIn font-sans">
      {/* Top Header with Back Arrow, Progress Bar, and Exit */}
      <div className="w-full max-w-md mx-auto pt-6 px-5 sm:px-8 flex items-center gap-2.5 shrink-0">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 shrink-0" />
        )}

        <div className="flex-1 bg-[#5A5A40]/15 h-2 rounded-full overflow-hidden relative">
          <div
            className="bg-[#5A5A40] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="p-1.5 rounded-full text-[#5A5A40]/70 hover:text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            title="Save & Exit (You can resume anytime)"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 shrink-0" />
        )}
      </div>

      {/* Resumed banner if returning to an in-progress onboarding */}
      {currentStep > 0 && (
        <div className="w-full max-w-md mx-auto px-5 sm:px-8 pt-2 flex items-center justify-between text-[11px] text-[#5A5A40] shrink-0 animate-fadeIn">
          <span className="flex items-center gap-1 font-medium bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#5A5A40]" />
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={() => setShowRestartModal(true)}
            className="text-stone-500 hover:text-stone-800 underline transition-colors cursor-pointer flex items-center gap-1 py-1 px-1.5"
            title="Clear saved progress and start from Step 1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Start over</span>
          </button>
        </div>
      )}

      {/* In-app Safe Confirmation Modal for Restarting Onboarding */}
      {showRestartModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-[#5A5A40]/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-[#5A5A40] flex items-center justify-center mx-auto shadow-inner">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2A2A]">Start Over from Step 1?</h3>
              <p className="text-xs text-[#5A5A40] mt-1.5 leading-relaxed">
                This will clear your current onboarding progress and return to the very beginning.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRestartModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRestart}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 max-w-xl mx-auto w-full flex flex-col items-center">
        <div className="my-auto w-full flex flex-col items-center py-2">
        {/* SLIDE 0: Mandatory Location Permission */}
        {currentStep === 0 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#5A5A40]/10 border-2 border-[#5A5A40]/30 flex items-center justify-center shadow-inner">
                <MapPin className="w-12 h-12 text-[#5A5A40]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#5A5A40] text-white p-2 rounded-full shadow-md">
                <Navigation className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Mandatory Step
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Allow Location Services
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
                Vivah uses your location to discover nearby verified matrimony profiles and calculate accurate distance matches.
              </p>
            </div>

            {locationStatus === 'idle' && (
              <button
                type="button"
                onClick={() => handleRequestLocation(false)}
                className="w-full max-w-xs py-3 px-5 bg-white border-2 border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
              >
                <MapPin className="w-4 h-4" />
                <span>Allow Location Access</span>
              </button>
            )}

            {locationStatus === 'requesting' && (
              <div className="p-3 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl text-xs font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Prompting system location permission...</span>
              </div>
            )}

            {locationStatus === 'granted' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Location Access Granted & Verified</span>
              </div>
            )}

            {locationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 1: Mandatory Notification Permission */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#5A5A40]/10 border-2 border-[#5A5A40]/30 flex items-center justify-center shadow-inner">
                <Bell className="w-12 h-12 text-[#5A5A40]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-2 rounded-full shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Mandatory Step
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Allow Push Notifications
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
                Stay updated instantly when verified matches view your profile, express interest, or send direct messages.
              </p>
            </div>

            {notificationStatus === 'idle' && (
              <button
                type="button"
                onClick={() => handleRequestNotification(false)}
                className="w-full max-w-xs py-3 px-5 bg-white border-2 border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
              >
                <Bell className="w-4 h-4" />
                <span>Enable Push Notifications</span>
              </button>
            )}

            {notificationStatus === 'requesting' && (
              <div className="p-3 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Prompting notification permission...</span>
              </div>
            )}

            {notificationStatus === 'granted' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Push Notifications Enabled & Access Granted</span>
              </div>
            )}

            {notificationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{notificationError}</span>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 2: First Name */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn">
            <div className="space-y-3 max-w-md mx-auto">
              <span className="inline-block px-3.5 py-1 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Build your profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                What is your first name?
              </h1>
            </div>

            <div className="w-full max-w-md space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    if (/\d/.test(rawVal)) {
                      setNameError('Name must contain letters only with no numbers.');
                    } else if (rawVal && !isValidNameString(rawVal)) {
                      setNameError('Name can only contain alphabetic letters.');
                    } else {
                      if (nameError) setNameError(null);
                    }
                    // Strip numbers from input automatically
                    setFirstName(rawVal.replace(/\d/g, ''));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNext();
                    }
                  }}
                  placeholder="Enter your first name"
                  className={`w-full py-3.5 px-4 bg-white border ${
                    nameError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-[#5A5A40]/30'
                  } rounded-xl text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 transition-all shadow-2xs text-center`}
                  autoFocus
                />
              </div>

              {nameError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              <p className="text-xs text-[#5A5A40]/80 font-medium text-center flex items-center justify-center gap-1.5 pt-1">
                Your name will be shown on your profile
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 3: Birthday */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Build your profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                When is your birthday
              </h1>
            </div>

            <div className="w-full space-y-4">
              <label className="block text-sm font-bold text-[#5A5A40]/80 uppercase tracking-wider text-center">
                select your date of birth
              </label>

              {/* Date Picker Carousel Controls */}
              <div className="bg-white p-5 rounded-2xl border border-[#5A5A40]/20 shadow-xs space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* 1. DAY COLUMN */}
                  {(() => {
                    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
                    const curDay = Math.min(selectedDay, maxDays);
                    const prevDay = curDay === 1 ? maxDays : curDay - 1;
                    const nextDay = curDay === maxDays ? 1 : curDay + 1;
                    const dayOptions = Array.from({ length: maxDays }, (_, i) => ({
                      value: i + 1,
                      label: String(i + 1).padStart(2, '0')
                    }));

                    return (
                      <SwipeablePickerColumn
                        label="Day"
                        prevText={String(prevDay).padStart(2, '0')}
                        currentText={String(curDay).padStart(2, '0')}
                        nextText={String(nextDay).padStart(2, '0')}
                        onUp={() => {
                          setSelectedDay(prevDay);
                          if (dobError) setDobError(null);
                        }}
                        onDown={() => {
                          setSelectedDay(nextDay);
                          if (dobError) setDobError(null);
                        }}
                        options={dayOptions}
                        currentValue={curDay}
                        onChange={(val) => {
                          setSelectedDay(Number(val));
                          if (dobError) setDobError(null);
                        }}
                      />
                    );
                  })()}

                  {/* 2. MONTH COLUMN */}
                  {(() => {
                    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
                    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                    const monthOptions = MONTH_NAMES.map((name, idx) => ({
                      value: idx + 1,
                      label: name
                    }));

                    return (
                      <SwipeablePickerColumn
                        label="Month"
                        prevText={MONTH_NAMES[prevMonth - 1]}
                        currentText={MONTH_NAMES[selectedMonth - 1]}
                        nextText={MONTH_NAMES[nextMonth - 1]}
                        onUp={() => {
                          setSelectedMonth(prevMonth);
                          if (dobError) setDobError(null);
                        }}
                        onDown={() => {
                          setSelectedMonth(nextMonth);
                          if (dobError) setDobError(null);
                        }}
                        options={monthOptions}
                        currentValue={selectedMonth}
                        onChange={(val) => {
                          setSelectedMonth(Number(val));
                          if (dobError) setDobError(null);
                        }}
                      />
                    );
                  })()}

                  {/* 3. YEAR COLUMN */}
                  {(() => {
                    const prevYear = selectedYear + 1;
                    const nextYear = selectedYear - 1;
                    const yearOptions = Array.from({ length: 75 }, (_, i) => {
                      const y = maxYearAllowed - i;
                      return { value: y, label: String(y) };
                    });

                    return (
                      <SwipeablePickerColumn
                        label="Year"
                        prevText={selectedYear >= maxYearAllowed ? '—' : String(prevYear)}
                        currentText={String(selectedYear)}
                        nextText={String(nextYear)}
                        disabledUp={selectedYear >= maxYearAllowed}
                        onUp={() => {
                          if (selectedYear < maxYearAllowed) {
                            setSelectedYear(selectedYear + 1);
                            if (dobError) setDobError(null);
                          }
                        }}
                        onDown={() => {
                          setSelectedYear(selectedYear - 1);
                          if (dobError) setDobError(null);
                        }}
                        options={yearOptions}
                        currentValue={selectedYear}
                        onChange={(val) => {
                          setSelectedYear(Number(val));
                          if (dobError) setDobError(null);
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Live Selected DOB Preview Card */}
                <div className="pt-3 border-t border-[#5A5A40]/15 flex items-center justify-between text-sm px-1">
                  <div className="flex items-center gap-2 text-[#5A5A40] font-semibold">
                    <Calendar className="w-5 h-5 text-[#5A5A40]" />
                    <span className="text-sm">
                      {MONTH_NAMES[selectedMonth - 1]} {Math.min(selectedDay, getDaysInMonth(selectedYear, selectedMonth))}, {selectedYear}
                    </span>
                  </div>

                  {isUnder18 ? (
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs border border-rose-300">
                      Under 18
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      {calculatedAge} yrs old
                    </span>
                  )}
                </div>
              </div>

              {/* Error Warning Notice */}
              {isUnder18 && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">
                    You must be at least 18 years old to join Vivah.
                  </span>
                </div>
              )}

              {dobError && !isUnder18 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{dobError}</span>
                </div>
              )}

              <p className="text-xs text-[#5A5A40]/80 font-medium text-center flex items-center justify-center gap-1.5 pt-0.5">
                You wont be able to change this later
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 4: What's your gender? */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Build your profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                What's your gender?
              </h1>
            </div>

            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setUserGender('Male');
                    if (genderError) setGenderError(null);
                  }}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-98 ${
                    userGender === 'Male'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/30'
                      : 'bg-white text-[#2A2A2A] border-[#5A5A40]/20 hover:border-[#5A5A40]/50 shadow-2xs'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                    userGender === 'Male' ? 'bg-white/20' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
                  }`}>
                    🤵
                  </div>
                  <span className="font-bold text-base">Male</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserGender('Female');
                    if (genderError) setGenderError(null);
                  }}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-98 ${
                    userGender === 'Female'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/30'
                      : 'bg-white text-[#2A2A2A] border-[#5A5A40]/20 hover:border-[#5A5A40]/50 shadow-2xs'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                    userGender === 'Female' ? 'bg-white/20' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
                  }`}>
                    👰
                  </div>
                  <span className="font-bold text-base">Female</span>
                </button>
              </div>

              {genderError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{genderError}</span>
                </div>
              )}

              <p className="text-xs text-[#5A5A40]/80 font-medium text-center flex items-center justify-center gap-1.5 pt-2">
                You won't be able to change this later
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 5: What's your height? */}
        {currentStep === 5 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Build your profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                What's your height?
              </h1>
            </div>

            <div className="w-full bg-white p-5 rounded-2xl border border-[#5A5A40]/20 shadow-xs space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Select Feet Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                    Feet
                  </label>
                  <select
                    value={heightFeet}
                    onChange={(e) => {
                      const val = e.target.value !== '' ? Number(e.target.value) : '';
                      setHeightFeet(val as any);
                      if (heightError) setHeightError(null);
                    }}
                    className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-sm font-bold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 cursor-pointer"
                  >
                    {heightFeet === '' && (
                      <option value="" disabled hidden>Select Feet</option>
                    )}
                    <option value={4}>4 ft</option>
                    <option value={5}>5 ft</option>
                    <option value={6}>6 ft</option>
                    <option value={7}>7 ft</option>
                  </select>
                </div>

                {/* Select Inches Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                    Inches
                  </label>
                  <select
                    value={heightInches}
                    onChange={(e) => {
                      const val = e.target.value !== '' ? Number(e.target.value) : '';
                      setHeightInches(val as any);
                      if (heightError) setHeightError(null);
                    }}
                    className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-sm font-bold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 cursor-pointer"
                  >
                    {heightInches === '' && (
                      <option value="" disabled hidden>Select Inches</option>
                    )}
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>{i} in</option>
                    ))}
                  </select>
                </div>
              </div>

              {heightFeet !== '' && heightInches !== '' && (
                <div className="p-3 bg-[#5A5A40]/10 rounded-xl flex items-center justify-center gap-2 text-[#5A5A40] font-bold text-sm">
                  <Ruler className="w-4 h-4 text-[#5A5A40]" />
                  <span>Selected Height: {heightFeet}' {heightInches}"</span>
                </div>
              )}

              {heightError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{heightError}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5A5A40]/80 font-medium text-center flex items-center justify-center gap-1.5">
              Your height will be shown on your profile.
            </p>
          </div>
        )}

        {/* SLIDE 6: Which country do you live in? */}
        {currentStep === 6 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Build your profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Which country do you live in?
              </h1>
            </div>

            <div className="w-full bg-white p-5 rounded-2xl border border-[#5A5A40]/20 shadow-xs space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Current Location / Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (countryError) setCountryError(null);
                    }}
                    placeholder="Click 'Pull Location From Device' below"
                    className="w-full py-3.5 px-4 pr-10 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20"
                  />
                  <Globe className="w-5 h-5 text-[#5A5A40]/50 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Pulled Current Location Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Pulled Current Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pulledLocation}
                    onChange={(e) => setPulledLocation(e.target.value)}
                    placeholder="Click 'Pull Location From Device' below"
                    className="w-full py-3.5 px-4 pr-10 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20"
                  />
                  <Navigation className="w-5 h-5 text-[#5A5A40]/50 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Pull Location From Device Button */}
              <button
                type="button"
                onClick={handleDetectCountryFromDevice}
                disabled={isDetectingCountry}
                className="w-full py-3.5 px-4 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
              >
                {isDetectingCountry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-white" />
                    <span>Pull Location From Device (Required)</span>
                  </>
                )}
              </button>

              {countryError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{countryError}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5A5A40]/80 font-medium text-center">
              Your device location is required to verify your region and match relevant proposals.
            </p>
          </div>
        )}

        {/* SLIDE 7: Life & Background */}
        {currentStep === 7 && (
          <div className="flex flex-col items-center text-center space-y-5 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Life &amp; Background
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A40] font-medium leading-relaxed">
                Help us understand your background and what you're looking for
              </p>
            </div>

            <div className="w-full bg-white p-5 rounded-2xl border border-[#5A5A40]/20 shadow-xs space-y-4 text-left">
              {/* Highest Education Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#5A5A40]" />
                  <span>Highest Education Level</span>
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => {
                    setEducationLevel(e.target.value);
                    if (lifeBackgroundError) setLifeBackgroundError(null);
                  }}
                  className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40]"
                >
                  <option value="" disabled>Select highest education level</option>
                  <option value="High School (e.g., High School Diploma, GED, SSLC)">
                    High School (e.g., High School Diploma, GED, SSLC)
                  </option>
                  <option value="Undergraduate (e.g., BA,BS,BEng)">
                    Undergraduate (e.g., BA,BS,BEng)
                  </option>
                  <option value="Graduate (e.g., MA,MS,MBA)">
                    Graduate (e.g., MA,MS,MBA)
                  </option>
                  <option value="Postgraduate (e.g., PGDM,PGCE,MPhil)">
                    Postgraduate (e.g., PGDM,PGCE,MPhil)
                  </option>
                  <option value="Doctorate (e.g., PhD,MD,EdD)">
                    Doctorate (e.g., PhD,MD,EdD)
                  </option>
                  <option value="Professional (e.g., JD,DDS,CA)">
                    Professional (e.g., JD,DDS,CA)
                  </option>
                </select>
              </div>

              {/* School or University */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#5A5A40]" />
                  <span>School or University</span>
                </label>
                <input
                  type="text"
                  value={schoolOrUniversity}
                  onChange={(e) => setSchoolOrUniversity(e.target.value)}
                  placeholder="Enter school or university name"
                  className="w-full py-3 px-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* Profession */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#5A5A40]" />
                  <span>Profession</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Enter your profession"
                  className="w-full py-3 px-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* Relationship Status Section */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-2">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Relationship Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Never Married', 'Divorced', 'Widowed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setUserRelationshipStatus(status);
                        if (lifeBackgroundError) setLifeBackgroundError(null);
                      }}
                      className={`py-2 px-2.5 rounded-full border text-xs font-bold transition-all text-center ${
                        userRelationshipStatus === status
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-white text-[#5A5A40] border-[#5A5A40]/30 hover:bg-[#5A5A40]/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRelationshipOnProfile}
                    onChange={(e) => setShowRelationshipOnProfile(e.target.checked)}
                    className="w-4 h-4 accent-[#5A5A40] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2A2A2A]">
                    Show on profile
                  </span>
                </label>
              </div>

              {/* Do you have kids? Section */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-2">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Do you have kids?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Yes', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setHaveKids(opt);
                        if (lifeBackgroundError) setLifeBackgroundError(null);
                      }}
                      className={`py-2 px-2.5 rounded-full border text-xs font-bold transition-all text-center ${
                        haveKids === opt
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-white text-[#5A5A40] border-[#5A5A40]/30 hover:bg-[#5A5A40]/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showHaveKidsOnProfile}
                    onChange={(e) => setShowHaveKidsOnProfile(e.target.checked)}
                    className="w-4 h-4 accent-[#5A5A40] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2A2A2A]">
                    Show on profile
                  </span>
                </label>
              </div>

              {/* Do you want kids? Section */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-2">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Do you want kids?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Yes', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setWantKids(opt);
                        if (lifeBackgroundError) setLifeBackgroundError(null);
                      }}
                      className={`py-2 px-2.5 rounded-full border text-xs font-bold transition-all text-center ${
                        wantKids === opt
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-white text-[#5A5A40] border-[#5A5A40]/30 hover:bg-[#5A5A40]/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showWantKidsOnProfile}
                    onChange={(e) => setShowWantKidsOnProfile(e.target.checked)}
                    className="w-4 h-4 accent-[#5A5A40] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2A2A2A]">
                    Show on profile
                  </span>
                </label>
              </div>

              {/* Dating Intentions Section */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-2">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Dating Intentions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Marriage Focused', 'Figuring It Out'] as const).map((intent) => (
                    <button
                      key={intent}
                      type="button"
                      onClick={() => {
                        setDatingIntentions(intent);
                        if (lifeBackgroundError) setLifeBackgroundError(null);
                      }}
                      className={`py-2 px-2.5 rounded-full border text-xs font-bold transition-all text-center ${
                        datingIntentions === intent
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-white text-[#5A5A40] border-[#5A5A40]/30 hover:bg-[#5A5A40]/10'
                      }`}
                    >
                      {intent}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDatingIntentionsOnProfile}
                    onChange={(e) => setShowDatingIntentionsOnProfile(e.target.checked)}
                    className="w-4 h-4 accent-[#5A5A40] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2A2A2A]">
                    Show on profile
                  </span>
                </label>
              </div>

              {/* Confirmation Checkbox */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={marriageConfirmation}
                    onChange={(e) => {
                      setMarriageConfirmation(e.target.checked);
                      if (lifeBackgroundError) setLifeBackgroundError(null);
                    }}
                    className="w-4 h-4 mt-0.5 accent-[#5A5A40] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-[#2A2A2A] leading-snug">
                    I Confirm that I'm not in a relationship, and that I am using this app to pursue a serious relationship leading to marriage.
                  </span>
                </label>
              </div>

              {lifeBackgroundError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{lifeBackgroundError}</span>
                </div>
              )}
            </div>

            {/* Remark below */}
            <p className="text-xs text-[#5A5A40]/80 font-medium text-center">
              You can change this in your settings later. These details will be shown on your profile.
            </p>
          </div>
        )}

        {/* SLIDE 8: Faith & Heritage (Religion, Ethnicity, and Optional Sri Lankan Horoscope) */}
        {currentStep === 8 && (
          <div className="flex flex-col items-center text-center space-y-5 animate-fadeIn w-full max-w-md mx-auto">
            <div className="space-y-2">
              <span className="inline-block px-3.5 py-1 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Build your profile • Step 8
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Faith &amp; Heritage
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A40] font-medium leading-relaxed">
                Please share your religion and ethnicity. Sri Lankan horoscope and Kendraya details are optional.
              </p>
            </div>

            <div className="w-full bg-white p-5 rounded-2xl border border-[#5A5A40]/20 shadow-xs space-y-4 text-left">
              {/* SECTION 1: RELIGION (Mandatory) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    <span>Religion</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <select
                  value={religion}
                  onChange={(e) => {
                    setReligion(e.target.value);
                    if (e.target.value !== 'Other') {
                      setCustomReligion('');
                    }
                    if (faithHeritageError) setFaithHeritageError(null);
                  }}
                  className="w-full p-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select Religion
                  </option>
                  {RELIGION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {/* Conditional Other Religion Input */}
                {religion === 'Other' && (
                  <div className="pt-2 animate-fadeIn space-y-1">
                    <label className="text-[11px] font-bold text-[#2A2A2A] block">
                      Specify Religion <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customReligion}
                      onChange={(e) => {
                        setCustomReligion(e.target.value);
                        if (faithHeritageError) setFaithHeritageError(null);
                      }}
                      placeholder="Please enter your religion"
                      className="w-full py-3 px-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: ETHNICITY (Mandatory) */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#5A5A40]" />
                    <span>Ethnicity</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <select
                  value={ethnicity}
                  onChange={(e) => {
                    setEthnicity(e.target.value);
                    if (e.target.value !== 'Other') {
                      setCustomEthnicity('');
                    }
                    if (faithHeritageError) setFaithHeritageError(null);
                  }}
                  className="w-full p-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select Ethnicity
                  </option>
                  {ETHNICITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {/* Conditional Other Ethnicity Input */}
                {ethnicity === 'Other' && (
                  <div className="pt-2 animate-fadeIn space-y-1">
                    <label className="text-[11px] font-bold text-[#2A2A2A] block">
                      Specify Ethnicity <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customEthnicity}
                      onChange={(e) => {
                        setCustomEthnicity(e.target.value);
                        if (faithHeritageError) setFaithHeritageError(null);
                      }}
                      placeholder="Please enter your ethnicity"
                      className="w-full py-3 px-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2.5: CASTE (Optional) */}
              <div className="pt-3 border-t border-[#5A5A40]/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#5A5A40]" />
                    <span>Caste</span>
                  </label>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <input
                  type="text"
                  value={caste}
                  onChange={(e) => setCaste(e.target.value)}
                  placeholder="e.g. Govigama, Karava, Salagama, or leave blank"
                  className="w-full py-3 px-3.5 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20"
                />
                <p className="text-[11px] text-[#5A5A40]/70">
                  Optional community or lineage background (can be left blank).
                </p>
              </div>

              {/* SECTION 3: SRI LANKAN HOROSCOPE (Optional) */}
              <div className="pt-4 border-t border-[#5A5A40]/15 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">
                      Sri Lankan Horoscope / Kendraya
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-[#5A5A40]/80 leading-snug">
                  Sri Lankan Kendraya (කේන්ද්‍රය) matching helps calculate astrological compatibility (Porondam / Porondama Gelapima). You can fill these or skip.
                </p>

                {/* Manglik / Kuja Dosha Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Manglik / Kuja Dosha Status</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'Non-Manglik', label: 'Non-Manglik', sub: 'No Kuja Dosha' },
                      { value: 'Manglik', label: 'Manglik', sub: 'Kuja Dosha' },
                      { value: "Don't Know", label: "Don't Know", sub: 'Unspecified' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setManglikStatus(manglikStatus === item.value ? '' : item.value);
                        }}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                          manglikStatus === item.value
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                            : 'bg-[#f8f7f2] text-[#2A2A2A] border-[#5A5A40]/25 hover:border-[#5A5A40]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`text-[9px] font-normal ${manglikStatus === item.value ? 'text-white/80' : 'text-[#5A5A40]/70'}`}>
                          {item.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lagna (Ascendant Sign) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lagna (Ascendant / ලග්නය)</span>
                  </label>
                  <select
                    value={lagna}
                    onChange={(e) => setLagna(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs font-semibold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                  >
                    <option value="">Select Lagna (Optional)</option>
                    {SRI_LANKAN_LAGNA_SIGNS.map((sign) => (
                      <option key={sign.value} value={sign.value}>
                        {sign.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nekatha (Birth Star / Nakshatra) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nekatha (Birth Star / 27 Sri Lankan Nakshathras)</span>
                  </label>
                  <select
                    value={nekatha}
                    onChange={(e) => setNekatha(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs font-semibold text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                  >
                    <option value="">Select Nekatha (Optional)</option>
                    {SRI_LANKAN_NEKATH.map((nek) => (
                      <option key={nek} value={nek}>
                        {nek}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horoscope Notes / Kendraya Text with Sri Lankan Astrological Validation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                      Horoscope Details / Kendraya Notes
                    </label>
                    <span className="text-[10px] text-[#5A5A40]/70">
                      Validated per Sri Lankan tradition
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={horoscopeNotes}
                    onChange={(e) => {
                      const text = e.target.value;
                      setHoroscopeNotes(text);
                      if (horoscopeTextError) setHoroscopeTextError(null);
                    }}
                    onBlur={() => {
                      if (horoscopeNotes.trim()) {
                        const res = validateSriLankanHoroscopeText(horoscopeNotes);
                        if (!res.isValid) {
                          setHoroscopeTextError(res.message || 'Please enter valid Sri Lankan horoscope details or leave blank.');
                        } else {
                          setHoroscopeTextError(null);
                        }
                      } else {
                        setHoroscopeTextError(null);
                      }
                    }}
                    placeholder="e.g. Kuja in 7, Shani in 8, Ravi in 1st house, Kataka Lagna, Rehena Nekatha, Porondam 18/20..."
                    className="w-full p-3 bg-[#f8f7f2] border border-[#5A5A40]/30 rounded-xl text-xs font-semibold text-[#2A2A2A] placeholder:text-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 resize-none"
                  />

                  {/* Validation State Indicator */}
                  {horoscopeNotes.trim() && !horoscopeTextError && validateSriLankanHoroscopeText(horoscopeNotes).isValid && (
                    <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Valid Sri Lankan horoscope/Kendraya notation ✓</span>
                    </div>
                  )}

                  {horoscopeTextError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{horoscopeTextError}</span>
                    </div>
                  )}

                  {/* Quick Format Suggestion Chips */}
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] font-bold text-[#5A5A40]/80 uppercase tracking-wider block">
                      Quick Astrological Tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Kuja in 7 (Manglik)',
                        'Non-Manglik',
                        'Shani in 8',
                        'Guru in 1st house',
                        'Kataka Lagna',
                        'Porondam Matching Ready',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setHoroscopeNotes((prev) => {
                              const trimmed = prev.trim();
                              if (!trimmed) return tag;
                              if (trimmed.includes(tag)) return trimmed;
                              return `${trimmed}, ${tag}`;
                            });
                            setHoroscopeTextError(null);
                          }}
                          className="px-2.5 py-1 bg-[#5A5A40]/8 hover:bg-[#5A5A40]/15 text-[#5A5A40] rounded-full text-[10px] font-semibold border border-[#5A5A40]/20 transition-all active:scale-95"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* General Faith & Heritage Error */}
              {faithHeritageError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{faithHeritageError}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5A5A40]/80 font-medium text-center">
              Religion and Ethnicity are required for matrimonial matching. Horoscope fields are optional.
            </p>
          </div>
        )}

        {/* SLIDE 9: Add Your Pictures (1 Main + 2 Additional, mandatory) */}
        {currentStep === 9 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                Add Your Photos
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-sm mx-auto">
                Please upload <strong>3 photos</strong> to build trust. Drag & drop to reorder, or tap <strong>"Make Main"</strong> to set your profile picture.
              </p>
            </div>

            {/* Reorder Hint Banner */}
            {(mainPhoto || photo2 || photo3) && (
              <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
                <span className="flex items-center gap-1.5 font-medium">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Drag & drop photos to rearrange positions, or tap <strong>"Make Main"</strong>.
                </span>
                <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900 shrink-0">
                  { [mainPhoto, photo2, photo3].filter(Boolean).length } / 3 Uploaded
                </span>
              </div>
            )}

            {/* 3 Photo Slots with Drag & Drop */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { idx: 0, label: 'Main Photo', isMain: true, photo: mainPhoto, setPhoto: setMainPhoto },
                { idx: 1, label: 'Photo 2', isMain: false, photo: photo2, setPhoto: setPhoto2 },
                { idx: 2, label: 'Photo 3', isMain: false, photo: photo3, setPhoto: setPhoto3 }
              ].map((slot) => {
                const isDraggingThis = draggedPhotoIndex === slot.idx;
                const isDragOverThis = dragOverIndex === slot.idx;

                return (
                  <div key={slot.idx} className="col-span-3 sm:col-span-1 flex flex-col items-center">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A5A40] mb-1.5 flex items-center gap-1">
                      {slot.isMain ? (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ) : null}
                      {slot.label} (Required)
                    </div>

                    <div
                      draggable={Boolean(slot.photo)}
                      onDragStart={(e) => {
                        if (!slot.photo) return;
                        setDraggedPhotoIndex(slot.idx);
                        e.dataTransfer.setData('text/plain', String(slot.idx));
                      }}
                      onDragEnd={() => {
                        setDraggedPhotoIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedPhotoIndex !== null && draggedPhotoIndex !== slot.idx) {
                          setDragOverIndex(slot.idx);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedPhotoIndex !== null && draggedPhotoIndex !== slot.idx) {
                          swapPhotos(draggedPhotoIndex, slot.idx);
                        }
                        setDraggedPhotoIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`relative w-full aspect-[3/4] max-h-52 bg-white rounded-2xl border-2 transition-all overflow-hidden group flex flex-col items-center justify-center shadow-xs cursor-grab active:cursor-grabbing ${
                        isDragOverThis
                          ? 'border-amber-500 bg-amber-50/60 scale-[1.03] ring-4 ring-amber-400/30 shadow-md'
                          : isDraggingThis
                          ? 'opacity-40 border-dashed border-[#5A5A40]'
                          : slot.photo
                          ? slot.isMain
                            ? 'border-amber-400 hover:border-amber-500'
                            : 'border-[#5A5A40]/30 hover:border-[#5A5A40]'
                          : 'border-dashed border-[#5A5A40]/40 hover:border-[#5A5A40]'
                      }`}
                    >
                      {slot.photo ? (
                        <>
                          <img src={slot.photo} alt={slot.label} className="w-full h-full object-cover pointer-events-none" />
                          
                          {/* Top Drag Indicator Badge */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white p-1 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-bold">
                            <GripVertical className="w-3.5 h-3.5 text-white/90" />
                            <span className="hidden sm:inline">Drag</span>
                          </div>

                          {/* Hover Controls Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
                            {!slot.isMain && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swapPhotos(slot.idx, 0);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm transition-transform hover:scale-105"
                              >
                                <Star className="w-3 h-3 fill-white" /> Make Main
                              </button>
                            )}

                            <div className="flex items-center gap-2">
                              <label className="p-2 bg-white/90 rounded-full cursor-pointer hover:bg-white text-gray-800 transition-transform hover:scale-105 shadow-sm">
                                <Upload className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          slot.setPhoto(reader.result);
                                          setPhotosError(null);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  slot.setPhoto('');
                                }}
                                className="p-2 bg-rose-500/90 rounded-full text-white hover:bg-rose-600 transition-transform hover:scale-105 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Slot Identifier Badge */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            {slot.isMain ? (
                              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-white" /> Main Profile
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swapPhotos(slot.idx, 0);
                                }}
                                className="pointer-events-auto bg-black/60 hover:bg-amber-500 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-all flex items-center gap-1 shadow-xs"
                              >
                                <ArrowLeftRight className="w-2.5 h-2.5" /> Set Main
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer text-center group-hover:bg-[#5A5A40]/5 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] mb-2 group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-[#2A2A2A]">Upload {slot.label}</span>
                          <span className="text-[10px] text-[#5A5A40] mt-0.5">Click or drag photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsUploading(true);
                                  setUploadProgress(0);
                                  
                                  // Simulate processing delay
                                  setTimeout(() => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        slot.setPhoto(reader.result);
                                        setPhotosError(null);
                                      }
                                      setIsUploading(false);
                                      setUploadProgress(100);
                                    };
                                    reader.readAsDataURL(file);
                                  }, 500); // Simulate processing time
                                } catch (error) {
                                  console.error('Error processing image:', error);
                                  setPhotosError('Failed to process image. Please try again.');
                                  setIsUploading(false);
                                }
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Image Upload Progress Indicator */}
            {isUploading && (
              <div className="bg-white p-3 rounded-xl border border-[#5A5A40]/15 mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2A2A2A] flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Uploading Photo
                  </span>
                  <span className="text-sm font-bold text-amber-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2 mt-1">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Quick Sample Presets Selector */}
            <div className="bg-white p-3 rounded-xl border border-[#5A5A40]/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2A2A2A] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#5A5A40]" /> Quick Sample Photos
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                  'https://via.placeholder.com/400x400?text=Profile+Image',
                ].map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!mainPhoto) {
                        setMainPhoto(url);
                      } else if (!photo2) {
                        setPhoto2(url);
                      } else {
                        setPhoto3(url);
                      }
                      setPhotosError(null);
                    }}
                    className="aspect-square rounded-lg overflow-hidden border border-[#5A5A40]/20 hover:border-[#5A5A40] hover:scale-105 transition-all shadow-xs"
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* What NOT to Upload Guidelines Card */}
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" /> What NOT to Upload
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Photos will be rejected
                </span>
              </div>

              {/* 4 Bad Photo Visual Examples */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-rose-300">
                    <img
                      src="https://via.placeholder.com/250x250/FF0000/FFFFFF?text=Group"
                      alt="Group picture"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 leading-tight">Group Pictures</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-rose-300">
                    <img
                      src="https://via.placeholder.com/250x250/0000FF/FFFFFF?text=Blurry"
                      alt="Blurry picture"
                      className="w-full h-full object-cover blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 leading-tight">Blurry / Pixelated</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-rose-300">
                    <img
                      src="https://via.placeholder.com/250x250/FF0000/FFFFFF?text=Covered"
                      alt="Face covered"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 leading-tight">Face Covered</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-rose-300">
                    <img
                      src="https://via.placeholder.com/250x250/00FF00/000000?text=Far"
                      alt="Unclear face"
                      className="w-full h-full object-cover scale-150 object-bottom"
                    />
                    <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 leading-tight">Unclear / Far Away</span>
                </div>
              </div>

              {/* Text Rules List */}
              <div className="pt-1 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-rose-900">
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>No group photos (must be clearly just you)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>No blurry, low-res, or heavy filter shots</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>No sunglasses, masks, or hats hiding face</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>No extreme side profiles or distant shots</span>
                </div>
              </div>
            </div>

            {/* Gallery Permissions Help Section */}
            <div className="bg-[#5A5A40]/5 p-3 rounded-xl border border-[#5A5A40]/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#5A5A40]/10 flex items-center justify-center shrink-0 text-[#5A5A40]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#2A2A2A] text-[11px] sm:text-xs leading-snug">
                    Photos not uploading or opening?
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#5A5A40]">
                    {galleryPermissionEnabled
                      ? 'Photo gallery access is active.'
                      : 'Gallery permissions may be disabled in device settings.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGalleryPermissionEnabled(true);
                  setPhotosError(null);
                  alert('Device Photo Library permissions enabled! You can now select photos from your device gallery.');
                }}
                className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-lg font-bold text-xs shrink-0 hover:bg-[#4A4A30] active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                {galleryPermissionEnabled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <span>Enable</span>
                )}
              </button>
            </div>

            {photosError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{photosError}</span>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 10: Share something about yourself */}
        {currentStep === 10 && (
          <div className="space-y-5 animate-fadeIn w-full max-w-md">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                Share something about yourself
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-sm mx-auto leading-relaxed">
                Describe yourself, your personality, or what type of person you're looking for.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#2A2A2A]">
                <span>About me</span>
                <span className={`text-[11px] ${aboutMe.length >= 700 ? 'text-amber-600 font-bold' : 'text-[#5A5A40]'}`}>
                  {aboutMe.length}/750
                </span>
              </div>
              <textarea
                rows={6}
                maxLength={750}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Write a few sentences about yourself, your hobbies, goals, or the kind of person you would love to meet..."
                className="w-full p-3.5 rounded-xl border border-[#5A5A40]/30 focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 text-xs sm:text-sm text-[#2A2A2A] placeholder-[#5A5A40]/50 outline-none transition-all resize-none bg-white shadow-xs"
              />
              <p className="text-[11px] text-[#5A5A40]/80 italic">
                * This field is optional. You can leave it blank and add details later from your profile.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 11: What are your interests? */}
        {currentStep === 11 && (
          <div className="space-y-5 animate-fadeIn w-full max-w-lg">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <Smile className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                What are your interests?
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-md mx-auto">
                Choose up to 3 per section (Maximum 6 total)
              </p>
            </div>

            {/* Selection Progress Banner */}
            {(() => {
              const totalCount = Object.values(selectedInterests).flat().length;
              const isFull = totalCount >= 6;
              return (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isFull ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-[#5A5A40]/5 border-[#5A5A40]/20 text-[#5A5A40]'
                }`}>
                  <span className="font-bold flex items-center gap-1.5">
                    Total Selected: <strong>{totalCount} / 6</strong>
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${
                    isFull ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-[#5A5A40]/10 border-[#5A5A40]/20 text-[#5A5A40]'
                  }`}>
                    {isFull ? 'Max reached ✓' : `${6 - totalCount} more available`}
                  </span>
                </div>
              );
            })()}

            {/* Categories List */}
            <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
              {INTEREST_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const catSelected = selectedInterests[cat.name] || [];
                const catCount = catSelected.length;

                return (
                  <div key={cat.name} className="bg-white p-3.5 rounded-2xl border border-[#5A5A40]/20 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#2A2A2A]">{cat.name}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        catCount === 3 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
                      }`}>
                        {catCount}/3 selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {cat.items.map((item) => {
                        const isSelected = catSelected.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              const current = selectedInterests[cat.name] || [];
                              if (isSelected) {
                                const next = current.filter((i) => i !== item);
                                setSelectedInterests({ ...selectedInterests, [cat.name]: next });
                                setInterestsError(null);
                              } else {
                                const totalSelected = Object.values(selectedInterests).flat().length;
                                if (totalSelected >= 6) {
                                  setInterestsError('Maximum 6 interests allowed. Deselect one to add another.');
                                  return;
                                }
                                if (current.length >= 3) {
                                  setInterestsError(`You can choose up to 3 per section ("${cat.name}" section already has 3 items selected).`);
                                  return;
                                }
                                setSelectedInterests({ ...selectedInterests, [cat.name]: [...current, item] });
                                setInterestsError(null);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                              isSelected
                                ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                                : 'bg-white text-[#2A2A2A] border-[#5A5A40]/25 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5'
                            }`}
                          >
                            <span>{item}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {interestsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{interestsError}</span>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 12: Show your personality off! */}
        {currentStep === 12 && (
          <div className="space-y-5 animate-fadeIn w-full max-w-md">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                Show your personality off!
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-sm mx-auto leading-relaxed">
                Prompts are fun questions that help you show your personality, Be your self and have fun!
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A2A] block">
                  Select a Prompt
                </label>
                <div className="relative">
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full p-3.5 pr-10 rounded-xl border border-[#5A5A40]/30 focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 text-xs sm:text-sm text-[#2A2A2A] bg-white shadow-xs appearance-none cursor-pointer outline-none font-medium"
                  >
                    <option value="">Select a prompt question...</option>
                    <option value="my most useless skill is..">my most useless skill is..</option>
                    <option value="as a kid i was really into..">as a kid i was really into..</option>
                    <option value="two truths and a lie..">two truths and a lie..</option>
                    <option value="i will never shut up about..">i will never shut up about..</option>
                    <option value="worst idea i ever had..">worst idea i ever had..</option>
                    <option value="my simple pleasures in life are..">my simple pleasures in life are..</option>
                    <option value="a random fact I love is..">a random fact I love is..</option>
                    <option value="the key to my heart is..">the key to my heart is..</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#5A5A40] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {selectedPrompt && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A2A2A]">
                    <span>Prompt Answer</span>
                    <span className="text-[11px] text-[#5A5A40]">{promptAnswer.length}/250</span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={250}
                    value={promptAnswer}
                    onChange={(e) => setPromptAnswer(e.target.value)}
                    placeholder="Write your fun answer here..."
                    className="w-full p-3.5 rounded-xl border border-[#5A5A40]/30 focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 text-xs sm:text-sm text-[#2A2A2A] placeholder-[#5A5A40]/50 outline-none transition-all resize-none bg-white shadow-xs"
                  />
                </div>
              )}

              <p className="text-[11px] text-[#5A5A40]/80 italic pt-1">
                * This page and prompts are not mandatory. You can skip or complete it later.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 13: What's your email address? */}
        {currentStep === 13 && (
          <div className="space-y-5 animate-fadeIn w-full max-w-md">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                What's your email address?
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-sm mx-auto">
                We'll send match notifications and account security updates here.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Email Address Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2A2A2A] block">Email Address</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A5A40] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      if (contactError) setContactError(null);
                    }}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-xs sm:text-sm text-[#2A2A2A] bg-white shadow-xs outline-none transition-all font-medium ${
                      emailAddress.trim()
                        ? isValidEmailAddress(emailAddress)
                          ? 'border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-[#5A5A40]/30 focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20'
                    }`}
                  />
                </div>

                {/* Email Real-time Validation Indicator */}
                {emailAddress.trim() && (
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5 animate-fadeIn">
                    {isValidEmailAddress(emailAddress) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">Valid email address</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-rose-600 font-medium">Please enter a complete email address (e.g. name@domain.com)</span>
                      </>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-[#5A5A40]/90 font-medium flex items-center gap-1 pt-0.5">
                  <Lock className="w-3 h-3 text-[#5A5A40] shrink-0" />
                  Your email will not be shown to other profiles
                </p>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2A2A2A] block">Phone Number</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(!showCountryPicker)}
                      className="px-3 py-3 rounded-xl border border-[#5A5A40]/30 bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 text-xs font-bold text-[#2A2A2A] flex items-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
                      title="Select Country Calling Code"
                    >
                      <CountryFlag countryCode={detectedPhoneInfo.countryCode || 'LK'} svg style={{ width: '1.25rem', height: '1.25rem' }} />
                      <span>{detectedPhoneInfo.code}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#5A5A40]" />
                    </button>
                    {showCountryPicker && (
                      <div className="absolute z-[60] w-56 bg-white border border-[#5A5A40]/30 rounded-xl shadow-xl mt-1 left-0 max-h-64 overflow-y-auto animate-fadeIn">
                        <div className="p-2.5 text-xs font-bold text-[#2A2A2A] border-b border-[#5A5A40]/10 flex items-center justify-between bg-stone-50">
                          <span>Select Country</span>
                          <span className="text-[10px] text-[#5A5A40]">Auto-detected</span>
                        </div>
                        <div>
                          {COUNTRIES_LIST.map((c) => (
                            <button
                              key={`${c.countryCode}-${c.code}`}
                              type="button"
                              onClick={() => {
                                setDetectedPhoneInfo({ code: c.code, flag: c.flag, countryCode: c.countryCode });
                                setShowCountryPicker(false);
                                if (contactError) setContactError(null);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#5A5A40]/10 transition-colors text-xs ${
                                detectedPhoneInfo.countryCode === c.countryCode ? 'bg-[#5A5A40]/10 font-bold' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <CountryFlag countryCode={c.countryCode} svg style={{ width: '1.15rem', height: '1.15rem' }} />
                                <span className="truncate text-[#2A2A2A]">{c.name}</span>
                              </div>
                              <span className="text-[#5A5A40] text-[11px] font-semibold ml-2">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#5A5A40] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      onFocus={() => setShowCountryPicker(false)}
                      placeholder="e.g. 77 123 4567 or paste full number"
                      className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-xs sm:text-sm text-[#2A2A2A] bg-white shadow-xs outline-none transition-all font-medium ${
                        phoneNumber.trim()
                          ? phoneValidationStatus.isValid
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20'
                          : 'border-[#5A5A40]/30 focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone Number Real-time Validation Indicator */}
                {phoneNumber.trim() && (
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5 animate-fadeIn">
                    {phoneValidationStatus.isValid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">
                          Valid: {phoneValidationStatus.formatted}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-700 font-medium">
                          {phoneValidationStatus.message}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-[#5A5A40]/90 font-medium flex items-center gap-1 pt-0.5">
                  <Lock className="w-3 h-3 text-[#5A5A40] shrink-0" />
                  Your phone number is confidential and kept secure
                </p>
              </div>

              {contactError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLIDE 14: Complete profile verification */}
        {currentStep === 14 && (
          <div className="space-y-5 animate-fadeIn w-full max-w-md">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
                <ShieldCheck className="w-6 h-6 text-[#5A5A40]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A]">
                Complete profile verification
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A40] max-w-sm mx-auto">
                Verified profiles get up to 300% more authentic matches and earn the Gold Badge.
              </p>
            </div>

            {/* Verification Steps Section */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">
                Verification Steps
              </h3>

              {/* Card 1: Selfie (Required) */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                selfieVerified
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-[#5A5A40]/30 hover:border-[#5A5A40] shadow-xs'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selfieVerified ? 'bg-emerald-600 text-white' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
                }`}>
                  <ScanFace className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-[#2A2A2A]">Selfie Verification</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selfieVerified ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {selfieVerified ? 'Verified ✓' : '* Required'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A5A40] mt-0.5 leading-snug">
                    Take a quick 3D face scan inside the oval frame to confirm you match your photos.
                  </p>
                </div>
              </div>

              {/* Card 2: Issued ID (Recommended) */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                idUploaded
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-[#5A5A40]/30 hover:border-[#5A5A40] shadow-xs'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  idUploaded ? 'bg-emerald-600 text-white' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
                }`}>
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-[#2A2A2A]">Issued ID</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      idUploaded ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {idUploaded ? 'Uploaded ✓' : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A5A40] mt-0.5 leading-snug">
                    Upload a government photo ID or passport to receive the maximum trust level.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  setVerificationError(null);
                  setIsVerificationModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#5A5A40] hover:bg-[#4a4a34] text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <ScanFace className="w-4 h-4" />
                <span>{selfieVerified ? 'Review Verification Status' : 'Start Verification'}</span>
              </button>

              {verificationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLIDE 15: Profile Preview */}
        {currentStep === 15 && (
          <div className="space-y-4 animate-fadeIn w-full max-w-md">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40]">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2A2A]">
                Profile Preview
              </h2>
              <p className="text-xs text-[#5A5A40] max-w-sm mx-auto">
                This is how your profile card will appear to potential matches on the Discover page.
              </p>
            </div>

            {/* Discover Page Card Style Preview */}
            <div className="bg-white p-5 rounded-[36px] shadow-xl shadow-stone-200/60 border border-[#5A5A40]/15 flex flex-col gap-4 relative text-left">
              {/* Header BEFORE Image: Name + Verification Pill on Left, 3-dot Menu on Right */}
              <div className="flex items-center justify-between gap-2 border-b border-[#5A5A40]/10 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">
                    {toPascalCase(firstName || 'Your Name')}
                  </h2>

                  {/* Pill shape: check icon + verification percentage */}
                  <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#5A5A40] stroke-[3]" />
                    <span>{selfieVerified ? (idUploaded ? '100%' : '98%') : '92%'}</span>
                  </div>
                </div>

                <div className="p-1.5 text-[#5A5A40]">
                  <MoreVertical className="w-5 h-5 rotate-90" />
                </div>
              </div>

              {/* Main Candidate Image Banner */}
              <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-2xs">
                <img
                  src={mainPhoto || 'https://via.placeholder.com/600x600?text=Profile+Image'}
                  alt="Main Profile Photo"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Below Image: About Me & Detailed Stats Cards */}
              <div className="space-y-4 px-1 text-[#2A2A2A]">
                {/* About Me Section - ONLY shown if user actually wrote an About Me text */}
                {aboutMe.trim() && (
                  <div className="space-y-1.5 px-1">
                    <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm">
                      About me
                    </h3>
                    <p className="text-xs text-[#2A2A2A]/90 font-sans leading-relaxed">
                      {aboutMe.trim()}
                    </p>
                  </div>
                )}

                {/* Card 1: Key Stats (Age, Height, Degree, University, Profession) */}
                <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
                  {/* Row 1: Age */}
                  <div className="py-3 flex items-center gap-3">
                    <Cake className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">
                      {calculateAge(selectedYear, selectedMonth, currentEffectiveDay)} years old
                    </span>
                  </div>

                  <div className="h-px bg-[#5A5A40]/12 mx-1" />

                  {/* Row 2: Height */}
                  <div className="py-3 flex items-center gap-3">
                    <Ruler className="w-4 h-4 text-[#8a804a] shrink-0" />
                    <span className="font-medium text-[#2A2A2A]">
                      {heightFeet !== '' ? `${heightFeet}' ${heightInches}"` : 'Not specified'}
                    </span>
                  </div>

                  {educationLevel && (
                    <>
                      <div className="h-px bg-[#5A5A40]/12 mx-1" />
                      <div className="py-3 flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-[#8a804a] shrink-0" />
                        <span className="font-medium text-[#2A2A2A]">{educationLevel.split('(')[0]}</span>
                      </div>
                    </>
                  )}

                  {schoolOrUniversity && (
                    <>
                      <div className="h-px bg-[#5A5A40]/12 mx-1" />
                      <div className="py-3 flex items-center gap-3">
                        <School className="w-4 h-4 text-[#8a804a] shrink-0" />
                        <span className="font-medium text-[#2A2A2A]">{schoolOrUniversity}</span>
                      </div>
                    </>
                  )}

                  {profession && (
                    <>
                      <div className="h-px bg-[#5A5A40]/12 mx-1" />
                      <div className="py-3 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#8a804a] shrink-0" />
                        <span className="font-medium text-[#2A2A2A]">{profession}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Location Card */}
                <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-[#2A2A2A] shadow-2xs font-sans">
                  <Navigation className="w-4 h-4 text-[#8a804a] shrink-0 rotate-45" />
                  <span>
                    {[pulledLocation, country].filter(Boolean).join(', ') || 'Location not specified'}
                  </span>
                </div>

                {/* Secondary Image Banner (Photo 2) */}
                {photo2 && (
                  <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-2xs">
                    <img
                      src={photo2}
                      alt="Second photo"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}

                {/* Prompt Answer Card */}
                {selectedPrompt && promptAnswer && (
                  <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] p-4 text-xs font-sans space-y-1.5 shadow-2xs">
                    <span className="font-bold text-[#8a804a] text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      {selectedPrompt}
                    </span>
                    <p className="text-xs font-medium text-[#2A2A2A] italic leading-relaxed">
                      "{promptAnswer}"
                    </p>
                  </div>
                )}

                {/* Section: A little more about me... */}
                <div className="pt-1">
                  <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm mb-2 px-1">
                    A little more about me...
                  </h3>

                  <div className="bg-[#fcfcf9] border border-[#5A5A40]/30 rounded-[22px] px-4 py-1 text-xs text-[#2A2A2A] shadow-2xs font-sans">
                    {userGender && (
                      <div className="py-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                          <Users className="w-4 h-4 text-[#8a804a] shrink-0" />
                          <span>Gender</span>
                        </div>
                        <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                          {userGender}
                        </span>
                      </div>
                    )}

                    {datingIntentions && showDatingIntentionsOnProfile && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                            <Heart className="w-4 h-4 text-[#8a804a] shrink-0" />
                            <span>Dating intentions</span>
                          </div>
                          <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                            {datingIntentions}
                          </span>
                        </div>
                      </>
                    )}

                    {userRelationshipStatus && showRelationshipOnProfile && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                            <Sparkles className="w-4 h-4 text-[#8a804a] shrink-0" />
                            <span>Marital Status</span>
                          </div>
                          <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                            {userRelationshipStatus}
                          </span>
                        </div>
                      </>
                    )}

                    {haveKids && showHaveKidsOnProfile && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                            <Smile className="w-4 h-4 text-[#8a804a] shrink-0" />
                            <span>Has kids</span>
                          </div>
                          <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                            {haveKids}
                          </span>
                        </div>
                      </>
                    )}

                    {wantKids && showWantKidsOnProfile && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                            <Baby className="w-4 h-4 text-[#8a804a] shrink-0" />
                            <span>Wants kids</span>
                          </div>
                          <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                            {wantKids}
                          </span>
                        </div>
                      </>
                    )}

                    {(religion || ethnicity || caste) && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90">
                            <Sparkles className="w-4 h-4 text-[#8a804a] shrink-0" />
                            <span>Faith &amp; Heritage</span>
                          </div>
                          <span className="border border-[#5A5A40]/35 rounded-full px-3 py-1 bg-[#5A5A40]/5 text-[11px] font-medium text-[#2A2A2A]">
                            {[
                              religion === 'Other' ? customReligion : religion,
                              ethnicity === 'Other' ? customEthnicity : ethnicity,
                              caste ? `Caste: ${caste}` : null
                            ].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      </>
                    )}

                    {(manglikStatus || lagna || nekatha || horoscopeNotes) && (
                      <>
                        <div className="h-px bg-[#5A5A40]/12 mx-1" />
                        <div className="py-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-[#2A2A2A]/90 pt-0.5">
                            <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Horoscope / Kendraya</span>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex flex-wrap justify-end gap-1">
                              {manglikStatus && (
                                <span className="border border-[#5A5A40]/35 rounded-full px-2.5 py-0.5 bg-[#5A5A40]/5 text-[10px] font-bold text-[#2A2A2A]">
                                  {manglikStatus}
                                </span>
                              )}
                              {lagna && (
                                <span className="border border-[#5A5A40]/35 rounded-full px-2.5 py-0.5 bg-[#5A5A40]/5 text-[10px] font-bold text-[#2A2A2A]">
                                  {lagna} Lagna
                                </span>
                              )}
                              {nekatha && (
                                <span className="border border-[#5A5A40]/35 rounded-full px-2.5 py-0.5 bg-[#5A5A40]/5 text-[10px] font-bold text-[#2A2A2A]">
                                  {nekatha.split(' ')[0]} Nekatha
                                </span>
                              )}
                            </div>
                            {horoscopeNotes && (
                              <p className="text-[10px] text-[#5A5A40] italic max-w-[200px] truncate">
                                "{horoscopeNotes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Third Image Banner (Photo 3) */}
                {photo3 && (
                  <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden bg-stone-200 shadow-2xs">
                    <img
                      src={photo3}
                      alt="Third photo"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}

                {/* Interests Chips */}
                {Object.values(selectedInterests).flat().length > 0 && (
                  <div className="pt-1 space-y-2">
                    <h3 className="font-sans font-semibold text-[#2A2A2A] text-sm px-1">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(selectedInterests).flat().map((interest) => (
                        <span
                          key={interest}
                          className="px-3.5 py-1.5 bg-[#fcfcf9] border border-[#5A5A40]/30 text-[#2A2A2A] font-medium text-xs rounded-full shadow-2xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        )}

        </div>
      </div>

      {/* Verification Flow Modal Overlay */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className={`bg-white rounded-3xl w-full p-5 sm:p-6 space-y-4 relative shadow-2xl border border-[#5A5A40]/20 max-h-[92vh] overflow-y-auto transition-all ${
            verificationStep === 'selfie_scan' ? 'max-w-xl sm:max-w-2xl' : 'max-w-md'
          }`}>
            <button
              type="button"
              onClick={handleCloseVerificationModal}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Verification Step 1: Info */}
            {verificationStep === 'info' && (
              <div className="text-center space-y-4 pt-1">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-serif text-[#2A2A2A]">
                    Biometric Face Verification
                  </h3>
                  <p className="text-xs text-[#5A5A40] leading-relaxed">
                    Vivah ensures a 100% genuine community. We compare your live front-camera face with your uploaded profile picture using AI.
                  </p>
                </div>

                <div className="bg-[#5A5A40]/5 p-3 rounded-2xl text-left space-y-2 text-xs text-[#2A2A2A]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Front Camera Only:</strong> Accesses solely your front selfie camera.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>AI Biometric Match:</strong> Verifies you match your uploaded profile photo.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep('selfie_scan');
                    startFrontCamera();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-[#5A5A40] text-white hover:bg-[#4a4a34] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Open Front Camera &amp; Verify Face</span>
                </button>
              </div>
            )}

            {/* Verification Step 2: Side-by-Side Front Camera & Uploaded Photo Face Verification */}
            {verificationStep === 'selfie_scan' && (
              <div className="space-y-4 pt-1">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Identity Matching</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2A2A2A]">
                    Front-Camera Face Verification
                  </h3>
                  <p className="text-xs text-[#5A5A40] max-w-md mx-auto">
                    We compare your live front-camera selfie alongside your uploaded profile photo to verify that you are genuine.
                  </p>
                </div>

                {/* Side-by-Side Image Comparison View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* LEFT COLUMN: Uploaded Profile Photo */}
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2A2A] flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>Uploaded Photo</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded-full">
                        Reference
                      </span>
                    </div>

                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border-2 border-[#5A5A40]/30 shadow-xs flex items-center justify-center">
                      <img
                        src={mainPhoto || photo2 || photo3 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                        alt="Uploaded reference profile photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-[10px] font-medium text-center truncate">
                        {firstName ? `${toPascalCase(firstName)}'s Profile Photo` : 'Profile Photo'}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Live Front Camera / Captured Selfie */}
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2A2A] flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Front Camera</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selfieVerified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : capturedSelfie
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {selfieVerified ? 'Approved ✓' : capturedSelfie ? 'Captured' : 'Front View'}
                      </span>
                    </div>

                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#5A5A40]/30 shadow-xs flex items-center justify-center">
                      {capturedSelfie ? (
                        <img
                          src={capturedSelfie}
                          alt="Captured front selfie"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />

                          {/* Oval Frame Guide */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                            <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)] flex flex-col items-center justify-center">
                              <span className="text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Fit Face Here
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Camera Loading or Error Overlay */}
                      {cameraStatus === 'starting' && (
                        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white space-y-2 p-3 text-center">
                          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                          <p className="text-xs font-semibold">Accessing front camera...</p>
                        </div>
                      )}

                      {cameraStatus === 'denied' && (
                        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white space-y-2.5 p-4 text-center z-10">
                          <AlertCircle className="w-8 h-8 text-amber-400" />
                          <p className="text-xs font-bold text-white">Front Camera Access</p>
                          <p className="text-[11px] text-white/80 leading-snug max-w-xs">
                            {cameraError || 'Camera permissions may be blocked in your browser preview.'}
                          </p>
                          <div className="flex flex-col w-full max-w-[210px] gap-2 pt-1">
                            <button
                              type="button"
                              onClick={startFrontCamera}
                              className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Retry Front Camera
                            </button>
                            <button
                              type="button"
                              onClick={() => selfieFileInputRef.current?.click()}
                              className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Take / Select Selfie</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Hidden Native Camera & File Input */}
                      <input
                        type="file"
                        ref={selfieFileInputRef}
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieFileSelect}
                        className="hidden"
                      />

                      {/* AI Verification Loading Overlay */}
                      {isVerifyingFace && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 space-y-3 text-center animate-fadeIn z-20">
                          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white">AI Biometric Analysis...</p>
                            <p className="text-[11px] text-white/80 leading-relaxed">
                              Gemini AI is comparing facial landmarks to verify genuine authenticity.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Verification Result Feedback */}
                {aiVerificationResult && (
                  <div className={`p-3.5 rounded-2xl border text-xs animate-fadeIn ${
                    aiVerificationResult.approved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {aiVerificationResult.approved ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">
                            {aiVerificationResult.approved ? 'Identity Match Confirmed ✓' : 'Verification Not Approved'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            aiVerificationResult.approved ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                          }`}>
                            Score: {aiVerificationResult.confidenceScore}%
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug">
                          {aiVerificationResult.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aiVerificationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{aiVerificationError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-1 space-y-2">
                  {!selfieVerified ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      {capturedSelfie && (
                        <button
                          type="button"
                          onClick={handleRetakeFrontSelfie}
                          disabled={isVerifyingFace}
                          className="w-full sm:w-1/3 py-3 px-3 rounded-xl border border-[#5A5A40]/30 hover:bg-[#5A5A40]/10 text-[#2A2A2A] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake</span>
                        </button>
                      )}

                      {cameraStatus === 'active' ? (
                        <button
                          type="button"
                          disabled={isVerifyingFace}
                          onClick={handleCaptureAndVerifyFace}
                          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          <ScanFace className="w-4 h-4" />
                          <span>{isVerifyingFace ? 'Verifying with AI...' : 'Capture Face & Verify with AI'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isVerifyingFace}
                          onClick={() => selfieFileInputRef.current?.click()}
                          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{isVerifyingFace ? 'Verifying with AI...' : 'Take / Upload Front Selfie'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 animate-fadeIn">
                      <button
                        type="button"
                        onClick={handleCloseVerificationModal}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified! Proceed with Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationStep('id_upload')}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Also upload government ID (Optional)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Step 3: Issued ID Upload (Front & Back) */}
            {verificationStep === 'id_upload' && (
              <div className="text-center space-y-4 pt-1">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={frontFileInputRef}
                  onChange={(e) => handleIdFileSelect(e, 'front')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={backFileInputRef}
                  onChange={(e) => handleIdFileSelect(e, 'back')}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#2A2A2A]">
                    Issued Government ID Verification
                  </h3>
                  <p className="text-xs text-[#5A5A40]">
                    Upload photos of both the front and back of your official government ID (Driving License, Passport, Aadhaar, National ID).
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  {/* SECTION 1: FRONT OF ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2A2A2A] flex items-center justify-between">
                      <span>1. Front of ID</span>
                      {idFrontImage && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Front Uploaded
                        </span>
                      )}
                    </label>

                    {idFrontImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-stone-100 group shadow-2xs">
                        <img
                          src={idFrontImage}
                          alt="Front of ID"
                          className="w-full h-32 object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIdPicker('front');
                              setShowIdOptionsModal(true);
                            }}
                            className="px-3 py-1.5 bg-white text-[#2A2A2A] rounded-xl text-xs font-bold shadow-md hover:bg-stone-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retake
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdFrontImage(null)}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIdPicker('front');
                          setShowIdOptionsModal(true);
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-[#5A5A40]/30 hover:border-[#5A5A40] bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] group-hover:scale-105 transition-transform shadow-2xs">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-[#2A2A2A]">Upload Front of ID</span>
                        <span className="text-[10px] text-[#5A5A40]">Tap to take picture or upload from device</span>
                      </button>
                    )}
                  </div>

                  {/* SECTION 2: BACK OF ID */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-[#2A2A2A] flex items-center justify-between">
                      <span>2. Back of ID</span>
                      {idBackImage && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Back Uploaded
                        </span>
                      )}
                    </label>

                    {idBackImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-stone-100 group shadow-2xs">
                        <img
                          src={idBackImage}
                          alt="Back of ID"
                          className="w-full h-32 object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIdPicker('back');
                              setShowIdOptionsModal(true);
                            }}
                            className="px-3 py-1.5 bg-white text-[#2A2A2A] rounded-xl text-xs font-bold shadow-md hover:bg-stone-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retake
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdBackImage(null)}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIdPicker('back');
                          setShowIdOptionsModal(true);
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-[#5A5A40]/30 hover:border-[#5A5A40] bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] group-hover:scale-105 transition-transform shadow-2xs">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-[#2A2A2A]">Upload Back of ID</span>
                        <span className="text-[10px] text-[#5A5A40]">Tap to take picture or upload from device</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (idFrontImage || idBackImage) {
                      setIdUploaded(true);
                    }
                    setIsVerificationModalOpen(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-[#5A5A40] text-white hover:bg-[#4a4a34] transition-all shadow-md active:scale-95"
                >
                  {idFrontImage && idBackImage
                    ? 'Save Complete ID & Return ✓'
                    : idFrontImage || idBackImage
                    ? 'Save Partial ID & Return'
                    : 'Skip / Return Later'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Upload Options Selection Dialog Modal */}
      {showIdOptionsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 relative shadow-2xl border border-[#5A5A40]/20 text-center">
            <button
              type="button"
              onClick={() => setShowIdOptionsModal(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-1">
              <h3 className="text-base font-serif font-bold text-[#2A2A2A]">
                {activeIdPicker === 'front' ? 'Front' : 'Back'} of Government ID
              </h3>
              <p className="text-xs text-[#5A5A40]">
                Choose how you would like to provide this photo
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Take a Picture */}
              <button
                type="button"
                onClick={() => {
                  setShowIdOptionsModal(false);
                  setIdCameraMode(activeIdPicker);
                }}
                className="w-full p-3.5 rounded-2xl border border-[#5A5A40]/30 hover:border-[#5A5A40] bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 text-left flex items-center gap-3 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2A2A2A]">Take a Picture</div>
                  <div className="text-[10px] text-[#5A5A40]">Use device camera to snap photo</div>
                </div>
              </button>

              {/* Option 2: Upload from Device */}
              <button
                type="button"
                onClick={() => {
                  setShowIdOptionsModal(false);
                  if (activeIdPicker === 'front') {
                    frontFileInputRef.current?.click();
                  } else {
                    backFileInputRef.current?.click();
                  }
                }}
                className="w-full p-3.5 rounded-2xl border border-[#5A5A40]/30 hover:border-[#5A5A40] bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 text-left flex items-center gap-3 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2A2A2A]">Upload from device</div>
                  <div className="text-[10px] text-[#5A5A40]">Select photo from gallery or files</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Camera Viewfinder Simulator Modal */}
      {idCameraMode && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-70 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 relative shadow-2xl border border-slate-700 text-center text-white">
            <button
              type="button"
              onClick={() => setIdCameraMode(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-1">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Snap {idCameraMode === 'front' ? 'Front' : 'Back'} of ID</span>
              </h3>
              <p className="text-xs text-slate-400">
                Fit your official ID document inside the rectangular frame.
              </p>
            </div>

            {/* ID Viewfinder */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <img
                src="https://via.placeholder.com/600x600?text=Profile+Image"
                alt="ID Camera Viewfinder"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-black/40" />

              {/* Rectangular ID Guide Frame */}
              <div className="w-64 h-36 border-2 border-emerald-400 rounded-xl relative shadow-[0_0_20px_rgba(52,211,153,0.5)] flex items-center justify-center bg-emerald-500/10 animate-pulse">
                <span className="bg-black/70 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Position {idCameraMode === 'front' ? 'Front' : 'Back'} of ID Here
                </span>
              </div>
            </div>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={() => {
                const samplePhoto =
                  idCameraMode === 'front'
                    ? 'https://via.placeholder.com/600x600?text=Profile+Image'
                    : 'https://via.placeholder.com/600x600?text=Profile+Image';
                if (idCameraMode === 'front') {
                  setIdFrontImage(samplePhoto);
                } else {
                  setIdBackImage(samplePhoto);
                }
                setIdUploaded(true);
                setIdCameraMode(null);
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pb-6 pt-3 px-5 sm:px-8 shrink-0 flex items-center justify-center relative w-full max-w-md mx-auto">
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-3.5 px-8 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center shadow-md active:scale-95 bg-[#5A5A40] hover:bg-[#4a4a34] text-white"
        >
          <span>{currentStep === totalSteps - 1 ? 'Start Discovering' : 'Continue'}</span>
        </button>
      </div>
    </div>
  );

};


