/**
 * Vietnamese Text Normalization Utility
 * Provides functions to normalize Vietnamese text for matching and comparison
 */

// Map of Vietnamese diacritics to base characters
const VIETNAMESE_DIACRITICS_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd',
  // Uppercase versions
  'À': 'a', 'Á': 'a', 'Ả': 'a', 'Ã': 'a', 'Ạ': 'a',
  'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ẳ': 'a', 'Ẵ': 'a', 'Ặ': 'a',
  'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ẩ': 'a', 'Ẫ': 'a', 'Ậ': 'a',
  'È': 'e', 'É': 'e', 'Ẻ': 'e', 'Ẽ': 'e', 'Ẹ': 'e',
  'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ể': 'e', 'Ễ': 'e', 'Ệ': 'e',
  'Ì': 'i', 'Í': 'i', 'Ỉ': 'i', 'Ĩ': 'i', 'Ị': 'i',
  'Ò': 'o', 'Ó': 'o', 'Ỏ': 'o', 'Õ': 'o', 'Ọ': 'o',
  'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ổ': 'o', 'Ỗ': 'o', 'Ộ': 'o',
  'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ở': 'o', 'Ỡ': 'o', 'Ợ': 'o',
  'Ù': 'u', 'Ú': 'u', 'Ủ': 'u', 'Ũ': 'u', 'Ụ': 'u',
  'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ử': 'u', 'Ữ': 'u', 'Ự': 'u',
  'Ỳ': 'y', 'Ý': 'y', 'Ỷ': 'y', 'Ỹ': 'y', 'Ỵ': 'y',
  'Đ': 'd'
};

/**
 * Normalizes Vietnamese text for comparison and matching
 * - Converts to lowercase
 * - Trims whitespace
 * - Replaces multiple spaces with single space
 * - Removes basic punctuation
 * - Removes Vietnamese diacritics for diacritics-insensitive matching
 *
 * @param input - The input string to normalize
 * @returns Normalized string ready for comparison
 */
export function normalizeViText(input: string): string {
  if (!input) return '';

  let result = input
    // Convert to lowercase
    .toLowerCase()
    // Trim leading/trailing whitespace
    .trim()
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove basic punctuation (keep letters, numbers, spaces)
    .replace(/[.,;:!?'"()[\]{}<>«»""''–—…·•/\\|@#$%^&*+=~`_-]/g, '');

  // Remove Vietnamese diacritics using NFD decomposition and manual mapping
  // First try NFD decomposition for combining characters
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Then apply manual mapping for precomposed Vietnamese characters
  let normalized = '';
  for (const char of result) {
    normalized += VIETNAMESE_DIACRITICS_MAP[char] || char;
  }

  return normalized;
}

/**
 * Tokenizes a normalized string into words
 * @param normalizedText - Already normalized text
 * @returns Array of word tokens
 */
export function tokenize(normalizedText: string): string[] {
  if (!normalizedText) return [];
  return normalizedText.split(' ').filter(token => token.length > 0);
}

/**
 * Gets the length of normalized text (for validation)
 * @param input - Raw input string
 * @returns Length of normalized string
 */
export function getNormalizedLength(input: string): number {
  return normalizeViText(input).length;
}
