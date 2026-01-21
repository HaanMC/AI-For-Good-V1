/**
 * Topic Matching and Validation Utility
 * Provides functions to match user input against known topics
 * and determine if a topic is meaningful/valid
 */

import { normalizeViText, tokenize } from './textNormalize';

/**
 * Candidate match result with score
 */
export interface Candidate {
  value: string;  // Original topic value (with proper Vietnamese)
  score: number;  // Match score from 0 to 1
}

/**
 * Calculates Jaccard similarity between two sets
 * @param setA - First set of tokens
 * @param setB - Second set of tokens
 * @returns Jaccard similarity score (0-1)
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Checks if string A contains string B as substring
 * @param a - Container string
 * @param b - Potential substring
 * @returns true if b is substring of a
 */
function containsSubstring(a: string, b: string): boolean {
  return a.includes(b);
}

/**
 * Checks if string A starts with string B (prefix match)
 * @param a - Main string
 * @param b - Potential prefix
 * @returns true if a starts with b
 */
function startsWithPrefix(a: string, b: string): boolean {
  return a.startsWith(b);
}

/**
 * Calculates match score between query and an option
 * Uses multiple scoring methods without external libraries:
 * 1. Token overlap (Jaccard similarity)
 * 2. Substring bonus (option contains query)
 * 3. Query contains option substring bonus
 * 4. Prefix match bonus
 *
 * @param normalizedQuery - Normalized query string
 * @param normalizedOption - Normalized option string
 * @param queryTokens - Tokenized query
 * @param optionTokens - Tokenized option
 * @returns Score from 0 to 1
 */
function calculateMatchScore(
  normalizedQuery: string,
  normalizedOption: string,
  queryTokens: string[],
  optionTokens: string[]
): number {
  // If query is empty, no match
  if (!normalizedQuery || normalizedQuery.length === 0) return 0;

  // Base score: Jaccard similarity of tokens
  const querySet = new Set(queryTokens);
  const optionSet = new Set(optionTokens);
  let score = jaccardSimilarity(querySet, optionSet);

  // Bonus 1: Option contains query as substring (strong indicator)
  // e.g., query="chu nguoi" matches "chu nguoi tu tu"
  if (containsSubstring(normalizedOption, normalizedQuery)) {
    score += 0.35;
  }

  // Bonus 2: Query contains significant part of option
  // e.g., query="phan tich chu nguoi tu tu" contains "chu nguoi tu tu"
  if (normalizedQuery.length > normalizedOption.length * 0.5 &&
      containsSubstring(normalizedQuery, normalizedOption)) {
    score += 0.25;
  }

  // Bonus 3: Any query token starts an option token (prefix match)
  // Useful for partial matches like "dam" matching "dam san"
  let prefixMatchCount = 0;
  for (const qToken of queryTokens) {
    if (qToken.length >= 2) { // Only consider tokens >= 2 chars
      for (const oToken of optionTokens) {
        if (startsWithPrefix(oToken, qToken) || startsWithPrefix(qToken, oToken)) {
          prefixMatchCount++;
          break;
        }
      }
    }
  }
  if (prefixMatchCount > 0) {
    score += 0.15 * (prefixMatchCount / queryTokens.length);
  }

  // Bonus 4: Significant token overlap ratio
  // If most query tokens appear in option tokens
  const matchingTokens = queryTokens.filter(qt =>
    optionTokens.some(ot => ot.includes(qt) || qt.includes(ot))
  );
  if (queryTokens.length > 0 && matchingTokens.length / queryTokens.length >= 0.6) {
    score += 0.15;
  }

  // Cap score at 1.0
  return Math.min(score, 1.0);
}

/**
 * Gets top matching candidates from a list of options
 * @param query - User's input query
 * @param options - Array of valid topic options
 * @param topK - Number of top candidates to return (default: 8)
 * @returns Array of candidates sorted by score descending
 */
export function getTopicCandidates(
  query: string,
  options: string[],
  topK: number = 8
): Candidate[] {
  const normalizedQuery = normalizeViText(query);
  const queryTokens = tokenize(normalizedQuery);

  // If query is too short, return empty (let isMeaningfulTopic handle this)
  if (normalizedQuery.length < 2) {
    return [];
  }

  // Calculate scores for all options
  const candidates: Candidate[] = options.map(option => {
    const normalizedOption = normalizeViText(option);
    const optionTokens = tokenize(normalizedOption);

    const score = calculateMatchScore(
      normalizedQuery,
      normalizedOption,
      queryTokens,
      optionTokens
    );

    return { value: option, score };
  });

  // Sort by score descending and take top K
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > 0); // Only return candidates with some match
}

/**
 * Determines if a topic query is meaningful enough to process
 * Filters out gibberish, single characters, very short inputs, etc.
 *
 * Rules:
 * - Normalized length must be >= 4
 * - If token count < 2, normalized length must be >= 8
 * - Single character/very short tokens are rejected
 *
 * @param query - User's input query
 * @returns true if the topic is meaningful, false otherwise
 */
export function isMeaningfulTopic(query: string): boolean {
  if (!query) return false;

  const normalized = normalizeViText(query);
  const tokens = tokenize(normalized);

  // Rule 1: Normalized length must be >= 4 characters
  if (normalized.length < 4) {
    return false;
  }

  // Rule 2: If less than 2 tokens, need longer length (>= 8)
  if (tokens.length < 2 && normalized.length < 8) {
    return false;
  }

  // Rule 3: Check if all tokens are very short (single char or 2 chars)
  // This catches cases like "d a m" or "a b c"
  const allTokensVeryShort = tokens.every(t => t.length <= 2);
  if (allTokensVeryShort && tokens.length < 3) {
    return false;
  }

  // Rule 4: At least one token should be >= 3 characters
  const hasSubstantialToken = tokens.some(t => t.length >= 3);
  if (!hasSubstantialToken) {
    return false;
  }

  return true;
}

/**
 * Threshold for considering a topic match as valid
 * This value should block clearly invalid inputs like "d", "abc"
 * while allowing reasonable partial matches like "dam san", "chu nguoi"
 */
export const TOPIC_MATCH_THRESHOLD = 0.45;
