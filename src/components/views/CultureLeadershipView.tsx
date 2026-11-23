import React from 'react';
import type { ChangeInitiative, CulturePillar } from '../../types';
import { AIPanel } from '../AIPanel';

interface CultureLeadershipViewProps {
  pillars: CulturePillar[];
  changes: ChangeInitiative[];
  onUpdateChangeReadiness: (id: string, readinessPercent: number) => void;
  isOnline: boolean;
}

export const CultureLeadershipView: React.FC<CultureLeadershipViewProps> = ({
  pillars,
  changes,
  onUpdateChangeReadiness,
  isOnline,
}) => {
  const avgAdoption = (
    pillars.reduce((s, p) => s + p.adoptionScore, 0) / Math.max(1, pillars.length)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="max-w-2xl space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Budaya Organisasi Islamicity Kaffah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pembentukan dan pemeliharaan nilai inti perusahaan untuk mendorong motivasi kerja cerdas, keras, tuntas, dan ikhlas yang berdampak langsung pada produktivitas bisnis.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Skor Adopsi Kaffah</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {avgAdoption}%
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 last:border-b-0 md:border-b-0 md:pb-0 dark:border-slate-800"
            >
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {pillar.name}
                  </h3>
                  <span className="font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {pillar.adoptionScore}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {pillar.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                    style={{ width: `${pillar.adoptionScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dampak Bisnis: <span className="text-slate-800 dark:text-slate-200">{pillar.businessImpact}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 space-y-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Kepemimpinan & Manajemen Perubahan Adaptif
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menyelaraskan visi bisnis pemimpin dengan perilaku sehari-hari tim di lapangan dalam menghadapi disrupsi teknologi dan pasar global.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {changes.map((chg) => (
            <div key={chg.id} className="grid grid-cols-1 gap-4 py-4 first:pt-1 last:pb-0 lg:grid-cols-12 lg:items-center">
              <div className="space-y-1 lg:col-span-6">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{chg.phase}</span>
                  <span aria-hidden="true">·</span>
                  <span>Pemicu: {chg.driver}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{chg.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Faktor Motivasi Psikologis & Struktural: {chg.motivationFactor}
                </p>
              </div>

              <div className="lg:col-span-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Kesiapan Adopsi Tim</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                    {chg.readinessPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={chg.readinessPercent}
                  onChange={(e) => onUpdateChangeReadiness(chg.id, Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="text-left lg:col-span-2 lg:text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Penyelarasan Pemimpin</p>
                <p className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
                  {chg.leaderAlignment}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AIPanel
        mode="culture_change"
        title="Penasihat Kepemimpinan & Transformasi Budaya AI"
        subtitle="Rekomendasi penguatan motivasi kerja tuntas-ikhlas dan mitigasi resistensi perubahan lintas unit."
        defaultPrompt="Analisis faktor psikologis dan struktural untuk mempercepat adopsi ekspansi model bisnis baru yang saat ini berada di fase Kesadaran."
        isOnline={isOnline}
        quickPrompts={[
          'Cara pemimpin menyelaraskan visi digital dengan tim operasional lapangan',
          'Strategi menjaga semangat kerja cerdas, keras, tuntas, dan ikhlas saat transisi sistem',
        ]}
        contextData={{ pillars, changeInitiatives: changes }}
      />
    </div>
  );
};
