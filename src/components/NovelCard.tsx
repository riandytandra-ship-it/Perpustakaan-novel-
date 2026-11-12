import React from 'react';
import {
  BookOpen,
  Star,
  Bookmark,
  Check,
  Feather,
  Edit,
  Trash2,
  Quote,
  Plus,
  Download,
} from 'lucide-react';
import { Novel, NovelStatus } from '../types/novel';
import { downloadNovelAsPdf } from '../utils/pdfService';

interface NovelCardProps {
  novel: Novel;
  onRead: (novel: Novel) => void;
  onQuickIncrementChapter: (novelId: string) => void;
  onEdit: (novel: Novel) => void;
  onDelete: (novelId: string) => void;
  onStatusChange: (novelId: string, status: NovelStatus) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onRead,
  onQuickIncrementChapter,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const percentComplete = Math.min(
    100,
    Math.round(
      novel.totalChapters > 0
        ? (novel.currentChapter / novel.totalChapters) * 100
        : (novel.currentPage / (novel.totalPages || 1)) * 100
    )
  );

  const getStatusBadge = () => {
    switch (novel.status) {
      case 'currently_reading':
        return {
          label: 'Sedang Dibaca',
          bg: 'bg-amber-950/80 text-amber-200 border-amber-700/60',
          dot: 'bg-amber-400',
        };
      case 'completed':
        return {
          label: 'Selesai',
          bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-700/60',
          dot: 'bg-emerald-400',
        };
      case 'writing_draft':
        return {
          label: 'Karya Sendiri',
          bg: 'bg-sky-950/80 text-sky-200 border-sky-700/60',
          dot: 'bg-sky-400',
        };
      case 'favorite':
        return {
          label: 'Favorit',
          bg: 'bg-purple-950/80 text-purple-200 border-purple-700/60',
          dot: 'bg-purple-400',
        };
      default:
        return {
          label: 'Ingin Dibaca',
          bg: 'bg-neutral-900/80 text-neutral-300 border-neutral-700/60',
          dot: 'bg-neutral-400',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Novel Cover Aspect Area */}
        <div
          className="relative w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-pointer"
          onClick={() => onRead(novel)}
        >
          {novel.coverImage ? (
            <img
              src={novel.coverImage}
              alt={novel.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            /* Styled Book Cover Fallback */
            <div
              className="w-full h-full p-5 flex flex-col justify-between text-white relative"
              style={{ backgroundColor: novel.accentColor || '#1E1B4B' }}
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                  {novel.genre}
                </span>
                <p className="text-xs font-medium opacity-90 line-clamp-1">{novel.author}</p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base leading-tight line-clamp-3">
                  {novel.title}
                </h3>
              </div>

              <div className="text-[10px] font-mono opacity-70 flex justify-between">
                <span>{novel.year}</span>
                <span>{novel.totalChapters} Bab</span>
              </div>
            </div>
          )}

          {/* Floating Status Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-md border shadow-xs ${statusBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>

          {/* Original Work Badge if applicable */}
          {novel.isOriginalWork && (
            <div className="absolute top-2.5 right-2.5 bg-neutral-950/80 text-amber-300 border border-amber-600/50 p-1.5 rounded-full shadow-xs" title="Naskah Novel Buatan Sendiri">
              <Feather className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-4 space-y-2">
          {/* Metadata line */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 truncate">
            <span>{novel.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{novel.totalChapters} Bab</span>
            <span aria-hidden="true">·</span>
            <span>{novel.totalPages} hlm</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onRead(novel)}
            className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
          >
            {novel.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium line-clamp-1">
            {novel.author}
          </p>

          {/* Rating */}
          <div className="pt-1 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300 font-semibold text-[11px]">
                {novel.rating}.0
              </span>
            </div>

            <span className="text-[10px] font-mono text-neutral-400">
              Bab {novel.currentChapter} / {novel.totalChapters}
            </span>
          </div>

          {/* Reading Progress Line */}
          <div className="pt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>Progres Membaca</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {percentComplete}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Favorite Quote snippet if exists */}
          {novel.favoriteQuote && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 italic">
              <Quote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5 opacity-60" />
              <p className="line-clamp-2 font-serif">"{novel.favoriteQuote}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-850/60 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-1.5">
        <button
          onClick={() => onRead(novel)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Buka Bab Cerita</span>
        </button>

        {novel.currentChapter < novel.totalChapters && (
          <button
            onClick={() => onQuickIncrementChapter(novel.id)}
            title="Tandai Selesai +1 Bab"
            className="p-2 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
          >
            +1 Bab
          </button>
        )}

        <button
          onClick={() => downloadNovelAsPdf(novel)}
          title="Unduh Novel Ini (Format PDF)"
          className="p-2 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onEdit(novel)}
          title="Edit Data Novel"
          className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(novel.id)}
          title="Hapus dari Rak"
          className="p-2 text-neutral-400 hover:text-rose-600 rounded"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
