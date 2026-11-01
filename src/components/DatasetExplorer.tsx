import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { EmailLabel, EmailSample } from '../types';

interface DatasetExplorerProps {
  dataset: EmailSample[];
  onAddSample: (sample: EmailSample) => void;
  onSelectSampleForTest: (sample: EmailSample) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  dataset,
  onAddSample,
  onSelectSampleForTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | 'spam' | 'ham'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New sample form state
  const [newText, setNewText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newLabel, setNewLabel] = useState<EmailLabel>('spam');

  // Stats
  const totalCount = dataset.length;
  const spamCount = dataset.filter(d => d.label === 'spam').length;
  const hamCount = dataset.filter(d => d.label === 'ham').length;
  const spamPercentage = totalCount > 0 ? ((spamCount / totalCount) * 100).toFixed(1) : '0';

  const filteredData = dataset.filter(item => {
    if (labelFilter !== 'all' && item.label !== labelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.text.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newSample: EmailSample = {
      id: `custom-${Date.now()}`,
      subject: newSubject.trim() || 'No Subject',
      sender: newSender.trim() || 'user.input@test.com',
      text: newText.trim(),
      label: newLabel,
      category: newLabel === 'spam' ? 'promotional' : 'personal',
    };

    onAddSample(newSample);
    setNewText('');
    setNewSubject('');
    setNewSender('');
    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const headers = ['label,text,subject,sender\n'];
    const rows = dataset.map(d => {
      const cleanText = `"${d.text.replace(/"/g, '""')}"`;
      const cleanSub = `"${d.subject.replace(/"/g, '""')}"`;
      const cleanSender = `"${d.sender.replace(/"/g, '""')}"`;
      const numericLabel = d.label === 'spam' ? 1 : 0;
      return `${numericLabel},${cleanText},${cleanSub},${cleanSender}\n`;
    });
    const blob = new Blob([headers.join(''), ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spam.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Step 1 & 2 Tutorial Dataset</span>
            <span aria-hidden="true">·</span>
            <span>SMS & Email Spam Corpus</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Dataset & Training Corpus Explorer</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse labeled training emails (0 = Ham, 1 = Spam). Add custom samples or export as <code className="text-indigo-300 font-mono text-xs">spam.csv</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title="Export CSV matching Step 1 format"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export spam.csv</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Training Sample</span>
          </button>
        </div>
      </div>

      {/* Exploratory Data Analysis (EDA) Summary Bar - Matching Step 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Total Emails in Dataset</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">df.shape[0]</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-emerald-400">Legitimate (Ham / 0)</span>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">
            {hamCount}
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            {(100 - parseFloat(spamPercentage)).toFixed(1)}% of corpus
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-rose-400">Spam / Phishing (1)</span>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1 tabular-nums">
            {spamCount}
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            {spamPercentage}% spam distribution
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Missing Values (Nulls)</span>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1 tabular-nums">
            0
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">df.isnull().sum() == 0</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search email body, subject, sender..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setLabelFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              labelFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setLabelFilter('spam')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              labelFilter === 'spam'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spam ({spamCount})
          </button>
          <button
            onClick={() => setLabelFilter('ham')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              labelFilter === 'ham'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ham ({hamCount})
          </button>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-20">Label</th>
                <th className="px-4 py-3 w-48">Sender / Subject</th>
                <th className="px-4 py-3">Email Text Content (Body)</th>
                <th className="px-4 py-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {filteredData.map(item => {
                const isSpam = item.label === 'spam';
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isSpam
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {isSpam ? '1 · SPAM' : '0 · HAM'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top space-y-1">
                      <div className="font-semibold text-slate-200 truncate max-w-xs">
                        {item.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                        {item.sender}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-slate-300 line-clamp-2 font-mono text-[11px] leading-relaxed">
                        {item.text}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        onClick={() => onSelectSampleForTest(item)}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/30 hover:bg-indigo-600/40 border border-indigo-800/50 rounded transition-colors whitespace-nowrap"
                        title="Load this into the Detector"
                      >
                        Test in Detector
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Sample Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Email to Training Dataset</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSample} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Bonus Claim Notification"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Sender (Optional)
                </label>
                <input
                  type="text"
                  value={newSender}
                  onChange={e => setNewSender(e.target.value)}
                  placeholder="e.g. offers@vip-rewards.com"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Body Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="Paste email text to include in training set..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ground Truth Classification Label
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewLabel('spam')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      newLabel === 'spam'
                        ? 'bg-rose-950/40 border-rose-600 text-rose-300 ring-1 ring-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    1 · SPAM / Unwanted
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLabel('ham')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      newLabel === 'ham'
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    0 · HAM / Legitimate
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Add & Retrain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
