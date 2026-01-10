/**
 * SGK Module - Barrel Export
 * Knowledge base system for Vietnamese textbooks
 */

// Types
export type {
  SgkManifest,
  SgkBook,
  SgkChunk,
  SgkSearchResult,
  SgkStoreStatus,
  SgkStoreState,
  SgkContextOptions,
  SgkContextResult,
  SgkCitation,
  SgkBookStatus,
} from './types';

// Loader functions
export {
  loadManifest,
  fetchMarkdown,
  parseMarkdownToChunks,
  extractTopicCandidates,
  checkPdfExists,
} from './sgkLoader';

// Index functions
export {
  buildIndex,
  query as searchSgk,
  isIndexReady,
  getIndexStats,
  clearIndex,
} from './sgkIndex';

// Store functions
export {
  init as initSgkStore,
  reload as reloadSgkStore,
  getState as getSgkState,
  subscribe as subscribeSgkStore,
  getBooks,
  getBookById,
  getBookStatus,
  getTopicCandidates,
  isValidTopic,
  findSimilarTopics,
  isReady as isSgkReady,
  getStatus as getSgkStatus,
  getError as getSgkError,
} from './sgkStore';

// Citation functions
export {
  formatCitation,
  createCitation,
  createCitationsFromResults,
  parseCitation,
  extractCitations,
  formatCitationShort,
  formatCitationTooltip,
  formatBookTitle,
  formatContextWithCitations,
} from './sgkCitations';
