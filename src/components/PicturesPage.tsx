import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, Pencil, Plus, Camera, X, ClipboardList, ImagePlus } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface PicturesPageProps {
  photos: string[];
  setPhotos: (photos: string[]) => void;
  onClose: () => void;
}

export const PicturesPage: React.FC<PicturesPageProps> = ({ photos, setPhotos, onClose }) => {
  const [showSheet, setShowSheet] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePickPhoto = useCallback(async () => {
    try {
      const image = await CapCamera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90,
      });
      if (image.webPath !== undefined) {
        const updated = [...photos];
        if (activePhotoIdx !== null) {
          updated[activePhotoIdx] = image.webPath;
        } else {
          updated.push(image.webPath);
        }
        setPhotos(updated);
      }
    } catch {
      // User canceled
    }
    setShowSheet(false);
    setActivePhotoIdx(null);
  }, [photos, setPhotos, activePhotoIdx]);

  const openPhotoOptions = (idx: number | null) => {
    setActivePhotoIdx(idx);
    setShowSheet(true);
  };

  const handleLongPressStart = (idx: number) => {
    longPressTimer.current = setTimeout(() => {
      setDragIdx(idx);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setDragIdx(null);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== targetIdx) {
      const updated = [...photos];
      const [dragged] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, dragged);
      setPhotos(updated);
      setDragIdx(targetIdx);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleLongPressEnd();
  };

  const mainPhoto = photos[0] || '';
  const secondaryPhoto = photos[1] || '';
  const hasAddSlot = photos.length < 2;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#5A5A40]/15 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
          <ChevronLeft className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Pictures</h2>
        <div className="w-10" />
      </div>

      {/* Guidelines Pill */}
      <div className="flex justify-center pt-4 shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-400 bg-amber-50">
          <ClipboardList className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">IMPORTANT — Content Guidelines</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {/* Column 1: Main Photo */}
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#5A5A40]/20">
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt="Main"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                draggable
                onDragStart={() => setDragIdx(0)}
                onDragEnd={handleLongPressEnd}
                onDragOver={(e) => handleDragOver(e, 0)}
                onDrop={handleDrop}
              />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                <ImagePlus className="w-10 h-10 text-stone-400" />
              </div>
            )}
            {/* Main Badge */}
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-black rounded-full">
              <span className="text-[10px] font-bold text-white uppercase tracking-wide">Main</span>
            </div>
            {/* Edit Icon */}
            <button
              onClick={() => openPhotoOptions(0)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
            >
              <Pencil className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            {/* Secondary Photo */}
            {secondaryPhoto ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#5A5A40]/15">
                <img
                  src={secondaryPhoto}
                  alt="Secondary"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  draggable
                  onDragStart={() => setDragIdx(1)}
                  onDragEnd={handleLongPressEnd}
                  onDragOver={(e) => handleDragOver(e, 1)}
                  onDrop={handleDrop}
                />
                {/* Edit Icon */}
                <button
                  onClick={() => openPhotoOptions(1)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <Pencil className="w-4 h-4 text-black" />
                </button>
              </div>
            ) : null}

            {/* Add Photo Slot */}
            {hasAddSlot && (
              <button
                onClick={() => openPhotoOptions(null)}
                className="aspect-square rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center hover:bg-stone-200 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-[#5A5A40]/60 mt-6">
          Tap a photo to replace · long-press to reorder
        </p>
      </div>

      {/* Bottom Continue Button */}
      <div className="p-4 bg-white border-t border-[#5A5A40]/15 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"
        >
          Continue
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      {showSheet && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={() => setShowSheet(false)}>
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto" />
            <button
              onClick={handlePickPhoto}
              className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-stone-50 transition-all"
            >
              <Camera className="w-6 h-6 text-[#5A5A40]" />
              <span className="text-sm font-semibold text-[#2A2A2A]">Replace photo</span>
            </button>
            <button
              onClick={() => setShowSheet(false)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-stone-50 transition-all"
            >
              <X className="w-6 h-6 text-[#5A5A40]" />
              <span className="text-sm font-semibold text-[#2A2A2A]">Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
