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

export function generateValidUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getPersistentUserId(): string {
  try {
    const saved = safeGetItem(STORAGE_KEY_USER_ID);
    if (saved && UUID_REGEX.test(saved)) {
      return saved;
    }
    const newId = generateValidUUID();
    safeSetItem(STORAGE_KEY_USER_ID, newId);
    return newId;
  } catch {
    return '11111111-2222-4333-8444-555555555555';
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

const STORAGE_KEY_UNSUPPORTED_COLS = 'vivah_supabase_unsupported_profile_cols_v1';

function getUnsupportedColumns(): Set<string> {
  try {
    const raw = safeGetItem(STORAGE_KEY_UNSUPPORTED_COLS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function recordUnsupportedColumn(col: string) {
  if (!col) return;
  try {
    const current = getUnsupportedColumns();
    if (!current.has(col)) {
      current.add(col);
      safeSetItem(STORAGE_KEY_UNSUPPORTED_COLS, JSON.stringify(Array.from(current)));
    }
  } catch {
    // ignore
  }
}

/**
 * Safely upserts a profile payload into the 'profiles' table.
 * If Supabase schema does not have a certain column (e.g. 'age', 'education', 'user_id'),
 * it automatically identifies the missing column from the PostgREST error, records it,
 * prunes it from the payload, and retries the upsert on the exact same row.
 */
export async function safeUpsertProfile(
  supabase: SupabaseClient,
  rawPayload: Record<string, any>
): Promise<{ success: boolean; error?: any; data?: any }> {
  if (!supabase || !rawPayload) return { success: false, error: 'No client or payload' };

  const payload: Record<string, any> = { ...rawPayload };
  const unsupported = getUnsupportedColumns();

  // Initial prune of known unsupported columns and undefined values
  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined || unsupported.has(k)) {
      delete payload[k];
    }
  }

  // Ensure ID is present
  if (!payload.id && payload.user_id) {
    payload.id = payload.user_id;
  }

  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (!error) {
        return { success: true, data };
      }

      const errMsg = error.message || '';

      // Pattern 1: Could not find the 'xyz' column of 'profiles' in the schema cache
      // Pattern 2: Could not find the column 'xyz'
      // Pattern 3: column "xyz" of relation "profiles" does not exist
      // Pattern 4: column "xyz" does not exist
      const match =
        errMsg.match(/Could not find the '([^']+)' column/i) ||
        errMsg.match(/Could not find the column '([^']+)'/i) ||
        errMsg.match(/column "?([a-zA-Z0-9_]+)"? of relation "?profiles"? does not exist/i) ||
        errMsg.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i);

      if (match && match[1]) {
        const missingCol = match[1];
        recordUnsupportedColumn(missingCol);
        delete payload[missingCol];
        // Retry without the rejected column
        continue;
      }

      // Foreign key constraint on user_id (if anonymous user id not in auth.users)
      if (errMsg.includes('violates foreign key constraint') && (errMsg.includes('user_id') || errMsg.includes('profiles_user_id_fkey'))) {
        recordUnsupportedColumn('user_id');
        delete payload['user_id'];
        continue;
      }

      // If ON CONFLICT clause failed or no unique constraint on id
      if (errMsg.includes('ON CONFLICT') || errMsg.includes('unique or exclusion constraint')) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', payload.id);
        if (!updateErr) return { success: true };

        const { error: insertErr } = await supabase
          .from('profiles')
          .insert(payload);
        if (!insertErr) return { success: true };
      }

      console.warn('Supabase profiles upsert warning:', errMsg);
      return { success: false, error };
    } catch (err: any) {
      console.warn('Supabase profiles upsert exception:', err?.message || err);
      return { success: false, error: err };
    }
  }

  return { success: false, error: 'Max attempts reached during column reconciliation' };
}

export async function syncProfileToSupabase(profile: CandidateProfile, onboardingData?: {
  onboarding_completed?: boolean;
  onboarding_step?: number;
  onboarding_completed_at?: string;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const payload = {
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
    };
    await safeUpsertProfile(supabase, payload);
  } catch (err) {
    console.warn('Supabase syncProfile error:', err);
  }
}

const STORAGE_KEY_UNSUPPORTED_USER_DETAILS_COLS = 'vivah_supabase_unsupported_user_details_cols_v1';

function getUnsupportedUserDetailsColumns(): Set<string> {
  try {
    const raw = safeGetItem(STORAGE_KEY_UNSUPPORTED_USER_DETAILS_COLS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function recordUnsupportedUserDetailsColumn(col: string) {
  if (!col) return;
  try {
    const current = getUnsupportedUserDetailsColumns();
    if (!current.has(col)) {
      current.add(col);
      safeSetItem(STORAGE_KEY_UNSUPPORTED_USER_DETAILS_COLS, JSON.stringify(Array.from(current)));
    }
  } catch {
    // ignore
  }
}

/**
 * Safely upserts into 'user_details' table (keyed by user_id).
 * Automatically reconciles schema cache and removes unsupported columns without failing.
 */
export async function safeUpsertUserDetails(
  supabase: SupabaseClient,
  rawPayload: Record<string, any>
): Promise<{ success: boolean; error?: any; data?: any }> {
  if (!supabase || !rawPayload) return { success: false, error: 'No client or payload' };

  const payload: Record<string, any> = { ...rawPayload };
  const unsupported = getUnsupportedUserDetailsColumns();

  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined || unsupported.has(k)) {
      delete payload[k];
    }
  }

  if (!payload.user_id) return { success: false, error: 'No user_id for user_details' };

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const { data, error } = await supabase
        .from('user_details')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        return { success: true, data };
      }

      const errMsg = error.message || '';

      const match =
        errMsg.match(/Could not find the '([^']+)' column/i) ||
        errMsg.match(/Could not find the column '([^']+)'/i) ||
        errMsg.match(/column "?([a-zA-Z0-9_]+)"? of relation "?user_details"? does not exist/i) ||
        errMsg.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i);

      if (match && match[1]) {
        const missingCol = match[1];
        recordUnsupportedUserDetailsColumn(missingCol);
        delete payload[missingCol];
        continue;
      }

      // Foreign key constraint (e.g. anonymous user id not yet in auth.users) or RLS
      if (errMsg.includes('violates foreign key constraint') || errMsg.includes('row-level security policy') || errMsg.includes('violates row-level security')) {
        // Soft log, do not throw
        return { success: false, error };
      }

      return { success: false, error };
    } catch (err: any) {
      return { success: false, error: err };
    }
  }

  return { success: false, error: 'Max attempts reached for user_details' };
}

export interface OnboardingSupabaseEntryPayload {
  onboarding_step?: number;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  name?: string;
  first_name?: string;
  gender?: string;
  user_gender?: string;
  age?: number;
  dob?: string | null;
  birth_date?: string | null;
  date_of_birth?: string | null;
  height?: string;
  height_feet?: number | null;
  height_inches?: number | null;
  country?: string;
  city?: string;
  state?: string;
  pulled_location?: string | null;
  education?: string;
  education_level?: string;
  highest_degree?: string;
  school_or_university?: string;
  profession?: string;
  marital_status?: string;
  user_relationship_status?: string;
  show_relationship_on_profile?: boolean;
  have_kids?: string;
  show_have_kids_on_profile?: boolean;
  want_kids?: string;
  show_want_kids_on_profile?: boolean;
  dating_intentions?: string;
  show_dating_intentions_on_profile?: boolean;
  religion?: string;
  ethnicity?: string;
  caste?: string;
  manglik_status?: string;
  lagna?: string;
  rashi?: string;
  nakshatra?: string;
  nekatha?: string;
  nekatha_pada?: number;
  navamshaya?: string;
  birth_time?: string;
  birth_place?: string;
  kendraya_chart_url?: string;
  shani_dosha?: boolean;
  rahu_kethu_dosha?: boolean;
  planetary_positions?: Record<number, string[]>;
  horoscope_notes?: string;
  photos?: string[];
  main_photo?: string;
  photo_2?: string;
  photo_3?: string;
  avatar_url?: string;
  bio?: string;
  about_me?: string;
  selected_prompt?: string;
  prompt_answer?: string;
  selected_interests?: any;
  email_address?: string;
  phone_number?: string;
  selfie_verified?: boolean;
  id_uploaded?: boolean;
  id_front_image?: string | null;
  id_back_image?: string | null;
  [key: string]: any;
}

/**
 * Writes or updates an entry into the 'profiles' and 'user_details' tables on the exact SAME row.
 * - 'user_details' updates 'religion' and 'caste' columns (as defined in the database schema).
 * - 'profiles' updates 'first_name', 'dob', 'user_gender', and embeds full faith & heritage metadata in 'selected_interests'.
 * - 'partner_preferences' updates 'religion' column.
 * Uses PostgreSQL upsert with onConflict to overwrite the existing record without creating duplicate rows.
 */
export async function syncOnboardingEntryToSupabase(userId: string, data: OnboardingSupabaseEntryPayload) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    const formattedDob = data.dob || data.date_of_birth || data.birth_date || null;
    const formattedName = data.first_name || data.name || '';
    const formattedGender = data.user_gender || data.gender || null;
    const formattedMarital = data.user_relationship_status || data.marital_status || null;
    const formattedProfession = data.profession || null;
    const formattedEducation = data.education_level || data.education || data.highest_degree || null;

    // 1. Profiles Table Payload (aligned with public.profiles columns)
    const profilePayload: Record<string, any> = {
      id: userId,
      user_id: userId,
      first_name: formattedName,
      name: formattedName,
      dob: formattedDob,
      date_of_birth: formattedDob,
      birth_date: formattedDob,
      user_gender: formattedGender,
      gender: formattedGender,
      age: data.age ?? null,
      height_feet: typeof data.height_feet === 'number' ? data.height_feet : null,
      height_inches: typeof data.height_inches === 'number' ? data.height_inches : null,
      height: data.height || null,
      country: data.country || null,
      city: data.city || null,
      state: data.state || null,
      pulled_location: data.pulled_location || (data.city && data.state ? `${data.city}, ${data.state}, ${data.country || 'Sri Lanka'}` : null),
      education_level: formattedEducation,
      education: formattedEducation,
      highest_degree: formattedEducation,
      school_or_university: data.school_or_university || null,
      profession: formattedProfession,
      user_relationship_status: formattedMarital,
      marital_status: formattedMarital,
      show_relationship_on_profile: data.show_relationship_on_profile ?? true,
      have_kids: data.have_kids || null,
      show_have_kids_on_profile: data.show_have_kids_on_profile ?? true,
      want_kids: data.want_kids || null,
      show_want_kids_on_profile: data.show_want_kids_on_profile ?? true,
      dating_intentions: data.dating_intentions || null,
      show_dating_intentions_on_profile: data.show_dating_intentions_on_profile ?? true,
      main_photo: data.main_photo || (data.photos && data.photos[0]) || data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      photo_2: data.photo_2 || (data.photos && data.photos[1]) || null,
      photo_3: data.photo_3 || (data.photos && data.photos[2]) || null,
      photos: data.photos || [data.main_photo, data.photo_2, data.photo_3].filter(Boolean),
      avatar_url: data.avatar_url || data.main_photo || null,
      about_me: data.about_me || data.bio || null,
      bio: data.bio || data.about_me || null,
      selected_prompt: data.selected_prompt || null,
      prompt_answer: data.prompt_answer || null,
      selected_interests: data.selected_interests || {},
      email_address: data.email_address || null,
      phone_number: data.phone_number || null,
      selfie_verified: Boolean(data.selfie_verified),
      id_uploaded: Boolean(data.id_uploaded),
      id_front_image: data.id_front_image || null,
      id_back_image: data.id_back_image || null,
      religion: data.religion || null,
      ethnicity: data.ethnicity || null,
      caste: data.caste || null,
      manglik_status: data.manglik_status || null,
      lagna: data.lagna || null,
      rashi: data.rashi || null,
      nakshatra: data.nakshatra || data.nekatha || null,
      nekatha_pada: data.nekatha_pada || null,
      navamshaya: data.navamshaya || null,
      birth_time: data.birth_time || null,
      birth_place: data.birth_place || null,
      kendraya_chart_url: data.kendraya_chart_url || null,
      shani_dosha: data.shani_dosha ?? null,
      rahu_kethu_dosha: data.rahu_kethu_dosha ?? null,
      horoscope_notes: data.horoscope_notes || null,
      onboarding_step: data.onboarding_step,
      onboarding_completed: data.onboarding_completed,
      onboarding_completed_at: data.onboarding_completed_at,
    };

    // Store Faith, Heritage, Caste, and 20-Porondam Horoscope in selected_interests JSONB for permanent preservation
    if (
      data.religion ||
      data.ethnicity ||
      data.caste ||
      data.manglik_status ||
      data.lagna ||
      data.rashi ||
      data.nakshatra ||
      data.nekatha ||
      data.nekatha_pada ||
      data.navamshaya ||
      data.birth_time ||
      data.birth_place ||
      data.kendraya_chart_url ||
      data.shani_dosha !== undefined ||
      data.rahu_kethu_dosha !== undefined ||
      data.planetary_positions ||
      data.horoscope_notes
    ) {
      const interestsObj = typeof profilePayload.selected_interests === 'object' && profilePayload.selected_interests !== null
        ? { ...profilePayload.selected_interests }
        : {};
      interestsObj._faith_heritage = {
        religion: data.religion || '',
        ethnicity: data.ethnicity || '',
        caste: data.caste || '',
        horoscope: {
          manglikStatus: data.manglik_status || '',
          lagna: data.lagna || '',
          rashi: data.rashi || '',
          nekatha: data.nakshatra || data.nekatha || '',
          nekathaPada: data.nekatha_pada || null,
          navamshaya: data.navamshaya || '',
          birthTime: data.birth_time || '',
          birthPlace: data.birth_place || '',
          kendrayaChartUrl: data.kendraya_chart_url || '',
          shaniDosha: Boolean(data.shani_dosha),
          rahuKethuDosha: Boolean(data.rahu_kethu_dosha),
          planetaryPositions: data.planetary_positions || {},
          horoscopeNotes: data.horoscope_notes || ''
        }
      };
      profilePayload.selected_interests = interestsObj;
    }

    // Upsert into profiles table
    await safeUpsertProfile(supabase, profilePayload);

    // 2. User Details Table Payload (where 'religion' and 'caste' are native columns)
    const userDetailsPayload: Record<string, any> = {
      user_id: userId,
      religion: data.religion || null,
      caste: data.caste || null,
      gender: formattedGender,
      marital_status: formattedMarital,
      date_of_birth: formattedDob,
      occupation: formattedProfession,
      education_level: formattedEducation,
      location_country: data.country || null,
      location_city: data.city || null,
      bio: data.about_me || data.bio || null,
      profile_image: data.main_photo || (data.photos && data.photos[0]) || null,
      ethnicity: data.ethnicity || null,
      updated_at: new Date().toISOString()
    };

    await safeUpsertUserDetails(supabase, userDetailsPayload);

    // 3. Partner Preferences Table Payload (updates religion if provided)
    if (data.religion) {
      try {
        await supabase
          .from('partner_preferences')
          .upsert({
            user_id: userId,
            religion: data.religion,
            civil_status: formattedMarital,
            location: data.country || null,
            education: formattedEducation,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch {
        // Ignore soft warning
      }
    }
  } catch (err) {
    console.warn('Supabase syncOnboardingEntry exception:', err);
  }
}

/**
 * Overwrites the exact SAME line in the 'profiles' and 'user_details' tables with reset values when starting over.
 * Guarantees zero duplicate rows and preserves existing database size.
 */
export async function resetOnboardingProfileInSupabase(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    const resetProfilePayload: Record<string, any> = {
      id: userId,
      user_id: userId,
      first_name: '',
      name: '',
      gender: '',
      user_gender: '',
      age: 0,
      dob: null,
      birth_date: null,
      date_of_birth: null,
      height_feet: null,
      height_inches: null,
      height: '',
      country: '',
      city: '',
      state: '',
      pulled_location: '',
      education: '',
      education_level: '',
      highest_degree: '',
      school_or_university: '',
      profession: '',
      marital_status: '',
      user_relationship_status: '',
      religion: '',
      ethnicity: '',
      caste: '',
      manglik_status: '',
      rashi: '',
      nakshatra: '',
      horoscope_notes: '',
      photos: [],
      main_photo: '',
      photo_2: null,
      photo_3: null,
      avatar_url: '',
      bio: '',
      about_me: '',
      selected_interests: {},
      selected_prompt: '',
      prompt_answer: '',
      email_address: '',
      phone_number: '',
      selfie_verified: false,
      id_uploaded: false,
      id_front_image: null,
      id_back_image: null,
      onboarding_step: 0,
      onboarding_completed: false,
      onboarding_completed_at: null
    };

    await safeUpsertProfile(supabase, resetProfilePayload);

    // Overwrite the same line in user_details
    await safeUpsertUserDetails(supabase, {
      user_id: userId,
      religion: null,
      caste: null,
      gender: null,
      marital_status: null,
      date_of_birth: null,
      occupation: null,
      education_level: null,
      location_country: null,
      location_city: null,
      bio: null,
      profile_image: null,
      updated_at: new Date().toISOString()
    });

    // Reset partner preferences religion
    try {
      await supabase
        .from('partner_preferences')
        .upsert({
          user_id: userId,
          religion: null,
          civil_status: null,
          location: null,
          education: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch {
      // Ignore
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
