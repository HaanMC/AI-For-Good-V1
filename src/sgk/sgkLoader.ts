/**
 * SGK Loader
 * Handles fetching and parsing SGK markdown files
 */

import type { SgkManifest, SgkBook, SgkChunk } from './types';

// Get base URL for assets (handles GitHub Pages deployment)
function getBaseUrl(): string {
  // In production, use the base from Vite config
  return import.meta.env.BASE_URL || '/';
}

/**
 * Load the SGK manifest file
 */
export async function loadManifest(): Promise<SgkManifest | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}sgk/manifest.json`);

    if (!response.ok) {
      console.warn('[SGK] Manifest not found (404). SGK features will be unavailable.');
      return null;
    }

    const manifest = await response.json();
    return manifest as SgkManifest;
  } catch (error) {
    console.error('[SGK] Error loading manifest:', error);
    return null;
  }
}

/**
 * Fetch markdown content for a book
 * Returns null if file doesn't exist (404)
 */
export async function fetchMarkdown(book: SgkBook): Promise<string | null> {
  try {
    const baseUrl = getBaseUrl();
    // Remove leading slash from book.md path since baseUrl already ends with /
    const mdPath = book.md.startsWith('/') ? book.md.slice(1) : book.md;
    const response = await fetch(`${baseUrl}${mdPath}`);

    if (!response.ok) {
      console.warn(`[SGK] Markdown file not found for book: ${book.id}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`[SGK] Error fetching markdown for ${book.id}:`, error);
    return null;
  }
}

/**
 * Parse markdown text into chunks
 * Splits by headings (#/##/###) with target chunk size 600-1200 chars
 */
export function parseMarkdownToChunks(mdText: string, bookId: string): SgkChunk[] {
  const lines = mdText.split('\n');
  const chunks: SgkChunk[] = [];

  let currentHeadingPath: string[] = [];
  let currentChunkText: string[] = [];
  let currentStartLine = 1;
  let chunkCounter = 0;

  const MIN_CHUNK_SIZE = 600;
  const MAX_CHUNK_SIZE = 1200;

  function flushChunk(endLine: number) {
    const text = currentChunkText.join('\n').trim();
    if (text.length > 0) {
      chunks.push({
        bookId,
        chunkId: `${bookId}-chunk-${chunkCounter++}`,
        headingPath: currentHeadingPath.join(' > ') || 'Giới thiệu',
        text,
        startLine: currentStartLine,
        endLine: endLine,
      });
    }
    currentChunkText = [];
    currentStartLine = endLine + 1;
  }

  function getHeadingLevel(line: string): number {
    const match = line.match(/^(#{1,6})\s/);
    return match ? match[1].length : 0;
  }

  function getHeadingText(line: string): string {
    return line.replace(/^#{1,6}\s+/, '').trim();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const headingLevel = getHeadingLevel(line);

    if (headingLevel > 0) {
      // Flush current chunk before starting new section
      if (currentChunkText.join('\n').trim().length > 0) {
        flushChunk(lineNumber - 1);
      }

      // Update heading path based on level
      const headingText = getHeadingText(line);

      if (headingLevel === 1) {
        currentHeadingPath = [headingText];
      } else if (headingLevel === 2) {
        currentHeadingPath = currentHeadingPath.slice(0, 1);
        currentHeadingPath.push(headingText);
      } else if (headingLevel === 3) {
        currentHeadingPath = currentHeadingPath.slice(0, 2);
        currentHeadingPath.push(headingText);
      } else {
        // For h4+, just replace last element
        if (currentHeadingPath.length >= headingLevel) {
          currentHeadingPath = currentHeadingPath.slice(0, headingLevel - 1);
        }
        currentHeadingPath.push(headingText);
      }

      currentChunkText.push(line);
      currentStartLine = lineNumber;
    } else {
      currentChunkText.push(line);

      // Check if chunk is getting too large
      const currentSize = currentChunkText.join('\n').length;
      if (currentSize >= MAX_CHUNK_SIZE) {
        // Try to find a natural break point (paragraph break)
        const text = currentChunkText.join('\n');
        const lastDoubleNewline = text.lastIndexOf('\n\n');

        if (lastDoubleNewline > MIN_CHUNK_SIZE) {
          // Split at paragraph break
          const textToFlush = text.slice(0, lastDoubleNewline);
          const remaining = text.slice(lastDoubleNewline + 2);

          currentChunkText = [textToFlush];
          flushChunk(lineNumber);

          currentChunkText = [remaining];
        } else {
          // Force flush at max size
          flushChunk(lineNumber);
        }
      }
    }
  }

  // Flush any remaining content
  if (currentChunkText.join('\n').trim().length > 0) {
    flushChunk(lines.length);
  }

  return chunks;
}

/**
 * Extract topic candidates from chunks (headings for autocomplete)
 */
export function extractTopicCandidates(chunks: SgkChunk[]): string[] {
  const topicsSet = new Set<string>();

  for (const chunk of chunks) {
    // Add full heading path
    if (chunk.headingPath) {
      topicsSet.add(chunk.headingPath);

      // Also add individual heading parts
      const parts = chunk.headingPath.split(' > ');
      for (const part of parts) {
        if (part.trim()) {
          topicsSet.add(part.trim());
        }
      }
    }
  }

  return Array.from(topicsSet).sort();
}
