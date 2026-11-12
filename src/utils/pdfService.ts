import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { Novel, NovelChapter } from '../types/novel';
import { ParsedBookResult, cleanFileNameToTitle, formatFileSize } from './bookFileParser';

// Configure pdfjs worker for browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extract text, pages, and chapters from an uploaded PDF file
 */
export async function parsePdfFile(file: File): Promise<ParsedBookResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const numPages = pdf.numPages;
  const pageTexts: { pageNum: number; text: string }[] = [];
  let fullText = '';
  let totalWords = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => item.str || '')
      .filter((s: string) => s.trim().length > 0);

    const pageJoined = strings.join(' ').replace(/\s+/g, ' ').trim();
    if (pageJoined.length > 0) {
      pageTexts.push({ pageNum: i, text: pageJoined });
      fullText += '\n\n' + pageJoined;
      totalWords += pageJoined.split(/\s+/).length;
    }
  }

  const cleanTitle = cleanFileNameToTitle(file.name);
  let author = 'Pengarang Novel';
  let synopsis = '';

  // Detect metadata in the first 2 pages
  const firstPagesText = pageTexts.slice(0, 2).map((p) => p.text).join(' ');
  const authorMatch = firstPagesText.match(/(?:oleh|by|penulis|pengarang|author)\s*[:=]?\s*([A-Za-z\s.]{3,35})(?:\s*[,\n]|\s+(?:tahun|penerbit|bab|hal))/i);
  if (authorMatch) {
    author = authorMatch[1].trim();
  }

  // Extract chapters from PDF text
  // Look for "Bab 1", "BAB I", "Chapter 1", etc.
  const chapterRegex = /(?:^|\n)\s*(?:bab|chapter|bagian)\s+([0-9]+|[ivxldcm]+)(?:\s*[:\-–—]\s*([^\n]{3,60}))?/gi;
  const chapters: NovelChapter[] = [];

  // Group pages into chapters:
  // If chapter markers exist in text:
  const matches = [...fullText.matchAll(chapterRegex)];

  if (matches.length > 1) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startIdx = match.index || 0;
      const endIdx = i < matches.length - 1 ? (matches[i + 1].index || fullText.length) : fullText.length;
      const chapterBody = fullText.substring(startIdx + match[0].length, endIdx).trim();

      const paragraphs = chapterBody
        .split(/\n\s*\n|\.\s{2,}/)
        .map((p) => p.trim())
        .filter((p) => p.length > 15);

      const titleSuffix = match[2] ? `: ${match[2].trim()}` : '';
      const chapTitle = `Bab ${i + 1}${titleSuffix}`;

      chapters.push({
        chapterNumber: i + 1,
        title: chapTitle,
        content: paragraphs.length > 0 ? paragraphs : [chapterBody.slice(0, 1500)],
      });
    }
  } else {
    // If no explicit chapter headers, group pages into chapters (e.g. 1 chapter per 5-10 pages or per page)
    const pagesPerChapter = numPages > 30 ? 5 : numPages > 10 ? 3 : 1;
    const totalChaps = Math.max(1, Math.ceil(pageTexts.length / pagesPerChapter));

    for (let c = 0; c < totalChaps; c++) {
      const slice = pageTexts.slice(c * pagesPerChapter, (c + 1) * pagesPerChapter);
      const paras = slice.map((p) => p.text);
      const startP = c * pagesPerChapter + 1;
      const endP = Math.min(pageTexts.length, (c + 1) * pagesPerChapter);

      chapters.push({
        chapterNumber: c + 1,
        title: pagesPerChapter === 1 ? `Bab ${c + 1} (Halaman ${startP})` : `Bab ${c + 1} (Halaman ${startP} - ${endP})`,
        content: paras,
      });
    }
  }

  // Synopsis from first chapter paragraph
  if (chapters[0] && chapters[0].content[0]) {
    synopsis = chapters[0].content[0].slice(0, 260) + '...';
  } else {
    synopsis = `Koleksi naskah digital dari berkas "${file.name}" dengan total ${numPages} halaman.`;
  }

  return {
    title: cleanTitle,
    author,
    synopsis,
    chapters: chapters.length > 0 ? chapters : [
      {
        chapterNumber: 1,
        title: 'Bab 1: Permulaan Dokumen',
        content: ['Berkas PDF telah berhasil diimpor ke dalam rak novel pribadi Anda.'],
      },
    ],
    totalChapters: chapters.length || 1,
    totalPages: numPages,
    wordCount: totalWords,
    fileName: file.name,
    fileSizeFormatted: formatFileSize(file.size),
  };
}

/**
 * Generate and download a complete Novel as a PDF Book
 */
export function downloadNovelAsPdf(novel: Novel): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // --- HALAMAN 1: SAMPUL / TITLE PAGE ---
  // Background accent banner
  doc.setFillColor(245, 240, 230); // warm paper color
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(30, 27, 75); // deep header
  doc.rect(margin, 25, contentWidth, 4, 'F');

  // Genre badge
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9); // amber
  doc.text(novel.genre.toUpperCase(), margin, 38);

  // Book Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(24, 24, 27); // near black
  const titleLines = doc.splitTextToSize(novel.title, contentWidth);
  doc.text(titleLines, margin, 50);

  const titleHeight = titleLines.length * 10;
  let currentY = 50 + titleHeight + 4;

  // Author & Publisher
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(`Karya: ${novel.author}`, margin, currentY);
  currentY += 8;

  if (novel.publisher) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Penerbit: ${novel.publisher} (${novel.year})`, margin, currentY);
    currentY += 12;
  } else {
    currentY += 8;
  }

  // Divider
  doc.setDrawColor(210, 200, 185);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Metadata Specs Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);

  const colWidth = contentWidth / 4;
  doc.text('TOTAL BAB', margin + 6, currentY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${novel.totalChapters} Bab`, margin + 6, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL HALAMAN', margin + colWidth + 6, currentY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${novel.totalPages} Halaman`, margin + colWidth + 6, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('PROGRES BACA', margin + colWidth * 2 + 6, currentY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bab ${novel.currentChapter}`, margin + colWidth * 2 + 6, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('RATING', margin + colWidth * 3 + 6, currentY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${novel.rating}.0 / 5.0`, margin + colWidth * 3 + 6, currentY + 16);

  currentY += 32;

  // Synopsis Box
  if (novel.synopsis) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 75);
    doc.text('SINOPSIS CERITA', margin, currentY);
    currentY += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
    const synopLines = doc.splitTextToSize(novel.synopsis, contentWidth);
    doc.text(synopLines, margin, currentY);
    currentY += synopLines.length * 5.5 + 8;
  }

  // Favorite Quote Box
  if (novel.favoriteQuote) {
    doc.setFillColor(254, 249, 195); // pale yellow
    const quoteLines = doc.splitTextToSize(`"${novel.favoriteQuote}"`, contentWidth - 16);
    const boxH = quoteLines.length * 6 + 12;

    doc.roundedRect(margin, currentY, contentWidth, boxH, 2, 2, 'F');
    doc.setDrawColor(217, 119, 6); // amber border
    doc.rect(margin, currentY, 3, boxH, 'F'); // left accent

    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(120, 53, 15);
    doc.text(quoteLines, margin + 8, currentY + 8);
    currentY += boxH + 8;
  }

  // Personal Review
  if (novel.personalReview && currentY < pageHeight - 40) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('CATATAN RESENSI PRIBADI:', margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const reviewLines = doc.splitTextToSize(novel.personalReview, contentWidth);
    doc.text(reviewLines, margin, currentY);
  }

  // Footer cover
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('PustakaNovel - Koleksi Perpustakaan Pribadi', margin, pageHeight - 12);

  // --- HALAMAN 2+: BAB-BAB CERITA ---
  const chapters = novel.chapters && novel.chapters.length > 0
    ? novel.chapters
    : [{ chapterNumber: 1, title: 'Bab 1', content: ['Belum ada teks naskah.'] }];

  for (let c = 0; c < chapters.length; c++) {
    const chap = chapters[c];
    doc.addPage();
    let y = margin + 10;

    // Running Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(novel.title.toUpperCase(), margin, margin);
    doc.text(`BAB ${c + 1}`, pageWidth - margin - 15, margin);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, margin + 3, pageWidth - margin, margin + 3);

    // Chapter Title
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 27, 75);
    doc.text(chap.title || `Bab ${c + 1}`, margin, y + 8);
    y += 18;

    // Chapter Content Paragraphs
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(35, 35, 35);

    for (const paragraph of chap.content) {
      const paraLines = doc.splitTextToSize(paragraph, contentWidth);
      const neededHeight = paraLines.length * 6 + 6;

      if (y + neededHeight > pageHeight - margin - 10) {
        // Page break inside chapter
        doc.addPage();
        y = margin + 10;

        // Running Header on continued page
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(novel.title.toUpperCase(), margin, margin);
        doc.text(`BAB ${c + 1} (Lanjutan)`, pageWidth - margin - 25, margin);
        doc.line(margin, margin + 3, pageWidth - margin, margin + 3);

        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(35, 35, 35);
      }

      // First line indent for novel look
      doc.text(paraLines, margin, y);
      y += neededHeight;
    }

    // Page number in footer
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Halaman ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Trigger browser download
  const safeTitle = novel.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
  doc.save(`${safeTitle}.pdf`);
}

/**
 * Generate and download the complete Library Catalog as a PDF Document
 */
export function downloadCatalogAsPdf(novels: Novel[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(30, 27, 75); // dark navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('KATALOG PERPUSTAKAAN NOVEL PRIBADI', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 230);
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Dicetak pada: ${dateStr} · Format Berkas Dokumen PDF`, margin, 24);

  // Summary Metrics Banner
  let y = 40;
  doc.setFillColor(245, 245, 247);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  const totalPagesRead = novels.reduce((acc, n) => acc + (n.currentPage || 0), 0);
  const totalAllPages = novels.reduce((acc, n) => acc + (n.totalPages || 0), 0);
  const completedCount = novels.filter((n) => n.status === 'completed').length;
  const originalWorks = novels.filter((n) => n.isOriginalWork).length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL KOLEKSI', margin + 6, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(`${novels.length} Judul`, margin + 6, y + 13);

  const colW = contentWidth / 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('SELESAI DIBACA', margin + colW + 6, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 149, 106); // emerald
  doc.text(`${completedCount} Novel`, margin + colW + 6, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('NASKAH SENDIRI', margin + colW * 2 + 6, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199); // sky
  doc.text(`${originalWorks} Naskah`, margin + colW * 2 + 6, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('HALAMAN DIBACA', margin + colW * 3 + 6, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber
  doc.text(`${totalPagesRead} / ${totalAllPages} hlm`, margin + colW * 3 + 6, y + 13);

  y += 26;

  // Novel Entries
  for (let i = 0; i < novels.length; i++) {
    const novel = novels[i];
    const itemHeight = novel.favoriteQuote ? 32 : 25;

    // Check if new page needed
    if (y + itemHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 10;
    }

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(225, 225, 230);
    doc.roundedRect(margin, y, contentWidth, itemHeight, 2, 2, 'FD');

    // Accent strip
    doc.setFillColor(30, 27, 75);
    doc.rect(margin, y, 2.5, itemHeight, 'F');

    // Number & Title
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text(`${i + 1}. ${novel.title}`, margin + 6, y + 6);

    // Status pill
    let statusLabel = 'Sedang Dibaca';
    if (novel.status === 'completed') statusLabel = 'Selesai';
    else if (novel.status === 'favorite') statusLabel = 'Favorit';
    else if (novel.status === 'writing_draft' || novel.isOriginalWork) statusLabel = 'Naskah Sendiri';
    else if (novel.status === 'want_to_read') statusLabel = 'Daftar Impian';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 120);
    doc.text(`[${statusLabel.toUpperCase()}]`, pageWidth - margin - 35, y + 6);

    // Author & Genre
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text(`Pengarang: ${novel.author}  ·  Genre: ${novel.genre}  ·  Tahun: ${novel.year}`, margin + 6, y + 12);

    // Reading Progress & Rating
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const progressText = `Progres: Bab ${novel.currentChapter}/${novel.totalChapters} (${novel.currentPage}/${novel.totalPages} hlm)  ·  Rating: ${novel.rating}.0/5.0`;
    doc.text(progressText, margin + 6, y + 17);

    // Favorite Quote snippet if any
    if (novel.favoriteQuote) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 80, 20);
      const qSnippet = doc.splitTextToSize(`"${novel.favoriteQuote}"`, contentWidth - 14);
      doc.text(qSnippet[0], margin + 6, y + 23);
    }

    y += itemHeight + 3.5;
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Katalog Pustaka Novel Pribadi · Halaman ${p} dari ${pageCount}`, pageWidth / 2, pageHeight - 8, {
      align: 'center',
    });
  }

  doc.save(`Katalog_Pustaka_Novel_Pribadi_${new Date().toISOString().slice(0, 10)}.pdf`);
}
