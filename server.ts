import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://rrgnuxvfccrdybhlzinx.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ251eHZmY2NyZHliaGx6aW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg3NDQ3NSwiZXhwIjoyMTA5NDUwNDc1fQ._S2SaT1U85zBNbmO1Dn1v23YaGRKuDHWZGeyCiaeJhg';

const SUPABASE_PROJECT_REF = 'rrgnuxvfccrdybhlzinx';
const BUCKET_NAME = 'novels_data';
const OBJECT_PATH = 'novels_collection.json';

// Ensure bucket exists in Supabase
async function ensureBucketExists() {
  try {
    const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET_NAME}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (checkRes.status === 404) {
      await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ id: BUCKET_NAME, name: BUCKET_NAME, public: true }),
      });
      console.log(`[Supabase] Bucket '${BUCKET_NAME}' created.`);
    }
  } catch (err) {
    console.error('[Supabase] ensureBucketExists error:', err);
  }
}

// Map PostgreSQL table snake_case row to Novel camelCase
function mapRowToNovel(row: any) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    isOriginalWork: !!row.is_original_work,
    genre: row.genre,
    year: row.year,
    publisher: row.publisher || '',
    totalPages: row.total_pages || 0,
    totalChapters: row.total_chapters || 0,
    currentPage: row.current_page || 0,
    currentChapter: row.current_chapter || 0,
    status: row.status,
    rating: row.rating || 5,
    synopsis: row.synopsis || '',
    coverImage: row.cover_image || '',
    accentColor: row.accent_color || '#1E1B4B',
    favoriteQuote: row.favorite_quote || '',
    personalReview: row.personal_review || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    chapters: Array.isArray(row.chapters) ? row.chapters : [],
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// Map Novel camelCase to PostgreSQL table snake_case row
function mapNovelToRow(novel: any) {
  return {
    id: novel.id,
    title: novel.title,
    author: novel.author,
    is_original_work: !!novel.isOriginalWork,
    genre: novel.genre,
    year: novel.year || 2024,
    publisher: novel.publisher || '',
    total_pages: novel.totalPages || 0,
    total_chapters: novel.totalChapters || 0,
    current_page: novel.currentPage || 0,
    current_chapter: novel.currentChapter || 0,
    status: novel.status || 'want_to_read',
    rating: novel.rating || 5,
    synopsis: novel.synopsis || '',
    cover_image: novel.coverImage || '',
    accent_color: novel.accentColor || '#1E1B4B',
    favorite_quote: novel.favoriteQuote || '',
    personal_review: novel.personalReview || '',
    tags: novel.tags || [],
    chapters: novel.chapters || [],
    updated_at: novel.updatedAt || new Date().toISOString(),
  };
}

// GET /api/supabase/status
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  try {
    let tableExists = false;
    let bucketReady = false;

    // Check table
    const tableRes = await fetch(`${SUPABASE_URL}/rest/v1/novels?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (tableRes.ok) {
      tableExists = true;
    }

    // Check bucket object
    const bucketRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${OBJECT_PATH}`,
      { cache: 'no-cache' }
    );
    if (bucketRes.ok) {
      bucketReady = true;
    }

    res.json({
      success: true,
      isConnected: true,
      projectRef: SUPABASE_PROJECT_REF,
      tableExists,
      bucketReady,
      url: SUPABASE_URL,
      storageMode: tableExists ? 'PostgreSQL Table (public.novels)' : 'Cloud Storage (novels_data)',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      isConnected: false,
      error: err?.message || 'Error checking Supabase status',
    });
  }
});

// GET /api/novels - Read novels from Supabase
app.get('/api/novels', async (_req: Request, res: Response) => {
  try {
    // 1. Try to fetch from PostgreSQL table `public.novels`
    const tableRes = await fetch(
      `${SUPABASE_URL}/rest/v1/novels?select=*&order=updated_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (tableRes.ok) {
      const rows = await tableRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const novels = rows.map(mapRowToNovel);
        return res.json({
          success: true,
          novels,
          source: 'supabase_table',
          count: novels.length,
        });
      }
    }

    // 2. Fetch from Supabase Cloud Storage
    const storageRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${OBJECT_PATH}`,
      { cache: 'no-cache' }
    );

    if (storageRes.ok) {
      const novels = await storageRes.json();
      if (Array.isArray(novels) && novels.length > 0) {
        return res.json({
          success: true,
          novels,
          source: 'supabase_storage',
          count: novels.length,
        });
      }
    }

    // 3. Fallback to default novels and seed to Supabase
    const { DEFAULT_NOVELS } = await import('./src/data/defaultNovels.ts');
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${OBJECT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-upsert': 'true',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(DEFAULT_NOVELS),
    });

    return res.json({
      success: true,
      novels: DEFAULT_NOVELS,
      source: 'supabase_seeded',
      count: DEFAULT_NOVELS.length,
    });
  } catch (err: any) {
    console.error('[Supabase GET /api/novels Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Gagal memuat novel dari Supabase',
    });
  }
});

// POST /api/novels - Save novels collection to Supabase
app.post('/api/novels', async (req: Request, res: Response) => {
  try {
    const { novels } = req.body;
    if (!Array.isArray(novels)) {
      return res.status(400).json({
        success: false,
        error: 'Data novel harus berupa array',
      });
    }

    await ensureBucketExists();

    // 1. Always save to Supabase Cloud Storage
    const saveStorageRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${OBJECT_PATH}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-upsert': 'true',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(novels),
      }
    );

    if (!saveStorageRes.ok) {
      const text = await saveStorageRes.text();
      console.warn('[Supabase Storage Warning]:', text);
    }

    // 2. Also upsert into PostgreSQL table if table exists
    try {
      const tableCheck = await fetch(`${SUPABASE_URL}/rest/v1/novels?select=id&limit=1`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });

      if (tableCheck.ok) {
        const rows = novels.map(mapNovelToRow);
        await fetch(`${SUPABASE_URL}/rest/v1/novels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(rows),
        });
      }
    } catch (tblErr) {
      // Ignored if table not created yet
    }

    res.json({
      success: true,
      message: 'Koleksi novel berhasil disimpan ke database Supabase Cloud',
      count: novels.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Supabase POST /api/novels Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Gagal menyimpan novel ke Supabase',
    });
  }
});

// POST /api/novels/reset - Reset to default novels in Supabase
app.post('/api/novels/reset', async (_req: Request, res: Response) => {
  try {
    const { DEFAULT_NOVELS } = await import('./src/data/defaultNovels.ts');
    await ensureBucketExists();

    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${OBJECT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-upsert': 'true',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(DEFAULT_NOVELS),
    });

    res.json({
      success: true,
      novels: DEFAULT_NOVELS,
      message: 'Data Supabase berhasil dikembalikan ke koleksi awal',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Gagal mereset data Supabase',
    });
  }
});

// Start dev or production server
async function startServer() {
  await ensureBucketExists();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PustakaNovel server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
