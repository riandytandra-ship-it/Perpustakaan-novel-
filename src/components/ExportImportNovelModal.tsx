import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen,
  FileDown,
} from 'lucide-react';
import { Novel } from '../types/novel';
import { parsePdfFile, downloadNovelAsPdf, downloadCatalogAsPdf } from '../utils/pdfService';
import { generateId } from '../utils/formatters';

interface ExportImportNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  novels: Novel[];
  onImportNovels: (novels: Novel[]) => void;
  onResetDefaults: () => void;
}

export const ExportImportNovelModal: React.FC<ExportImportNovelModalProps> = ({
  isOpen,
  onClose,
  novels,
  onImportNovels,
  onResetDefaults,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [selectedNovelIdForPdf, setSelectedNovelIdForPdf] = useState<string>(
    novels[0]?.id || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string, error = false) => {
    setFeedbackMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // 1. Download Catalog PDF
  const handleDownloadCatalogPdf = () => {
    try {
      downloadCatalogAsPdf(novels);
      showNotification('Dokumen PDF Katalog Perpustakaan Novel berhasil diunduh.');
    } catch (err) {
      console.error(err);
      showNotification('Gagal membuat berkas PDF katalog.', true);
    }
  };

  // 2. Download Selected Novel PDF
  const handleDownloadSingleNovelPdf = () => {
    const target = novels.find((n) => n.id === selectedNovelIdForPdf) || novels[0];
    if (!target) {
      showNotification('Pilih novel yang ingin diunduh terlebih dahulu.', true);
      return;
    }
    try {
      downloadNovelAsPdf(target);
      showNotification(`Buku novel "${target.title}" berhasil diunduh dalam format PDF.`);
    } catch (err) {
      console.error(err);
      showNotification('Gagal membuat berkas PDF novel.', true);
    }
  };

  // 3. Upload Book PDF (.pdf ONLY)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showNotification('Hanya format dokumen PDF (.pdf) yang didukung untuk unggahan.', true);
      return;
    }

    setIsProcessingPdf(true);
    try {
      const parsed = await parsePdfFile(file);
      const newNovel: Novel = {
        id: generateId('novel'),
        title: parsed.title,
        author: parsed.author,
        genre: 'Fantasi & Magis',
        year: new Date().getFullYear(),
        publisher: 'Koleksi Berkas PDF',
        totalPages: parsed.totalPages,
        totalChapters: parsed.totalChapters,
        currentPage: 0,
        currentChapter: 1,
        status: 'currently_reading',
        rating: 5,
        synopsis: parsed.synopsis || `Naskah novel dari berkas PDF "${file.name}".`,
        accentColor: '#1E1B4B',
        tags: ['Impor PDF', 'Dokumen Digital'],
        chapters: parsed.chapters,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      onImportNovels([newNovel, ...novels]);
      showNotification(
        `Berhasil mengimpor novel "${parsed.title}" (${parsed.totalPages} Hlm, ${parsed.totalChapters} Bab) dari berkas PDF.`
      );
    } catch (err: any) {
      console.error(err);
      showNotification(`Gagal membaca berkas PDF: ${err?.message || 'Terjadi kesalahan'}`, true);
    } finally {
      setIsProcessingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetConfirm = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin memulihkan koleksi novel ke daftar bawaan? Perubahan manual akan digantikan.'
      )
    ) {
      onResetDefaults();
      showNotification('Koleksi novel telah dikembalikan ke data awal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
                  Pusat Berkas PDF (Unduh & Unggah)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Format PDF
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-sans">
                Unduh dan unggah buku atau katalog perpustakaan dalam format dokumen PDF
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

        {/* Notifications */}
        {feedbackMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              isError
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[72vh]">
          {/* SECTION 1: DOWNLOAD PDF */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-mono flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Unduh Berkas PDF (Download)</span>
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono">Format Dokumen .PDF</span>
            </div>

            <div className="space-y-3">
              {/* Option A: Unduh Katalog Koleksi PDF */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Unduh Katalog Lengkap Koleksi (PDF)</span>
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Menghasilkan dokumen PDF berisi seluruh daftar novel, statistik membaca, status, dan kutipan emas.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCatalogPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* Option B: Unduh Novel Tunggal PDF */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Unduh Berkas Buku Novel Pilihan (PDF)</span>
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Pilih salah satu novel untuk diunduh sebagai buku utuh berformat PDF lengkap dengan seluruh bab ceritanya.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <select
                    value={selectedNovelIdForPdf}
                    onChange={(e) => setSelectedNovelIdForPdf(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-serif outline-hidden text-neutral-900 dark:text-neutral-100"
                  >
                    {novels.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title} ({n.totalChapters} Bab, {n.author})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleDownloadSingleNovelPdf}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Novel (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: UPLOAD PDF */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-mono flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Unggah Berkas PDF (Upload)</span>
              </h3>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-medium">
                Hanya File .PDF
              </span>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfUpload}
                className="hidden"
                id="file-upload-pdf-novel"
              />
              <label
                htmlFor="file-upload-pdf-novel"
                className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl bg-neutral-50 dark:bg-neutral-850/50 cursor-pointer transition-colors text-center group"
              >
                {isProcessingPdf ? (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 py-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-medium">Sedang membaca dan mengekstrak dokumen PDF...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Klik untuk Memilih Berkas Dokumen PDF (.pdf)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Sistem akan membaca isi buku, membagi teks bab, dan menambahkan langsung ke rak buku Anda
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Section: Pulihkan Bawaan */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              Pemulihan Sistem
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  Kembalikan ke Koleksi Awal
                </span>
                <p className="text-[11px] text-neutral-500">
                  Muat ulang novel-novel standar di database Supabase.
                </p>
              </div>

              <button
                onClick={handleResetConfirm}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
