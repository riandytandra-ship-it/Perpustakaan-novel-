import React, { useState } from 'react';
import { Quote, BookOpen, Star, Sparkles, Feather, Bookmark } from 'lucide-react';
import { Novel } from '../types/novel';

interface QuotesDiaryViewProps {
  novels: Novel[];
  onReadNovel: (novel: Novel) => void;
  onNavigateToShelf: () => void;
}

export const QuotesDiaryView: React.FC<QuotesDiaryViewProps> = ({
  novels,
  onReadNovel,
  onNavigateToShelf,
}) => {
  const [filterGenre, setFilterGenre] = useState('all');

  const novelsWithQuotes = novels.filter((n) => n.favoriteQuote && n.favoriteQuote.trim().length > 0);

  const filteredQuotes = novelsWithQuotes.filter((n) => {
    if (filterGenre === 'all') return true;
    return n.genre === filterGenre;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
            Buku Harian Kutipan Emas
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kumpulan kalimat puitis, dialog tak terlupakan, dan pemikiran mendalam dari novel-novel pribadi Anda.
          </p>
        </div>

        <button
          onClick={onNavigateToShelf}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg shadow-xs self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kembali ke Rak Novel</span>
        </button>
      </div>

      {/* Quote Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.map((novel) => (
          <div
            key={novel.id}
            className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-200 dark:hover:border-amber-900 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 dark:text-amber-400">
                  {novel.genre}
                </span>

                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {novel.rating}.0
                  </span>
                </div>
              </div>

              {/* Big Quote */}
              <div className="relative pl-6">
                <Quote className="w-5 h-5 text-amber-500/40 absolute left-0 top-0" />
                <blockquote className="font-serif italic text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  "{novel.favoriteQuote}"
                </blockquote>
              </div>

              {/* Personal Review snippet if exists */}
              {novel.personalReview && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase font-mono">
                    Catatan Resensi Anda:
                  </span>
                  <p className="line-clamp-3">{novel.personalReview}</p>
                </div>
              )}
            </div>

            {/* Attribution & Book Link */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  {novel.title}
                </h4>
                <p className="text-[11px] text-neutral-500">{novel.author}</p>
              </div>

              <button
                onClick={() => onReadNovel(novel)}
                className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 font-medium hover:underline"
              >
                <span>Buka Novel</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
            <Quote className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-500">
              Belum ada kutipan emas yang dicatat. Buka novel Anda dan simpan kutipan kalimat terbaik!
            </p>
            <button
              onClick={onNavigateToShelf}
              className="px-4 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200"
            >
              Lihat Rak Novel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
