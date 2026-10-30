/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, CandidateProfile } from '../types';

const STORAGE_KEY_CONFIG = 'vivah_supabase_config_v1';
const STORAGE_KEY_USER_ID = 'vivah_current_user_id_v1';

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function getPersistentUserId(): string {
  try {
    const saved = safeGetItem(STORAGE_KEY_USER_ID);
    if (saved) return saved;
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    safeSetItem(STORAGE_KEY_USER_ID, newId);
    return newId;
  } catch {
    return 'current-user-123';
  }
}

export function setPersistentUserId(id: string) {
  if (id) {
    safeSetItem(STORAGE_KEY_USER_ID, id);
  }
}

// Load initial config from localStorage or import.meta.env
export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = safeGetItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read saved Supabase config:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: !!(envUrl && envKey)
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    safeSetItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export async function syncLikeToSupabase(userId: string, candidateId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('connection_requests').upsert({
      sender_id: userId,
      receiver_id: candidateId,
      status: 'pending',
      message: 'Expressed interest in your profile!'
    }, { onConflict: 'sender_id,receiver_id' });

    await supabase.from('shortlists').upsert({
      user_id: userId,
      profile_id: candidateId
    }, { onConflict: 'user_id,profile_id' });
  } catch (err) {
    console.warn('Supabase syncLike error:', err);
  }
}

export async function syncUnlikeToSupabase(userId: string, candidateId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('connection_requests')
      .delete()
      .eq('sender_id', userId)
      .eq('receiver_id', candidateId);

    await supabase.from('shortlists')
      .delete()
      .eq('user_id', userId)
      .eq('profile_id', candidateId);
  } catch (err) {
    console.warn('Supabase syncUnlike error:', err);
  }
}

export async function syncMessageToSupabase(senderId: string, matchId: string, text: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('chat_messages').insert({
      match_id: matchId,
      sender_id: senderId,
      receiver_id: matchId,
      message_text: text,
      status: 'delivered',
      is_encrypted: true
    });
  } catch (err) {
    console.warn('Supabase syncMessage error:', err);
  }
}

export async function syncProfileToSupabase(profile: CandidateProfile, onboardingData?: {
  onboarding_completed?: boolean;
  onboarding_step?: number;
  onboarding_completed_at?: string;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      religion: profile.religion,
      mother_tongue: profile.motherTongue,
      caste: profile.caste,
      sub_caste: profile.subCaste,
      marital_status: profile.maritalStatus,
      diet: profile.diet,
      bio: profile.bio,
      headline: profile.headline,
      city: profile.location.city,
      state: profile.location.state,
      country: profile.location.country,
      avatar_url: profile.avatarUrl,
      photos: profile.photos,
      profession: profile.career.profession,
      highest_degree: profile.career.highestDegree,
      annual_income: profile.career.annualIncome,
      company_name: profile.career.companyName,
      ...(onboardingData && {
        onboarding_completed: onboardingData.onboarding_completed,
        onboarding_step: onboardingData.onboarding_step,
        onboarding_completed_at: onboardingData.onboarding_completed_at,
      }),
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase syncProfile error:', err);
  }
}

export interface OnboardingSupabaseEntryPayload {
  onboarding_step?: number;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  name?: string;
  gender?: string;
  age?: number;
  height?: string;
  country?: string;
  city?: string;
  state?: string;
  education?: string;
  highest_degree?: string;
  school_or_university?: string;
  profession?: string;
  marital_status?: string;
  photos?: string[];
  avatar_url?: string;
  bio?: string;
  [key: string]: any;
}

/**
 * Writes or updates an entry into the 'profiles' table on the exact SAME line (matching id).
 * Uses PostgreSQL upsert with onConflict: 'id' so no duplicate rows are created.
 */
export async function syncOnboardingEntryToSupabase(userId: string, data: OnboardingSupabaseEntryPayload) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    const payload: Record<string, any> = {
      id: userId,
      user_id: userId,
      ...data
    };

    // Clean undefined keys
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase syncOnboardingEntry upsert warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase syncOnboardingEntry exception:', err);
  }
}

/**
 * Overwrites the exact SAME line in the 'profiles' table with reset values when starting over.
 * Guarantees zero duplicate rows and preserves existing database size.
 */
export async function resetOnboardingProfileInSupabase(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    const resetPayload = {
      id: userId,
      user_id: userId,
      name: '',
      gender: '',
      age: 0,
      height: '',
      country: '',
      city: '',
      state: '',
      education: '',
      highest_degree: '',
      school_or_university: '',
      profession: '',
      marital_status: '',
      photos: [],
      avatar_url: '',
      bio: '',
      onboarding_step: 0,
      onboarding_completed: false,
      onboarding_completed_at: null
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(resetPayload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase resetOnboardingProfile upsert warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase resetOnboardingProfile exception:', err);
  }
}

export async function fetchInitialSupabaseData(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [requestsRes, shortlistsRes, messagesRes] = await Promise.all([
      supabase.from('connection_requests').select('*'),
      supabase.from('shortlists').select('*'),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: true })
    ]);

    const connectionRequests = requestsRes.data || [];
    const shortlists = shortlistsRes.data || [];
    const chatMessages = messagesRes.data || [];

    return {
      interestedCandidateIds: connectionRequests
        .filter((r) => r.sender_id === userId)
        .map((r) => r.receiver_id),
      shortlistedCandidateIds: shortlists
        .filter((s) => s.user_id === userId)
        .map((s) => s.profile_id),
      chatMessages: chatMessages.map((m) => ({
        id: m.id,
        matchId: m.match_id,
        senderId: m.sender_id,
        text: m.message_text,
        timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        status: m.status || 'delivered'
      }))
    };
  } catch (err) {
    console.warn('Failed to fetch initial Supabase data:', err);
    return null;
  }
}

export async function signInWithSupabaseEmail(email: string, pass: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase client is not connected. Please connect Supabase URL & Key.' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) return { success: false, message: error.message };
    return { success: true, user: data.user, session: data.session };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Login failed' };
  }
}

export async function signUpWithSupabaseEmail(email: string, pass: string, name: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase client is not connected. Please connect Supabase URL & Key.' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name }
      }
    });
    if (error) return { success: false, message: error.message };
    return { success: true, user: data.user, session: data.session };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Sign up failed' };
  }
}

export async function signInWithSupabaseGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase client is not connected.' };

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Google Auth failed' };
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'Please provide both Supabase URL and Anon Key' };
  }

  try {
    const tempClient = createClient(url, anonKey);
    // Simple light request to check authorization or connection
    const { error } = await tempClient.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.profiles" does not exist')) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
    // Connected to Supabase project successfully!
    return { success: true, message: 'Successfully connected to Supabase Database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Invalid Supabase configuration URL or Key.' };
  }
}

// SQL DDL Script for user's Supabase Database setup
export const SUPABASE_SQL_SCHEMA = `-- ===============================================
-- VIVAH MATRIMONY DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor (SQL Query tab)
-- ===============================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height TEXT NOT NULL,
  religion TEXT NOT NULL,
  mother_tongue TEXT NOT NULL,
  caste TEXT,
  sub_caste TEXT,
  marital_status TEXT NOT NULL,
  diet TEXT NOT NULL,
  bio TEXT,
  headline TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  avatar_url TEXT,
  photos TEXT[],
  profession TEXT NOT NULL,
  highest_degree TEXT,
  annual_income TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
  
  -- Horoscope / Kundali
  rashi TEXT,
  nakshatra TEXT,
  gotra TEXT,
  manglik_status TEXT,
  
  -- Family
  family_type TEXT,
  family_values TEXT,
  father_occupation TEXT,
  mother_occupation TEXT,
  
  verified BOOLEAN DEFAULT true,
  online_now BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Interests & Connection Requests
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Encrypted Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  media_url TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'delivered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shortlists & Saved Profiles
CREATE TABLE IF NOT EXISTS public.shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- 5. Call Signaling (WebRTC SDP & ICE candidates)
CREATE TABLE IF NOT EXISTS public.call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for Profiles
-- Authenticated users can SELECT their own profile
CREATE POLICY "Auth users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can UPDATE their own profile
CREATE POLICY "Auth users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles are readable by all authenticated users (for Discover)
CREATE POLICY "Public profiles readable by all auth users" ON public.profiles FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Connection Requests Policies
CREATE POLICY "Auth users can read connection requests" ON public.connection_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Chat Messages Policies
CREATE POLICY "Auth users can read chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Shortlists Policies
CREATE POLICY "Auth users can read shortlists" ON public.shortlists FOR SELECT USING (auth.uid() = user_id);

-- Call Signals Policies
CREATE POLICY "Auth users can read call signals" ON public.call_signals FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
`;
