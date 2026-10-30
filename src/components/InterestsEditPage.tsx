import React, { useState, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';

interface InterestCategory {
  name: string;
  items: { emoji: string; label: string }[];
}

const CATEGORIES: InterestCategory[] = [
  {
    name: 'Sports',
    items: [
      { emoji: '🏸', label: 'Badminton' },
      { emoji: '🎾', label: 'Tennis' },
      { emoji: '🏏', label: 'Cricket' },
      { emoji: '🚴', label: 'Cycling' },
      { emoji: '🏃', label: 'Running' },
      { emoji: '🏋️', label: 'Gym' },
      { emoji: '🥒', label: 'Pickleball' },
      { emoji: '⚽', label: 'Soccer' },
      { emoji: '🏓', label: 'Padel' },
      { emoji: '🏊', label: 'Swimming' },
      { emoji: '🏀', label: 'Basketball' },
      { emoji: '🧘', label: 'Yoga' },
      { emoji: '🏎️', label: 'F1 Racing' },
    ],
  },
  {
    name: 'Going Out',
    items: [
      { emoji: '🥾', label: 'Hiking' },
      { emoji: '⛺', label: 'Camping' },
      { emoji: '🚗', label: 'Road Trips' },
      { emoji: '🏖️', label: 'Beaches' },
      { emoji: '⛰️', label: 'Mountains' },
      { emoji: '🏙️', label: 'Exploring Cities' },
      { emoji: '🎤', label: 'Concerts' },
      { emoji: '🍽️', label: 'Restaurants' },
      { emoji: '🛣️', label: 'Long Drives' },
      { emoji: '🛍️', label: 'Shopping' },
      { emoji: '🏛️', label: 'Museums' },
      { emoji: '🧺', label: 'Picnics' },
    ],
  },
  {
    name: 'Staying In',
    items: [
      { emoji: '🎲', label: 'Board Games' },
      { emoji: '🧁', label: 'Baking' },
      { emoji: '🎧', label: 'Podcasts' },
      { emoji: '🍳', label: 'Cooking' },
      { emoji: '📚', label: 'Reading' },
      { emoji: '🎬', label: 'Movies' },
      { emoji: '🎮', label: 'Video Games' },
      { emoji: '🎨', label: 'Creativity' },
      { emoji: '👨‍👩‍👧‍👦', label: 'Family Time' },
    ],
  },
  {
    name: 'Food & Cuisine',
    items: [
      { emoji: '🥡', label: 'Chinese' },
      { emoji: '🍜', label: 'Thai' },
      { emoji: '🌮', label: 'Street Food' },
      { emoji: '☕', label: 'Chai' },
      { emoji: '🍖', label: 'BBQ' },
      { emoji: '🍝', label: 'Italian' },
      { emoji: '🍣', label: 'Japanese' },
      { emoji: '🇰🇷', label: 'Korean' },
      { emoji: '🌯', label: 'Mexican' },
      { emoji: '🧆', label: 'Middle Eastern' },
    ],
  },
  {
    name: 'Film and TV',
    items: [
      { emoji: '💥', label: 'Action and Adventure' },
      { emoji: '🎨', label: 'Animation' },
      { emoji: '🎬', label: 'Bollywood' },
      { emoji: '😂', label: 'Comedy' },
      { emoji: '🎭', label: 'Drama' },
      { emoji: '🇹🇷', label: 'Turkish Dramas' },
      { emoji: '🇰🇷', label: 'K-Dramas' },
      { emoji: '💕', label: 'Rom-Com' },
      { emoji: '👻', label: 'Horror' },
      { emoji: '🔍', label: 'Thriller' },
      { emoji: '📹', label: 'Documentaries' },
      { emoji: '🚀', label: 'Sci-Fi' },
    ],
  },
  {
    name: 'Reading',
    items: [
      { emoji: '💻', label: 'Tech' },
      { emoji: '💬', label: 'Comics' },
      { emoji: '🔎', label: 'Mystery' },
      { emoji: '❤️', label: 'Romance' },
      { emoji: '📖', label: 'Fiction' },
      { emoji: '📕', label: 'Non-Fiction' },
      { emoji: '🌱', label: 'Self-Improvement' },
      { emoji: '📜', label: 'History' },
      { emoji: '✍️', label: 'Poetry' },
    ],
  },
  {
    name: 'Culture & Values',
    items: [
      { emoji: '🌍', label: 'Travel' },
      { emoji: '🎭', label: 'Arts & Culture' },
      { emoji: '📖', label: 'Learning' },
      { emoji: '🤝', label: 'Volunteering' },
      { emoji: '👨‍👩‍👧‍👦', label: 'Family Time' },
      { emoji: '🕌', label: 'Spirituality' },
      { emoji: '🌱', label: 'Mindfulness' },
      { emoji: '🎵', label: 'Music' },
      { emoji: '💃', label: 'Dance' },
      { emoji: '📸', label: 'Photography' },
      { emoji: '🗣️', label: 'Languages' },
      { emoji: '🏠', label: 'Home & Decor' },
      { emoji: '🧘', label: 'Wellness' },
      { emoji: '🌟', label: 'Personal Growth' },
    ],
  },
];

const MAX_PER_SECTION = 3;
const MIN_TOTAL = 6;

interface InterestsEditPageProps {
  selected: string[];
  onSave: (interests: string[]) => void;
  onClose: () => void;
}

export const InterestsEditPage: React.FC<InterestsEditPageProps> = ({ selected, onSave, onClose }) => {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(selected));
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleInterest = (label: string, categoryItems: string[]) => {
    const next = new Set(selectedInterests);
    if (next.has(label)) {
      next.delete(label);
    } else {
      // Check section limit
      const sectionCount = categoryItems.filter((item) => next.has(item)).length;
      if (sectionCount >= MAX_PER_SECTION) {
        showToast(`Maximum ${MAX_PER_SECTION} interests per section`);
        return;
      }
      next.add(label);
    }
    setSelectedInterests(next);
  };

  const handleContinue = useCallback(() => {
    onSave(Array.from(selectedInterests));
    onClose();
  }, [selectedInterests, onSave, onClose]);

  const totalSelected = selectedInterests.size;
  const canContinue = totalSelected >= MIN_TOTAL;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Interests</h2>
        <div className="w-10" />
      </div>

      {/* Instruction Text */}
      <div className="text-center py-3 shrink-0 bg-white border-b border-[#5A5A40]/10">
        <p className="text-sm text-[#5A5A40]">Choose up to 3 interests per section</p>
        <p className="text-xs text-[#5A5A40]/70 mt-0.5">(Select at least {MIN_TOTAL} total)</p>
      </div>

      {/* Scrollable Categories */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
        {CATEGORIES.map((cat) => {
          const catLabels = cat.items.map((i) => i.label);
          return (
            <div key={cat.name} className="space-y-3">
              <h3 className="text-sm font-bold text-[#2A2A2A] text-center uppercase tracking-wider">{cat.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {cat.items.map((item) => {
                  const isSelected = selectedInterests.has(item.label);
                  return (
                    <button
                      key={item.label}
                      onClick={() => toggleInterest(item.label, catLabels)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all border ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                          : 'bg-white border-stone-200 text-[#2A2A2A] shadow-xs hover:border-stone-300'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-[#2A2A2A] text-white text-xs px-4 py-2 rounded-full shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Continue Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#5A5A40]/15 shrink-0">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-3.5 font-bold rounded-full text-sm transition-all shadow-md ${
            canContinue
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Continue ({totalSelected}/{MIN_TOTAL} selected)
        </button>
      </div>
    </div>
  );
};
