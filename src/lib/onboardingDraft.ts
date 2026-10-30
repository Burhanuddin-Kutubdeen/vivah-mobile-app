export const ONBOARDING_DRAFT_KEY = 'vivah_onboarding_draft_v1';
export const ONBOARDING_COMPLETED_KEY = 'vivah_onboarding_completed_v1';

export interface OnboardingDraft {
  currentStep: number;
  locationStatus?: 'idle' | 'requesting' | 'granted' | 'denied';
  locationCoords?: { lat: number; lng: number } | null;
  notificationStatus?: 'idle' | 'requesting' | 'granted' | 'denied';
  firstName?: string;
  selectedDay?: number;
  selectedMonth?: number;
  selectedYear?: number;
  dob?: string;
  lookingForGender?: 'Female' | 'Male' | 'All';
  maritalStatus?: string;
  verifiedOnly?: boolean;
  ageRange?: { min: number; max: number };
  userGender?: 'Male' | 'Female' | '';
  heightFeet?: number | '';
  heightInches?: number | '';
  country?: string;
  pulledLocation?: string;
  hasPulledLocation?: boolean;
  educationLevel?: string;
  schoolOrUniversity?: string;
  profession?: string;
  userRelationshipStatus?: 'Never Married' | 'Divorced' | 'Widowed' | '';
  showRelationshipOnProfile?: boolean;
  haveKids?: 'Yes' | 'No' | '';
  showHaveKidsOnProfile?: boolean;
  wantKids?: 'Yes' | 'No' | '';
  showWantKidsOnProfile?: boolean;
  datingIntentions?: 'Marriage Focused' | 'Figuring It Out' | '';
  showDatingIntentionsOnProfile?: boolean;
  marriageConfirmation?: boolean;
  mainPhoto?: string;
  photo2?: string;
  photo3?: string;
  aboutMe?: string;
  selectedInterests?: Record<string, string[]>;
  selectedPrompt?: string;
  promptAnswer?: string;
  emailAddress?: string;
  phoneNumber?: string;
  detectedPhoneInfo?: { code: string; flag: string; countryCode: string };
  selfieVerified?: boolean;
  idUploaded?: boolean;
  idFrontImage?: string | null;
  idBackImage?: string | null;
  lastUpdated?: number;
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load onboarding draft:', e);
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  try {
    draft.lastUpdated = Date.now();
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    try {
      // In case quota is exceeded with full base64 images, save without large photos
      const lightweightDraft: OnboardingDraft = {
        ...draft,
        mainPhoto: draft.mainPhoto && draft.mainPhoto.length > 5000 ? '' : draft.mainPhoto,
        photo2: draft.photo2 && draft.photo2.length > 5000 ? '' : draft.photo2,
        photo3: draft.photo3 && draft.photo3.length > 5000 ? '' : draft.photo3,
        idFrontImage: null,
        idBackImage: null,
        lastUpdated: Date.now()
      };
      localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(lightweightDraft));
    } catch (innerErr) {
      console.warn('Could not save onboarding draft to localStorage:', innerErr);
    }
  }
}

export function clearOnboardingDraft(): void {
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    clearOnboardingDraft();
  } catch {
    /* ignore */
  }
}
