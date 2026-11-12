export type NovelGenre =
  | 'Fantasi & Magis'
  | 'Misteri & Thriller'
  | 'Romansa & Drama'
  | 'Fiksi Ilmiah & Distopia'
  | 'Sastra Nusantara'
  | 'Petualangan & Aksi'
  | 'Horor & Supernatural'
  | 'Sejarah & Epik';

export type NovelStatus =
  | 'currently_reading' // Sedang Dibaca
  | 'completed'         // Selesai Dibaca
  | 'want_to_read'      // Ingin Dibeli / Dibaca
  | 'writing_draft'     // Karya Naskah Sendiri
  | 'favorite';         // Koleksi Terfavorit

export interface NovelChapter {
  chapterNumber: number;
  title: string;
  content: string[]; // array of paragraphs
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  isOriginalWork?: boolean; // karya tulis sendiri
  genre: NovelGenre;
  year: number;
  publisher?: string;
  totalPages: number;
  totalChapters: number;
  currentPage: number;
  currentChapter: number;
  status: NovelStatus;
  rating: number; // 1-5
  synopsis: string;
  coverImage?: string;
  accentColor: string;
  favoriteQuote?: string;
  personalReview?: string;
  tags: string[];
  chapters: NovelChapter[];
  updatedAt: string;
}

export type NovelLibraryView = 'shelf' | 'table' | 'quotes' | 'analytics';
