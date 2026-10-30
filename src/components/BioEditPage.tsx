import React, { useState, useCallback } from 'react';
import { ChevronLeft, ClipboardList } from 'lucide-react';
import { CandidateProfile } from '../types';

interface BioEditPageProps {
  bio: string;
  onSave: (bio: string) => void;
  onClose: () => void;
}

const MAX_CHARS = 750;
const PLACEHOLDER = "eg. Hey, I'm [Name]! I'm a [profession/hobby] who loves to [activity]. I'm looking for someone who shares similar interests and values. I value honesty, humor, and kindness. Let's grab a coffee and see where things go!";

export const BioEditPage: React.FC<BioEditPageProps> = ({ bio, onSave, onClose }) => {
  const [text, setText] = useState(bio);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setText(val);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate brief save delay
    await new Promise((r) => setTimeout(r, 400));
    onSave(text);
    setSaving(false);
    onClose();
  }, [text, onSave, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Bio</h2>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Instruction Text */}
        <p className="text-sm text-[#5A5A40] leading-relaxed">
          Describe yourself, your personality, or what type of person you're looking for.
        </p>

        {/* Guidelines Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-400 bg-amber-50">
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">IMPORTANT — Content Guidelines</span>
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={handleChange}
            placeholder={PLACEHOLDER}
            rows={10}
            maxLength={MAX_CHARS}
            className="w-full bg-white border border-[#5A5A40]/20 rounded-2xl p-4 text-sm text-[#2A2A2A] leading-relaxed focus:outline-none focus:border-[#5A5A40] resize-none"
          />
          {/* Character Counter */}
          <div className="absolute bottom-3 right-4 text-xs text-[#5A5A40]/60 font-mono">
            {text.length}/{MAX_CHARS}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 bg-white border-t border-[#5A5A40]/15 shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-full text-sm transition-all shadow-md"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};
