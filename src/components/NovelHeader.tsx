import React from 'react';
import { Database, Plus, FileDown, Feather } from 'lucide-react';
import { NovelLibraryView } from '../types/novel';

interface NovelHeaderProps {
  currentView: NovelLibraryView;
  onViewChange: (view: NovelLibraryView) => void;
  novelCount: number;
  currentlyReadingCount: number;
  onOpenAddNovel: () => void;
  onOpenExportImport: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  isSaving: boolean;
}

export const NovelHeader: React.FC<NovelHeaderProps> = ({
  currentView,
  onViewChange,
  novelCount,
  currentlyReadingCount,
  onOpenAddNovel,
  onOpenExportImport,
  onOpenSupabaseModal,
  isSupabaseConnected,
  isSaving,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-8 py-3.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text wordmark */}
      <div
        className="flex items-center gap-3 shrink-0 cursor-pointer"
        onClick={() => onViewChange('shelf')}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-900 text-amber-100 dark:bg-amber-100 dark:text-amber-900 shadow-xs">
          <Feather className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-serif font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            PustakaNovel
          </span>
          <span className="hidden sm:inline-block text-[11px] text-amber-700/80 dark:text-amber-400 font-mono">
            Ruang Novel Pribadi
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
        <button
          onClick={() => onViewChange('shelf')}
          className={`flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentView === 'shelf'
              ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
              : ''
          }`}
        >
          <span>Rak Lemari Novel</span>
          {currentlyReadingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded text-[10px] font-mono">
              {currentlyReadingCount} Dibaca
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange('table')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentView === 'table'
              ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
              : ''
          }`}
        >
          Tabel Arsip ({novelCount})
        </button>

        <button
          onClick={() => onViewChange('quotes')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentView === 'quotes'
              ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
              : ''
          }`}
        >
          Buku Harian Kutipan
        </button>

        <button
          onClick={() => onViewChange('analytics')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 py-1 ${
            currentView === 'analytics'
              ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
              : ''
          }`}
        >
          Statistik Membaca
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isSupabaseConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
          }`}
          title="Status Database Supabase Cloud"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Supabase</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSaving
                ? 'bg-amber-400 animate-ping'
                : isSupabaseConnected
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
          />
        </button>

        <button
          onClick={onOpenExportImport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          title="Pusat Berkas PDF (Unduh & Unggah)"
        >
          <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline font-medium">Berkas PDF</span>
        </button>

        <button
          onClick={onOpenAddNovel}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Novel</span>
        </button>
      </div>
    </header>
  );
};
