/**
 * SGK Store
 * Singleton store for SGK data management
 */

import type {
  SgkStoreState,
  SgkManifest,
  SgkChunk,
  SgkBook,
  SgkBookStatus,
} from './types';
import {
  loadManifest,
  fetchMarkdown,
  parseMarkdownToChunks,
  extractTopicCandidates,
  checkPdfExists,
} from './sgkLoader';
import { buildIndex, clearIndex, isIndexReady } from './sgkIndex';

// Storage keys for caching
const CACHE_KEY_MANIFEST = 'sgk_manifest_cache';
const CACHE_KEY_CHUNKS = 'sgk_chunks_cache';
const CACHE_KEY_VERSION = 'sgk_cache_version';

// Singleton state
let state: SgkStoreState = {
  status: 'idle',
  error: null,
  manifest: null,
  chunks: [],
  topicCandidates: [],
  loadedBooks: [],
  failedBooks: [],
};

// Listeners for state changes
type StateListener = (state: SgkStoreState) => void;
const listeners: Set<StateListener> = new Set();

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

/**
 * Update state and notify listeners
 */
function setState(updates: Partial<SgkStoreState>): void {
  state = { ...state, ...updates };
  notifyListeners();
}

/**
 * Subscribe to state changes
 */
export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get current state
 */
export function getState(): SgkStoreState {
  return state;
}

/**
 * Try to load cached data from localStorage
 */
function loadFromCache(manifestVersion: string): SgkChunk[] | null {
  try {
    const cachedVersion = localStorage.getItem(CACHE_KEY_VERSION);

    if (cachedVersion !== manifestVersion) {
      // Cache is outdated
      return null;
    }

    const cachedChunks = localStorage.getItem(CACHE_KEY_CHUNKS);
    if (cachedChunks) {
      return JSON.parse(cachedChunks);
    }
  } catch (error) {
    console.warn('[SGK] Error loading from cache:', error);
  }

  return null;
}

/**
 * Save data to localStorage cache
 */
function saveToCache(manifestVersion: string, chunks: SgkChunk[]): void {
  try {
    localStorage.setItem(CACHE_KEY_VERSION, manifestVersion);
    localStorage.setItem(CACHE_KEY_CHUNKS, JSON.stringify(chunks));
    console.log('[SGK] Data cached to localStorage');
  } catch (error) {
    console.warn('[SGK] Error saving to cache (storage might be full):', error);
  }
}

/**
 * Initialize the SGK store
 * Loads manifest, fetches markdown files, parses chunks, and builds index
 */
export async function init(): Promise<void> {
  if (state.status === 'loading') {
    console.log('[SGK] Already loading...');
    return;
  }

  setState({ status: 'loading', error: null });

  try {
    // Load manifest
    const manifest = await loadManifest();

    if (!manifest) {
      setState({
        status: 'error',
        error: 'Không tìm thấy manifest SGK. Vui lòng upload SGK vào thư mục /public/sgk/',
        manifest: null,
      });
      return;
    }

    setState({ manifest });

    // Check if we have cached data
    const cachedChunks = loadFromCache(manifest.version);

    if (cachedChunks && cachedChunks.length > 0) {
      console.log('[SGK] Using cached chunks');
      const topicCandidates = extractTopicCandidates(cachedChunks);
      buildIndex(cachedChunks);

      // Determine which books are loaded from cache
      const loadedBooks = [...new Set(cachedChunks.map(c => c.bookId))];

      setState({
        status: 'ready',
        chunks: cachedChunks,
        topicCandidates,
        loadedBooks,
      });
      return;
    }

    // Fetch and parse all books
    const allChunks: SgkChunk[] = [];
    const loadedBooks: string[] = [];
    const failedBooks: string[] = [];

    for (const book of manifest.books) {
      const mdContent = await fetchMarkdown(book);

      if (mdContent) {
        const chunks = parseMarkdownToChunks(mdContent, book.id);
        allChunks.push(...chunks);
        loadedBooks.push(book.id);
        console.log(`[SGK] Loaded ${book.id}: ${chunks.length} chunks`);
      } else {
        failedBooks.push(book.id);
        console.warn(`[SGK] Failed to load ${book.id}`);
      }
    }

    if (allChunks.length === 0) {
      setState({
        status: 'error',
        error: 'Chưa có file SGK nào được upload. Vui lòng upload file .md vào thư mục /public/sgk/',
        loadedBooks,
        failedBooks,
      });
      return;
    }

    // Extract topics and build index
    const topicCandidates = extractTopicCandidates(allChunks);
    buildIndex(allChunks);

    // Cache the data
    saveToCache(manifest.version, allChunks);

    setState({
      status: 'ready',
      chunks: allChunks,
      topicCandidates,
      loadedBooks,
      failedBooks,
    });

    console.log(`[SGK] Initialization complete. ${allChunks.length} chunks indexed.`);
  } catch (error) {
    console.error('[SGK] Initialization error:', error);
    setState({
      status: 'error',
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi tải SGK',
    });
  }
}

/**
 * Force reload SGK data (bypasses cache)
 */
export async function reload(): Promise<void> {
  // Clear cache
  try {
    localStorage.removeItem(CACHE_KEY_VERSION);
    localStorage.removeItem(CACHE_KEY_CHUNKS);
  } catch {
    // Ignore cache clear errors
  }

  // Clear index
  clearIndex();

  // Reset state
  setState({
    status: 'idle',
    error: null,
    manifest: null,
    chunks: [],
    topicCandidates: [],
    loadedBooks: [],
    failedBooks: [],
  });

  // Re-initialize
  await init();
}

/**
 * Get list of available books from manifest
 */
export function getBooks(): SgkBook[] {
  return state.manifest?.books || [];
}

/**
 * Get book by ID
 */
export function getBookById(bookId: string): SgkBook | undefined {
  return state.manifest?.books.find(b => b.id === bookId);
}

/**
 * Check availability status of a book
 */
export async function getBookStatus(bookId: string): Promise<SgkBookStatus> {
  const book = getBookById(bookId);

  if (!book) {
    return {
      bookId,
      mdAvailable: false,
      pdfAvailable: false,
    };
  }

  const mdAvailable = state.loadedBooks.includes(bookId);
  const pdfAvailable = await checkPdfExists(book);

  return {
    bookId,
    mdAvailable,
    pdfAvailable,
  };
}

/**
 * Get topic candidates for autocomplete
 */
export function getTopicCandidates(): string[] {
  return state.topicCandidates;
}

/**
 * Check if a topic is valid (exists in SGK headings)
 */
export function isValidTopic(topic: string): boolean {
  const topicLower = topic.toLowerCase();

  return state.topicCandidates.some(candidate =>
    candidate.toLowerCase().includes(topicLower) ||
    topicLower.includes(candidate.toLowerCase())
  );
}

/**
 * Find similar topics for suggestions
 */
export function findSimilarTopics(query: string, limit: number = 5): string[] {
  const queryLower = query.toLowerCase();

  const scored = state.topicCandidates.map(topic => {
    const topicLower = topic.toLowerCase();

    let score = 0;

    // Exact match
    if (topicLower === queryLower) {
      score = 100;
    }
    // Starts with query
    else if (topicLower.startsWith(queryLower)) {
      score = 80;
    }
    // Contains query
    else if (topicLower.includes(queryLower)) {
      score = 60;
    }
    // Query starts with topic
    else if (queryLower.startsWith(topicLower)) {
      score = 40;
    }
    // Partial word match
    else {
      const queryWords = queryLower.split(/\s+/);
      const topicWords = topicLower.split(/\s+/);

      for (const qw of queryWords) {
        for (const tw of topicWords) {
          if (tw.includes(qw) || qw.includes(tw)) {
            score += 10;
          }
        }
      }
    }

    return { topic, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.topic);
}

/**
 * Check if store is ready
 */
export function isReady(): boolean {
  return state.status === 'ready' && isIndexReady();
}

/**
 * Get store status
 */
export function getStatus(): SgkStoreState['status'] {
  return state.status;
}

/**
 * Get error message if any
 */
export function getError(): string | null {
  return state.error;
}
