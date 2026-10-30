import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Check, X } from 'lucide-react';
import { PromptOption, PROMPT_OPTIONS } from '../data/promptOptions';
import { PromptPickerSheet } from './PromptPickerSheet';
import { AnswerPage } from './AnswerPage';

interface PromptSlot {
  promptId: string;
  promptText: string;
  answer: string;
}

interface WrittenPromptPageProps {
  prompts: { question: string; answer: string }[];
  onSave: (prompts: { question: string; answer: string }[]) => void;
  onClose: () => void;
}

export const WrittenPromptPage: React.FC<WrittenPromptPageProps> = ({ prompts, onSave, onClose }) => {
  const [slots, setSlots] = useState<PromptSlot[]>(() =>
    prompts.slice(0, 3).map((p) => {
      const opt = PROMPT_OPTIONS.find((o) => o.text === p.question);
      return {
        promptId: opt?.id || `custom-${p.question}`,
        promptText: p.question,
        answer: p.answer,
      };
    })
  );

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTargetIdx, setPickerTargetIdx] = useState<number | null>(null);
  const [answerSlotIdx, setAnswerSlotIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const usedIds = slots.filter((s) => s.promptId).map((s) => s.promptId);

  const handleSelectPrompt = useCallback(
    (prompt: PromptOption) => {
      if (pickerTargetIdx !== null) {
        const updated = [...slots];
        if (updated[pickerTargetIdx]) {
          updated[pickerTargetIdx] = { promptId: prompt.id, promptText: prompt.text, answer: '' };
        } else {
          updated.push({ promptId: prompt.id, promptText: prompt.text, answer: '' });
        }
        setSlots(updated);
      }
      setShowPicker(false);
      setPickerTargetIdx(null);
      // Open answer page for the selected prompt
      setAnswerSlotIdx(pickerTargetIdx ?? slots.length);
    },
    [pickerTargetIdx, slots]
  );

  const handleSaveAnswer = useCallback(
    (answer: string, idx: number) => {
      const updated = [...slots];
      if (updated[idx]) {
        updated[idx].answer = answer;
      } else {
        // shouldn't happen but safety
      }
      setSlots(updated);
      setAnswerSlotIdx(null);

      setToast('Prompt saved');
      setTimeout(() => setToast(null), 2500);
    },
    [slots]
  );

  const handleSaveAll = useCallback(() => {
    const result = slots
      .filter((s) => s.promptText && s.answer)
      .map((s) => ({ question: s.promptText, answer: s.answer }));
    onSave(result);
    onClose();
  }, [slots, onSave, onClose]);

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== targetIdx && slots[dragIdx]?.promptText && slots[targetIdx]?.promptText) {
      const updated = [...slots];
      const temp = updated[dragIdx];
      updated[dragIdx] = updated[targetIdx];
      updated[targetIdx] = temp;
      setSlots(updated);
      setDragIdx(targetIdx);
    }
  };

  const handleSlotClick = (idx: number) => {
    if (slots[idx]?.promptText) {
      // Has a prompt, open answer
      setAnswerSlotIdx(idx);
    } else {
      // Empty slot, open picker
      setPickerTargetIdx(idx);
      setShowPicker(true);
    }
  };

  if (answerSlotIdx !== null && slots[answerSlotIdx]) {
    return (
      <AnswerPage
        prompt={slots[answerSlotIdx].promptText}
        answer={slots[answerSlotIdx].answer}
        onSave={(answer) => handleSaveAnswer(answer, answerSlotIdx)}
        onClose={() => setAnswerSlotIdx(null)}
      />
    );
  }

  const filledSlots = slots.filter((s) => s.promptText);
  const emptySlotsCount = Math.max(3 - slots.length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Written Prompt</h2>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Instructions */}
        <div className="space-y-2">
          <p className="text-sm text-[#5A5A40] leading-relaxed">
            Prompts help you share more about yourself and what you're looking for.
          </p>
          <p className="text-sm text-[#5A5A40] leading-relaxed">
            By using prompts, you can show off your personality and make it easier for others to start a conversation with you.
          </p>
          <p className="text-sm text-[#5A5A40] font-medium">So, have fun with it and be yourself!</p>
        </div>

        {/* Prompt Slots */}
        <div className="space-y-3">
          {/* Filled Slots */}
          {filledSlots.map((slot, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#5A5A40]/15 rounded-2xl p-4 relative cursor-pointer hover:bg-stone-50 transition-all"
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragEnd={() => setDragIdx(null)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => {
                e.preventDefault();
                setDragIdx(null);
              }}
              onClick={() => handleSlotClick(idx)}
            >
              <p className="text-xs font-bold text-amber-600 mb-1">{slot.promptText}</p>
              <p className="text-sm text-[#2A2A2A]">{slot.answer || 'Tap to add your answer...'}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAnswerSlotIdx(idx);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center"
              >
                <Pencil className="w-3.5 h-3.5 text-[#5A5A40]" />
              </button>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <button
              key={`empty-${idx}`}
              onClick={() => {
                setPickerTargetIdx(filledSlots.length + idx);
                setShowPicker(true);
              }}
              className="w-full bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-stone-100 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-[#5A5A40] font-medium">Add a prompt</span>
            </button>
          ))}
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-[#5A5A40]/60">Tap a prompt to replace · long-press to reorder</p>
      </div>

      {/* Save Button */}
      <div className="p-4 bg-white border-t border-[#5A5A40]/15 shrink-0">
        <button
          onClick={handleSaveAll}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-sm transition-all shadow-md"
        >
          Save
        </button>
      </div>

      {/* Prompt Picker Sheet */}
      {showPicker && (
        <PromptPickerSheet
          usedIds={usedIds}
          onSelect={handleSelectPrompt}
          onClose={() => {
            setShowPicker(false);
            setPickerTargetIdx(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-[#2A2A2A] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-1 text-white/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
