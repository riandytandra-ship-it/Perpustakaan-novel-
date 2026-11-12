import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Cloud,
} from 'lucide-react';
import { SUPABASE_PROJECT_REF, SUPABASE_URL } from '../utils/supabaseClient';
import { SUPABASE_SQL_SCHEMA, SupabaseSyncState } from '../utils/novelService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SupabaseSyncState;
  onTriggerSync: () => void;
  novelCount: number;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
  novelCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
                  Koneksi Database Supabase Cloud
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-sans">
                Aplikasi terhubung ke server Supabase (Data tidak lagi disimpan di browser)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Overview Card */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-500 text-[11px]">Proyek Supabase:</span>
                <p className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {SUPABASE_PROJECT_REF}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 text-[11px]">Endpoint API:</span>
                <p className="font-mono text-neutral-700 dark:text-neutral-300 truncate text-[11px]" title={SUPABASE_URL}>
                  {SUPABASE_URL}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 text-[11px]">Metode Penyimpanan Cloud:</span>
                <p className="font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5" />
                  {syncState.mode === 'table' ? 'Tabel Relasional PostgreSQL' : 'Supabase Cloud Storage (novels_data)'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 text-[11px]">Novel Tersinkronisasi:</span>
                <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {novelCount} Judul Novel
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">
                Status Terakhir:{' '}
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                  {syncState.statusText}
                </span>
              </span>

              <button
                onClick={onTriggerSync}
                disabled={syncState.isSaving}
                className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${syncState.isSaving ? 'animate-spin' : ''}`} />
                <span>{syncState.isSaving ? 'Menyimpan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* SQL Table Script Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
                  Skrip SQL Tabel Supabase (Opsional)
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Jalankan skrip ini di SQL Editor dashboard Supabase jika ingin membuat tabel <code className="text-amber-700 dark:text-amber-400 font-mono">public.novels</code> secara relasional.
                </p>
              </div>

              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg text-white shadow-xs transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-200">
              <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48">
                <code>{SUPABASE_SQL_SCHEMA}</code>
              </pre>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Keamanan Kunci API Server:</span>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300">
                Service Role Key dijalankan secara aman melalui proxy backend server (Express), sehingga kunci rahasia tidak pernah terpapar di browser client.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
