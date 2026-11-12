import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen,
  ArrowUpDown,
  Sparkles,
  Feather,
  Plus,
  Loader2,
  Database,
  CloudCheck,
} from 'lucide-react';
import { Novel, NovelStatus, NovelLibraryView } from './types/novel';
import {
  loadNovelsFromSupabase,
  saveNovelsToSupabase,
  resetNovelsInSupabase,
  SupabaseSyncState,
} from './utils/novelService';
import { checkSupabaseConnection, SUPABASE_PROJECT_REF } from './utils/supabaseClient';

// Components
import { NovelHeader } from './components/NovelHeader';
import { NovelHero } from './components/NovelHero';
import { NovelCard } from './components/NovelCard';
import { NovelTableView } from './components/NovelTableView';
import { QuotesDiaryView } from './components/QuotesDiaryView';
import { NovelAnalytics } from './components/NovelAnalytics';
import { NovelReaderModal } from './components/NovelReaderModal';
import { AddEditNovelModal } from './components/AddEditNovelModal';
import { ExportImportNovelModal } from './components/ExportImportNovelModal';
import { SupabaseModal } from './components/SupabaseModal';

export default function App() {
  // Main Novel State
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Cloud Sync State
  const [syncState, setSyncState] = useState<SupabaseSyncState>({
    isConnected: true,
    statusText: 'Menghubungkan ke Supabase Cloud...',
    isSaving: false,
    lastSyncedAt: null,
    mode: 'bucket',
    projectRef: SUPABASE_PROJECT_REF,
  });

  // Track if initial load has completed to prevent saving back on initial mount
  const isInitialLoadDone = useRef(false);

  // Views & Filter States
  const [currentView, setCurrentView] = useState<NovelLibraryView>('shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua Genre');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [readingNovel, setReadingNovel] = useState<Novel | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isAddNovelOpen, setIsAddNovelOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // 1. Initial Load from Supabase Database
  useEffect(() => {
    let isMounted = true;

    async function initSupabaseData() {
      setIsLoading(true);
      try {
        const [health, { novels: remoteNovels, source }] = await Promise.all([
          checkSupabaseConnection(),
          loadNovelsFromSupabase(),
        ]);

        if (isMounted) {
          setNovels(remoteNovels);
          setSyncState({
            isConnected: health.isConnected,
            statusText: `Tersambung (${health.mode === 'table' ? 'PostgreSQL Table' : 'Cloud Storage'})`,
            isSaving: false,
            lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
            mode: health.mode,
            projectRef: SUPABASE_PROJECT_REF,
          });
        }
      } catch (err: any) {
        console.error('Error fetching Supabase data:', err);
        if (isMounted) {
          setSyncState((prev) => ({
            ...prev,
            isConnected: false,
            statusText: 'Gagal terhubung ke Supabase',
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isInitialLoadDone.current = true;
        }
      }
    }

    initSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto Sync to Supabase whenever novels state changes
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCloudSave = useCallback((updatedNovels: Novel[]) => {
    if (!isInitialLoadDone.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    setSyncState((prev) => ({
      ...prev,
      isSaving: true,
      statusText: 'Menyimpan perubahan ke Supabase...',
    }));

    syncTimerRef.current = setTimeout(async () => {
      try {
        const result = await saveNovelsToSupabase(updatedNovels);
        setSyncState((prev) => ({
          ...prev,
          isConnected: result.success,
          isSaving: false,
          statusText: result.success ? 'Tersinkronkan di Cloud' : result.message,
          lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
        }));
      } catch (err: any) {
        setSyncState((prev) => ({
          ...prev,
          isSaving: false,
          isConnected: false,
          statusText: 'Gagal sinkronisasi ke Supabase',
        }));
      }
    }, 600); // 600ms debounce
  }, []);

  // Aggregate Counters
  const completedNovelsCount = useMemo(
    () => novels.filter((n) => n.status === 'completed').length,
    [novels]
  );
  const currentlyReadingCount = useMemo(
    () => novels.filter((n) => n.status === 'currently_reading').length,
    [novels]
  );
  const originalWorksCount = useMemo(
    () => novels.filter((n) => n.isOriginalWork).length,
    [novels]
  );

  // Filtered & Sorted Novels
  const filteredNovels = useMemo(() => {
    let result = [...novels];

    // 1. Text Search (title, author, synopsis, quote, tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.genre.toLowerCase().includes(q) ||
          (n.synopsis && n.synopsis.toLowerCase().includes(q)) ||
          (n.favoriteQuote && n.favoriteQuote.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Status Filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'writing_draft') {
        result = result.filter((n) => n.isOriginalWork || n.status === 'writing_draft');
      } else {
        result = result.filter((n) => n.status === selectedStatus);
      }
    }

    // 3. Genre Filter
    if (selectedGenre !== 'Semua Genre') {
      result = result.filter((n) => n.genre === selectedGenre);
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof Novel];
      let valB: any = b[sortBy as keyof Novel];

      if (sortBy === 'title' || sortBy === 'author' || sortBy === 'genre') {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (
        sortBy === 'rating' ||
        sortBy === 'year' ||
        sortBy === 'totalPages' ||
        sortBy === 'totalChapters' ||
        sortBy === 'currentPage'
      ) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [novels, searchQuery, selectedStatus, selectedGenre, sortBy, sortOrder]);

  // Handlers for Data Mutations (Automatically syncs to Supabase)
  const handleQuickIncrementChapter = (novelId: string) => {
    setNovels((prev) => {
      const updated = prev.map((n) => {
        if (n.id === novelId) {
          const nextChap = Math.min(n.totalChapters, n.currentChapter + 1);
          const estPage = Math.min(
            n.totalPages,
            Math.round((nextChap / (n.totalChapters || 1)) * n.totalPages)
          );
          const newStatus: NovelStatus =
            nextChap >= n.totalChapters && n.status !== 'writing_draft' ? 'completed' : n.status;

          return {
            ...n,
            currentChapter: nextChap,
            currentPage: estPage,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      triggerCloudSave(updated);
      return updated;
    });
  };

  const handleUpdateProgress = (novelId: string, chapter: number, page: number) => {
    setNovels((prev) => {
      const updated = prev.map((n) => {
        if (n.id === novelId) {
          const isDone = chapter >= n.totalChapters;
          const newStatus: NovelStatus =
            isDone && n.status !== 'writing_draft' ? 'completed' : n.status;

          return {
            ...n,
            currentChapter: chapter,
            currentPage: page,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      triggerCloudSave(updated);
      return updated;
    });
  };

  const handleSaveQuote = (novelId: string, quote: string) => {
    setNovels((prev) => {
      const updated = prev.map((n) => {
        if (n.id === novelId) {
          return {
            ...n,
            favoriteQuote: quote,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      triggerCloudSave(updated);
      return updated;
    });
  };

  const handleSaveReview = (novelId: string, review: string) => {
    setNovels((prev) => {
      const updated = prev.map((n) => {
        if (n.id === novelId) {
          return {
            ...n,
            personalReview: review,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      triggerCloudSave(updated);
      return updated;
    });
  };

  const handleStatusChange = (novelId: string, status: NovelStatus) => {
    setNovels((prev) => {
      const updated = prev.map((n) =>
        n.id === novelId ? { ...n, status, updatedAt: new Date().toISOString() } : n
      );
      triggerCloudSave(updated);
      return updated;
    });
  };

  const handleSaveNovel = (savedNovel: Novel) => {
    setNovels((prev) => {
      const exists = prev.some((n) => n.id === savedNovel.id);
      let updated: Novel[];
      if (exists) {
        updated = prev.map((n) => (n.id === savedNovel.id ? savedNovel : n));
      } else {
        updated = [savedNovel, ...prev];
      }
      triggerCloudSave(updated);
      return updated;
    });
    setEditingNovel(null);
  };

  const handleDeleteNovel = (novelId: string) => {
    const target = novels.find((n) => n.id === novelId);
    if (!target) return;
    if (window.confirm(`Hapus novel "${target.title}" dari database Supabase?`)) {
      setNovels((prev) => {
        const updated = prev.filter((n) => n.id !== novelId);
        triggerCloudSave(updated);
        return updated;
      });
    }
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleImportNovels = (imported: Novel[]) => {
    setNovels(imported);
    triggerCloudSave(imported);
  };

  const handleResetDefaults = async () => {
    setIsLoading(true);
    const fresh = await resetNovelsInSupabase();
    setNovels(fresh);
    setIsLoading(false);
    setSyncState((prev) => ({
      ...prev,
      lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
      statusText: 'Data dikembalikan ke koleksi awal',
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* 3-Zone Sticky Header with Supabase Indicator */}
      <NovelHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        novelCount={novels.length}
        currentlyReadingCount={currentlyReadingCount}
        onOpenAddNovel={() => {
          setEditingNovel(null);
          setIsAddNovelOpen(true);
        }}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={syncState.isConnected}
        isSaving={syncState.isSaving}
      />

      {/* Cloud Sync Status Bar */}
      <div className="bg-emerald-900/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Database Cloud: <strong className="font-mono">{syncState.projectRef}</strong>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-neutral-500 dark:text-neutral-400">
            {syncState.statusText}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {syncState.lastSyncedAt && (
            <span className="text-neutral-500 text-[10px] hidden md:inline">
              Sinkron terakhir: {syncState.lastSyncedAt}
            </span>
          )}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="underline font-medium hover:text-emerald-600 dark:hover:text-emerald-200 transition-colors"
          >
            Lihat Status & SQL
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 font-serif">
              Memuat koleksi novel dari database Supabase Cloud...
            </p>
            <span className="text-xs text-neutral-400 font-mono">
              Proyek: {SUPABASE_PROJECT_REF}
            </span>
          </div>
        ) : (
          <>
            {currentView === 'shelf' && (
              <div>
                {/* Visual Backing Hero & Search */}
                <NovelHero
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedGenre={selectedGenre}
                  onGenreChange={setSelectedGenre}
                  totalNovels={novels.length}
                  completedNovels={completedNovelsCount}
                  currentlyReading={currentlyReadingCount}
                  originalWorksCount={originalWorksCount}
                />

                {/* Bookshelf Grid View */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                  {/* Secondary Controls Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100">
                        Koleksi Rak Buku
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        ({filteredNovels.length} novel ditampilkan)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Genre Quick Dropdown */}
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 outline-hidden focus:border-neutral-900"
                      >
                        <option value="Semua Genre">Semua Genre</option>
                        <option value="Fantasi & Magis">Fantasi & Magis</option>
                        <option value="Misteri & Thriller">Misteri & Thriller</option>
                        <option value="Sastra Nusantara">Sastra Nusantara</option>
                        <option value="Romansa & Drama">Romansa & Drama</option>
                        <option value="Fiksi Ilmiah & Distopia">Fiksi Ilmiah & Distopia</option>
                        <option value="Sejarah & Epik">Sejarah & Epik</option>
                      </select>

                      {/* Sort Selector */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-transparent font-medium text-neutral-700 dark:text-neutral-300 outline-hidden cursor-pointer"
                        >
                          <option value="updatedAt">Terakhir Dibaca</option>
                          <option value="title">Judul (A-Z)</option>
                          <option value="author">Pengarang</option>
                          <option value="rating">Rating Tertinggi</option>
                          <option value="totalPages">Halaman Tebal</option>
                          <option value="year">Tahun Terbit</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Novels Grid */}
                  {filteredNovels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredNovels.map((novel) => (
                        <NovelCard
                          key={novel.id}
                          novel={novel}
                          onRead={(n) => setReadingNovel(n)}
                          onQuickIncrementChapter={handleQuickIncrementChapter}
                          onEdit={(n) => {
                            setEditingNovel(n);
                            setIsAddNovelOpen(true);
                          }}
                          onDelete={handleDeleteNovel}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 px-4 space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif font-bold text-base text-neutral-800 dark:text-neutral-200">
                        Tidak ada novel yang cocok
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Coba bersihkan pencarian atau tambahkan novel baru ke database Supabase Anda.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedStatus('all');
                          setSelectedGenre('Semua Genre');
                        }}
                        className="px-3.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentView === 'table' && (
              <NovelTableView
                novels={filteredNovels}
                onReadNovel={(n) => setReadingNovel(n)}
                onEditNovel={(n) => {
                  setEditingNovel(n);
                  setIsAddNovelOpen(true);
                }}
                onDeleteNovel={handleDeleteNovel}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            )}

            {currentView === 'quotes' && (
              <QuotesDiaryView
                novels={novels}
                onReadNovel={(n) => setReadingNovel(n)}
                onNavigateToShelf={() => setCurrentView('shelf')}
              />
            )}

            {currentView === 'analytics' && <NovelAnalytics novels={novels} />}
          </>
        )}
      </main>

      {/* Novel Reading Room Modal */}
      <NovelReaderModal
        isOpen={!!readingNovel}
        novel={readingNovel}
        onClose={() => setReadingNovel(null)}
        onUpdateProgress={handleUpdateProgress}
        onSaveQuote={handleSaveQuote}
        onSaveReview={handleSaveReview}
      />

      {/* Add / Edit Novel Modal */}
      <AddEditNovelModal
        isOpen={isAddNovelOpen}
        initialNovel={editingNovel}
        onClose={() => {
          setIsAddNovelOpen(false);
          setEditingNovel(null);
        }}
        onSaveNovel={handleSaveNovel}
      />

      {/* Export / Import & Backup Modal */}
      <ExportImportNovelModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        novels={novels}
        onImportNovels={handleImportNovels}
        onResetDefaults={handleResetDefaults}
      />

      {/* Supabase Connection & SQL Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        syncState={syncState}
        onTriggerSync={() => triggerCloudSave(novels)}
        novelCount={novels.length}
      />
    </div>
  );
}
