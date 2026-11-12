import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://rrgnuxvfccrdybhlzinx.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ251eHZmY2NyZHliaGx6aW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NzQ0NzUsImV4cCI6MjEwOTQ1MDQ3NX0.6GEW8Kuda28ZRQoA7N7c5MaQ6isPsj4IIy40BD_5U54';

export const SUPABASE_PROJECT_REF = 'rrgnuxvfccrdybhlzinx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseHealthStatus {
  isConnected: boolean;
  mode: 'table' | 'bucket' | 'offline';
  message: string;
  projectRef: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseHealthStatus> {
  try {
    // 1. Check if public.novels table exists
    const { data: tableData, error: tableError } = await supabase
      .from('novels')
      .select('id')
      .limit(1);

    if (!tableError) {
      return {
        isConnected: true,
        mode: 'table',
        message: 'Tersambung ke PostgreSQL Supabase (Tabel: public.novels)',
        projectRef: SUPABASE_PROJECT_REF,
      };
    }

    // 2. If table doesn't exist, check cloud bucket
    const bucketResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/novels_data/novels_collection.json`,
      { cache: 'no-cache' }
    );

    if (bucketResponse.ok) {
      return {
        isConnected: true,
        mode: 'bucket',
        message: 'Tersambung ke Supabase Cloud (Storage Bucket: novels_data)',
        projectRef: SUPABASE_PROJECT_REF,
      };
    }

    return {
      isConnected: false,
      mode: 'offline',
      message: 'Gagal menghubungi server Supabase',
      projectRef: SUPABASE_PROJECT_REF,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      mode: 'offline',
      message: err?.message || 'Koneksi Supabase terputus',
      projectRef: SUPABASE_PROJECT_REF,
    };
  }
}
