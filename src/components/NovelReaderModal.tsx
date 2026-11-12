import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  Flame,
  Bookmark,
  CheckCircle2,
  Quote,
  Edit3,
  Download,
} from 'lucide-react';
import { Novel, NovelChapter } from '../types/novel';
import { downloadNovelAsPdf } from '../utils/pdfService';

interface NovelReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel | null;
  onUpdateProgress: (novelId: string, chapter: number, page: number) => void;
  onSaveQuote: (novelId: string, quote: string) => void;
  onSaveReview: (novelId: string, review: string) => void;
}

export const NovelReaderModal: React.FC<NovelReaderModalProps> = ({
  isOpen,
  onClose,
  novel,
  onUpdateProgress,
  onSaveQuote,
  onSaveReview,
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readerTheme, setReaderTheme] = useState<'paper' | 'candle' | 'white' | 'dark'>('paper');
  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');
  const [editingReview, setEditingReview] = useState(false);
  const [reviewInput, setReviewInput] = useState('');

  if (!isOpen || !novel) return null;

  const chapters: NovelChapter[] =
    novel.chapters && novel.chapters.length > 0
      ? novel.chapters
      : [
          {
            chapterNumber: 1,
            title: 'Bab 1: Permulaan Kisah',
            content: [
              'Halaman pertama dibuka dengan suasana hening. Kata-kata mengalir membawa pembaca ke dalam dunia gagasan dan cerita yang tak terbatas.',
              'Perjalanan panjang selalu diawali dengan rasa ingin tahu dan keberanian untuk membuka halaman berikutnya.',
            ],
          },
        ];

  const currentChapter = chapters[currentChapterIdx] || chapters[0];

  const fontClasses = {
    normal: 'text-sm leading-relaxed sm:text-base sm:leading-loose',
    large: 'text-base leading-relaxed sm:text-lg sm:leading-loose',
    xlarge: 'text-lg leading-relaxed sm:text-xl sm:leading-loose',
  };

  const themeClasses = {
    paper: 'bg-[#FDFBF7] text-[#2D2A26] border-[#E8E2D8]',
    candle: 'bg-[#FBF6ED] text-[#3D2C1E] border-[#EADFCF]',
    white: 'bg-white text-neutral-900 border-neutral-200',
    dark: 'bg-[#18181B] text-[#E4E4E7] border-neutral-800',
  };

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      const nextIdx = currentChapterIdx + 1;
      setCurrentChapterIdx(nextIdx);
      onUpdateProgress(novel.id, nextIdx + 1, Math.round(((nextIdx + 1) / (chapters.length || 1)) * novel.totalPages));
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(currentChapterIdx - 1);
    }
  };

  const handleMarkChapterRead = () => {
    const chapterNum = currentChapter.chapterNumber;
    const estPage = Math.min(
      novel.totalPages,
      Math.round((chapterNum / (novel.totalChapters || 1)) * novel.totalPages)
    );
    onUpdateProgress(novel.id, chapterNum, estPage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-neutral-950/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-3xl max-h-[94vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors ${themeClasses[readerTheme]}`}
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b flex items-center justify-between shrink-0 border-inherit">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-xs font-serif font-bold truncate block">
                {novel.title}
              </span>
              <span className="text-[10px] font-mono opacity-60">
                Karya {novel.author} · {novel.genre}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font size adjustment */}
            <div className="flex items-center gap-1 border rounded-lg px-2 py-0.5 text-xs border-inherit">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1 font-serif ${fontSize === 'normal' ? 'font-bold underline' : 'opacity-60'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1 font-serif text-sm ${fontSize === 'large' ? 'font-bold underline' : 'opacity-60'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-1 font-serif text-base ${fontSize === 'xlarge' ? 'font-bold underline' : 'opacity-60'}`}
              >
                A++
              </button>
            </div>

            {/* Reading ambience themes */}
            <div className="flex items-center gap-0.5 border rounded-lg p-0.5 border-inherit text-xs">
              <button
                onClick={() => setReaderTheme('paper')}
                title="Kertas Klasik"
                className={`p-1 rounded ${readerTheme === 'paper' ? 'bg-[#EAE4D9]' : 'opacity-60'}`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('candle')}
                title="Lilin Hangat"
                className={`p-1 rounded ${readerTheme === 'candle' ? 'bg-[#EDDEC9]' : 'opacity-60'}`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-700" />
              </button>
              <button
                onClick={() => setReaderTheme('white')}
                title="Putih Bersih"
                className={`p-1 rounded ${readerTheme === 'white' ? 'bg-neutral-200' : 'opacity-60'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                title="Mode Malam"
                className={`p-1 rounded ${readerTheme === 'dark' ? 'bg-neutral-700 text-white' : 'opacity-60'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Novel as PDF */}
            <button
              onClick={() => downloadNovelAsPdf(novel)}
              title="Unduh Novel Lengkap (Format PDF)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans rounded-lg border border-inherit opacity-80 hover:opacity-100 hover:bg-neutral-500/10 transition-opacity"
            >
              <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline font-medium">Unduh PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-neutral-500/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Body Canvas */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-14 py-8 space-y-8 font-serif">
          {/* Chapter Selector & Title */}
          <div className="text-center space-y-2 pb-6 border-b border-inherit">
            <span className="text-[11px] font-mono uppercase tracking-widest opacity-60 block">
              {novel.title} · Bab {currentChapter.chapterNumber} dari {chapters.length}
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl leading-tight">
              {currentChapter.title}
            </h1>

            {/* Reading progress indication */}
            <div className="pt-2 flex items-center justify-center gap-3 font-sans text-xs opacity-75">
              <span>Progres Anda: Bab {novel.currentChapter} / {novel.totalChapters}</span>
              <button
                onClick={handleMarkChapterRead}
                className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium flex items-center gap-1 hover:opacity-90"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Tandai Sampai Bab Ini</span>
              </button>
            </div>
          </div>

          {/* Chapter Paragraphs */}
          <div className={`space-y-6 ${fontClasses[fontSize]}`}>
            {currentChapter.content.map((paragraph, idx) => (
              <p key={idx} className="indent-8 text-justify leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Golden Quote from this novel */}
          <div className="pt-8 border-t border-inherit font-sans space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
                <Quote className="w-3.5 h-3.5 text-amber-600" />
                <span>Kutipan Emas Pilihan</span>
              </div>
              <button
                onClick={() => {
                  setQuoteInput(novel.favoriteQuote || '');
                  setEditingQuote(!editingQuote);
                }}
                className="text-[11px] underline opacity-70 hover:opacity-100"
              >
                {editingQuote ? 'Batal' : novel.favoriteQuote ? 'Ubah Kutipan' : '+ Tulis Kutipan'}
              </button>
            </div>

            {editingQuote ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="Ketik kalimat atau dialog novel yang paling menyentuh hati..."
                  className="w-full p-2.5 text-xs border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-inherit outline-hidden font-serif"
                />
                <button
                  onClick={() => {
                    onSaveQuote(novel.id, quoteInput.trim());
                    setEditingQuote(false);
                  }}
                  className="px-3 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded text-xs"
                >
                  Simpan Kutipan
                </button>
              </div>
            ) : novel.favoriteQuote ? (
              <blockquote className="p-4 rounded-xl border border-inherit bg-amber-500/5 font-serif text-sm italic">
                "{novel.favoriteQuote}"
              </blockquote>
            ) : (
              <p className="text-xs opacity-50 italic">
                Belum ada kutipan emas yang dicatat dari novel ini.
              </p>
            )}
          </div>

          {/* Personal Review & Notes */}
          <div className="pt-4 border-t border-inherit font-sans space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Resensi & Catatan Pribadi</span>
              </div>
              <button
                onClick={() => {
                  setReviewInput(novel.personalReview || '');
                  setEditingReview(!editingReview);
                }}
                className="text-[11px] underline opacity-70 hover:opacity-100"
              >
                {editingReview ? 'Batal' : novel.personalReview ? 'Ubah Resensi' : '+ Tulis Catatan'}
              </button>
            </div>

            {editingReview ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Tulis kesan, analisis alur, atau ulasan pribadi Anda terhadap novel ini..."
                  className="w-full p-2.5 text-xs border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-inherit outline-hidden font-sans"
                />
                <button
                  onClick={() => {
                    onSaveReview(novel.id, reviewInput.trim());
                    setEditingReview(false);
                  }}
                  className="px-3 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded text-xs"
                >
                  Simpan Resensi
                </button>
              </div>
            ) : novel.personalReview ? (
              <p className="p-4 rounded-xl border border-inherit bg-neutral-500/5 text-xs leading-relaxed opacity-90">
                {novel.personalReview}
              </p>
            ) : (
              <p className="text-xs opacity-50 italic">
                Belum ada catatan resensi pribadi untuk novel ini.
              </p>
            )}
          </div>
        </div>

        {/* Footer Navigation (Previous Chapter & Next Chapter) */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-xs font-sans border-inherit shrink-0">
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterIdx === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-inherit hover:bg-neutral-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Bab Sebelumnya</span>
          </button>

          <span className="font-mono text-[11px] opacity-60">
            Bab {currentChapterIdx + 1} dari {chapters.length}
          </span>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIdx >= chapters.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-inherit bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-30 disabled:bg-transparent disabled:text-inherit"
          >
            <span>Bab Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
