import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Filter,
  Check,
  X,
  FileCode,
  Hash,
  Sparkles,
  Scissors,
  Binary,
} from 'lucide-react';
import { PreprocessingResult } from '../nlp/tokenizer';
import { TfidfVectorizer } from '../nlp/tfidf';

interface PipelineVisualizerProps {
  preprocessData: PreprocessingResult;
  vectorizer: TfidfVectorizer;
  activeModelName: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  preprocessData,
  vectorizer,
  activeModelName,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Linguistic Profiling',
      codeSnippet: "len(text), sum(1 for c in text if c.isupper())",
      summary: 'Compute text length, uppercase capitalization ratio, exclamation count, and link indicators.',
    },
    {
      num: 2,
      title: 'Cleaning & Punctuation',
      codeSnippet: "text = text.lower()\ntext = text.translate(str.maketrans('', '', string.punctuation))",
      summary: 'Standardize to lowercase and strip all punctuation symbols.',
    },
    {
      num: 3,
      title: 'Word Tokenization',
      codeSnippet: "from nltk.tokenize import word_tokenize\ntokens = word_tokenize(text)",
      summary: 'Segment continuous character stream into discrete word units.',
    },
    {
      num: 4,
      title: 'Stopword Filtering',
      codeSnippet: "from nltk.corpus import stopwords\nwords = [w for w in tokens if w not in stopwords.words('english')]",
      summary: 'Discard high-frequency non-discriminative grammar tokens (the, is, a, of, at).',
    },
    {
      num: 5,
      title: 'Porter Stemming',
      codeSnippet: "from nltk.stem import PorterStemmer\nps = PorterStemmer()\nwords = [ps.stem(w) for w in words]",
      summary: 'Collapse word variants to base morphological stems (e.g., winning -> win, running -> run).',
    },
    {
      num: 6,
      title: 'TF-IDF Numerical Vectorizer',
      codeSnippet: "from sklearn.feature_extraction.text import TfidfVectorizer\ntfidf = TfidfVectorizer()\nX = tfidf.transform([email])",
      summary: 'Compute Term Frequency (TF) × Inverse Document Frequency (IDF) with L2 normalization.',
    },
  ];

  const { dense, sparse } = vectorizer.transform(preprocessData.stemmedTokens);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>End-to-End NLP Pipeline</span>
            <span aria-hidden="true">·</span>
            <span>NLTK & Scikit-Learn Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Interactive NLP Pipeline Inspector</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Walk step-by-step through the exact transformation pipeline from raw email string to machine learning feature matrix.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
          Active ML Model: <span className="text-indigo-300 font-semibold">{activeModelName}</span>
        </div>
      </div>

      {/* Step Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map(step => (
          <button
            key={step.num}
            onClick={() => setSelectedStep(step.num)}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
              selectedStep === step.num
                ? 'bg-indigo-600/10 border-indigo-500/80 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className={selectedStep === step.num ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                Step 0{step.num}
              </span>
              {selectedStep === step.num && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </div>
            <div className="text-xs font-semibold leading-tight line-clamp-1">
              {step.title}
            </div>
          </button>
        ))}
      </div>

      {/* Step Detail Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        {/* Step Explanation & Python Equivalent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-800">
          <div className="lg:col-span-7 space-y-2">
            <div className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
              Step 0{selectedStep} · {steps[selectedStep - 1].title}
            </div>
            <h3 className="text-lg font-bold text-white">
              {steps[selectedStep - 1].title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {steps[selectedStep - 1].summary}
            </p>
          </div>

          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-500 text-[10px] pb-1.5 mb-1.5 border-b border-slate-900">
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3 text-indigo-400" />
                <span>Python / NLTK Implementation</span>
              </span>
            </div>
            <pre className="text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
              {steps[selectedStep - 1].codeSnippet}
            </pre>
          </div>
        </div>

        {/* Dynamic Interactive Stage per Step */}
        {selectedStep === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200">Raw Linguistic Profile & Signals</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <div className="text-xs text-slate-500 mb-1">Character Length</div>
                <div className="text-xl font-bold font-mono tabular-nums text-white">
                  {preprocessData.stats.charCount}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <div className="text-xs text-slate-500 mb-1">Uppercase Ratio</div>
                <div className="text-xl font-bold font-mono tabular-nums text-indigo-300">
                  {(preprocessData.stats.uppercaseRatio * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <div className="text-xs text-slate-500 mb-1">Exclamations (!)</div>
                <div className="text-xl font-bold font-mono tabular-nums text-amber-300">
                  {preprocessData.stats.exclamationCount}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <div className="text-xs text-slate-500 mb-1">Currency / Links</div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-300">
                  {preprocessData.stats.currencySymbolsCount} / {preprocessData.stats.urlCount}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Input Text:</div>
              <div className="text-sm text-slate-200 font-mono whitespace-pre-wrap">
                {preprocessData.raw || <span className="italic text-slate-600">No email input provided.</span>}
              </div>
            </div>
          </div>
        )}

        {selectedStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200">Cleaning & Punctuation Stripping</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono text-slate-400">1. Original Raw Input:</div>
                <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {preprocessData.raw}
                </div>
              </div>

              <div className="bg-slate-950 border border-indigo-900/40 rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono text-indigo-400">2. Cleaned Lowercase (Punctuation Stripped):</div>
                <div className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {preprocessData.punctuationRemoved}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">
                Extracted Tokens ({preprocessData.tokens.length})
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Tokens parsed by whitespace delimiter
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-4 bg-slate-950 border border-slate-800 rounded-lg">
              {preprocessData.tokens.map((token, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200"
                >
                  <span className="text-slate-500 mr-1 text-[10px]">#{i + 1}</span>
                  {token}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">
                Stopword Classification (NLTK English Corpus)
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500" /> Removed Stopword
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" /> Retained Token
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-4 bg-slate-950 border border-slate-800 rounded-lg">
              {preprocessData.tokenDetails.map((td, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs font-mono border flex items-center gap-1.5 ${
                    td.isStopword
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-400 line-through opacity-60'
                      : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 font-medium'
                  }`}
                >
                  {td.isStopword ? <X className="w-3 h-3 text-rose-500" /> : <Check className="w-3 h-3 text-emerald-400" />}
                  {td.original}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Retained {preprocessData.filteredTokens.length} discriminative tokens after discarding{' '}
              {preprocessData.tokens.length - preprocessData.filteredTokens.length} stopwords.
            </div>
          </div>
        )}

        {selectedStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">
                Porter Stemmer Morphological Reductions
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Martin Porter 1980 Rule Cascade
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-4 bg-slate-950 border border-slate-800 rounded-lg">
              {preprocessData.tokenDetails
                .filter(td => !td.isStopword)
                .map((td, i) => {
                  const changed = td.cleaned !== td.stem;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded border text-xs font-mono ${
                        changed
                          ? 'bg-indigo-950/20 border-indigo-800/50 text-indigo-200'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="text-slate-500 text-[10px] mb-0.5">Original:</div>
                      <div className="font-semibold">{td.cleaned}</div>
                      <div className="flex items-center gap-1 text-[11px] mt-1 text-slate-400">
                        <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-white font-bold">{td.stem}</span>
                        {changed && (
                          <span className="text-[10px] text-indigo-400 ml-auto font-mono">
                            stemmed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {selectedStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  TF-IDF Feature Weights Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Normalized vector values for terms matching the trained vocabulary of {vectorizer.featureNames.length} features.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Formula: TF × [ln((1 + N)/(1 + DF)) + 1]
              </span>
            </div>

            {sparse.length > 0 ? (
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Vocabulary Index</th>
                      <th className="px-4 py-2.5">Stemmed Feature</th>
                      <th className="px-4 py-2.5">IDF Score</th>
                      <th className="px-4 py-2.5">Normalized TF-IDF</th>
                      <th className="px-4 py-2.5">Relative Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                    {sparse.map((item, idx) => {
                      const idf = vectorizer.idfScores[item.index] ?? 1.0;
                      return (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-2 text-slate-500 tabular-nums">#{item.index}</td>
                          <td className="px-4 py-2 font-bold text-slate-200">{item.token}</td>
                          <td className="px-4 py-2 text-slate-400 tabular-nums">{idf.toFixed(3)}</td>
                          <td className="px-4 py-2 text-indigo-300 font-bold tabular-nums">
                            {item.value.toFixed(4)}
                          </td>
                          <td className="px-4 py-2 w-48">
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, item.value * 120)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                No active tokens from this text matched the trained vocabulary. Try a preset or sample with common words.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
