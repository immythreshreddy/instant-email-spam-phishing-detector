import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { ForensicReport } from '../types';

interface AIForensicPanelProps {
  emailText: string;
  sender: string;
  subject: string;
  onApplyRewrittenText: (text: string) => void;
}

export const AIForensicPanel: React.FC<AIForensicPanelProps> = ({
  emailText,
  sender,
  subject,
  onApplyRewrittenText,
}) => {
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rewriter state
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [changesMade, setChangesMade] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAnalysis = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText, sender, subject }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete forensic audit');
      }
      setReport(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with analysis service');
    } finally {
      setLoading(false);
    }
  };

  const runDeSpamify = async (tone: string = 'professional') => {
    if (!emailText.trim()) return;
    setRewriteLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText, tone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rewrite email');
      }
      setRewrittenText(data.data.rewrittenEmail);
      setChangesMade(data.data.changesMade || []);
      setTips(data.data.deliverabilityTips || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error rewriting email');
    } finally {
      setRewriteLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Cybersecurity Forensics</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-400" />
            <span>Deep Threat Forensic & De-Spamify Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyze social engineering persuasion triggers, spoofed headers, and rewrite emails to safely pass spam filters.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runAnalysis}
            disabled={loading || !emailText.trim()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run Forensic Audit</span>
          </button>

          <button
            onClick={() => runDeSpamify('professional')}
            disabled={rewriteLoading || !emailText.trim()}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            {rewriteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5 text-emerald-400" />}
            <span>De-Spamify (Clean Copy)</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Forensic Engine Notice</span>
          </div>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Split: Forensic Audit & De-Spamify Rewriter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Forensic Audit Report */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Forensic Security Audit</span>
            </h3>
            {report && (
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  report.threatSeverity === 'CRITICAL' || report.threatSeverity === 'HIGH'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                }`}
              >
                Severity: {report.threatSeverity}
              </span>
            )}
          </div>

          {report ? (
            <div className="space-y-4 text-xs">
              {/* Primary Intent */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] text-slate-500 font-mono block mb-1">
                  Primary Sender Intent:
                </span>
                <p className="text-slate-200 font-medium text-sm">
                  {report.primaryIntent}
                </p>
              </div>

              {/* Social Engineering Tactics */}
              {report.socialEngineeringTactics?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 block">
                    Social Engineering Persuasion Tactics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.socialEngineeringTactics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-amber-950/30 text-amber-300 border border-amber-800/50 font-mono text-[11px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evading Techniques */}
              {report.filterEvadingTechniques?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 block">
                    Spam Filter Evasion Signals:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.filterEvadingTechniques.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-rose-950/30 text-rose-300 border border-rose-800/50 font-mono text-[11px]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Verdict */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-[11px] text-indigo-400 font-mono block">
                  Bayesian & NLP Filter Verdict:
                </span>
                <p className="text-slate-300 leading-relaxed font-mono">
                  {report.technicalVerdict}
                </p>
              </div>

              {/* Security Advice */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 text-emerald-200 space-y-1">
                <span className="font-semibold block">Recommended Security Action:</span>
                <p className="text-slate-300">{report.securityAdvice}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Run Forensic Audit" to analyze this email for social engineering pressure, phishing hooks, and filter evasion tactics.
              </p>
            </div>
          )}
        </div>

        {/* Right: De-Spamify / Rewrite Tool */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase">Deliverability Optimizer</span>
              <h3 className="text-sm font-bold text-white">Clean & De-Spamify Email</h3>
            </div>
            {rewrittenText && (
              <button
                onClick={() => copyToClipboard(rewrittenText)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {rewrittenText ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 border border-emerald-900/40 rounded-lg p-3.5 text-slate-200 font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {rewrittenText}
              </div>

              {changesMade.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 block">Optimizations Applied:</span>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    {changesMade.map((ch, i) => (
                      <li key={i}>{ch}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onApplyRewrittenText(rewrittenText)}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Test Cleaned Version in Detector</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need to send an important notice without triggering spam filters? Click "De-Spamify" to strip aggressive trigger words and boost deliverability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
