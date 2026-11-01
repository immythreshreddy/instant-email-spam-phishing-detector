import { EmailLabel, EmailSample, ModelMetrics, PredictionResult } from '../types';
import { INITIAL_EMAIL_DATASET } from '../data/emailDataset';
import { preprocessEmailText } from './tokenizer';
import { TfidfVectorizer } from './tfidf';
import { evaluateModel, LogisticRegression, MultinomialNaiveBayes } from './models';

export class SpamNlpEngine {
  public dataset: EmailSample[] = [...INITIAL_EMAIL_DATASET];
  public vectorizer: TfidfVectorizer = new TfidfVectorizer({ maxFeatures: 1500, minDf: 1 });
  public naiveBayes: MultinomialNaiveBayes = new MultinomialNaiveBayes(1.0);
  public logisticRegression: LogisticRegression = new LogisticRegression({
    learningRate: 0.6,
    iterations: 120,
    l2Reg: 0.005,
  });

  public metrics: Record<string, ModelMetrics> = {};
  public testSplitRatio: number = 0.25;
  public isReady: boolean = false;

  constructor() {
    this.trainModels();
  }

  public setDataset(newDataset: EmailSample[]): void {
    this.dataset = [...newDataset];
    this.trainModels();
  }

  public addSample(sample: EmailSample): void {
    this.dataset.unshift(sample);
    this.trainModels();
  }

  public trainModels(splitRatio: number = this.testSplitRatio): void {
    this.testSplitRatio = splitRatio;

    // Preprocess all documents
    const processedDocs = this.dataset.map(item => {
      const fullText = `${item.subject} ${item.text}`;
      return {
        stemmed: preprocessEmailText(fullText).stemmedTokens,
        label: item.label === 'spam' ? 1 : 0,
      };
    });

    // Shuffle deterministically
    const indexed = processedDocs.map((item, idx) => ({ item, idx }));
    // Simple pseudo-random shuffle with fixed seed
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    indexed.sort(() => pseudoRandom() - 0.5);

    const splitIndex = Math.max(2, Math.floor(indexed.length * (1 - splitRatio)));
    const trainItems = indexed.slice(0, splitIndex).map(x => x.item);
    const testItems = indexed.slice(splitIndex).map(x => x.item);

    const trainDocs = trainItems.map(x => x.stemmed);
    const trainLabels = trainItems.map(x => x.label);

    const testDocs = testItems.map(x => x.stemmed);
    const testLabels = testItems.map(x => x.label);

    // Fit Vectorizer on training data
    this.vectorizer = new TfidfVectorizer({ maxFeatures: 1500, minDf: 1 });
    this.vectorizer.fit(trainDocs);

    const XTrain = trainDocs.map(doc => this.vectorizer.transform(doc).dense);
    const XTest = testDocs.map(doc => this.vectorizer.transform(doc).dense);

    // 1. Train Multinomial Naive Bayes
    const t0 = performance.now();
    this.naiveBayes = new MultinomialNaiveBayes(1.0);
    this.naiveBayes.train(XTrain, trainLabels);
    const tNB = performance.now() - t0;

    const nbMetrics = evaluateModel(
      'Multinomial Naive Bayes',
      'naive_bayes',
      'Classic probabilistic model applying Bayes theorem with Laplace smoothing. Fast, resilient to short texts.',
      x => this.naiveBayes.predict(x),
      XTest,
      testLabels,
      Math.max(0.2, tNB)
    );

    // 2. Train Logistic Regression
    const t1 = performance.now();
    this.logisticRegression = new LogisticRegression({
      learningRate: 0.6,
      iterations: 120,
      l2Reg: 0.005,
    });
    this.logisticRegression.train(XTrain, trainLabels);
    const tLR = performance.now() - t1;

    const lrMetrics = evaluateModel(
      'Logistic Regression (L2)',
      'logistic_regression',
      'Linear model with sigmoid activation and L2 ridge penalty. Provides high-interpretability feature weights.',
      x => this.logisticRegression.predict(x),
      XTest,
      testLabels,
      Math.max(0.5, tLR)
    );

    // 3. Ensemble (Blended vote)
    const ensemblePredict = (x: number[]): number => {
      const pNB = this.naiveBayes.predictProbabilities(x).spamProb;
      const pLR = this.logisticRegression.predictProbabilities(x).spamProb;
      const avg = 0.45 * pNB + 0.55 * pLR;
      return avg >= 0.5 ? 1 : 0;
    };

    const ensembleMetrics = evaluateModel(
      'Ensemble (NB + LR)',
      'ensemble',
      'Soft-voting hybrid combining Naive Bayes log-odds with regularized Logistic Regression probabilities.',
      ensemblePredict,
      XTest,
      testLabels,
      Math.max(0.7, tNB + tLR)
    );

    this.metrics = {
      naive_bayes: nbMetrics,
      logistic_regression: lrMetrics,
      ensemble: ensembleMetrics,
    };

    this.isReady = true;
  }

  public detectPhishingSignals(text: string, uppercaseRatio: number, exclamationCount: number) {
    const signals: { signal: string; severity: 'low' | 'medium' | 'high'; description: string }[] = [];
    const lower = text.toLowerCase();

    // False urgency
    if (/(urgent|immediately|within \d+ hours|act now|account (suspended|locked|terminated)|unauthorized|expires soon)/i.test(lower)) {
      signals.push({
        signal: 'Artificial Urgency Pressure',
        severity: 'high',
        description: 'Imposes short deadlines or fear of account loss to bypass rational judgment.',
      });
    }

    // High financial rewards / Lottery
    if (/(won|lakh|prize|jackpot|free cash|guaranteed profit|bitcoin mining|inheritance|unclaimed)/i.test(lower)) {
      signals.push({
        signal: 'Unsolicited Financial/Prize Hook',
        severity: 'high',
        description: 'Promises large cash sums, lottery winnings, or high risk-free investment returns.',
      });
    }

    // Credential Harvesting triggers
    if (/(confirm your ssn|verify your password|update billing credit card|enter banking credentials|click link to restore)/i.test(lower)) {
      signals.push({
        signal: 'Credential Harvesting Request',
        severity: 'high',
        description: 'Requests sensitive personal, banking, or password details over untrusted channel.',
      });
    }

    // Aggressive uppercase yelling
    if (uppercaseRatio > 0.35 && text.length > 30) {
      signals.push({
        signal: 'High Uppercase Shouting Density',
        severity: 'medium',
        description: `Over ${(uppercaseRatio * 100).toFixed(0)}% of characters are capitalized, a common spam evasion/attention trap.`,
      });
    }

    // Excessive punctuation
    if (exclamationCount >= 3) {
      signals.push({
        signal: 'Punctuation Shock Factor',
        severity: 'low',
        description: `Found ${exclamationCount} exclamation marks designed to simulate urgency.`,
      });
    }

    // Suspicious links or obfuscation
    if (/(bit\.ly|tinyurl|click here|tap here|http:\/\/\d+\.\d+\.\d+\.\d+)/i.test(lower)) {
      signals.push({
        signal: 'Masked / Shortened Link Call-to-Action',
        severity: 'medium',
        description: 'Directs user to opaque shortened URLs or raw IP addresses.',
      });
    }

    return signals;
  }

  public predict(
    emailText: string,
    modelType: 'naive_bayes' | 'logistic_regression' | 'ensemble' = 'logistic_regression'
  ): PredictionResult {
    const startTime = performance.now();
    const pre = preprocessEmailText(emailText);

    // Vectorize using TF-IDF
    const { dense, sparse } = this.vectorizer.transform(pre.stemmedTokens);

    let spamProb = 0.5;
    let hamProb = 0.5;

    if (modelType === 'naive_bayes') {
      const res = this.naiveBayes.predictProbabilities(dense);
      spamProb = res.spamProb;
      hamProb = res.hamProb;
    } else if (modelType === 'logistic_regression') {
      const res = this.logisticRegression.predictProbabilities(dense);
      spamProb = res.spamProb;
      hamProb = res.hamProb;
    } else {
      const nbRes = this.naiveBayes.predictProbabilities(dense);
      const lrRes = this.logisticRegression.predictProbabilities(dense);
      spamProb = 0.45 * nbRes.spamProb + 0.55 * lrRes.spamProb;
      hamProb = 1 - spamProb;
    }

    // Detect phishing vectors
    const phishingSignals = this.detectPhishingSignals(
      emailText,
      pre.stats.uppercaseRatio,
      pre.stats.exclamationCount
    );

    // Determine top contributing tokens
    // We compute the impact using Logistic Regression weights or Naive Bayes log odds
    const topContributingTokens: { token: string; weight: number; favors: EmailLabel }[] = [];

    sparse.forEach(item => {
      const featureIdx = item.index;
      let impact = 0;
      if (this.logisticRegression.weights[featureIdx] !== undefined) {
        impact = this.logisticRegression.weights[featureIdx] * item.value;
      } else if (this.naiveBayes.featureLogOdds[featureIdx] !== undefined) {
        impact = this.naiveBayes.featureLogOdds[featureIdx] * item.value;
      }

      if (Math.abs(impact) > 0.001) {
        topContributingTokens.push({
          token: item.token,
          weight: Math.abs(impact),
          favors: impact > 0 ? 'spam' : 'ham',
        });
      }
    });

    // If no vocabulary match found, fallback to heuristic indicators
    if (topContributingTokens.length === 0 && pre.filteredTokens.length > 0) {
      for (const t of pre.filteredTokens.slice(0, 5)) {
        const isSpamTrigger = /(won|prize|free|urgent|cash|click|bonus|offer|now)/i.test(t);
        topContributingTokens.push({
          token: t,
          weight: isSpamTrigger ? 0.8 : 0.3,
          favors: isSpamTrigger ? 'spam' : 'ham',
        });
      }
    }

    topContributingTokens.sort((a, b) => b.weight - a.weight);

    // If strong phishing indicators are present, slightly elevate spam prob
    if (phishingSignals.some(s => s.severity === 'high') && spamProb < 0.6) {
      spamProb = Math.min(0.99, spamProb + 0.25);
      hamProb = 1 - spamProb;
    }

    const verdictLabel: EmailLabel = spamProb >= 0.5 ? 'spam' : 'ham';
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      label: verdictLabel,
      spamProbability: spamProb,
      hamProbability: hamProb,
      latencyMs,
      topContributingTokens: topContributingTokens.slice(0, 8),
      phishingSignals,
      pipelineSteps: {
        rawText: pre.raw,
        lowercased: pre.lowercased,
        punctRemoved: pre.punctuationRemoved,
        tokens: pre.tokens,
        nonStopwords: pre.filteredTokens,
        stemmedTokens: pre.stemmedTokens,
        tfidfVector: sparse.slice(0, 10).map(s => ({ token: s.token, tfidf: s.value })),
      },
      modelUsed: modelType,
    };
  }
}

// Global singleton engine instance
export const engineInstance = new SpamNlpEngine();
