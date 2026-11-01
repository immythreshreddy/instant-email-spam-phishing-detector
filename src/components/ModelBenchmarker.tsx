import React, { useState } from 'react';
import {
  BarChart3,
  Sliders,
  RotateCw,
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { ModelMetrics } from '../types';

interface ModelBenchmarkerProps {
  metrics: Record<string, ModelMetrics>;
  testSplitRatio: number;
  onRetrain: (ratio: number) => void;
  datasetSize: number;
}

export const ModelBenchmarker: React.FC<ModelBenchmarkerProps> = ({
  metrics,
  testSplitRatio,
  onRetrain,
  datasetSize,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(Math.round(testSplitRatio * 100));
  const [selectedModelKey, setSelectedModelKey] = useState<string>('logistic_regression');

  const modelsList = Object.values(metrics);
  const activeMetrics = metrics[selectedModelKey] || modelsList[0];

  const handleApplySplit = () => {
    onRetrain(sliderVal / 100);
  };

  const trainCount = Math.floor(datasetSize * (1 - sliderVal / 100));
  const testCount = datasetSize - trainCount;

  return (
    <div className="space-y-6">
      {/* Title & Training Controls Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Machine Learning Evaluation</span>
            <span aria-hidden="true">·</span>
            <span>Step 8 & 10 Tutorial Benchmarking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Model Training & Performance Benchmark</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Compare Multinomial Naive Bayes vs. Logistic Regression (L2) on accuracy, precision, recall, and confusion matrix.
          </p>
        </div>

        {/* Retrain Controller */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Test Split:</span>
              <span className="font-mono text-indigo-300 font-bold ml-2">
                {sliderVal}% ({testCount} emails)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              step="5"
              value={sliderVal}
              onChange={e => setSliderVal(parseInt(e.target.value, 10))}
              className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button
            onClick={handleApplySplit}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retrain Models</span>
          </button>
        </div>
      </div>

      {/* Model Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelsList.map(m => {
          const isSelected = selectedModelKey === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedModelKey(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-950/20 border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  {m.id === 'logistic_regression' ? 'Recommended' : 'Algorithm'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {m.trainTimeMs.toFixed(1)}ms
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{m.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {m.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Accuracy</span>
                  <span className="text-white font-bold text-sm tabular-nums">
                    {(m.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Precision</span>
                  <span className="text-emerald-300 font-bold text-sm tabular-nums">
                    {(m.precision * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Diagnostics for Selected Model */}
      {activeMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Metrics & Interpretation */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                  Diagnostic Breakdown
                </span>
                <h3 className="text-lg font-bold text-white">{activeMetrics.name}</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Evaluated on {testCount} holdout samples
              </span>
            </div>

            {/* 4 Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 mb-0.5">Accuracy</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {(activeMetrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">(TP + TN) / Total</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-emerald-400 mb-0.5">Precision</div>
                <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                  {(activeMetrics.precision * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">TP / (TP + FP)</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-indigo-400 mb-0.5">Recall</div>
                <div className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
                  {(activeMetrics.recall * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">TP / (TP + FN)</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-amber-400 mb-0.5">F1-Score</div>
                <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                  {(activeMetrics.f1Score * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Harmonic mean</div>
              </div>
            </div>

            {/* Practical Interpretation */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Why High Precision Matters in Email Spam Filtering</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                In spam detection, a <strong>False Positive (FP)</strong> is catastrophic: a legitimate work email, flight ticket, or password reset ends up in the Spam folder.
                Therefore, high <strong>Precision</strong> (e.g. 100% or close to 0 false alarms) is prioritized over aggressive recall.
              </p>
            </div>
          </div>

          {/* Right: Confusion Matrix */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">Step 10 Evaluation</span>
                <h3 className="text-base font-bold text-white">2×2 Confusion Matrix</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Holdout Set</span>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 text-center py-2 text-slate-400 font-semibold">
                <div></div>
                <div>Predicted Ham (0)</div>
                <div>Predicted Spam (1)</div>
              </div>

              {/* Actual Ham Row */}
              <div className="grid grid-cols-3 border-b border-slate-800 items-center">
                <div className="bg-slate-950 p-3 text-slate-400 font-semibold text-center border-r border-slate-800">
                  Actual Ham
                </div>
                <div className="p-4 bg-emerald-950/20 text-center border-r border-slate-800">
                  <div className="text-xl font-bold text-emerald-300 tabular-nums">
                    {activeMetrics.confusionMatrix.tn}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-sans mt-0.5">
                    True Negative (TN)
                  </div>
                </div>
                <div className="p-4 bg-rose-950/10 text-center">
                  <div className="text-xl font-bold text-rose-300 tabular-nums">
                    {activeMetrics.confusionMatrix.fp}
                  </div>
                  <div className="text-[10px] text-rose-400 font-sans mt-0.5">
                    False Positive (FP)
                  </div>
                </div>
              </div>

              {/* Actual Spam Row */}
              <div className="grid grid-cols-3 items-center">
                <div className="bg-slate-950 p-3 text-slate-400 font-semibold text-center border-r border-slate-800">
                  Actual Spam
                </div>
                <div className="p-4 bg-amber-950/10 text-center border-r border-slate-800">
                  <div className="text-xl font-bold text-amber-300 tabular-nums">
                    {activeMetrics.confusionMatrix.fn}
                  </div>
                  <div className="text-[10px] text-amber-400 font-sans mt-0.5">
                    False Negative (FN)
                  </div>
                </div>
                <div className="p-4 bg-emerald-950/20 text-center">
                  <div className="text-xl font-bold text-emerald-300 tabular-nums">
                    {activeMetrics.confusionMatrix.tp}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-sans mt-0.5">
                    True Positive (TP)
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• <strong>TN:</strong> Legitimate emails correctly delivered to Inbox.</div>
              <div>• <strong>TP:</strong> Junk & scam emails correctly blocked.</div>
              <div>• <strong>FP:</strong> False alarm (Ham flagged as Spam).</div>
              <div>• <strong>FN:</strong> Missed spam that leaked through.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
