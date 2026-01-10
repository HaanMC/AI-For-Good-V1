/**
 * SGK Citations
 * Handles formatting and parsing of SGK citations
 */

import type { SgkChunk, SgkCitation, SgkSearchResult } from './types';

/**
 * Format a citation from a chunk
 * Format: [SGK:<bookId>:L<start>-L<end>:<headingPath>]
 */
export function formatCitation(chunk: SgkChunk): string {
  const shortHeading = truncateHeading(chunk.headingPath, 50);
  return `[SGK:${chunk.bookId}:L${chunk.startLine}-L${chunk.endLine}:${shortHeading}]`;
}

/**
 * Create a full SgkCitation object from a chunk
 */
export function createCitation(chunk: SgkChunk): SgkCitation {
  return {
    bookId: chunk.bookId,
    startLine: chunk.startLine,
    endLine: chunk.endLine,
    headingPath: chunk.headingPath,
    formatted: formatCitation(chunk),
  };
}

/**
 * Create citations from search results
 */
export function createCitationsFromResults(results: SgkSearchResult[]): SgkCitation[] {
  return results.map(r => createCitation(r.chunk));
}

/**
 * Truncate heading path if too long
 */
function truncateHeading(heading: string, maxLength: number): string {
  if (heading.length <= maxLength) {
    return heading;
  }

  // Try to truncate at last ' > ' separator
  const parts = heading.split(' > ');
  if (parts.length > 1) {
    // Keep last parts
    let result = parts[parts.length - 1];
    for (let i = parts.length - 2; i >= 0; i--) {
      const candidate = parts[i] + ' > ' + result;
      if (candidate.length <= maxLength) {
        result = candidate;
      } else {
        break;
      }
    }
    if (result !== heading) {
      return '...' + result;
    }
  }

  return heading.slice(0, maxLength - 3) + '...';
}

/**
 * Parse a citation string back to components
 */
export function parseCitation(citation: string): Partial<SgkCitation> | null {
  // Match pattern: [SGK:bookId:L1-L10:heading]
  const match = citation.match(/\[SGK:([^:]+):L(\d+)-L(\d+):([^\]]+)\]/);

  if (!match) {
    return null;
  }

  return {
    bookId: match[1],
    startLine: parseInt(match[2], 10),
    endLine: parseInt(match[3], 10),
    headingPath: match[4],
    formatted: citation,
  };
}

/**
 * Extract all citations from a text
 */
export function extractCitations(text: string): string[] {
  const regex = /\[SGK:[^\]]+\]/g;
  return text.match(regex) || [];
}

/**
 * Format citation for display in UI (shorter version)
 */
export function formatCitationShort(chunk: SgkChunk): string {
  const bookShort = chunk.bookId.replace('ngu-van-10-', '').replace('-', ' ');
  const headingShort = truncateHeading(chunk.headingPath, 30);
  return `📖 ${bookShort}: ${headingShort}`;
}

/**
 * Format citation for tooltip display
 */
export function formatCitationTooltip(citation: SgkCitation): string {
  const bookTitle = formatBookTitle(citation.bookId);
  return `${bookTitle}\nMục: ${citation.headingPath}\nDòng: ${citation.startLine}-${citation.endLine}`;
}

/**
 * Format book ID to human-readable title
 */
export function formatBookTitle(bookId: string): string {
  const titles: Record<string, string> = {
    'ngu-van-10-canh-dieu-tap-1': 'Ngữ Văn 10 - Cánh Diều - Tập 1',
    'ngu-van-10-canh-dieu-tap-2': 'Ngữ Văn 10 - Cánh Diều - Tập 2',
    'ngu-van-10-kntt-tap-1': 'Ngữ Văn 10 - Kết Nối Tri Thức - Tập 1',
    'ngu-van-10-kntt-tap-2': 'Ngữ Văn 10 - Kết Nối Tri Thức - Tập 2',
  };

  return titles[bookId] || bookId;
}

/**
 * Create formatted context block with citations
 */
export function formatContextWithCitations(
  results: SgkSearchResult[]
): { text: string; citations: SgkCitation[] } {
  const citations: SgkCitation[] = [];
  const textParts: string[] = [];

  textParts.push('=== TRÍCH SGK ===\n');

  for (const result of results) {
    const citation = createCitation(result.chunk);
    citations.push(citation);

    textParts.push(`${citation.formatted}`);
    textParts.push(result.chunk.text);
    textParts.push('\n---\n');
  }

  return {
    text: textParts.join('\n'),
    citations,
  };
}
