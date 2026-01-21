/**
 * SGK (Sách Giáo Khoa) Types
 * Types for textbook knowledge base system
 */

/** Manifest structure for all available SGK books */
export interface SgkManifest {
  version: string;
  lastUpdated: string;
  books: SgkBook[];
}

/** Individual SGK book metadata */
export interface SgkBook {
  id: string;
  title: string;
  publisher: string;
  grade: number;
  semester: number;
  md: string;  // Path to markdown file
}

/** A chunk of SGK content for indexing and retrieval */
export interface SgkChunk {
  bookId: string;
  chunkId: string;
  headingPath: string;  // e.g., "Bài 1 > Đọc hiểu > Tác phẩm A"
  text: string;
  startLine: number;
  endLine: number;
}

/** Search result from SGK index */
export interface SgkSearchResult {
  chunk: SgkChunk;
  score: number;
  snippet: string;
}

/** SGK store status */
export type SgkStoreStatus = 'idle' | 'loading' | 'ready' | 'error';

/** SGK store state */
export interface SgkStoreState {
  status: SgkStoreStatus;
  error: string | null;
  manifest: SgkManifest | null;
  chunks: SgkChunk[];
  topicCandidates: string[];  // Extracted headings for autocomplete
  loadedBooks: string[];      // Book IDs that were successfully loaded
  failedBooks: string[];      // Book IDs that failed to load (404)
}

/** Options for building SGK context */
export interface SgkContextOptions {
  bookFilter?: string[];  // Filter by specific book IDs
  topK?: number;          // Number of top results (default: 8)
  maxChars?: number;      // Maximum characters in context (default: 9000)
}

/** Result of building SGK context */
export interface SgkContextResult {
  ok: boolean;
  reason?: 'NO_MATCH' | 'NOT_READY' | 'NO_SGK';
  contextText?: string;
  citations?: SgkCitation[];
}

/** Citation reference to SGK source */
export interface SgkCitation {
  bookId: string;
  startLine: number;
  endLine: number;
  headingPath: string;
  formatted: string;  // "[SGK:bookId:L1-L10:heading]"
}

/** Book availability status */
export interface SgkBookStatus {
  bookId: string;
  mdAvailable: boolean;
}
