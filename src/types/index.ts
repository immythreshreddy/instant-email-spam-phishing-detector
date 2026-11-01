export type EmailLabel = 'ham' | 'spam';

export interface EmailSample {
  id: string;
  subject: string;
  sender: string;
  text: string;
  label: EmailLabel;
  category?: 'corporate' | 'personal' | 'financial_scam' | 'lottery' | 'phishing' | 'promotional' | 'ecommerce';
}

export interface PipelineStep {
  name: string;
  description: string;
  input: any;
  output: any;
  detail?: string;
}

export interface TokenDetail {
  original: string;
  cleaned: string;
  isStopword: boolean;
  stemmed: string;
  tf?: number;
  idf?: number;
  tfidf?: number;
  isSpamTrigger?: boolean;
}

export interface PredictionResult {
  label: EmailLabel;
  spamProbability: number; // 0 to 1
  hamProbability: number;  // 0 to 1
  latencyMs: number;
  topContributingTokens: {
    token: string;
    weight: number;
    favors: EmailLabel;
  }[];
  phishingSignals: {
    signal: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  pipelineSteps: {
    rawText: string;
    lowercased: string;
    punctRemoved: string;
    tokens: string[];
    nonStopwords: string[];
    stemmedTokens: string[];
    tfidfVector: { token: string; tfidf: number }[];
  };
  modelUsed: 'naive_bayes' | 'logistic_regression' | 'ensemble';
}

export interface ConfusionMatrix {
  tp: number; // True Spam
  tn: number; // True Ham
  fp: number; // False Alarm (Ham predicted as Spam)
  fn: number; // Missed Spam (Spam predicted as Ham)
}

export interface ModelMetrics {
  name: string;
  id: 'naive_bayes' | 'logistic_regression' | 'ensemble';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainTimeMs: number;
  confusionMatrix: ConfusionMatrix;
  description: string;
}

export interface ForensicReport {
  classification: 'SPAM' | 'HAM' | 'PHISHING';
  threatSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  primaryIntent: string;
  socialEngineeringTactics: string[];
  suspiciousElements: string[];
  filterEvadingTechniques: string[];
  technicalVerdict: string;
  securityAdvice: string;
}
