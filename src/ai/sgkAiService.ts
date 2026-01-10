/**
 * SGK AI Service
 * Wrapper layer that integrates SGK knowledge base into AI features
 * Enforces anti-fabrication rules - AI can only use content from uploaded SGK
 */

import {
  searchSgk,
  isSgkReady,
  getSgkStatus,
  formatContextWithCitations,
  isValidTopic,
  findSimilarTopics,
  getTopicCandidates,
} from '../sgk';
import type { SgkContextResult, SgkCitation, SgkContextOptions } from '../sgk/types';
import {
  buildSgkContext,
  buildSystemPromptWithSgk,
  shouldBlockAiCall,
  getErrorMessage,
  SGK_ENFORCEMENT_PROMPT,
} from './sgkContext';

/**
 * Result type for SGK-aware AI calls
 */
export interface SgkAiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  citations?: SgkCitation[];
  fromSgk: boolean;
}

/**
 * Check if SGK is available and ready
 */
export function checkSgkAvailability(): {
  ready: boolean;
  status: string;
  message: string;
} {
  const status = getSgkStatus();

  switch (status) {
    case 'ready':
      return {
        ready: true,
        status,
        message: 'SGK đã sẵn sàng',
      };
    case 'loading':
      return {
        ready: false,
        status,
        message: 'Đang tải SGK, vui lòng đợi...',
      };
    case 'error':
      return {
        ready: false,
        status,
        message: 'Lỗi tải SGK. Vui lòng reload trang.',
      };
    case 'idle':
    default:
      return {
        ready: false,
        status,
        message: 'Chưa có SGK được tải lên.',
      };
  }
}

/**
 * Build context for chat/study questions
 */
export function buildChatContext(
  userMessage: string,
  options?: SgkContextOptions
): SgkContextResult {
  return buildSgkContext(userMessage, {
    topK: 8,
    maxChars: 9000,
    ...options,
  });
}

/**
 * Build context for exam generation
 */
export function buildExamContext(
  topic: string,
  options?: SgkContextOptions
): SgkContextResult {
  return buildSgkContext(topic, {
    topK: 10,
    maxChars: 12000,
    ...options,
  });
}

/**
 * Build context for grading/writing analysis
 */
export function buildWritingContext(
  workContent: string,
  options?: SgkContextOptions
): SgkContextResult {
  // Extract key terms from the writing for context search
  const keyTerms = extractKeyTermsFromWriting(workContent);

  if (keyTerms.length === 0) {
    // No specific literary references found, return partial context
    return {
      ok: true,
      contextText: '',
      citations: [],
    };
  }

  // Search for context related to mentioned works/terms
  const query = keyTerms.join(' ');
  return buildSgkContext(query, {
    topK: 6,
    maxChars: 6000,
    ...options,
  });
}

/**
 * Extract key literary terms from student writing
 */
function extractKeyTermsFromWriting(text: string): string[] {
  const terms: string[] = [];

  // Common patterns for literary references
  const patterns = [
    /tác phẩm\s+[""]?([^"",.]+)[""]?/gi,
    /bài thơ\s+[""]?([^"",.]+)[""]?/gi,
    /truyện\s+[""]?([^"",.]+)[""]?/gi,
    /[""]([^""]+)[""](?:\s+của\s+([^,.\n]+))?/gi,
    /nhà (?:thơ|văn)\s+([^,.\n]+)/gi,
    /tác giả\s+([^,.\n]+)/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) terms.push(match[1].trim());
      if (match[2]) terms.push(match[2].trim());
    }
  }

  // Deduplicate and filter
  return [...new Set(terms)].filter(t => t.length > 2 && t.length < 50);
}

/**
 * Build context for flashcard/mindmap generation
 */
export function buildStudyMaterialContext(
  topic: string,
  options?: SgkContextOptions
): SgkContextResult {
  return buildSgkContext(topic, {
    topK: 8,
    maxChars: 8000,
    ...options,
  });
}

/**
 * Validate exam topic against SGK content
 */
export function validateExamTopic(topic: string): {
  valid: boolean;
  suggestions: string[];
  message: string;
} {
  if (!isSgkReady()) {
    return {
      valid: false,
      suggestions: [],
      message: 'SGK chưa được tải. Không thể xác thực chủ đề.',
    };
  }

  // Check if topic matches SGK headings
  const isValid = isValidTopic(topic);

  if (isValid) {
    return {
      valid: true,
      suggestions: [],
      message: 'Chủ đề hợp lệ',
    };
  }

  // Get similar topics for suggestions
  const suggestions = findSimilarTopics(topic, 5);

  return {
    valid: false,
    suggestions,
    message: suggestions.length > 0
      ? `Không tìm thấy "${topic}" trong SGK. Bạn có thể thử: ${suggestions.slice(0, 3).join(', ')}`
      : `Không tìm thấy "${topic}" trong SGK. Vui lòng nhập tên tác phẩm/bài học cụ thể.`,
  };
}

/**
 * Get all available topics from SGK for autocomplete
 */
export function getAvailableTopics(): string[] {
  return getTopicCandidates();
}

/**
 * Search SGK for quick lookup (PDF viewer integration)
 */
export function quickSearchSgk(query: string, limit: number = 5) {
  if (!isSgkReady()) {
    return {
      success: false,
      results: [],
      message: 'SGK chưa được tải',
    };
  }

  const results = searchSgk(query, limit);

  return {
    success: true,
    results: results.map(r => ({
      bookId: r.chunk.bookId,
      heading: r.chunk.headingPath,
      snippet: r.snippet,
      startLine: r.chunk.startLine,
      endLine: r.chunk.endLine,
      score: r.score,
    })),
    message: results.length > 0
      ? `Tìm thấy ${results.length} kết quả`
      : 'Không tìm thấy kết quả. Thử từ khóa khác.',
  };
}

/**
 * Build system prompt with SGK enforcement for any AI call
 */
export function buildEnforcedSystemPrompt(
  basePrompt: string,
  context: SgkContextResult
): string {
  return buildSystemPromptWithSgk(basePrompt, context);
}

/**
 * Format no-match error message
 */
export function formatNoMatchError(): string {
  return getErrorMessage('NO_MATCH');
}

/**
 * Format not-ready error message
 */
export function formatNotReadyError(): string {
  return getErrorMessage('NOT_READY');
}

/**
 * Check if we should proceed with AI call
 * Returns false if context is not available and we shouldn't fabricate
 */
export function shouldProceedWithAi(
  context: SgkContextResult,
  allowPartialContext: boolean = false
): boolean {
  if (context.ok) return true;

  // For some features like general writing skills, we can proceed without SGK
  if (allowPartialContext && context.reason === 'NO_MATCH') {
    return true;
  }

  return false;
}

/**
 * Get SGK enforcement prompt for AI system instructions
 */
export function getSgkEnforcementPrompt(): string {
  return SGK_ENFORCEMENT_PROMPT;
}

// Export types
export type { SgkContextResult, SgkCitation, SgkContextOptions };
