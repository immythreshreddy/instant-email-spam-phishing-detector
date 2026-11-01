import React from 'react';
import { ShieldCheck, Mail, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'detector' | 'pipeline' | 'benchmark' | 'dataset' | 'code';
  setActiveTab: (tab: 'detector' | 'pipeline' | 'benchmark' | 'dataset' | 'code') => void;
  onQuickSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onQuickSample }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            SpamGuard NLP
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('detector')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'detector'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spam Detector
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'pipeline'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NLP Pipeline Visualizer
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'benchmark'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'dataset'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dataset & Corpus
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'code'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Code & Resume
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickSample}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Load Quick Sample</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-900 bg-slate-950 text-xs overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('detector')}
          className={`whitespace-nowrap px-2 py-1 ${activeTab === 'detector' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Detector
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`whitespace-nowrap px-2 py-1 ${activeTab === 'pipeline' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`whitespace-nowrap px-2 py-1 ${activeTab === 'benchmark' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('dataset')}
          className={`whitespace-nowrap px-2 py-1 ${activeTab === 'dataset' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Dataset
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`whitespace-nowrap px-2 py-1 ${activeTab === 'code' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Python & Resume
        </button>
      </div>
    </header>
  );
};
