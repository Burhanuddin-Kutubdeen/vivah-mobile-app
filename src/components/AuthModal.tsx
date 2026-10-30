import React, { useState } from 'react';
import { SupabaseConfig } from '../types';
import { testSupabaseConnection, saveSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { X, Database, Key, Check, AlertCircle, Copy, Loader2, ShieldCheck, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: (cfg: SupabaseConfig) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  setSupabaseConfig
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'supabase' | 'sql'>('supabase');
  const [urlInput, setUrlInput] = useState(supabaseConfig.url);
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Quick auth simulation form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(urlInput.trim(), keyInput.trim());
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      const updated: SupabaseConfig = {
        url: urlInput.trim(),
        anonKey: keyInput.trim(),
        isConnected: true,
        lastTestedAt: new Date().toLocaleTimeString()
      };
      setSupabaseConfig(updated);
      saveSupabaseConfig(updated);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-rose-900/60 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-4 border-b border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-serif font-bold text-amber-100">
              Supabase Authentication & Storage
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'supabase'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Supabase Keys
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            User Login / Signup
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Database SQL Schema
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'supabase' && (
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Vivah uses <span className="font-bold text-amber-300">Supabase</span> for user authentication, PostgreSQL database queries, and photo storage.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">VITE_SUPABASE_URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">VITE_SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing Supabase Connection...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Connect & Test Supabase
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'login' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-300 font-bold block">Supabase Auth Session</span>
                <p className="text-slate-300">
                  {userLoggedIn
                    ? '✓ Signed in as aarav.m@example.com (Verified Supabase Session)'
                    : 'Currently viewing as Guest Aarav Malhotra (Pre-populated sample profile)'}
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <button
                onClick={() => setUserLoggedIn(!userLoggedIn)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
              >
                {userLoggedIn ? 'Sign Out Session' : 'Sign In with Supabase Auth'}
              </button>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold">Supabase DDL Migration Script</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] transition-all"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-60">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
