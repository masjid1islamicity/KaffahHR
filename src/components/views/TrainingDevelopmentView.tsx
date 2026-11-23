import { FileDown, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import type { TrainingProgram } from '../../types';
import { downloadTrainingRoiPDF } from '../../utils/pdfReport';
import { AIPanel } from '../AIPanel';
import { TrainingRoiCalculator } from '../TrainingRoiCalculator';

interface TrainingDevelopmentViewProps {
  trainings: TrainingProgram[];
  onAddTraining: (program: Omit<TrainingProgram, 'id'>) => void;
  isOnline: boolean;
}

export const TrainingDevelopmentView: React.FC<TrainingDevelopmentViewProps> = ({
  trainings,
  onAddTraining,
  isOnline,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TrainingProgram['category']>('Kompetensi Digital & AI');
  const [participants, setParticipants] = useState(25);
  const [investmentMillion, setInvestmentMillion] = useState(75);
  const [projectedRoiPercent, setProjectedRoiPercent] = useState(210);
  const [targetOutcome, setTargetOutcome] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() =>
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );

  const categories = [
    'Semua',
    'Kompetensi Digital & AI',
    'Kepemimpinan Adaptif',
    'Budaya Islamicity Kaffah',
    'Kewirausahaan & Bisnis',
  ];

  const filtered =
    categoryFilter === 'Semua'
      ? trainings
      : trainings.filter((t) => t.category === categoryFilter);

  const totalInvestment = trainings.reduce((s, t) => s + t.investmentMillion, 0);
  const totalParticipants = trainings.reduce((s, t) => s + t.participants, 0);
  const completedOrRunning = trainings.filter((t) => t.postTestAvg > t.preTestAvg);
  const avgGain =
    completedOrRunning.length > 0
      ? (
          completedOrRunning.reduce((s, t) => s + (t.postTestAvg - t.preTestAvg), 0) /
          completedOrRunning.length
        ).toFixed(1)
      : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetOutcome.trim()) return;
    onAddTraining({
      title: title.trim(),
      category,
      status: 'Terjadwal',
      participants: Number(participants) || 20,
      completionRate: 0,
      investmentMillion: Number(investmentMillion) || 50,
      projectedRoiPercent: Number(projectedRoiPercent) || 180,
      preTestAvg: 65,
      postTestAvg: 65,
      targetOutcome: targetOutcome.trim(),
      deadlineDate: deadlineDate || undefined,
    });
    setTitle('');
    setTargetOutcome('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-2xl space-y-1">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Pelatihan Sebagai Investasi Strategis Jangka Panjang
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Perencanaan, pelaksanaan, dan evaluasi dampak kompetensi SDM terukur terhadap produktivitas serta daya saing bisnis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => downloadTrainingRoiPDF({ trainings })}
            className="inline-flex min-h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <FileDown className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Unduh Laporan ROI (PDF)
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex min-h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Rancang Program Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Modal Investasi Diklat</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            Rp {totalInvestment.toLocaleString('id-ID')} Jt
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dialokasikan lintas {trainings.length} kurikulum strategis
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-rata Kenaikan Kompetensi</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            +{avgGain} Poin
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Selisih evaluasi Pre-Test ke Post-Test
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Partisipasi Talenta Aktif</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {totalParticipants} Orang
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Terintegrasi dengan penilaian kinerja kuartalan
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Portofolio Program Pendidikan & Pelatihan
          </h3>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filtered.map((prog) => {
            const delta = prog.postTestAvg - prog.preTestAvg;
            return (
              <div
                key={prog.id}
                className="flex flex-col justify-between gap-4 py-4 first:pt-2 last:pb-0 lg:flex-row lg:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {prog.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {prog.status}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{prog.participants} Peserta</span>
                    {prog.deadlineDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">Batas: {prog.deadlineDate}</span>
                      </>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {prog.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{prog.targetOutcome}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-3 text-right lg:border-t-0 lg:pt-0 dark:border-slate-800">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Investasi</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                      Rp {prog.investmentMillion} Jt
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Proyeksi ROI</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {prog.projectedRoiPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Pre / Post</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                      {prog.preTestAvg} → {prog.postTestAvg}
                      {delta > 0 ? ` (+${delta})` : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TrainingRoiCalculator
        onApplyToNewProgram={(preset) => {
          setInvestmentMillion(preset.investmentMillion);
          setProjectedRoiPercent(preset.projectedRoiPercent);
          setParticipants(preset.participants);
          setTargetOutcome(preset.targetOutcome);
          setShowModal(true);
        }}
        onDownloadPdf={(simulation) => downloadTrainingRoiPDF({ trainings, simulation })}
      />

      <AIPanel
        mode="training_roi"
        title="Evaluasi Kurikulum & Optimasi ROI Pelatihan AI"
        subtitle="Analisis efektivitas investasi pelatihan terhadap peningkatan kapabilitas dan rekomendasi modul prioritas."
        defaultPrompt="Evaluasi program pelatihan mana yang memberikan dampak ROI tertinggi dan rekomendasikan kurikulum lanjutan untuk menutup gap Kewirausahaan Bisnis."
        isOnline={isOnline}
        quickPrompts={[
          'Rancang kurikulum percepatan kompetensi Kewirausahaan & AI untuk level Manajer',
          'Hitung proyeksi penghematan biaya rekrutmen dari program retensi internalisasi Kaffah',
        ]}
        contextData={{ programs: trainings }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Rancang Investasi Program Pelatihan
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
                  Nama Program Pelatihan
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Sertifikasi Tata Kelola AI & Etika Bisnis"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Kategori Kompetensi
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TrainingProgram['category'])}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Kompetensi Digital & AI">Kompetensi Digital & AI</option>
                    <option value="Kepemimpinan Adaptif">Kepemimpinan Adaptif</option>
                    <option value="Budaya Islamicity Kaffah">Budaya Islamicity Kaffah</option>
                    <option value="Kewirausahaan & Bisnis">Kewirausahaan & Bisnis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Jumlah Peserta Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Alokasi Investasi (Rp Juta)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={investmentMillion}
                    onChange={(e) => setInvestmentMillion(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Proyeksi ROI (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={projectedRoiPercent}
                    onChange={(e) => setProjectedRoiPercent(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Batas Akhir Pelatihan
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Dampak Bisnis Terukur yang Diharapkan
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    placeholder="Contoh: Meningkatkan kecepatan pengambilan keputusan berbasis data sebesar 25%."
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
