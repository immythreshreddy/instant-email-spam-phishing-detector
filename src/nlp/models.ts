import { ConfusionMatrix, ModelMetrics } from '../types';

export class MultinomialNaiveBayes {
  public classPriors: [number, number] = [0.5, 0.5]; // [P(ham), P(spam)]
  public featureLogProbs: [number[], number[]] = [[], []]; // [log P(x|ham), log P(x|spam)]
  public featureLogOdds: number[] = []; // log(P(x|spam) / P(x|ham))
  public alpha: number = 1.0; // Laplace smoothing
  public isTrained: boolean = false;

  constructor(alpha: number = 1.0) {
    this.alpha = alpha;
  }

  public train(X: number[][], y: number[]): void {
    const numSamples = X.length;
    if (numSamples === 0) return;
    const numFeatures = X[0].length;

    let countHam = 0;
    let countSpam = 0;

    const featureSumHam = new Array<number>(numFeatures).fill(0);
    const featureSumSpam = new Array<number>(numFeatures).fill(0);

    let totalWeightHam = 0;
    let totalWeightSpam = 0;

    for (let i = 0; i < numSamples; i++) {
      const label = y[i];
      const vector = X[i];

      if (label === 1) {
        countSpam++;
        for (let j = 0; j < numFeatures; j++) {
          featureSumSpam[j] += vector[j];
          totalWeightSpam += vector[j];
        }
      } else {
        countHam++;
        for (let j = 0; j < numFeatures; j++) {
          featureSumHam[j] += vector[j];
          totalWeightHam += vector[j];
        }
      }
    }

    // Priors
    this.classPriors = [
      Math.log((countHam || 1) / numSamples),
      Math.log((countSpam || 1) / numSamples),
    ];

    // Laplace smoothed feature log probabilities
    const logProbsHam = new Array<number>(numFeatures);
    const logProbsSpam = new Array<number>(numFeatures);
    const logOdds = new Array<number>(numFeatures);

    const denomHam = totalWeightHam + this.alpha * numFeatures;
    const denomSpam = totalWeightSpam + this.alpha * numFeatures;

    for (let j = 0; j < numFeatures; j++) {
      const pWham = (featureSumHam[j] + this.alpha) / denomHam;
      const pWspam = (featureSumSpam[j] + this.alpha) / denomSpam;

      logProbsHam[j] = Math.log(pWham);
      logProbsSpam[j] = Math.log(pWspam);
      logOdds[j] = logProbsSpam[j] - logProbsHam[j];
    }

    this.featureLogProbs = [logProbsHam, logProbsSpam];
    this.featureLogOdds = logOdds;
    this.isTrained = true;
  }

  public predictProbabilities(x: number[]): { spamProb: number; hamProb: number } {
    if (!this.isTrained) return { spamProb: 0.5, hamProb: 0.5 };

    let logHam = this.classPriors[0];
    let logSpam = this.classPriors[1];

    for (let j = 0; j < x.length; j++) {
      if (x[j] > 0) {
        logHam += x[j] * this.featureLogProbs[0][j];
        logSpam += x[j] * this.featureLogProbs[1][j];
      }
    }

    // Numerical stability via max-log subtraction
    const maxLog = Math.max(logHam, logSpam);
    const expHam = Math.exp(logHam - maxLog);
    const expSpam = Math.exp(logSpam - maxLog);
    const sum = expHam + expSpam;

    return {
      hamProb: expHam / sum,
      spamProb: expSpam / sum,
    };
  }

  public predict(x: number[]): number {
    const { spamProb } = this.predictProbabilities(x);
    return spamProb >= 0.5 ? 1 : 0;
  }
}

export class LogisticRegression {
  public weights: number[] = [];
  public bias: number = 0;
  public learningRate: number = 0.5;
  public iterations: number = 100;
  public l2Reg: number = 0.005;
  public isTrained: boolean = false;

  constructor(options?: { learningRate?: number; iterations?: number; l2Reg?: number }) {
    if (options?.learningRate) this.learningRate = options.learningRate;
    if (options?.iterations) this.iterations = options.iterations;
    if (options?.l2Reg) this.l2Reg = options.l2Reg;
  }

  public train(X: number[][], y: number[]): void {
    const m = X.length;
    if (m === 0) return;
    const n = X[0].length;

    this.weights = new Array<number>(n).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = new Array<number>(m);
      for (let i = 0; i < m; i++) {
        let z = this.bias;
        const xi = X[i];
        for (let j = 0; j < n; j++) {
          if (xi[j] !== 0) z += this.weights[j] * xi[j];
        }
        predictions[i] = 1 / (1 + Math.exp(-Math.max(-25, Math.min(25, z))));
      }

      // Compute gradients
      let gradBias = 0;
      const gradWeights = new Array<number>(n).fill(0);

      for (let i = 0; i < m; i++) {
        const error = predictions[i] - y[i];
        gradBias += error;
        const xi = X[i];
        for (let j = 0; j < n; j++) {
          if (xi[j] !== 0) {
            gradWeights[j] += error * xi[j];
          }
        }
      }

      // Update weights with L2 regularization
      for (let j = 0; j < n; j++) {
        const dw = gradWeights[j] / m + this.l2Reg * this.weights[j];
        this.weights[j] -= this.learningRate * dw;
      }
      this.bias -= this.learningRate * (gradBias / m);
    }

    this.isTrained = true;
  }

  public predictProbabilities(x: number[]): { spamProb: number; hamProb: number } {
    if (!this.isTrained) return { spamProb: 0.5, hamProb: 0.5 };

    let z = this.bias;
    for (let j = 0; j < x.length; j++) {
      if (x[j] !== 0) {
        z += this.weights[j] * x[j];
      }
    }
    const clampedZ = Math.max(-25, Math.min(25, z));
    const spamProb = 1 / (1 + Math.exp(-clampedZ));
    return {
      spamProb,
      hamProb: 1 - spamProb,
    };
  }

  public predict(x: number[]): number {
    const { spamProb } = this.predictProbabilities(x);
    return spamProb >= 0.5 ? 1 : 0;
  }
}

export function evaluateModel(
  name: string,
  id: 'naive_bayes' | 'logistic_regression' | 'ensemble',
  description: string,
  predictFn: (x: number[]) => number,
  XTest: number[][],
  yTest: number[],
  trainTimeMs: number
): ModelMetrics {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < XTest.length; i++) {
    const pred = predictFn(XTest[i]);
    const actual = yTest[i];

    if (actual === 1 && pred === 1) tp++;
    else if (actual === 0 && pred === 0) tn++;
    else if (actual === 0 && pred === 1) fp++;
    else if (actual === 1 && pred === 0) fn++;
  }

  const total = tp + tn + fp + fn || 1;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const confusionMatrix: ConfusionMatrix = { tp, tn, fp, fn };

  return {
    name,
    id,
    description,
    accuracy,
    precision,
    recall,
    f1Score,
    trainTimeMs,
    confusionMatrix,
  };
}
