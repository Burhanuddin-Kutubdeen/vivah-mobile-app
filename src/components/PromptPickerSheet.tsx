import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { PROMPT_OPTIONS, PromptOption } from '../data/promptOptions';

interface PromptPickerSheetProps {
  usedIds: string[];
  onSelect: (prompt: PromptOption) => void;
  onClose: () => void;
}

const CATEGORIES = ['ABOUT ME', 'FUN', 'LIFESTYLE'] as const;

export const PromptPickerSheet: React.FC<PromptPickerSheetProps> = ({ usedIds, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-[#5A5A40]/10">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2A2A2A]">Pick a prompt</h3>
              <p className="text-xs text-[#5A5A40] mt-0.5">Pick one to answer.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
              <X className="w-5 h-5 text-[#5A5A40]" />
            </button>
          </div>
        </div>

        {/* Categorized List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {CATEGORIES.map((cat) => {
            const catPrompts = PROMPT_OPTIONS.filter((p) => p.category === cat);
            return (
              <div key={cat} className="mb-5 last:mb-0">
                <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">{cat}</h4>
                <div className="space-y-1">
                  {catPrompts.map((prompt) => {
                    const isInUse = usedIds.includes(prompt.id);
                    return (
                      <button
                        key={prompt.id}
                        onClick={() => !isInUse && onSelect(prompt)}
                        disabled={isInUse}
                        className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-stone-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm text-[#2A2A2A] text-left">{prompt.text}</span>
                        {isInUse ? (
                          <span className="text-xs text-[#5A5A40]/50 font-medium">In use</span>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#5A5A40]/40 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
