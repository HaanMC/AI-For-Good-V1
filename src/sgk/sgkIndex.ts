/**
 * SGK Index
 * Full-text search index for SGK chunks using a simple TF-IDF approach
 * (No external dependencies - lightweight implementation)
 */

import type { SgkChunk, SgkSearchResult } from './types';

interface IndexedDocument {
  chunk: SgkChunk;
  tokens: string[];
  tokenFreqs: Map<string, number>;
}

interface SearchIndex {
  documents: IndexedDocument[];
  idf: Map<string, number>;
  totalDocs: number;
}

// Vietnamese stop words to filter out
const STOP_WORDS = new Set([
  'và', 'của', 'là', 'có', 'được', 'trong', 'cho', 'này', 'đã', 'với',
  'các', 'những', 'không', 'một', 'như', 'để', 'tại', 'khi', 'từ', 'còn',
  'hay', 'đến', 'về', 'theo', 'sau', 'trước', 'nếu', 'vì', 'bởi', 'mà',
  'rằng', 'thì', 'cũng', 'đều', 'lại', 'nên', 'ra', 'vào', 'lên', 'xuống',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'có thể', 'sẽ', 'đang', 'rất', 'cùng', 'nhất', 'qua', 'hơn'
]);

let searchIndex: SearchIndex | null = null;

/**
 * Tokenize Vietnamese text
 */
function tokenize(text: string): string[] {
  // Convert to lowercase and normalize
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics for matching
    .replace(/đ/g, 'd')
    .replace(/[^\w\s]/g, ' ')
    .trim();

  // Split into tokens
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));

  return tokens;
}

/**
 * Tokenize preserving Vietnamese diacritics for display
 */
function tokenizePreserve(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\sàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, ' ')
    .trim();

  return normalized.split(/\s+/).filter(t => t.length > 1);
}

/**
 * Build search index from chunks
 */
export function buildIndex(chunks: SgkChunk[]): void {
  const documents: IndexedDocument[] = [];
  const docFreqs = new Map<string, number>();

  for (const chunk of chunks) {
    // Index both heading and text
    const fullText = `${chunk.headingPath} ${chunk.text}`;
    const tokens = tokenize(fullText);

    // Calculate term frequencies
    const tokenFreqs = new Map<string, number>();
    const uniqueTokens = new Set<string>();

    for (const token of tokens) {
      tokenFreqs.set(token, (tokenFreqs.get(token) || 0) + 1);
      uniqueTokens.add(token);
    }

    // Update document frequencies
    for (const token of uniqueTokens) {
      docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
    }

    documents.push({
      chunk,
      tokens,
      tokenFreqs,
    });
  }

  // Calculate IDF
  const idf = new Map<string, number>();
  const totalDocs = documents.length;

  for (const [term, df] of docFreqs) {
    idf.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1);
  }

  searchIndex = {
    documents,
    idf,
    totalDocs,
  };

  console.log(`[SGK] Index built with ${chunks.length} chunks`);
}

/**
 * Search the index
 */
export function query(
  searchQuery: string,
  topK: number = 8,
  bookFilter?: string[]
): SgkSearchResult[] {
  if (!searchIndex) {
    console.warn('[SGK] Search index not initialized');
    return [];
  }

  const queryTokens = tokenize(searchQuery);

  if (queryTokens.length === 0) {
    return [];
  }

  const results: SgkSearchResult[] = [];

  for (const doc of searchIndex.documents) {
    // Apply book filter if specified
    if (bookFilter && bookFilter.length > 0 && !bookFilter.includes(doc.chunk.bookId)) {
      continue;
    }

    // Calculate TF-IDF score
    let score = 0;

    for (const queryToken of queryTokens) {
      const tf = doc.tokenFreqs.get(queryToken) || 0;
      const idf = searchIndex.idf.get(queryToken) || 0;

      // Also check for partial matches (prefix matching)
      if (tf === 0) {
        for (const docToken of doc.tokens) {
          if (docToken.startsWith(queryToken) || queryToken.startsWith(docToken)) {
            score += 0.5 * idf; // Partial match gets half score
            break;
          }
        }
      } else {
        score += tf * idf;
      }
    }

    // Boost score if query appears in heading
    const headingLower = doc.chunk.headingPath.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    if (headingLower.includes(queryLower)) {
      score *= 2;
    }

    if (score > 0) {
      // Generate snippet
      const snippet = generateSnippet(doc.chunk.text, searchQuery);

      results.push({
        chunk: doc.chunk,
        score,
        snippet,
      });
    }
  }

  // Sort by score descending and take top K
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

/**
 * Generate a snippet highlighting the search query
 */
function generateSnippet(text: string, searchQuery: string, maxLength: number = 200): string {
  const queryLower = searchQuery.toLowerCase();
  const textLower = text.toLowerCase();

  // Find the first occurrence of query
  const index = textLower.indexOf(queryLower);

  let start: number;
  let end: number;

  if (index >= 0) {
    // Center snippet around the match
    start = Math.max(0, index - 50);
    end = Math.min(text.length, index + queryLower.length + 150);
  } else {
    // No exact match, use beginning of text
    start = 0;
    end = Math.min(text.length, maxLength);
  }

  // Adjust to word boundaries
  if (start > 0) {
    const spaceIndex = text.indexOf(' ', start);
    if (spaceIndex > start && spaceIndex < start + 20) {
      start = spaceIndex + 1;
    }
  }

  if (end < text.length) {
    const spaceIndex = text.lastIndexOf(' ', end);
    if (spaceIndex > end - 20) {
      end = spaceIndex;
    }
  }

  let snippet = text.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Check if index is ready
 */
export function isIndexReady(): boolean {
  return searchIndex !== null && searchIndex.documents.length > 0;
}

/**
 * Get index statistics
 */
export function getIndexStats(): { totalChunks: number; totalTerms: number } | null {
  if (!searchIndex) return null;

  return {
    totalChunks: searchIndex.documents.length,
    totalTerms: searchIndex.idf.size,
  };
}

/**
 * Clear the index
 */
export function clearIndex(): void {
  searchIndex = null;
}
