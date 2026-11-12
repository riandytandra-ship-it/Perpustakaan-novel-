import React from 'react';
import { Search, BookOpen, Bookmark, Star, Sparkles, Feather } from 'lucide-react';
import { NovelStatus } from '../types/novel';

interface NovelHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  totalNovels: number;
  completedNovels: number;
  currentlyReading: number;
  originalWorksCount: number;
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Semua Koleksi' },
  { key: 'currently_reading', label: 'Sedang Dibaca' },
  { key: 'completed', label: 'Selesai Dibaca' },
  { key: 'favorite', label: 'Koleksi Favorit' },
  { key: 'writing_draft', label: 'Naskah Sendiri' },
  { key: 'want_to_read', label: 'Daftar Impian' },
];

const GENRES = [
  'Semua Genre',
  'Fantasi & Magis',
  'Misteri & Thriller',
  'Sastra Nusantara',
  'Romansa & Drama',
  'Fiksi Ilmiah & Distopia',
  'Sejarah & Epik',
];

export const NovelHero: React.FC<NovelHeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedGenre,
  onGenreChange,
  totalNovels,
  completedNovels,
  currentlyReading,
  originalWorksCount,
}) => {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Visual Nook Backing */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_novel_reading_nook_1793876921517.jpg"
            alt="Ruang Baca Novel Pribadi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-90 dark:brightness-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-black/25 dark:from-neutral-900 dark:via-neutral-900/85 dark:to-neutral-950/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-8 sm:pt-16 sm:pb-10 text-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-800 dark:text-amber-300 font-mono">
            Sudut Baca & Koleksi Fiksi
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
            Perpustakaan Novel Pribadi
          </h1>
          <p className="mt-2.5 max-w-2xl mx-auto text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
            Tempat menyimpan novel favorit, merawat naskah cerita buatan sendiri, melacak
            kemajuan membaca bab demi bab, serta mengabadikan kutipan berkesan.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Cari judul novel, nama pengarang, genre, atau kalimat kutipan..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-neutral-300 dark:border-neutral-700 rounded-xl outline-hidden focus:border-neutral-900 dark:focus:border-neutral-300 transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Status Filter Segmented Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {STATUS_FILTERS.map((s) => {
              const isActive = selectedStatus === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onStatusChange(s.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 text-center">
          <div className="pt-2 sm:pt-0">
            <span className="text-[11px] text-neutral-500 font-medium">Total Novel Dikoleksi</span>
            <p className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
              {totalNovels} Judul
            </p>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-[11px] text-neutral-500 font-medium">Sedang Berjalan Dibaca</span>
            <p className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {currentlyReading} Buku
            </p>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-[11px] text-neutral-500 font-medium">Telah Selesai Dibaca</span>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {completedNovels} Novel
            </p>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-[11px] text-neutral-500 font-medium">Karya Naskah Sendiri</span>
            <p className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
              {originalWorksCount} Draft
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
