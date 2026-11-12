import React from 'react';
import { ArrowUpDown, BookOpen, Edit, Trash2, Star, Feather, Download } from 'lucide-react';
import { Novel, NovelStatus } from '../types/novel';
import { downloadNovelAsPdf } from '../utils/pdfService';

interface NovelTableViewProps {
  novels: Novel[];
  onReadNovel: (novel: Novel) => void;
  onEditNovel: (novel: Novel) => void;
  onDeleteNovel: (novelId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

export const NovelTableView: React.FC<NovelTableViewProps> = ({
  novels,
  onReadNovel,
  onEditNovel,
  onDeleteNovel,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const getStatusLabel = (status: NovelStatus) => {
    switch (status) {
      case 'currently_reading':
        return { label: 'Sedang Dibaca', class: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50' };
      case 'completed':
        return { label: 'Selesai', class: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50' };
      case 'writing_draft':
        return { label: 'Naskah Sendiri', class: 'text-sky-700 bg-sky-50 dark:bg-sky-950/50' };
      case 'favorite':
        return { label: 'Favorit', class: 'text-purple-700 bg-purple-50 dark:bg-purple-950/50' };
      default:
        return { label: 'Ingin Dibaca', class: 'text-neutral-700 bg-neutral-100 dark:bg-neutral-800' };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 select-none">
              <tr>
                <th
                  onClick={() => onSortChange('title')}
                  className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Judul Novel</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>

                <th
                  onClick={() => onSortChange('author')}
                  className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pengarang</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>

                <th className="px-3.5 py-3 font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                  Genre
                </th>

                <th className="px-3.5 py-3 font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                  Progres Bab
                </th>

                <th className="px-3.5 py-3 font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                  Status
                </th>

                <th
                  onClick={() => onSortChange('rating')}
                  className="px-3.5 py-3 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Rating</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>

                <th className="px-4 py-3 text-right font-medium text-neutral-500 whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {novels.map((novel) => {
                const statusInfo = getStatusLabel(novel.status);
                const percent = Math.min(
                  100,
                  Math.round(
                    novel.totalChapters > 0
                      ? (novel.currentChapter / novel.totalChapters) * 100
                      : (novel.currentPage / (novel.totalPages || 1)) * 100
                  )
                );

                return (
                  <tr
                    key={novel.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => onReadNovel(novel)}
                          className="w-8 h-11 rounded overflow-hidden shrink-0 shadow-2xs cursor-pointer bg-neutral-200"
                        >
                          {novel.coverImage ? (
                            <img src={novel.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-[9px] text-white font-bold"
                              style={{ backgroundColor: novel.accentColor }}
                            >
                              📖
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => onReadNovel(novel)}
                            className="font-serif font-bold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer truncate"
                          >
                            {novel.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {novel.year} · {novel.totalPages} hlm
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]">
                      {novel.author}
                      {novel.isOriginalWork && (
                        <span className="ml-1 text-[10px] text-amber-600 font-normal">
                          (Karya Sendiri)
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                      {novel.genre}
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap font-mono">
                      <span>Bab {novel.currentChapter} / {novel.totalChapters}</span>
                      <span className="ml-1.5 text-[10px] text-neutral-400">({percent}%)</span>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500 font-mono text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{novel.rating}.0</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onReadNovel(novel)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded hover:opacity-90"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Baca</span>
                        </button>

                        <button
                          onClick={() => downloadNovelAsPdf(novel)}
                          className="p-1.5 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                          title="Unduh Novel (Format PDF)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditNovel(novel)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                          title="Edit Novel"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteNovel(novel.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                          title="Hapus Novel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {novels.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    Belum ada novel dalam arsip tabel ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-850/60 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono tabular-nums flex items-center justify-between">
          <span>Menampilkan {novels.length} novel terarsip</span>
          <span className="text-neutral-400 text-[10px]">
            Arsip Novel Pribadi PustakaNovel
          </span>
        </div>
      </div>
    </div>
  );
};
