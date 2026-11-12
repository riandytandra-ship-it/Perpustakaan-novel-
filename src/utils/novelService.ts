import { Novel } from '../types/novel';
import { DEFAULT_NOVELS } from '../data/defaultNovels';
import { supabase, SUPABASE_URL } from './supabaseClient';

export interface SupabaseSyncState {
  isConnected: boolean;
  statusText: string;
  isSaving: boolean;
  lastSyncedAt: string | null;
  mode: 'table' | 'bucket' | 'offline';
  projectRef: string;
}

/**
 * Load novels from Supabase cloud database
 */
export async function loadNovelsFromSupabase(): Promise<{
  novels: Novel[];
  source: string;
}> {
  // 1. Try server-side proxy route
  try {
    const res = await fetch('/api/novels', {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.novels) && json.novels.length > 0) {
        return { novels: json.novels, source: json.source || 'supabase_api' };
      }
    }
  } catch (err) {
    console.warn('[NovelService] API route unavailable, trying direct Supabase client:', err);
  }

  // 2. Direct client fallback via Supabase Public Bucket
  try {
    const bucketRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/novels_data/novels_collection.json`,
      { cache: 'no-cache' }
    );
    if (bucketRes.ok) {
      const novels = await bucketRes.json();
      if (Array.isArray(novels) && novels.length > 0) {
        return { novels, source: 'supabase_storage_direct' };
      }
    }
  } catch (storageErr) {
    console.warn('[NovelService] Direct bucket read failed:', storageErr);
  }

  // 3. Direct client fallback via Supabase PostgREST table
  try {
    const { data: rows, error } = await supabase
      .from('novels')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(rows) && rows.length > 0) {
      const novels: Novel[] = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        author: r.author,
        isOriginalWork: !!r.is_original_work,
        genre: r.genre,
        year: r.year,
        publisher: r.publisher || '',
        totalPages: r.total_pages || 0,
        totalChapters: r.total_chapters || 0,
        currentPage: r.current_page || 0,
        currentChapter: r.current_chapter || 0,
        status: r.status,
        rating: r.rating || 5,
        synopsis: r.synopsis || '',
        coverImage: r.cover_image || '',
        accentColor: r.accent_color || '#1E1B4B',
        favoriteQuote: r.favorite_quote || '',
        personalReview: r.personal_review || '',
        tags: Array.isArray(r.tags) ? r.tags : [],
        chapters: Array.isArray(r.chapters) ? r.chapters : [],
        updatedAt: r.updated_at || new Date().toISOString(),
      }));
      return { novels, source: 'supabase_table_direct' };
    }
  } catch (pgErr) {
    console.warn('[NovelService] Direct table query failed:', pgErr);
  }

  return { novels: DEFAULT_NOVELS, source: 'default_preset' };
}

/**
 * Save novels collection to Supabase cloud
 */
export async function saveNovelsToSupabase(novels: Novel[]): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const res = await fetch('/api/novels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ novels }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Tersimpan ke Supabase Cloud',
      };
    }
    const errText = await res.text();
    return { success: false, message: `Gagal menyimpan: ${errText}` };
  } catch (err: any) {
    console.error('[NovelService] Gagal menyimpan ke Supabase:', err);
    return {
      success: false,
      message: err?.message || 'Koneksi ke Supabase terputus',
    };
  }
}

/**
 * Reset novels in Supabase
 */
export async function resetNovelsInSupabase(): Promise<Novel[]> {
  try {
    const res = await fetch('/api/novels/reset', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return data.novels || DEFAULT_NOVELS;
    }
  } catch (err) {
    console.error('[NovelService] Reset error:', err);
  }
  return DEFAULT_NOVELS;
}

/**
 * SQL Schema script for user if they want to run it in Supabase SQL editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- PUSTAKANOVEL: SKRIP PEMBUATAN TABEL DI SUPABASE POSTGRESQL
-- Salin dan jalankan skrip ini di:
-- Dashboard Supabase > SQL Editor > New Query > Run
-- ========================================================

-- 1. Buat Tabel Novels
CREATE TABLE IF NOT EXISTS public.novels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  is_original_work BOOLEAN DEFAULT false,
  genre TEXT NOT NULL,
  year INTEGER DEFAULT 2024,
  publisher TEXT DEFAULT '',
  total_pages INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  current_chapter INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'want_to_read',
  rating INTEGER DEFAULT 5,
  synopsis TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#1E1B4B',
  favorite_quote TEXT DEFAULT '',
  personal_review TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  chapters JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;

-- 3. Berikan Akses Baca & Tulis Penuh untuk Aplikasi
DROP POLICY IF EXISTS "Akses Penuh PustakaNovel" ON public.novels;
CREATE POLICY "Akses Penuh PustakaNovel"
  ON public.novels
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 4. Notifikasi Realtime (Opsional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.novels;
`;
