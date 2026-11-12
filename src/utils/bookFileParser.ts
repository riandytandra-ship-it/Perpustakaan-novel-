import JSZip from 'jszip';
import { NovelChapter } from '../types/novel';

export interface ParsedBookResult {
  title: string;
  author: string;
  synopsis: string;
  coverImage?: string;
  chapters: NovelChapter[];
  totalChapters: number;
  totalPages: number;
  wordCount: number;
  fileName: string;
  fileSizeFormatted: string;
}

/**
 * Format bytes into human readable KB / MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Clean filename into a book title candidate
 */
export function cleanFileNameToTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  return withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Parse plain text or Markdown into chapters
 */
export function parseTextNovel(text: string, fileName: string): ParsedBookResult {
  const cleanTitle = cleanFileNameToTitle(fileName);
  let author = '';
  let synopsis = '';

  const lines = text.split(/\r?\n/);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

  // Check top lines for metadata like "Judul:", "Pengarang:", "Oleh:", "Sinopsis:"
  let contentStartIndex = 0;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    if (/^(?:pengarang|penulis|author|oleh|by)\s*[:=]\s*(.+)$/i.test(line)) {
      const match = line.match(/^(?:pengarang|penulis|author|oleh|by)\s*[:=]\s*(.+)$/i);
      if (match) author = match[1].trim();
      contentStartIndex = Math.max(contentStartIndex, i + 1);
    } else if (/^(?:judul|title)\s*[:=]\s*(.+)$/i.test(line)) {
      contentStartIndex = Math.max(contentStartIndex, i + 1);
    } else if (/^(?:sinopsis|ringkasan|synopsis)\s*[:=]\s*(.+)$/i.test(line)) {
      const match = line.match(/^(?:sinopsis|ringkasan|synopsis)\s*[:=]\s*(.+)$/i);
      if (match) synopsis = match[1].trim();
      contentStartIndex = Math.max(contentStartIndex, i + 1);
    }
  }

  // Detect chapters via regex
  // Pattern matches: "Bab 1", "BAB I", "Chapter 1", "Bagian 1", "## Bab 1", etc.
  const chapterRegex = /^(?:#{1,3}\s*)?(?:bab|chapter|bagian)\s+(?:[0-9]+|[ivxldcm]+)(?:\s*[:\-–—]\s*.*)?$/i;

  const rawChapters: { title: string; paragraphs: string[] }[] = [];
  let currentTitle = 'Bab 1: Permulaan';
  let currentParas: string[] = [];

  const remainingText = lines.slice(contentStartIndex).join('\n');
  const rawParagraphs = remainingText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (const para of rawParagraphs) {
    const firstLine = para.split('\n')[0].trim();
    if (chapterRegex.test(firstLine)) {
      if (currentParas.length > 0) {
        rawChapters.push({ title: currentTitle, paragraphs: currentParas });
        currentParas = [];
      }
      currentTitle = firstLine.replace(/^#{1,3}\s*/, '').trim();
      // If there are other lines in this paragraph, include them
      const otherLines = para.split('\n').slice(1).join('\n').trim();
      if (otherLines) {
        currentParas.push(otherLines);
      }
    } else {
      currentParas.push(para);
    }
  }

  if (currentParas.length > 0) {
    rawChapters.push({ title: currentTitle, paragraphs: currentParas });
  }

  // If no chapter headers were found at all, partition long text every ~12 paragraphs
  const finalChapters: NovelChapter[] = [];
  if (rawChapters.length <= 1 && rawParagraphs.length > 15) {
    const parasPerChapter = 12;
    const numChapters = Math.ceil(rawParagraphs.length / parasPerChapter);
    for (let c = 0; c < numChapters; c++) {
      const slice = rawParagraphs.slice(c * parasPerChapter, (c + 1) * parasPerChapter);
      finalChapters.push({
        chapterNumber: c + 1,
        title: `Bab ${c + 1}: Bagian ${c + 1}`,
        content: slice,
      });
    }
  } else if (rawChapters.length > 0) {
    rawChapters.forEach((rc, idx) => {
      finalChapters.push({
        chapterNumber: idx + 1,
        title: rc.title || `Bab ${idx + 1}`,
        content: rc.paragraphs.length > 0 ? rc.paragraphs : ['Teks bab ini sedang disiapkan.'],
      });
    });
  } else {
    finalChapters.push({
      chapterNumber: 1,
      title: 'Bab 1: Permulaan Cerita',
      content: rawParagraphs.length > 0 ? rawParagraphs : ['Belum ada teks naskah.'],
    });
  }

  return {
    title: cleanTitle,
    author: author || 'Pengarang Novel',
    synopsis: synopsis || (rawParagraphs[0] ? rawParagraphs[0].slice(0, 240) + '...' : ''),
    chapters: finalChapters,
    totalChapters: finalChapters.length,
    totalPages: estimatedPages,
    wordCount,
    fileName,
    fileSizeFormatted: `${Math.round(text.length / 1024)} KB`,
  };
}

/**
 * Parse an EPUB file using JSZip
 */
export async function parseEpubNovel(file: File): Promise<ParsedBookResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  let title = cleanFileNameToTitle(file.name);
  let author = 'Pengarang Novel';
  let synopsis = '';
  let coverImage: string | undefined = undefined;

  // 1. Locate container.xml to find .opf package file
  let opfPath = '';
  const containerFile = zipContent.file('META-INF/container.xml');
  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const match = containerXml.match(/full-path\s*=\s*["']([^"']+)["']/i);
    if (match) {
      opfPath = match[1];
    }
  }

  // Fallback: look for any .opf file
  if (!opfPath) {
    const opfEntries = zipContent.file(/\.opf$/i);
    if (opfEntries.length > 0) {
      opfPath = opfEntries[0].name;
    }
  }

  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // Extract metadata from OPF
  if (opfPath) {
    const opfFile = zipContent.file(opfPath);
    if (opfFile) {
      const opfXml = await opfFile.async('text');

      const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
      if (titleMatch) title = titleMatch[1].trim();

      const authorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
      if (authorMatch) author = authorMatch[1].trim();

      const descMatch = opfXml.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i);
      if (descMatch) synopsis = descMatch[1].replace(/<[^>]+>/g, '').trim();

      // Look for cover image reference in manifest
      const coverItemMatch =
        opfXml.match(/<item[^>]+id=["'](?:cover|cover-image|my-cover)["'][^>]+href=["']([^"']+)["']/i) ||
        opfXml.match(/<item[^>]+href=["']([^"']+)["'][^>]+properties=["']cover-image["']/i);

      if (coverItemMatch) {
        const coverRelativeHref = coverItemMatch[1];
        const coverFullPath = opfDir + coverRelativeHref;
        const coverFile = zipContent.file(coverFullPath) || zipContent.file(coverRelativeHref);
        if (coverFile) {
          const base64 = await coverFile.async('base64');
          const ext = coverFullPath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          coverImage = `data:image/${ext};base64,${base64}`;
        }
      }
    }
  }

  // If no cover yet, find any image matching cover
  if (!coverImage) {
    const coverFiles = zipContent.file(/cover.*\.(?:jpg|jpeg|png|webp)$/i);
    if (coverFiles.length > 0) {
      const cFile = coverFiles[0];
      const base64 = await cFile.async('base64');
      const ext = cFile.name.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
      coverImage = `data:image/${ext};base64,${base64}`;
    }
  }

  // 2. Extract HTML/XHTML chapters
  const htmlFiles = zipContent.file(/\.(?:xhtml|html|htm)$/i);
  // Sort files naturally by filename
  htmlFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  const chapters: NovelChapter[] = [];
  let totalWords = 0;

  for (let i = 0; i < htmlFiles.length; i++) {
    const hFile = htmlFiles[i];
    // Skip cover/nav/toc pages if they don't have substantial content
    if (/cover|titlepage|nav|toc/i.test(hFile.name) && htmlFiles.length > 3) {
      continue;
    }

    const html = await hFile.async('text');

    // Extract title from <h1>, <h2>, or <title>
    let chapTitle = `Bab ${chapters.length + 1}`;
    const headingMatch = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/i);
    if (headingMatch) {
      chapTitle = headingMatch[1].trim();
    }

    // Extract text paragraphs
    const paragraphs: string[] = [];
    // Match <p>...</p> tags
    const pMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    for (const match of pMatches) {
      const cleanPara = match[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      if (cleanPara.length > 10) {
        paragraphs.push(cleanPara);
        totalWords += cleanPara.split(/\s+/).length;
      }
    }

    if (paragraphs.length > 0) {
      chapters.push({
        chapterNumber: chapters.length + 1,
        title: chapTitle,
        content: paragraphs,
      });
    }
  }

  // Fallback if no paragraphs were extracted
  if (chapters.length === 0) {
    chapters.push({
      chapterNumber: 1,
      title: 'Bab 1: Permulaan',
      content: ['Berkas naskah EPUB berhasil diimpor ke dalam rak novel pribadi Anda.'],
    });
  }

  const estimatedPages = Math.max(1, Math.ceil(totalWords / 250));

  return {
    title,
    author,
    synopsis: synopsis || (chapters[0]?.content[0] ? chapters[0].content[0].slice(0, 240) + '...' : ''),
    coverImage,
    chapters,
    totalChapters: chapters.length,
    totalPages: estimatedPages > 1 ? estimatedPages : 250,
    wordCount: totalWords,
    fileName: file.name,
    fileSizeFormatted: formatFileSize(file.size),
  };
}

/**
 * Universal book file parser entry point
 */
export async function parseAnyBookFile(file: File): Promise<ParsedBookResult> {
  const name = file.name.toLowerCase();

  // EPUB
  if (name.endsWith('.epub')) {
    return parseEpubNovel(file);
  }

  // JSON Novel / Backup
  if (name.endsWith('.json')) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const item = Array.isArray(parsed) ? parsed[0] : parsed;
    return {
      title: item.title || cleanFileNameToTitle(file.name),
      author: item.author || 'Pengarang Novel',
      synopsis: item.synopsis || '',
      coverImage: item.coverImage,
      chapters: item.chapters && item.chapters.length > 0 ? item.chapters : [
        {
          chapterNumber: 1,
          title: 'Bab 1',
          content: ['Konten novel dari file JSON.'],
        },
      ],
      totalChapters: item.totalChapters || 1,
      totalPages: item.totalPages || 100,
      wordCount: 1000,
      fileName: file.name,
      fileSizeFormatted: formatFileSize(file.size),
    };
  }

  // Plain Text, Markdown, HTML
  if (
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.text') ||
    name.endsWith('.markdown') ||
    name.endsWith('.html') ||
    name.endsWith('.htm') ||
    file.type.startsWith('text/')
  ) {
    const text = await file.text();
    return parseTextNovel(text, file.name);
  }

  // PDF or other binary document fallback
  const cleanTitle = cleanFileNameToTitle(file.name);
  return {
    title: cleanTitle,
    author: 'Pengarang Novel',
    synopsis: `Berkas buku "${file.name}" tersimpan dalam format digital.`,
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Permulaan',
        content: [
          `Berkas dokumen "${file.name}" (${formatFileSize(file.size)}) telah berhasil ditautkan ke dalam koleksi novel pribadi Anda.`,
          'Anda dapat membaca bab ceritanya di sini atau menambahkan catatan resensi dan kutipan emas favorit.',
        ],
      },
    ],
    totalChapters: 1,
    totalPages: Math.max(1, Math.round(file.size / 1500)),
    wordCount: 500,
    fileName: file.name,
    fileSizeFormatted: formatFileSize(file.size),
  };
}
