import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import type { InnovationIdea, StrategicPartnership } from '../../types';
import { AIPanel } from '../AIPanel';

interface BusinessInnovationViewProps {
  innovations: InnovationIdea[];
  partnerships: StrategicPartnership[];
  onAddInnovation: (idea: Omit<InnovationIdea, 'id'>) => void;
  isOnline: boolean;
}

export const BusinessInnovationView: React.FC<BusinessInnovationViewProps> = ({
  innovations,
  partnerships,
  onAddInnovation,
  isOnline,
}) => {
  const [stageFilter, setStageFilter] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [proposer, setProposer] = useState('');
  const [department, setDepartment] = useState('Pemasaran & Wawasan Pasar');
  const [marketImpactScore, setMarketImpactScore] = useState(85);
  const [efficiencyGainPercent, setEfficiencyGainPercent] = useState(20);
  const [summary, setSummary] = useState('');

  const stages = ['Semua', 'Ideasi', 'Validasi Pasar', 'Inkubasi', 'Implementasi'];

  const filteredIdeas =
    stageFilter === 'Semua'
      ? innovations
      : innovations.filter((i) => i.stage === stageFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !proposer.trim() || !summary.trim()) return;
    onAddInnovation({
      title: title.trim(),
      proposer: proposer.trim(),
      department,
      stage: 'Ideasi',
      marketImpactScore: Number(marketImpactScore) || 80,
      efficiencyGainPercent: Number(efficiencyGainPercent) || 15,
      summary: summary.trim(),
    });
    setTitle('');
    setProposer('');
    setSummary('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-2xl space-y-1">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Tata Kelola Bisnis, Kewirausahaan & Inovasi Berkelanjutan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Pengembangan usaha berbasis wawasan pasar akurat, inkubasi ide kreatif sistematis, serta kemitraan strategis ekosistem digital.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex min-h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Ajukan Ide Inovasi
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Pipeline Strategi Inovasi Berkelanjutan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengembangan ide intrapreneurship dari validasi pasar hingga komersialisasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {stages.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  stageFilter === st
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filteredIdeas.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Belum ada inisiatif inovasi pada tahap {stageFilter}.
            </p>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between gap-4 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {idea.stage}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{idea.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>Pengusul: {idea.proposer}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {idea.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{idea.summary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-6 text-right">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Dampak Pasar</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                      {idea.marketImpactScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Efisiensi Kerja</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      +{idea.efficiencyGainPercent}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Kemitraan Strategis & Ekosistem Digital
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kolaborasi B2B dan integrasi infrastruktur mitra untuk memperluas jangkauan operasional
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2.5 pr-4">Mitra Ekosistem</th>
                <th className="py-2.5 pr-4">Sektor</th>
                <th className="py-2.5 pr-4">Skema Integrasi</th>
                <th className="py-2.5 pr-4">Kontribusi Operasional</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {partnerships.map((p) => (
                <tr key={p.id} className="h-11">
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">
                    {p.partnerName}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-400">
                    {p.sector}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {p.integrationType}
                  </td>
                  <td className="py-2 pr-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {p.operationalReachBoost}
                  </td>
                  <td className="py-2 text-right text-xs font-medium text-slate-800 dark:text-slate-200">
                    {p.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIPanel
        mode="business_innovation"
        title="Analisis Strategi Bisnis, Pemasaran & Kewirausahaan AI"
        subtitle="Rekomendasi pengembangan usaha, tata kelola GCG, dan pemanfaatan kemitraan ekosistem digital."
        defaultPrompt="Prioritaskan ide inovasi dengan potensi komersialisasi tercepat dan susun strategi pemasaran B2B melalui mitra ekosistem aktif."
        isOnline={isOnline}
        quickPrompts={[
          'Strategi tata kelola bisnis & ekspansi kemitraan logistik Asia Tenggara',
          'Model monetisasi dan retensi pelanggan berbasis wawasan pasar saat ini',
        ]}
        contextData={{ innovations, partnerships }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Ajukan Inisiatif Inovasi Bisnis
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Judul Inisiatif / Produk Baru
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Otomatisasi Segmentasi Pelanggan B2B Syariah"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nama Pengusul
                  </label>
                  <input
                    type="text"
                    required
                    value={proposer}
                    onChange={(e) => setProposer(e.target.value)}
                    placeholder="Contoh: Aisyah Zahra"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Departemen
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Pemasaran & Wawasan Pasar">Pemasaran & Wawasan Pasar</option>
                    <option value="Operasional & Produksi">Operasional & Produksi</option>
                    <option value="IT & Keamanan Siber">IT & Keamanan Siber</option>
                    <option value="Pengembangan Budaya & L&D">Pengembangan Budaya & L&D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Skor Potensi Pasar (1-100)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={marketImpactScore}
                    onChange={(e) => setMarketImpactScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Estimasi Efisiensi (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={efficiencyGainPercent}
                    onChange={(e) => setEfficiencyGainPercent(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Ringkasan Nilai Bisnis & Strategi Eksekusi
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Ajukan Ide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
