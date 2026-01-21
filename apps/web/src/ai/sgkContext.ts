/**
 * SGK Context Builder
 * Builds context from SGK for AI features with anti-fabrication rules
 */

import {
  searchSgk,
  isSgkReady,
  getSgkStatus,
  formatContextWithCitations,
} from '../sgk';
import type { SgkContextOptions, SgkContextResult, SgkCitation } from '../sgk/types';

/**
 * System prompt suffix to enforce SGK-only responses
 */
export const SGK_ENFORCEMENT_PROMPT = `
BẠN CHỈ ĐƯỢC DÙNG THÔNG TIN TRONG PHẦN "TRÍCH SGK" BÊN DƯỚI.
Nếu thông tin không có trong TRÍCH SGK, hãy trả lời: "Thông tin này không có trong SGK đã tải. Bạn có thể thử từ khóa khác hoặc mở SGK PDF để tra cứu."
Mỗi ý quan trọng phải kèm trích dẫn nguồn [SGK:...].
TUYỆT ĐỐI KHÔNG được bịa đặt thông tin không có trong TRÍCH SGK.
`;

/**
 * Message shown when no SGK match is found
 */
export const NO_MATCH_MESSAGE =
  'Không tìm thấy nội dung liên quan trong SGK đã tải. Hãy thử:\n' +
  '- Dùng từ khóa khác (ví dụ: tên tác phẩm, tên tác giả)\n' +
  '- Mở SGK PDF để tra cứu trực tiếp\n' +
  '- Kiểm tra xem SGK đã được upload chưa';

/**
 * Message shown when SGK is not ready
 */
export const NOT_READY_MESSAGE =
  'Hệ thống SGK chưa sẵn sàng. Vui lòng đợi trong giây lát hoặc tải lại trang.';

/**
 * Message shown when no SGK is uploaded
 */
export const NO_SGK_MESSAGE =
  'Chưa có SGK nào được tải lên. Vui lòng upload file .md vào thư mục /public/sgk/';

/**
 * Build SGK context for AI prompts
 *
 * @param userQuery - The user's query
 * @param options - Options for context building
 * @returns Context result with text and citations, or error reason
 */
export function buildSgkContext(
  userQuery: string,
  options: SgkContextOptions = {}
): SgkContextResult {
  const { bookFilter, topK = 8, maxChars = 9000 } = options;

  // Check if SGK store is ready
  const status = getSgkStatus();

  if (status === 'idle' || status === 'loading') {
    return {
      ok: false,
      reason: 'NOT_READY',
    };
  }

  if (status === 'error' || !isSgkReady()) {
    return {
      ok: false,
      reason: 'NO_SGK',
    };
  }

  // Search SGK
  const results = searchSgk(userQuery, topK, bookFilter);

  if (results.length === 0) {
    return {
      ok: false,
      reason: 'NO_MATCH',
    };
  }

  // Format context with citations
  const { text, citations } = formatContextWithCitations(results);

  // Trim if too long
  let contextText = text;
  if (contextText.length > maxChars) {
    // Keep as many results as fit within maxChars
    let trimmedText = '=== TRÍCH SGK ===\n';
    const trimmedCitations: SgkCitation[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const citationText = `\n${citations[i].formatted}\n${result.chunk.text}\n---\n`;

      if (trimmedText.length + citationText.length <= maxChars) {
        trimmedText += citationText;
        trimmedCitations.push(citations[i]);
      } else {
        break;
      }
    }

    contextText = trimmedText;
    return {
      ok: true,
      contextText,
      citations: trimmedCitations,
    };
  }

  return {
    ok: true,
    contextText,
    citations,
  };
}

/**
 * Get error message based on reason
 */
export function getErrorMessage(reason: SgkContextResult['reason']): string {
  switch (reason) {
    case 'NO_MATCH':
      return NO_MATCH_MESSAGE;
    case 'NOT_READY':
      return NOT_READY_MESSAGE;
    case 'NO_SGK':
      return NO_SGK_MESSAGE;
    default:
      return 'Đã xảy ra lỗi không xác định.';
  }
}

/**
 * Build system prompt with SGK context
 */
export function buildSystemPromptWithSgk(
  basePrompt: string,
  sgkContext: SgkContextResult
): string {
  if (!sgkContext.ok || !sgkContext.contextText) {
    return basePrompt;
  }

  return `${basePrompt}

${SGK_ENFORCEMENT_PROMPT}

${sgkContext.contextText}
`;
}

/**
 * Check if a response should be blocked due to no SGK context
 * Returns true if we should NOT call the AI
 */
export function shouldBlockAiCall(context: SgkContextResult): boolean {
  return !context.ok;
}

/**
 * Validate that AI response contains citations
 * Returns warnings if response lacks proper citations
 */
export function validateResponseCitations(
  response: string,
  expectedCitations: SgkCitation[]
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check if response contains at least one citation
  const citationPattern = /\[SGK:[^\]]+\]/g;
  const foundCitations = response.match(citationPattern) || [];

  if (foundCitations.length === 0 && expectedCitations.length > 0) {
    warnings.push('Câu trả lời không có trích dẫn nguồn SGK');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Extract keywords from user query for better matching
 */
export function extractKeywords(query: string): string[] {
  // Vietnamese common words to filter out
  const stopWords = new Set([
    'là', 'có', 'của', 'và', 'trong', 'cho', 'với', 'được', 'các', 'những',
    'một', 'như', 'để', 'này', 'đã', 'khi', 'từ', 'về', 'theo', 'hay',
    'gì', 'sao', 'nào', 'thế', 'hãy', 'xin', 'cho', 'biết', 'giải', 'thích',
    'phân', 'tích', 'nêu', 'trình', 'bày', 'em', 'tôi', 'bạn'
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^\w\sàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  return [...new Set(words)];
}

/**
 * Build enhanced query from user input
 * Expands abbreviations and adds related terms
 */
export function enhanceQuery(query: string): string {
  const expansions: Record<string, string[]> = {
    'bptt': ['biện pháp tu từ'],
    'nhân vật': ['nhân vật', 'hình tượng'],
    'tác giả': ['tác giả', 'nhà văn', 'nhà thơ'],
    'tác phẩm': ['tác phẩm', 'bài thơ', 'truyện', 'văn bản'],
    'nội dung': ['nội dung', 'ý nghĩa', 'chủ đề'],
    'nghệ thuật': ['nghệ thuật', 'biện pháp', 'phong cách'],
  };

  let enhanced = query;

  for (const [abbr, expansion] of Object.entries(expansions)) {
    if (query.toLowerCase().includes(abbr)) {
      enhanced = `${enhanced} ${expansion.join(' ')}`;
    }
  }

  return enhanced;
}
