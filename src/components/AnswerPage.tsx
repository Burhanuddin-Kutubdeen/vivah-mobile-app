import React, { useState, useCallback } from 'react';
import { ChevronLeft, Save, X } from 'lucide-react';

interface AnswerPageProps {
  prompt: string;
  answer: string;
  onSave: (answer: string) => void;
  onClose: () => void;
}

const MAX_CHARS = 200;

export const AnswerPage: React.FC<AnswerPageProps> = ({ prompt, answer, onSave, onClose }) => {
  const [text, setText] = useState(answer);

  const handleSave = useCallback(() => {
    if (text.trim()) {
      onSave(text);
      onClose();
    }
  }, [text, onSave, onClose]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Your answer</h2>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className={`p-2 font-bold text-sm transition-all ${
            text.trim() ? 'text-amber-600 hover:text-amber-700' : 'text-stone-300 cursor-not-allowed'
          }`}
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#2A2A2A]">{prompt}</h3>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your answer..."
            rows={8}
            maxLength={MAX_CHARS}
            className="w-full bg-white border border-[#5A5A40]/20 rounded-2xl p-4 text-sm text-[#2A2A2A] leading-relaxed focus:outline-none focus:border-[#5A5A40] resize-none"
          />
          <div className="absolute bottom-3 right-4 text-xs text-[#5A5A40]/60 font-mono">
            {text.length} / {MAX_CHARS}
          </div>
        </div>
      </div>

      {/* Toast */}
      {text.trim() && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#2A2A2A] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
          <span className="text-emerald-400">✓</span>
          <span>Ready to save</span>
          <button onClick={() => setText('')} className="ml-1 text-white/60 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
