import { AlertCircle, ArrowUpRight, BrainCircuit, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import type { AIAnalysisResult } from '../types';

interface AIPanelProps {
  mode: 'predictive_hr' | 'training_roi' | 'culture_change' | 'business_innovation' | 'talent_coach';
  title: string;
  subtitle: string;
  defaultPrompt: string;
  contextData: Record<string, unknown>;
  isOnline: boolean;
  quickPrompts?: string[];
}

export const AIPanel: React.FC<AIPanelProps> = ({
  mode,
  title,
  subtitle,
  defaultPrompt,
  contextData,
  isOnline,
  quickPrompts = [],
}) => {
  const [question, setQuestion] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const runAnalysis = async (customPrompt?: string) => {
    const activeQuestion = customPrompt ?? question;
    if (customPrompt) {
      setQuestion(customPrompt);
    }

    if (!isOnline) {
      setError('Perangkat sedang dalam Mode Offline. Analitik AI memerlukan koneksi internet aktif, sementara pencatatan data lokal tetap berjalan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          contextData,
          question: activeQuestion,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        generatedAt?: string;
        result?: AIAnalysisResult;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || 'Gagal memproses analisis AI.');
      }

      setResult(payload.result);
      setGeneratedAt(payload.generatedAt ?? new Date().toISOString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi mesin analitik AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <BrainCircuit className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => runAnalysis()}
          disabled={loading}
          className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menganalisis Data...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Jalankan Analisis AI
            </>
          )}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ajukan pertanyaan strategis berbasis data departemen..."
            className="min-h-[42px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {quickPrompts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fokus cepat:</span>
            {quickPrompts.map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => runAnalysis(promptText)}
                disabled={loading}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                {promptText}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Mode Offline aktif: pembaruan data lokal tetap tersimpan di perangkat, sedangkan inferensi AI real-time akan aktif kembali saat daring.</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        </div>
      )}

      {!loading && result && (
        <div className="mt-5 space-y-5 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">{result.headline}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Tingkat Risiko: <strong className="text-slate-900 dark:text-slate-100">{result.riskLevel}</strong></span>
              {generatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {new Date(generatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {result.executiveSummary}
          </p>

          <div className="rounded-lg bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
            <span className="font-semibold">Proyeksi Dampak: </span>
            {result.projectedImpact}
          </div>

          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rekomendasi Aksi Prioritas
            </h5>
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {result.strategicActions.map((action, idx) => (
                <div key={`${action.title}-${idx}`} className="flex flex-col gap-1 p-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <span>{idx + 1}. {action.title}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {action.rationale}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-col sm:items-end sm:gap-0.5">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{action.owner}</span>
                    <span className="font-mono">{action.horizon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
