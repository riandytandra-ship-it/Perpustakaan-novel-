import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Layers,
  Star,
  Feather,
  Quote,
} from 'lucide-react';
import { Novel } from '../types/novel';

interface NovelAnalyticsProps {
  novels: Novel[];
}

export const NovelAnalytics: React.FC<NovelAnalyticsProps> = ({ novels }) => {
  const totalNovels = novels.length;
  const completedNovels = novels.filter((n) => n.status === 'completed').length;
  const currentlyReading = novels.filter((n) => n.status === 'currently_reading').length;
  const originalWorks = novels.filter((n) => n.isOriginalWork).length;

  const totalPagesRead = novels.reduce((acc, n) => acc + (n.currentPage || 0), 0);
  const totalAllPages = novels.reduce((acc, n) => acc + (n.totalPages || 0), 0);
  const totalQuotes = novels.filter((n) => n.favoriteQuote && n.favoriteQuote.trim().length > 0).length;

  // Genre distribution
  const genreCounts: Record<string, number> = {};
  novels.forEach((n) => {
    genreCounts[n.genre] = (genreCounts[n.genre] || 0) + 1;
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
          Statistik Membaca & Koleksi Novel Pribadi
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Rangkuman pencapaian literasi fiksi, jumlah halaman dituntaskan, dan genre kesukaan Anda.
        </p>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Total Koleksi Novel</span>
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
            {totalNovels}
          </p>
          <span className="text-[10px] text-neutral-400">Judul tersimpan di rak</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Halaman Berhasil Dibaca</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {totalPagesRead.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-neutral-400">Dari total {totalAllPages.toLocaleString('id-ID')} hlm</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Novel Tuntas Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {completedNovels}
          </p>
          <span className="text-[10px] text-neutral-400">Tamat dibaca seluruhnya</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Kutipan Emas Dicatat</span>
            <Quote className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
            {totalQuotes}
          </p>
          <span className="text-[10px] text-neutral-400">Kalimat indah diarsipkan</span>
        </div>
      </div>

      {/* Grid: Genre breakdown & Reading Habit summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Distribusi Genre Favorit
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {sortedGenres.length} Genre
            </span>
          </div>

          <div className="space-y-3">
            {sortedGenres.map(([genre, count]) => {
              const percent = Math.round((count / (totalNovels || 1)) * 100);
              return (
                <div key={genre} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {genre}
                    </span>
                    <span className="font-mono tabular-nums text-neutral-500 text-[11px]">
                      {count} Novel ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 dark:bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Status Aktivitas Rak Novel
          </h3>

          <div className="space-y-2.5">
            {[
              { label: 'Sedang Dibaca Aktif', count: currentlyReading, desc: 'Buku yang terbuka di meja baca Anda' },
              { label: 'Tamat Selesai Dibaca', count: completedNovels, desc: 'Telah rampung dinikmati' },
              { label: 'Karya Naskah Sendiri', count: originalWorks, desc: 'Draft cerita ciptaan pribadi' },
              { label: 'Koleksi Terfavorit', count: novels.filter((n) => n.status === 'favorite').length, desc: 'Novel dengan kesan paling mendalam' },
              { label: 'Daftar Ingin Dibaca', count: novels.filter((n) => n.status === 'want_to_read').length, desc: 'Rencana bacaan berikutnya' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-neutral-400">{stat.desc}</span>
                </div>
                <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
