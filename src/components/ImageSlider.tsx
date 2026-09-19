import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  alt = 'Dokumentasi Visual Berita',
  className = '',
  aspectRatio = 'video',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter gambar valid
  const validImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);

  if (validImages.length === 0) return null;

  // Jika hanya 1 gambar, tampilkan gambar tunggal dengan opsi perbesar
  if (validImages.length === 1) {
    return (
      <div className={`relative group overflow-hidden rounded-2xl bg-slate-900 ${className}`}>
        <img
          src={validImages[0]}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Perbesar Gambar"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={validImages[0]}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    );
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -80 : 80,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className={`relative group overflow-hidden rounded-2xl bg-slate-950 select-none ${className}`}>
      {/* Container Gambar Slider dengan Motion */}
      <div className={`relative w-full overflow-hidden ${
        aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'min-h-[260px] max-h-[500px]'
      }`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${alt} - Slide ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Gradient Overlay Lembut */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Badge Indikator Jumlah Foto */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {currentIndex + 1} / {validImages.length} Foto
          </span>
        </div>

        {/* Tombol Perbesar / Lightbox */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-90 group-hover:opacity-100 shadow-md"
          title="Buka Mode Layar Penuh"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Tombol Navigasi Sebelumnya & Berikutnya (Facebook Style) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-xl active:scale-95"
          title="Foto Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-xl active:scale-95"
          title="Foto Selanjutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indikator Dots di Bawah */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(i > currentIndex ? 'right' : 'left');
                setCurrentIndex(i);
              }}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-5 h-2 bg-blue-500 shadow-md shadow-blue-500/50'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Buka Foto ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl flex items-center justify-between pb-4 text-white">
            <span className="text-sm font-semibold">
              Foto {currentIndex + 1} dari {validImages.length}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
            <img
              src={validImages[currentIndex]}
              alt={`${alt} Fullscreen`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnail Bar di Modal Fullscreen */}
          <div className="flex items-center gap-2 mt-4 max-w-xl overflow-x-auto p-2">
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 'right' : 'left');
                  setCurrentIndex(i);
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === currentIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
