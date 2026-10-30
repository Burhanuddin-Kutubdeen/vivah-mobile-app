export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce';
export type DietType = 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan' | 'Jain';
export type FamilyType = 'Joint Family' | 'Nuclear Family' | 'Extended Family';
export type FamilyValues = 'Traditional' | 'Moderate' | 'Liberal' | 'Traditional & Modern Blend';
export type DoshaType = 'No Dosha' | 'Manglik' | 'Anshik Manglik' | 'Don\'t Know';

export interface HoroscopeDetails {
  rashi: string; // Moon Sign / චන්ද්‍ර රාශිය
  nakshatra: string;
  gotra?: string;
  manglikStatus: DoshaType | string;
  gunaScore?: number; // e.g. 32 out of 36
  timeOfBirth?: string;
  placeOfBirth?: string;
  lagna?: string; // Ascendant / ලග්නය
  nekatha?: string;
  nekathaPada?: 1 | 2 | 3 | 4 | number; // පාදය (1 to 4)
  navamshaya?: string; // නවාංශකය
  shaniDosha?: boolean; // Shani 7/8 / සෙනසුරු අෂ්ටම
  rahuKethuDosha?: boolean; // Rahu-Kethu / කාලසර්ප
  planetaryPositions?: Record<number, string[]>; // 12 houses -> planets
  kendrayaChartUrl?: string; // Uploaded Kendraya photo/PDF
  chartImageUrl?: string;
  horoscopeNotes?: string;
}

export interface FamilyDetails {
  fatherOccupation: string;
  motherOccupation: string;
  brothersCount: number;
  sistersCount: number;
  familyType: FamilyType;
  familyValues: FamilyValues;
  familyLocation: string;
  aboutFamily?: string;
}

export interface EducationCareer {
  highestDegree: string;
  collegeName: string;
  profession: string;
  companyName: string;
  annualIncome: string;
  workLocation: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  age: number;
  height: string; // e.g. "5'6\"" or "168 cm"
  gender: 'Female' | 'Male';
  profileFor: 'Self' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Friend';
  verified: boolean;
  premium: boolean;
  onlineNow: boolean;
  avatarUrl: string;
  photos: string[]; // Gallery photos
  location: {
    city: string;
    state: string;
    country: string;
  };
  religion: string;
  ethnicity?: string;
  customReligion?: string;
  customEthnicity?: string;
  motherTongue: string;
  caste: string;
  subCaste?: string;
  maritalStatus: MaritalStatus;
  diet: DietType;
  drinking: 'No' | 'Occasionally' | 'Yes';
  smoking: 'No' | 'Occasionally' | 'Yes';
  datingIntentions?: string;
  wantsKids?: string;
  hasKids?: string;
  habits?: string;
  bio: string;
  headline: string;
  horoscope: HoroscopeDetails;
  family: FamilyDetails;
  career: EducationCareer;
  hobbies: string[];
  partnerPreferences: {
    ageMin: number;
    ageMax: number;
    heightMin: string;
    heightMax: string;
    religion: string[];
    motherTongue: string[];
    maritalStatus: MaritalStatus[];
    diet: DietType[];
    minIncome: string;
    locationPreference: string;
  };
  compatibilityScore: number; // 0 - 100
  gunaMilanText: string; // "32/36 Guna Match"
  distanceKm?: number;
  joinedDate: string;
  prompts?: { question: string; answer: string }[];
}

export interface FilterState {
  gender: 'Female' | 'Male';
  ageMin: number;
  ageMax: number;
  heightMinInches: number; // in total inches for range calculation
  heightMaxInches: number;
  religions: string[];
  castes: string[];
  maritalStatuses: MaritalStatus[];
  minIncome: string;
  city: string;
  state: string;
  manglikPreference: 'All' | 'Non-Manglik Only' | 'Manglik Allowed';
  verifiedOnly: boolean;
  withPhotosOnly: boolean;
  searchQuery: string;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toProfileId: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  message?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string; // profile ID of the contact
  senderId: 'currentUser' | string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  isIcebreaker?: boolean;
}

export interface ChatThread {
  profileId: string;
  profile: CandidateProfile;
  lastMessage: ChatMessage;
  unreadCount: number;
  isEncrypted: boolean;
  connectionStatus: 'accepted' | 'pending_approval' | 'none';
}

export interface GeminiMatchAnalysis {
  overallCompatibilityPercentage: number;
  gunaMilanScore: string;
  summary: string;
  strengths: string[];
  considerations: string[];
  astrologicalInsight: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastTestedAt?: string;
}

// WebRTC Call Types
export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

export interface IncomingCallInfo {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  type: CallType;
  roomId: string;
}

export interface CallSignal {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  signal_type: 'offer' | 'answer' | 'ice-candidate' | 'call-end' | 'call-decline';
  signal_data: Record<string, unknown>;
  created_at?: string;
}

export type FlutterDevice = 'iphone' | 'pixel' | 'fullscreen';
export type TabType = 'discover' | 'likes' | 'chats' | 'my_profile';
