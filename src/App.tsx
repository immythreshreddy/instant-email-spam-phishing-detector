/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DetectorHero } from './components/DetectorHero';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ModelBenchmarker } from './components/ModelBenchmarker';
import { DatasetExplorer } from './components/DatasetExplorer';
import { AIForensicPanel } from './components/AIForensicPanel';
import { CodeAndResumeHub } from './components/CodeAndResumeHub';
import { engineInstance } from './nlp/engine';
import { preprocessEmailText } from './nlp/tokenizer';
import { EmailSample, PredictionResult } from './types';
import { History, Shield, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'detector' | 'pipeline' | 'benchmark' | 'dataset' | 'code'>('detector');
  const [emailInput, setEmailInput] = useState<string>(
    'Congratulations!!! You WON ₹1 Lakh now, click here to claim your instant cash bonus. Limited time offer expires in 2 hours!'
  );
  const [senderInput, setSenderInput] = useState<string>('prizes-winner@lottery-intl-rewards.net');
  const [subjectInput, setSubjectInput] = useState<string>('CONGRATULATIONS! You WON ₹1,00,000 Cash Prize Today!');
  const [modelType, setModelType] = useState<'naive_bayes' | 'logistic_regression' | 'ensemble'>('logistic_regression');

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<{ id: string; subject: string; isSpam: boolean; text: string; time: string }[]>([]);
  const [isAIForensicsModalOpen, setIsAIForensicsModalOpen] = useState(false);

  // Synchronized dataset & metrics
  const [dataset, setDataset] = useState<EmailSample[]>(engineInstance.dataset);
  const [metrics, setMetrics] = useState(engineInstance.metrics);
  const [testSplit, setTestSplit] = useState(engineInstance.testSplitRatio);

  const handleClassify = (textToUse: string = emailInput) => {
    if (!textToUse.trim()) return;
    const pred = engineInstance.predict(textToUse, modelType);
    setResult(pred);

    // Append to history
    setHistory(prev => [
      {
        id: `hist-${Date.now()}`,
        subject: subjectInput.trim() || 'No Subject',
        isSpam: pred.label === 'spam',
        text: textToUse.slice(0, 80) + '...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 9),
    ]);
  };

  // Run initial classification on mount
  useEffect(() => {
    handleClassify(emailInput);
  }, [modelType]);

  const handleRetrain = (newSplit: number) => {
    engineInstance.trainModels(newSplit);
    setMetrics({ ...engineInstance.metrics });
    setTestSplit(newSplit);
    // Re-run current prediction
    if (emailInput.trim()) {
      handleClassify(emailInput);
    }
  };

  const handleAddSample = (sample: EmailSample) => {
    engineInstance.addSample(sample);
    setDataset([...engineInstance.dataset]);
    setMetrics({ ...engineInstance.metrics });
    if (emailInput.trim()) {
      handleClassify(emailInput);
    }
  };

  const handleSelectSampleForTest = (sample: EmailSample) => {
    setEmailInput(sample.text);
    setSubjectInput(sample.subject);
    setSenderInput(sample.sender);
    setActiveTab('detector');
    setTimeout(() => {
      handleClassify(sample.text);
    }, 50);
  };

  const handleQuickSample = () => {
    // Pick random sample from dataset
    const random = dataset[Math.floor(Math.random() * dataset.length)];
    handleSelectSampleForTest(random);
  };

  const preprocessData = preprocessEmailText(emailInput);

  const currentAccuracy = metrics.logistic_regression?.accuracy ?? 0.97;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSample={handleQuickSample}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'detector' && (
          <div className="space-y-8">
            <DetectorHero
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              senderInput={senderInput}
              setSenderInput={setSenderInput}
              subjectInput={subjectInput}
              setSubjectInput={setSubjectInput}
              modelType={modelType}
              setModelType={setModelType}
              result={result}
              onAnalyze={() => handleClassify(emailInput)}
              onOpenPipeline={() => setActiveTab('pipeline')}
              onOpenAIForensics={() => setIsAIForensicsModalOpen(true)}
            />

            {/* Email History Quick Bar */}
            {history.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recent Session Scans ({history.length})</span>
                  </span>
                  <button
                    onClick={() => setHistory([])}
                    className="text-slate-500 hover:text-slate-300 font-mono text-[11px]"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 whitespace-nowrap shrink-0"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isSpam ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-slate-200 font-sans font-medium truncate max-w-xs">
                        {item.subject}
                      </span>
                      <span className="text-slate-500 text-[10px]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <PipelineVisualizer
            preprocessData={preprocessData}
            vectorizer={engineInstance.vectorizer}
            activeModelName={
              modelType === 'logistic_regression'
                ? 'Logistic Regression (L2)'
                : modelType === 'naive_bayes'
                ? 'Multinomial Naive Bayes'
                : 'Ensemble Soft-Voting'
            }
          />
        )}

        {activeTab === 'benchmark' && (
          <ModelBenchmarker
            metrics={metrics}
            testSplitRatio={testSplit}
            onRetrain={handleRetrain}
            datasetSize={dataset.length}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            dataset={dataset}
            onAddSample={handleAddSample}
            onSelectSampleForTest={handleSelectSampleForTest}
          />
        )}

        {activeTab === 'code' && (
          <CodeAndResumeHub currentAccuracy={currentAccuracy} />
        )}
      </main>

      {/* Deep AI Forensics Modal */}
      {isAIForensicsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Gemini Deep Threat Forensics & Deliverability Optimizer
                </h3>
              </div>
              <button
                onClick={() => setIsAIForensicsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AIForensicPanel
              emailText={emailInput}
              sender={senderInput}
              subject={subjectInput}
              onApplyRewrittenText={cleanedText => {
                setEmailInput(cleanedText);
                setIsAIForensicsModalOpen(false);
                handleClassify(cleanedText);
              }}
            />
          </div>
        </div>
      )}

      {/* Minimal Footer following anti-slop guidelines */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <span>SpamGuard NLP · Scikit-Learn, NLTK & Streamlit Architecture</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Accuracy: {(currentAccuracy * 100).toFixed(1)}%</span>
            <span aria-hidden="true">·</span>
            <span>Latency: &lt;1ms</span>
            <span aria-hidden="true">·</span>
            <span>Corpus: {dataset.length} samples</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
