import { useState, useCallback, useEffect } from 'react';

interface CreditState {
  credits: number;
  resetTimestamp: number; // Unix timestamp when credits reset
  maxCredits: number;
  timeUntilReset: string; // Formatted countdown string
}

const STORAGE_KEY = 'vivah_daily_credits_v1';
const MAX_CREDITS = 5;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadCredits(): { credits: number; resetTimestamp: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { credits: MAX_CREDITS, resetTimestamp: Date.now() + RESET_INTERVAL_MS };
    
    const parsed = JSON.parse(raw);
    // Check if the reset time has passed
    if (Date.now() >= parsed.resetTimestamp) {
      // Reset credits
      const newReset = Date.now() + RESET_INTERVAL_MS;
      const fresh = { credits: MAX_CREDITS, resetTimestamp: newReset };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { credits: MAX_CREDITS, resetTimestamp: Date.now() + RESET_INTERVAL_MS };
  }
}

function saveCredits(credits: number, resetTimestamp: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ credits, resetTimestamp }));
  } catch {
    // Ignore storage errors
  }
}

function formatTimeUntilReset(resetTimestamp: number): string {
  const diff = resetTimestamp - Date.now();
  if (diff <= 0) return 'Refreshing now...';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export function useDailyCredits(): CreditState & {
  spendCredit: () => boolean;
  resetCredits: () => void;
} {
  const [credits, setCredits] = useState(MAX_CREDITS);
  const [resetTimestamp, setResetTimestamp] = useState(Date.now() + RESET_INTERVAL_MS);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Initialize from storage
  useEffect(() => {
    const initial = loadCredits();
    setCredits(initial.credits);
    setResetTimestamp(initial.resetTimestamp);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= resetTimestamp) {
        // Time to reset
        const newReset = now + RESET_INTERVAL_MS;
        setCredits(MAX_CREDITS);
        setResetTimestamp(newReset);
        saveCredits(MAX_CREDITS, newReset);
      }
      setTimeUntilReset(formatTimeUntilReset(resetTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTimestamp]);

  const spendCredit = useCallback((): boolean => {
    if (credits <= 0) return false;
    const newCredits = credits - 1;
    setCredits(newCredits);
    saveCredits(newCredits, resetTimestamp);
    return true;
  }, [credits, resetTimestamp]);

  const resetCredits = useCallback(() => {
    const newReset = Date.now() + RESET_INTERVAL_MS;
    setCredits(MAX_CREDITS);
    setResetTimestamp(newReset);
    saveCredits(MAX_CREDITS, newReset);
  }, []);

  return {
    credits,
    resetTimestamp,
    maxCredits: MAX_CREDITS,
    timeUntilReset,
    spendCredit,
    resetCredits,
  };
}
