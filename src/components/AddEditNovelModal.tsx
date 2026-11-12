import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookPlus,
  Feather,
  Star,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Novel, NovelGenre, NovelStatus, NovelChapter } from '../types/novel';
import { generateId } from '../utils/formatters';
import { parsePdfFile } from '../utils/pdfService';
import { formatFileSize } from '../utils/bookFileParser';

interface AddEditNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNovel: (novel: Novel) => void;
  initialNovel?: Novel | null;
}

const GENRES: NovelGenre[] = [
  'Fantasi & Magis',
  'Misteri & Thriller',
  'Romansa & Drama',
  'Sastra Nusantara',
  'Fiksi Ilmiah & Distopia',
  'Petualangan & Aksi',
  'Horor & Supernatural',
  'Sejarah & Epik',
];

const ACCENT_COLORS = [
  '#1E1B4B', // Midnight indigo
  '#14532D', // Deep forest
  '#9A3412', // Warm terracotta
  '#78350F', // Rich leather brown
  '#0284C7', // Sky blue
  '#581C87', // Royal purple
  '#831843', // Rose berry
  '#1C1917', // Charcoal stone
];

export const AddEditNovelModal: React.FC<AddEditNovelModalProps> = ({
  isOpen,
  onClose,
  onSaveNovel,
  initialNovel,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isOriginalWork, setIsOriginalWork] = useState(false);
  const [genre, setGenre] = useState<NovelGenre>('Fantasi & Magis');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [publisher, setPublisher] = useState('');
  const [totalChapters, setTotalChapters] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(320);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [status, setStatus] = useState<NovelStatus>('currently_reading');
  const [rating, setRating] = useState<number>(5);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [synopsis, setSynopsis] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [personalReview, setPersonalReview] = useState('');

  // Chapter management state
  const [chapters, setChapters] = useState<NovelChapter[]>([
    {
      chapterNumber: 1,
      title: 'Bab 1: Permulaan',
      content: ['Teks bab cerita akan ditampilkan di sini saat Anda membaca di e-reader.'],
    },
  ]);
  const [selectedPreviewChapterIdx, setSelectedPreviewChapterIdx] = useState(0);

  // PDF upload state
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [uploadedPdfInfo, setUploadedPdfInfo] = useState<{
    name: string;
    size: string;
    chaptersDetected: number;
    pages: number;
  } | null>(null);
  const [isDragOverPdf, setIsDragOverPdf] = useState(false);

  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialNovel) {
      setTitle(initialNovel.title);
      setAuthor(initialNovel.author);
      setIsOriginalWork(!!initialNovel.isOriginalWork);
      setGenre(initialNovel.genre);
      setYear(initialNovel.year);
      setPublisher(initialNovel.publisher || '');
      setTotalChapters(initialNovel.totalChapters);
      setTotalPages(initialNovel.totalPages);
      setCurrentChapter(initialNovel.currentChapter);
      setCurrentPage(initialNovel.currentPage);
      setStatus(initialNovel.status);
      setRating(initialNovel.rating);
      setAccentColor(initialNovel.accentColor || ACCENT_COLORS[0]);
      setSynopsis(initialNovel.synopsis);
      setCoverImage(initialNovel.coverImage);
      setFavoriteQuote(initialNovel.favoriteQuote || '');
      setPersonalReview(initialNovel.personalReview || '');
      setChapters(
        initialNovel.chapters && initialNovel.chapters.length > 0
          ? initialNovel.chapters
          : [
              {
                chapterNumber: 1,
                title: 'Bab 1: Permulaan',
                content: ['Belum ada teks naskah.'],
              },
            ]
      );
      setSelectedPreviewChapterIdx(0);
      setUploadedPdfInfo(null);
    } else {
      setTitle('');
      setAuthor('');
      setIsOriginalWork(false);
      setGenre('Fantasi & Magis');
      setYear(new Date().getFullYear());
      setPublisher('Koleksi Pribadi');
      setTotalChapters(20);
      setTotalPages(300);
      setCurrentChapter(1);
      setCurrentPage(0);
      setStatus('currently_reading');
      setRating(5);
      setAccentColor(ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]);
      setSynopsis('');
      setCoverImage(undefined);
      setFavoriteQuote('');
      setPersonalReview('');
      setChapters([
        {
          chapterNumber: 1,
          title: 'Bab 1: Permulaan',
          content: [
            'Lembaran pertama dibuka dengan suasana hening. Kata-kata mengalir membawa pembaca ke dalam dunia gagasan dan cerita yang tak terbatas.',
          ],
        },
      ]);
      setSelectedPreviewChapterIdx(0);
      setUploadedPdfInfo(null);
    }
  }, [initialNovel, isOpen]);

  if (!isOpen) return null;

  // Handle Book File Upload (.pdf ONLY)
  const handleProcessPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Format berkas harus berupa dokumen PDF (.pdf). Format lain tidak didukung.');
      return;
    }

    setIsParsingPdf(true);
    try {
      const parsed = await parsePdfFile(file);

      // Auto-populate fields if empty
      if (!title || title.trim() === '') {
        setTitle(parsed.title);
      }
      if (!author || author.trim() === '' || author === 'Pengarang Novel') {
        if (parsed.author && parsed.author !== 'Pengarang Novel') {
          setAuthor(parsed.author);
        }
      }
      if (parsed.synopsis && (!synopsis || synopsis.trim() === '')) {
        setSynopsis(parsed.synopsis);
      }

      setChapters(parsed.chapters);
      setTotalChapters(parsed.totalChapters);
      setTotalPages(parsed.totalPages);
      setSelectedPreviewChapterIdx(0);

      setUploadedPdfInfo({
        name: file.name,
        size: formatFileSize(file.size),
        chaptersDetected: parsed.totalChapters,
        pages: parsed.totalPages,
      });
    } catch (err: any) {
      console.error('Error parsing PDF file:', err);
      alert(`Gagal membaca berkas PDF: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessPdfFile(file);
    }
  };

  const handleDropPdfFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverPdf(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessPdfFile(file);
    }
  };

  // Handle Cover Image File Upload (.png, .jpg, .webp)
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Silakan pilih berkas gambar sampul (.jpg, .jpeg, .png, atau .webp).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('Judul novel dan nama pengarang wajib diisi.');
      return;
    }

    const novelToSave: Novel = {
      id: initialNovel?.id || generateId('novel'),
      title: title.trim(),
      author: author.trim(),
      isOriginalWork,
      genre,
      year: Number(year) || new Date().getFullYear(),
      publisher: publisher.trim() || 'Koleksi Pribadi',
      totalChapters: Math.max(1, Number(totalChapters) || chapters.length || 1),
      totalPages: Math.max(1, Number(totalPages) || 100),
      currentChapter: Math.min(Number(totalChapters) || 1, Math.max(1, Number(currentChapter) || 1)),
      currentPage: Math.max(0, Number(currentPage) || 0),
      status,
      rating: Number(rating) || 5,
      synopsis:
        synopsis.trim() ||
        'Karya novel pilihan yang tersimpan rapi dalam lemari perpustakaan pribadi.',
      accentColor,
      coverImage: coverImage || initialNovel?.coverImage,
      favoriteQuote: favoriteQuote.trim(),
      personalReview: personalReview.trim(),
      tags: initialNovel?.tags || [genre, isOriginalWork ? 'Naskah Sendiri' : 'Koleksi'],
      updatedAt: new Date().toISOString().split('T')[0],
      chapters: chapters.length > 0 ? chapters : [
        {
          chapterNumber: 1,
          title: 'Bab 1: Permulaan',
          content: ['Teks naskah siap dibaca.'],
        },
      ],
    };

    onSaveNovel(novelToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
                {initialNovel ? 'Edit Data & Naskah Novel' : 'Tambah Novel & Unggah Berkas PDF'}
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Unggah berkas novel dalam format PDF (.pdf), foto sampul, dan kelola bab cerita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: UNGGAH BERKAS BUKU (PDF SAJA) & SAMPUL */}
          <div className="p-4 bg-amber-50/50 dark:bg-neutral-850 border border-amber-200/80 dark:border-neutral-750 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 font-mono">
                  Unggah Berkas Naskah Buku (Format PDF Saja)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                .PDF Saja
              </span>
            </div>

            {/* Drag & Drop PDF File Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverPdf(true);
              }}
              onDragLeave={() => setIsDragOverPdf(false)}
              onDrop={handleDropPdfFile}
              onClick={() => pdfFileInputRef.current?.click()}
              className={`p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                isDragOverPdf
                  ? 'border-amber-500 bg-amber-100/60 dark:bg-amber-950/40'
                  : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-amber-400'
              }`}
            >
              <input
                ref={pdfFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfFileChange}
                className="hidden"
              />

              {isParsingPdf ? (
                <div className="flex flex-col items-center gap-2 py-3 text-amber-700 dark:text-amber-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-medium">Mengekstrak teks, bab, dan halaman dari berkas PDF...</span>
                </div>
              ) : uploadedPdfInfo ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>PDF Berhasil Dimuat: <strong>{uploadedPdfInfo.name}</strong> ({uploadedPdfInfo.size})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                    <span>{uploadedPdfInfo.chaptersDetected} Bab Terdeteksi</span>
                    <span>·</span>
                    <span>{uploadedPdfInfo.pages} Halaman PDF</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 underline mt-1">
                    Klik untuk mengganti dengan berkas PDF lain
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Tarik berkas PDF buku Anda ke sini, atau klik untuk memilih file
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Hanya menerima berkas <strong>.PDF</strong>. Teks naskah, halaman, dan bab akan diekstrak secara otomatis.
                  </p>
                </div>
              )}
            </div>

            {/* Cover Image Upload Area */}
            <div className="pt-2 border-t border-amber-200/60 dark:border-neutral-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {coverImage ? (
                  <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-xs shrink-0 group">
                    <img
                      src={coverImage}
                      alt="Pratinjau Sampul"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage(undefined);
                      }}
                      className="absolute inset-0 bg-neutral-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus gambar sampul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-14 h-18 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs text-[10px] font-mono text-center p-1 font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    Sampul Tanpa Gambar
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Foto Sampul Buku (Cover Image)
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    Unggah foto sampul (.jpg, .png, .webp) untuk memperindah rak buku Anda
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{coverImage ? 'Ganti Foto Sampul' : 'Pilih Foto Sampul'}</span>
                </button>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(undefined)}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: METADATA UTAMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Judul Novel *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Bintang Menara Kuno"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Nama Pengarang / Penulis *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama penulis atau nama Anda..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100"
              />
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-[11px] text-amber-700 dark:text-amber-400">
                <input
                  type="checkbox"
                  checked={isOriginalWork}
                  onChange={(e) => {
                    setIsOriginalWork(e.target.checked);
                    if (e.target.checked && (!author || author === 'Pengarang Novel')) {
                      setAuthor('Saya Sendiri');
                    }
                  }}
                  className="rounded border-amber-400 text-amber-600 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <Feather className="w-3 h-3" />
                  Ini adalah naskah cerita buatan saya sendiri
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Genre Novel
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as NovelGenre)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Status Membaca
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NovelStatus)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100"
              >
                <option value="currently_reading">Sedang Dibaca</option>
                <option value="completed">Selesai Dibaca</option>
                <option value="favorite">Koleksi Terfavorit</option>
                <option value="writing_draft">Karya Naskah Sendiri</option>
                <option value="want_to_read">Ingin Dibeli / Dibaca</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Rating Kepuasan (1 - 5 Bintang)
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-200 dark:text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-mono text-xs text-neutral-500 font-semibold">
                  {rating}.0
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Total Bab Novel
              </label>
              <input
                type="number"
                min={1}
                value={totalChapters}
                onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Bab yang Sedang Dibaca
              </label>
              <input
                type="number"
                min={1}
                max={totalChapters}
                value={currentChapter}
                onChange={(e) => setCurrentChapter(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Total Halaman PDF
              </label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Halaman Saat Ini
              </label>
              <input
                type="number"
                min={0}
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden"
              />
            </div>
          </div>

          {/* Accent Color Picker for Spine / Fallback Cover */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Warna Aksen Sampul
            </label>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    accentColor === col
                      ? 'scale-110 ring-2 ring-neutral-900 dark:ring-white ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Sinopsis / Ringkasan Cerita
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Garis besar kisah, dunia cerita, atau tema naskah..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* SECTION 3: PRATINJAU & EDIT BAB CERITA */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-mono">
                  Isi Bab Cerita ({chapters.length} Bab Siap Dibaca)
                </span>
              </div>
              {chapters.length > 1 && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Diekstrak dari dokumen PDF
                </span>
              )}
            </div>

            {/* Chapter selector */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-neutral-500 font-medium shrink-0">
                Pilih Bab untuk Disunting:
              </label>
              <select
                value={selectedPreviewChapterIdx}
                onChange={(e) => setSelectedPreviewChapterIdx(Number(e.target.value))}
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-serif outline-hidden"
              >
                {chapters.map((chap, idx) => (
                  <option key={idx} value={idx}>
                    {chap.title || `Bab ${chap.chapterNumber}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Active chapter title & content */}
            <div className="space-y-2">
              <input
                type="text"
                value={chapters[selectedPreviewChapterIdx]?.title || ''}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setChapters((prev) =>
                    prev.map((c, i) => (i === selectedPreviewChapterIdx ? { ...c, title: newTitle } : c))
                  );
                }}
                placeholder="Judul Bab (contoh: Bab 1: Permulaan)"
                className="w-full px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden font-serif"
              />

              <textarea
                rows={4}
                value={chapters[selectedPreviewChapterIdx]?.content?.join('\n\n') || ''}
                onChange={(e) => {
                  const paragraphs = e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0);
                  setChapters((prev) =>
                    prev.map((c, i) =>
                      i === selectedPreviewChapterIdx
                        ? { ...c, content: paragraphs.length > 0 ? paragraphs : [e.target.value] }
                        : c
                    )
                  );
                }}
                placeholder="Ketik atau edit teks untuk bab ini..."
                className="w-full px-3 py-2 text-xs font-serif bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100 leading-relaxed"
              />
            </div>
          </div>

          {/* Golden Quote */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Kutipan Emas Pilihan (Golden Quote)
            </label>
            <textarea
              rows={2}
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              placeholder="Ketik kalimat atau dialog novel yang paling membekas..."
              className="w-full px-3 py-2 text-xs font-serif bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100 italic"
            />
          </div>

          {/* Personal Review */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Resensi & Catatan Pribadi
            </label>
            <textarea
              rows={2}
              value={personalReview}
              onChange={(e) => setPersonalReview(e.target.value)}
              placeholder="Bagikan kesan, analisis alur, atau catatan penting Anda..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan ke Rak Novel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
