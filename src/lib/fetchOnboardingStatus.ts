import { getSupabaseClient } from './supabase';

interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_step: number;
  answers?: any; // Placeholder for step-specific answers
}

export async function fetchOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_step')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Error fetching onboarding status:', error);
      return null;
    }

    return {
      onboarding_completed: data.onboarding_completed || false,
      onboarding_step: data.onboarding_step || 0,
    };
  } catch (err) {
    console.warn('Failed to fetch onboarding status:', err);
    return null;
  }
}

// Helper to fetch answers for a specific step
// (To be implemented based on actual step data structure)
export async function fetchOnboardingAnswers(userId: string, step: number): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Placeholder: Fetch step-specific answers from Supabase
    // This will be expanded based on actual data structure
    const { data, error } = await supabase
      .from('profiles')
      .select(`*
        ${step === 2 ? 'name' : ''}
        ${step === 3 ? 'age, dob' : ''}
        ${step === 4 ? 'gender' : ''}
        ${step === 5 ? 'height' : ''}
        ${step === 6 ? 'country, pulled_location' : ''}
        ${step === 7 ? 'education, school_or_university, profession' : ''}
        ${step === 8 ? 'marital_status, relationship_status, have_kids, want_kids, dating_intentions' : ''}
        ${step === 9 ? 'photos' : ''}
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Error fetching onboarding answers:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Failed to fetch onboarding answers:', err);
    return null;
  }
}