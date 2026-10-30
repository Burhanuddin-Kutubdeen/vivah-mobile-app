import React from 'react';
import { FilterState, MaritalStatus } from '../types';
import { X, RotateCcw, Check, Sliders, ShieldCheck } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
}

const RELIGIONS = ['Buddhist', 'Hindu', 'Muslim', 'Christian'];
const MARITAL_STATUSES: MaritalStatus[] = ['Never Married', 'Divorced', 'Widowed'];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onResetFilters
}) => {
  if (!isOpen) return null;

  const toggleArrayFilter = (key: 'religions' | 'maritalStatuses', value: any) => {
    setFilters((prev) => {
      const exists = (prev[key] as any[]).includes(value);
      const updated = exists
        ? (prev[key] as any[]).filter((item) => item !== value)
        : [...(prev[key] as any[]), value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#f5f5f0] text-[#2A2A2A] h-full w-full flex flex-col animate-fadeIn overflow-hidden">
      <div className="w-full h-full flex flex-col bg-[#f5f5f0] overflow-hidden">
        {/* Header - Natural Tones Theme */}
        <div className="bg-white px-4 py-3.5 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#5A5A40]" />
            <h2 className="text-lg font-serif font-bold text-[#5A5A40]">Filter Preferences</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="text-xs font-sans text-[#5A5A40] hover:text-[#2A2A2A] flex items-center gap-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 border border-[#5A5A40]/20 px-3 py-1.5 rounded-full transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#5A5A40]" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5A5A40] hover:bg-[#5A5A40]/10 rounded-full transition-colors"
              title="Close Filters"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter Scrollable Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-5 text-sm font-sans">
          {/* Gender Filter */}
          <div>
            <label className="block text-[#2A2A2A] font-bold mb-2 font-sans text-base">Looking For</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Female', 'Male'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters((p) => ({ ...p, gender: g }))}
                  className={`py-3 px-4 rounded-xl border text-center font-sans font-medium transition-all text-sm ${
                    filters.gender === g
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-bold shadow-xs'
                      : 'bg-white text-[#2A2A2A] border-[#5A5A40]/15 hover:bg-stone-50'
                  }`}
                >
                  {g === 'Female' ? 'Bride' : 'Groom'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="bg-white p-4 border border-[#5A5A40]/15 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-center pb-1">
              <label className="text-[#2A2A2A] font-bold font-sans text-base">Age Range</label>
              <span className="text-sm font-bold font-sans text-[#5A5A40] bg-[#5A5A40]/10 border border-[#5A5A40]/20 px-3 py-1.5 rounded-full">
                {filters.ageMin} - {filters.ageMax >= 80 ? '80+' : filters.ageMax} Years
              </span>
            </div>

            {/* SINGLE DUAL-THUMB SLIDER TRACK */}
            <div className="relative w-full h-8 flex items-center select-none pt-1">
              {/* Single Shared Track Background */}
              <div className="absolute w-full h-2 bg-[#5A5A40]/15 rounded-full overflow-hidden">
                {/* Highlighted active range between min and max age */}
                <div
                  className="absolute h-full bg-[#5A5A40] rounded-full"
                  style={{
                    left: `${((filters.ageMin - 18) / (80 - 18)) * 100}%`,
                    width: `${((filters.ageMax - filters.ageMin) / (80 - 18)) * 100}%`,
                  }}
                />
              </div>

              {/* Min Age Thumb */}
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageMin}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, ageMin: Math.min(Number(e.target.value), p.ageMax - 1) }))
                }
                className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5A5A40] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5A5A40] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md z-10 cursor-pointer"
              />

              {/* Max Age Thumb */}
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageMax}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, ageMax: Math.max(Number(e.target.value), p.ageMin + 1) }))
                }
                className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5A5A40] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5A5A40] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md z-20 cursor-pointer"
              />
            </div>
          </div>

          {/* Religion */}
          <div>
            <label className="block text-[#2A2A2A] font-bold mb-2 font-sans text-base">Religion</label>
            <div className="flex flex-wrap gap-2">
              {RELIGIONS.map((rel) => {
                const isSelected = filters.religions.includes(rel);
                return (
                  <button
                    key={rel}
                    onClick={() => toggleArrayFilter('religions', rel)}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 font-sans text-sm ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-semibold shadow-2xs'
                        : 'bg-white text-[#5A5A40] border-[#5A5A40]/20 hover:border-[#5A5A40]/40'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                    <span>{rel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-[#2A2A2A] font-bold mb-2 font-sans text-base">Marital Status</label>
            <div className="flex flex-wrap gap-2">
              {MARITAL_STATUSES.map((status) => {
                const isSelected = filters.maritalStatuses.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleArrayFilter('maritalStatuses', status)}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 font-sans text-sm ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-semibold shadow-2xs'
                        : 'bg-white text-[#5A5A40] border-[#5A5A40]/20 hover:border-[#5A5A40]/40'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                    <span>{status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified Checkbox */}
          <div className="pt-2 border-t border-[#5A5A40]/15">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))}
                className="w-5 h-5 rounded border-[#5A5A40]/30 accent-[#5A5A40]"
              />
              <span className="font-medium text-[#2A2A2A] font-sans flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
                Show Verified Profiles Only
              </span>
            </label>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 bg-white border-t border-[#5A5A40]/15">
          <button
            onClick={onClose}
            className="w-full bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-sans text-sm uppercase tracking-widest font-bold py-3.5 rounded-full transition-all shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
