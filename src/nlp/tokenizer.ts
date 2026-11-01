import { ENGLISH_STOPWORDS } from './stopwords';
import { porterStem } from './stemmer';

export interface PreprocessingResult {
  raw: string;
  lowercased: string;
  punctuationRemoved: string;
  tokens: string[];
  filteredTokens: string[];
  stemmedTokens: string[];
  tokenDetails: {
    original: string;
    cleaned: string;
    isStopword: boolean;
    stem: string;
  }[];
  stats: {
    charCount: number;
    wordCount: number;
    uppercaseCount: number;
    uppercaseRatio: number;
    exclamationCount: number;
    questionCount: number;
    currencySymbolsCount: number;
    urlCount: number;
    hasSuspiciousLinks: boolean;
  };
}

// Common Python string.punctuation
export const PUNCTUATION_REGEX = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g;
export const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
export const IP_URL_REGEX = /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i;

export function preprocessEmailText(text: string): PreprocessingResult {
  const raw = text || '';
  const lowercased = raw.toLowerCase();

  // Stats calculation
  const charCount = raw.length;
  const uppercaseLetters = (raw.match(/[A-Z]/g) || []).length;
  const totalLetters = (raw.match(/[a-zA-Z]/g) || []).length;
  const uppercaseRatio = totalLetters > 0 ? uppercaseLetters / totalLetters : 0;
  const exclamationCount = (raw.match(/!/g) || []).length;
  const questionCount = (raw.match(/\?/g) || []).length;
  const currencyMatches = (raw.match(/[₹$€£¥]|(?:rs\.?|inr|usd|eur)/gi) || []).length;
  const urls = raw.match(URL_REGEX) || [];
  const hasSuspiciousLinks = IP_URL_REGEX.test(raw) || urls.some(u => u.includes('bit.ly') || u.includes('tinyurl') || u.includes('@'));

  // Step 3: Remove punctuation
  // Python: text.translate(str.maketrans('', '', string.punctuation))
  const punctuationRemoved = lowercased.replace(PUNCTUATION_REGEX, ' ');

  // Step 4: Tokenization
  // Split on whitespace and filter empty
  const rawTokens = punctuationRemoved
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && /^[a-z0-9]+$/i.test(t));

  const wordCount = rawTokens.length;

  // Step 5: Remove Stopwords & Step 6: Stemming
  const filteredTokens: string[] = [];
  const stemmedTokens: string[] = [];
  const tokenDetails = rawTokens.map(token => {
    const isStop = ENGLISH_STOPWORDS.has(token);
    const stem = isStop ? token : porterStem(token);

    if (!isStop && stem.length > 1) {
      filteredTokens.push(token);
      stemmedTokens.push(stem);
    }

    return {
      original: token,
      cleaned: token,
      isStopword: isStop,
      stem,
    };
  });

  return {
    raw,
    lowercased,
    punctuationRemoved,
    tokens: rawTokens,
    filteredTokens,
    stemmedTokens,
    tokenDetails,
    stats: {
      charCount,
      wordCount,
      uppercaseCount: uppercaseLetters,
      uppercaseRatio,
      exclamationCount,
      questionCount,
      currencySymbolsCount: currencyMatches,
      urlCount: urls.length,
      hasSuspiciousLinks,
    },
  };
}
