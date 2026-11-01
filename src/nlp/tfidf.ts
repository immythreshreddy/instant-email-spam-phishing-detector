/**
 * TfidfVectorizer implementation matching scikit-learn's formulas:
 * idf(t) = log((1 + n) / (1 + df(t))) + 1
 * tf-idf = tf(t, d) * idf(t)
 * normalized with L2 norm: v = v / sqrt(sum(v_i^2))
 */

export interface TfidfVector {
  indices: number[];
  values: number[];
  tokens: string[];
}

export class TfidfVectorizer {
  public vocabulary: Map<string, number> = new Map();
  public featureNames: string[] = [];
  public idfScores: number[] = [];
  public docCount: number = 0;
  public maxFeatures: number = 1000;
  public minDf: number = 1;

  constructor(options?: { maxFeatures?: number; minDf?: number }) {
    if (options?.maxFeatures) this.maxFeatures = options.maxFeatures;
    if (options?.minDf) this.minDf = options.minDf;
  }

  public fit(documents: string[][]): this {
    this.docCount = documents.length;
    const dfMap = new Map<string, number>();

    // Count document frequencies
    for (const doc of documents) {
      const seen = new Set<string>();
      for (const token of doc) {
        if (!seen.has(token)) {
          seen.add(token);
          dfMap.set(token, (dfMap.get(token) || 0) + 1);
        }
      }
    }

    // Filter by minDf and sort by document frequency
    const candidates = Array.from(dfMap.entries())
      .filter(([_, df]) => df >= this.minDf)
      .sort((a, b) => b[1] - a[1]);

    // Truncate to maxFeatures
    const topCandidates = candidates.slice(0, this.maxFeatures);
    // Sort alphabetically for deterministic ordering like scikit-learn
    topCandidates.sort((a, b) => a[0].localeCompare(b[0]));

    this.vocabulary.clear();
    this.featureNames = [];
    this.idfScores = [];

    const n = this.docCount;

    topCandidates.forEach(([token, df], index) => {
      this.vocabulary.set(token, index);
      this.featureNames.push(token);
      // Scikit-learn formula: log((1 + n) / (1 + df)) + 1
      const idf = Math.log((1 + n) / (1 + df)) + 1;
      this.idfScores.push(idf);
    });

    return this;
  }

  public transform(docTokens: string[]): {
    dense: number[];
    sparse: { index: number; token: string; value: number }[];
  } {
    const vocabSize = this.featureNames.length;
    const dense = new Array<number>(vocabSize).fill(0);

    // Compute Term Frequency (raw counts)
    const counts = new Map<number, number>();
    for (const token of docTokens) {
      const idx = this.vocabulary.get(token);
      if (idx !== undefined) {
        counts.set(idx, (counts.get(idx) || 0) + 1);
      }
    }

    let sumSq = 0;
    const sparse: { index: number; token: string; value: number }[] = [];

    counts.forEach((count, idx) => {
      const idf = this.idfScores[idx];
      const val = count * idf;
      dense[idx] = val;
      sumSq += val * val;
    });

    // L2 Normalization
    const norm = Math.sqrt(sumSq) || 1.0;
    for (let i = 0; i < vocabSize; i++) {
      if (dense[i] > 0) {
        dense[i] = dense[i] / norm;
        sparse.push({
          index: i,
          token: this.featureNames[i],
          value: dense[i],
        });
      }
    }

    sparse.sort((a, b) => b.value - a.value);

    return { dense, sparse };
  }

  public fitTransform(documents: string[][]): number[][] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc).dense);
  }
}
