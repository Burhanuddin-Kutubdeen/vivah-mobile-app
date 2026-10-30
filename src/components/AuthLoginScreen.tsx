import React, { useState } from 'react';
import { 
  Heart, 
  Database, 
  Mail, 
  Lock, 
  User, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Key
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { toPascalCase } from '../lib/formatters';
import { 
  testSupabaseConnection, 
  saveSupabaseConfig, 
  signInWithSupabaseEmail, 
  signUpWithSupabaseEmail, 
  signInWithSupabaseGoogle 
} from '../lib/supabase';

interface AuthLoginScreenProps {
  onLoginSuccess: (userEmail?: string, userName?: string) => void;
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: (cfg: SupabaseConfig) => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({
  onLoginSuccess,
  supabaseConfig,
  setSupabaseConfig
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Supabase Configuration State
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [urlInput, setUrlInput] = useState(supabaseConfig.url);
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Auth Action State
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Test & Save Supabase Credentials
  const handleSaveSupabase = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setSupabaseMessage({ success: false, text: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }

    setTestingSupabase(true);
    setSupabaseMessage(null);

    const result = await testSupabaseConnection(urlInput.trim(), keyInput.trim());
    setTestingSupabase(false);

    if (result.success) {
      const updated: SupabaseConfig = {
        url: urlInput.trim(),
        anonKey: keyInput.trim(),
        isConnected: true,
        lastTestedAt: new Date().toLocaleTimeString()
      };
      setSupabaseConfig(updated);
      saveSupabaseConfig(updated);
      setSupabaseMessage({ success: true, text: 'Supabase connected successfully!' });
    } else {
      setSupabaseMessage({ success: false, text: result.message });
    }
  };

  // Submit Email / Password Auth
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (supabaseConfig.isConnected) {
      if (mode === 'login') {
        const res = await signInWithSupabaseEmail(email, password);
        setSubmitting(false);
        if (res.success) {
          setAuthSuccess('Welcome back!');
          setTimeout(() => onLoginSuccess(email, name ? toPascalCase(name) : 'User'), 800);
        } else {
          setAuthError(res.message);
        }
      } else {
        const res = await signUpWithSupabaseEmail(email, password, name ? toPascalCase(name) : 'New Member');
        setSubmitting(false);
        if (res.success) {
          setAuthSuccess('Account created successfully!');
          setTimeout(() => onLoginSuccess(email, name ? toPascalCase(name) : 'New Member'), 800);
        } else {
          setAuthError(res.message);
        }
      }
    } else {
      // Local / Offline mode fallback
      setTimeout(() => {
        setSubmitting(false);
        setAuthSuccess(mode === 'login' ? 'Logged in successfully!' : 'Account created!');
        setTimeout(() => onLoginSuccess(email, name ? toPascalCase(name) : (mode === 'login' ? 'User' : 'New Member')), 600);
      }, 500);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setAuthError(null);

    if (supabaseConfig.isConnected) {
      const res = await signInWithSupabaseGoogle();
      setSubmitting(false);
      if (!res.success) {
        setAuthError(res.message);
      }
    } else {
      // Demo Google Auth simulation
      setTimeout(() => {
        setSubmitting(false);
        setAuthSuccess('Signed in with Google!');
        setTimeout(() => onLoginSuccess('google.user@gmail.com', 'Google User'), 600);
      }, 600);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#f8f7f2] text-[#2A2A2A] flex flex-col justify-between overflow-y-auto animate-fadeIn font-sans p-5 sm:p-6">
      
      {/* Top Branding Bar */}
      <div className="flex items-center justify-center shrink-0 pb-4 border-b border-[#5A5A40]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
            V
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#5A5A40] tracking-tight">Vivah</span>
            <span className="text-[10px] block text-[#5A5A40]/70 uppercase tracking-widest font-sans font-semibold -mt-1">Matrimony</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="my-auto py-4 space-y-5 max-w-sm mx-auto w-full">
        
        {/* Welcome Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-6 h-6 text-[#5A5A40] fill-[#5A5A40]/20" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#2A2A2A]">
            {mode === 'login' ? 'Find Your Life Partner' : 'Begin Your Sacred Journey'}
          </h1>
          <p className="text-xs text-[#5A5A40]">
            {mode === 'login' 
              ? 'Sign in to explore verified matrimony profiles' 
              : 'Join India’s trusted marriage matrimony community'}
          </p>
        </div>

        {/* Toggle Mode Pills */}
        <div className="flex bg-[#5A5A40]/10 p-1 rounded-full text-xs font-bold text-[#5A5A40]">
          <button
            type="button"
            onClick={() => { setMode('login'); setAuthError(null); }}
            className={`flex-1 py-1.5 rounded-full transition-all ${
              mode === 'login' ? 'bg-white text-[#2A2A2A] shadow-xs' : 'hover:text-[#2A2A2A]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setAuthError(null); }}
            className={`flex-1 py-1.5 rounded-full transition-all ${
              mode === 'signup' ? 'bg-white text-[#2A2A2A] shadow-xs' : 'hover:text-[#2A2A2A]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Collapsible Supabase Settings Box */}
        {showSupabaseConfig && (
          <div className="bg-white p-4 rounded-xl border border-[#5A5A40]/20 shadow-xs space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-[#5A5A40]/10">
              <span className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                Supabase Backend Auth
              </span>
              <button 
                onClick={() => setShowSupabaseConfig(false)}
                className="text-[10px] text-[#5A5A40]/70 hover:text-[#2A2A2A]"
              >
                Close
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A5A40] block mb-1">Supabase URL</label>
              <input
                type="text"
                placeholder="https://xyz.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#f8f7f2] border border-[#5A5A40]/20 rounded-lg p-2 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A5A40] block mb-1">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-[#f8f7f2] border border-[#5A5A40]/20 rounded-lg p-2 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            {supabaseMessage && (
              <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                supabaseMessage.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {supabaseMessage.success ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{supabaseMessage.text}</span>
              </div>
            )}

            <button
              onClick={handleSaveSupabase}
              disabled={testingSupabase}
              className="w-full py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {testingSupabase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Test & Connect Supabase</span>
            </button>
          </div>
        )}

        {/* Email & Password Auth Form */}
        <form onSubmit={handleSubmitAuth} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-[#5A5A40] block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5A5A40]/50 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#5A5A40]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#5A5A40] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5A5A40]/50 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#5A5A40]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#5A5A40] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5A5A40]/50 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#5A5A40]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2A2A2A] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>
          </div>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] flex items-center gap-2 animate-fadeIn font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In to Account' : 'Create New Account'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>



        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#5A5A40]/25 text-[#2A2A2A] rounded-full font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-98"
        >
          {/* Colorful Google SVG Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Privacy Policy & Terms Modal Dialogs */}
      </div>

      {/* Footer Disclaimer with Links */}
      <div className="text-center text-[10px] text-[#5A5A40]/80 shrink-0 pt-2.5 border-t border-[#5A5A40]/10">
        By continuing, you agree to Vivah Matrimony{' '}
        <a 
          href="#privacy" 
          onClick={(e) => {
            e.preventDefault();
            alert("Vivah Matrimony Privacy Policy:\n\n1. All profile data is encrypted in transit and at rest.\n2. Contact details are hidden until mutual express of interest.\n3. Government ID verification status is kept strictly confidential.");
          }}
          className="font-bold underline text-[#5A5A40] hover:text-[#2A2A2A] transition-colors"
        >
          Privacy Policy
        </a>
        {' '}&amp;{' '}
        <a 
          href="#terms" 
          onClick={(e) => {
            e.preventDefault();
            alert("Vivah Matrimony Terms of Service:\n\n1. Only verified profiles intended for genuine marriage matching are allowed.\n2. Respectful communication and consent-based chatting rules apply.\n3. Unsolicited commercial use or impersonation leads to instant account termination.");
          }}
          className="font-bold underline text-[#5A5A40] hover:text-[#2A2A2A] transition-colors"
        >
          Terms of Service
        </a>.
      </div>
    </div>
  );
};
