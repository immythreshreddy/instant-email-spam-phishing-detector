import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Flame,
  Layers,
  FileSearch,
} from 'lucide-react';
import { PredictionResult } from '../types';

interface DetectorHeroProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  senderInput: string;
  setSenderInput: (val: string) => void;
  subjectInput: string;
  setSubjectInput: (val: string) => void;
  modelType: 'naive_bayes' | 'logistic_regression' | 'ensemble';
  setModelType: (type: 'naive_bayes' | 'logistic_regression' | 'ensemble') => void;
  result: PredictionResult | null;
  onAnalyze: () => void;
  onOpenPipeline: () => void;
  onOpenAIForensics: () => void;
}

export const DetectorHero: React.FC<DetectorHeroProps> = ({
  emailInput,
  setEmailInput,
  senderInput,
  setSenderInput,
  subjectInput,
  setSubjectInput,
  modelType,
  setModelType,
  result,
  onAnalyze,
  onOpenPipeline,
  onOpenAIForensics,
}) => {
  const [highlightView, setHighlightView] = useState<'text' | 'highlight'>('text');

  const presetSamples = [
    {
      title: 'Win ₹1 Lakh (Spam)',
      subject: 'Congratulations! You WON ₹1,00,000 Cash Prize',
      sender: 'rewards@instant-cash-lottery.in',
      text: 'Congratulations!!! You WON ₹1 Lakh now, click here to claim your instant cash bonus. Limited time offer expires in 2 hours!',
    },
    {
      title: 'Free iPhone (Spam)',
      subject: 'Congratulations you won free iPhone',
      sender: 'gift@promo-apple-giveaways.com',
      text: 'Congratulations you won free iPhone! Your mobile number was chosen in our annual sweepstakes. Click here now to verify shipping details.',
    },
    {
      title: 'Project Report (Ham)',
      subject: 'Project report attached for tomorrow meeting',
      sender: 'priya.sharma@company.com',
      text: 'Project report attached. Please review the updated Q3 performance numbers and customer retention metrics before our 10 AM synchronization call.',
    },
    {
      title: 'Team Meeting (Ham)',
      subject: 'Team meeting at 4 PM - Sprint planning',
      sender: 'david.chen@engineering-corp.org',
      text: 'Hi team, let us meet today at 4 PM in Conference Room B to discuss sprint 14 deliverables and ticket assignments.',
    },
    {
      title: 'PayPal Phishing (High Risk)',
      subject: 'URGENT: Your PayPal account has been suspended!',
      sender: 'security@paypa1-account-verify.com',
      text: 'We detected unauthorized login attempts. Your account is temporarily locked. Click here immediately to confirm your SSN and credit card or lose access within 24 hours.',
    },
  ];

  const handleLoadPreset = (p: typeof presetSamples[0]) => {
    setSubjectInput(p.subject);
    setSenderInput(p.sender);
    setEmailInput(p.text);
  };

  const spamPercent = result ? Math.round(result.spamProbability * 100) : 0;
  const isSpam = result?.label === 'spam';
  const hasPhishing = (result?.phishingSignals.length ?? 0) > 0;

  // Highlight words based on top contributing tokens
  const renderHighlightedBody = () => {
    if (!result) return <div>{emailInput}</div>;

    const words = emailInput.split(/(\s+|[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/);
    const spamTokens = new Set(
      result.topContributingTokens.filter(t => t.favors === 'spam').map(t => t.token.toLowerCase())
    );
    const hamTokens = new Set(
      result.topContributingTokens.filter(t => t.favors === 'ham').map(t => t.token.toLowerCase())
    );

    return (
      <div className="leading-relaxed font-mono text-sm break-words whitespace-pre-wrap">
        {words.map((chunk, i) => {
          const clean = chunk.toLowerCase().trim();
          const isSpamTrigger = spamTokens.has(clean);
          const isHamTrigger = hamTokens.has(clean);

          if (isSpamTrigger) {
            return (
              <span
                key={i}
                className="bg-rose-500/20 text-rose-300 font-semibold border-b border-rose-500/50 px-0.5 rounded"
                title="Spam indicator token"
              >
                {chunk}
              </span>
            );
          }
          if (isHamTrigger) {
            return (
              <span
                key={i}
                className="bg-emerald-500/20 text-emerald-300 font-medium border-b border-emerald-500/50 px-0.5 rounded"
                title="Legitimate ham indicator token"
              >
                {chunk}
              </span>
            );
          }
          return <span key={i}>{chunk}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title & Goal Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Natural Language Processing</span>
            <span aria-hidden="true">·</span>
            <span>TF-IDF Vectorization</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-400 font-mono">1-Second Detection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Spam & Phishing Email Classifier
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspect any email text in real time. Analyzed with tokenization, Porter stemming,
            and machine learning vector classification.
          </p>
        </div>

        {/* Quick Model Selector Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setModelType('logistic_regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'logistic_regression'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logistic Regression
          </button>
          <button
            onClick={() => setModelType('naive_bayes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'naive_bayes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Naive Bayes
          </button>
          <button
            onClick={() => setModelType('ensemble')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'ensemble'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ensemble Blend
          </button>
        </div>
      </div>

      {/* Preset Pill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium whitespace-nowrap shrink-0">Quick Presets:</span>
        {presetSamples.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleLoadPreset(sample)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
          >
            {sample.title}
          </button>
        ))}
        <button
          onClick={() => {
            setEmailInput('');
            setSubjectInput('');
            setSenderInput('');
          }}
          className="px-2 py-1 text-slate-500 hover:text-slate-300 ml-auto whitespace-nowrap flex items-center gap-1"
          title="Clear inputs"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Main Two-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Email Input Editor */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          {/* Email Header Simulation */}
          <div className="space-y-3 pb-3 border-b border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Sender (From:)
                </label>
                <input
                  type="text"
                  value={senderInput}
                  onChange={e => setSenderInput(e.target.value)}
                  placeholder="e.g. notifications@lottery-winner.net"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  placeholder="e.g. You WON ₹1,00,000 cash prize!"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Email Body Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                Email Body Text
              </label>
              <div className="flex items-center gap-2">
                {result && (
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 text-xs">
                    <button
                      onClick={() => setHighlightView('text')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        highlightView === 'text'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Plain Editor
                    </button>
                    <button
                      onClick={() => setHighlightView('highlight')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        highlightView === 'highlight'
                          ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Token Heatmap
                    </button>
                  </div>
                )}
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {emailInput.length} chars · {emailInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            {highlightView === 'text' ? (
              <textarea
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    onAnalyze();
                  }
                }}
                rows={9}
                placeholder="Paste or type raw email content here (e.g. 'Congratulations! You WON ₹1 Lakh now, click here to claim...')"
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
              />
            ) : (
              <div className="min-h-[220px] max-h-[350px] overflow-y-auto px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm">
                {renderHighlightedBody()}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to run</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenPipeline}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                title="Inspect Step-by-Step Tokenization & TF-IDF"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>View NLP Pipeline</span>
              </button>

              <button
                onClick={onAnalyze}
                disabled={!emailInput.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Classify Email (1s)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Detection Verdict & Probability Deck */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
              {/* Verdict Header Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isSpam
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isSpam ? (
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="text-[11px] font-mono tracking-wider uppercase opacity-80 block">
                        Classification Verdict
                      </span>
                      <h2 className="text-xl font-bold tracking-tight">
                        {isSpam ? '🚨 SPAM EMAIL DETECTED' : '✅ LEGITIMATE EMAIL (HAM)'}
                      </h2>
                    </div>
                  </div>

                  <span className="font-mono text-xs px-2 py-1 rounded bg-black/40 text-slate-300 tabular-nums shrink-0">
                    ⚡ {result.latencyMs} ms
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>Spam Probability</span>
                    <span className="font-bold tabular-nums text-sm">{spamPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSpam
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.max(4, Math.min(100, spamPercent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0% Ham</span>
                    <span>50% Threshold</span>
                    <span>100% Spam</span>
                  </div>
                </div>
              </div>

              {/* Phishing Threats if detected */}
              {hasPhishing && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Suspicious Phishing Indicators ({result.phishingSignals.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.phishingSignals.map((sig, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-mono">▲</span>
                        <div>
                          <strong className="text-amber-200">{sig.signal}: </strong>
                          <span className="text-slate-400">{sig.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Influential Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">Key Distinguishing Tokens (TF-IDF)</span>
                  <span className="text-[11px] text-slate-500 font-mono">Influence Weight</span>
                </div>
                <div className="space-y-1.5">
                  {result.topContributingTokens.length > 0 ? (
                    result.topContributingTokens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.favors === 'spam' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-slate-200 font-semibold">{item.token}</span>
                          <span className="text-[10px] text-slate-500">
                            → {item.favors.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-400 tabular-nums">
                          {item.weight.toFixed(3)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic p-2 bg-slate-950 rounded">
                      Standard neutral conversational vocabulary.
                    </div>
                  )}
                </div>
              </div>

              {/* Forensic and AI Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={onOpenPipeline}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inspect Preprocessing</span>
                </button>

                <button
                  onClick={onOpenAIForensics}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deep AI Forensics</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State Waiting for Analysis */
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Ready for Real-Time Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click a quick preset above or paste an email and hit "Classify Email" for instant NLP breakdown.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
