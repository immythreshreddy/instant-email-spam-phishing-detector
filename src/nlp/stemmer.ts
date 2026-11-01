/**
 * Porter Stemmer implementation in TypeScript
 * Faithfully reproduces Martin Porter's 1980 stemming algorithm used in NLTK (PorterStemmer).
 */

export function porterStem(word: string): string {
  let w = word.toLowerCase();
  if (w.length < 3) return w;

  const isVowel = (i: number): boolean => {
    const c = w[i];
    if (c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u') return true;
    if (c === 'y') {
      if (i === 0) return false;
      return !isVowel(i - 1);
    }
    return false;
  };

  const measure = (s: string): number => {
    let count = 0;
    let i = 0;
    const len = s.length;
    while (i < len && !isVowelChar(s, i)) i++;
    while (i < len) {
      while (i < len && isVowelChar(s, i)) i++;
      if (i >= len) break;
      while (i < len && !isVowelChar(s, i)) i++;
      count++;
    }
    return count;
  };

  const isVowelChar = (s: string, i: number): boolean => {
    const c = s[i];
    if ('aeiou'.includes(c)) return true;
    if (c === 'y') {
      if (i === 0) return false;
      return !isVowelChar(s, i - 1);
    }
    return false;
  };

  const containsVowel = (s: string): boolean => {
    for (let i = 0; i < s.length; i++) {
      if (isVowelChar(s, i)) return true;
    }
    return false;
  };

  const endsWithDoubleConsonant = (s: string): boolean => {
    const len = s.length;
    if (len < 2) return false;
    return s[len - 1] === s[len - 2] && !isVowelChar(s, len - 1);
  };

  const cvc = (s: string): boolean => {
    const len = s.length;
    if (len < 3) return false;
    const c1 = !isVowelChar(s, len - 3);
    const v = isVowelChar(s, len - 2);
    const c2 = !isVowelChar(s, len - 1);
    const lastChar = s[len - 1];
    return c1 && v && c2 && lastChar !== 'w' && lastChar !== 'x' && lastChar !== 'y';
  };

  // Step 1a
  if (w.endsWith('sses')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ies')) {
    w = w.slice(0, -2);
  } else if (!w.endsWith('ss') && w.endsWith('s')) {
    w = w.slice(0, -1);
  }

  // Step 1b
  let extra1b = false;
  if (w.endsWith('eed')) {
    const stem = w.slice(0, -3);
    if (measure(stem) > 0) {
      w = stem + 'ee';
    }
  } else if (w.endsWith('ed')) {
    const stem = w.slice(0, -2);
    if (containsVowel(stem)) {
      w = stem;
      extra1b = true;
    }
  } else if (w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (containsVowel(stem)) {
      w = stem;
      extra1b = true;
    }
  }

  if (extra1b) {
    if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
      w += 'e';
    } else if (endsWithDoubleConsonant(w) && !w.endsWith('l') && !w.endsWith('s') && !w.endsWith('z')) {
      w = w.slice(0, -1);
    } else if (measure(w) === 1 && cvc(w)) {
      w += 'e';
    }
  }

  // Step 1c
  if (w.endsWith('y')) {
    const stem = w.slice(0, -1);
    if (containsVowel(stem)) {
      w = stem + 'i';
    }
  }

  // Step 2
  const step2Pairs: [string, string][] = [
    ['ational', 'ate'],
    ['tional', 'tion'],
    ['enci', 'ence'],
    ['anci', 'ance'],
    ['izer', 'ize'],
    ['abli', 'able'],
    ['alli', 'al'],
    ['entli', 'ent'],
    ['eli', 'e'],
    ['ousli', 'ous'],
    ['ization', 'ize'],
    ['ation', 'ate'],
    ['ator', 'ate'],
    ['alism', 'al'],
    ['iveness', 'ive'],
    ['fulness', 'ful'],
    ['ousness', 'ous'],
    ['aliti', 'al'],
    ['iviti', 'ive'],
    ['biliti', 'ble'],
  ];

  for (const [suffix, replacement] of step2Pairs) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) {
        w = stem + replacement;
      }
      break;
    }
  }

  // Step 3
  const step3Pairs: [string, string][] = [
    ['icate', 'ic'],
    ['ative', ''],
    ['alize', 'al'],
    ['iciti', 'ic'],
    ['ical', 'ic'],
    ['ful', ''],
    ['ness', ''],
  ];

  for (const [suffix, replacement] of step3Pairs) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) {
        w = stem + replacement;
      }
      break;
    }
  }

  // Step 4
  const step4Suffixes = [
    'al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement',
    'ment', 'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize',
  ];

  for (const suffix of step4Suffixes) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 1) {
        w = stem;
      }
      break;
    }
  }
  if (w.endsWith('sion') || w.endsWith('tion')) {
    const stem = w.slice(0, -3);
    if (measure(stem) > 1) {
      w = stem;
    }
  }

  // Step 5a
  if (w.endsWith('e')) {
    const stem = w.slice(0, -1);
    const m = measure(stem);
    if (m > 1 || (m === 1 && !cvc(stem))) {
      w = stem;
    }
  }

  // Step 5b
  if (measure(w) > 1 && endsWithDoubleConsonant(w) && w.endsWith('l')) {
    w = w.slice(0, -1);
  }

  return w;
}
