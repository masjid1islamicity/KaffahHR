import { ArrowRight, Bell, CheckCircle2, Clock, FileDown } from 'lucide-react';
import React, { useState } from 'react';
import { COMPETENCY_RADAR, PREDICTIVE_SERIES } from '../../data/initialData';
import type {
  DepartmentSyncRecord,
  InAppNotification,
  ModuleKey,
  TalentMember,
  TrainingProgram,
} from '../../types';
import { downloadPerformanceSummaryPDF } from '../../utils/pdfReport';
import { AIPanel } from '../AIPanel';
import { CompetencyRadarChart, PredictiveTrendChart } from '../Charts';

interface ExecutiveOverviewProps {
  talents: TalentMember[];
  trainings: TrainingProgram[];
  departments: DepartmentSyncRecord[];
  isOnline: boolean;
  onNavigate: (mod: ModuleKey) => void;
  notifications: InAppNotification[];
  dailyDigestEnabled: boolean;
  onOpenNotifications: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  talents,
  trainings,
  departments,
  isOnline,
  onNavigate,
  notifications,
  dailyDigestEnabled,
  onOpenNotifications,
}) => {
  const [horizon, setHorizon] = useState<3 | 6 | 12>(12);

  const avgPerf =
    talents.length > 0
      ? (talents.reduce((sum, t) => sum + t.performanceScore, 0) / talents.length).toFixed(1)
      : '0.0';
  const avgKaffah =
    talents.length > 0
      ? (talents.reduce((sum, t) => sum + t.kaffahScore, 0) / talents.length).toFixed(1)
      : '0.0';
  const avgRoi =
    trainings.length > 0
      ? Math.round(trainings.reduce((sum, tr) => sum + tr.projectedRoiPercent, 0) / trainings.length)
      : 0;
  const syncedDepts = departments.filter((d) => d.status === 'Tersinkron').length;
  const highRiskCount = talents.filter((t) => t.attritionRisk === 'Tinggi').length;

  const activeReminders = notifications.filter((n) => !n.dismissed);
  const unreadReminders = activeReminders.filter((n) => !n.read);
  const trainingAlertCount = activeReminders.filter((n) => n.type === 'training_deadline').length;
  const talentAlertCount = activeReminders.filter((n) => n.type === 'talent_followup').length;

  return (
    <div className="space-y-6">
      {dailyDigestEnabled && unreadReminders.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-5 py-3.5 sm:flex-row sm:items-center dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-3 sm:items-center">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 sm:mt-0 dark:text-amber-400" />
            <div className="text-xs text-amber-950 dark:text-amber-100">
              <span className="font-semibold">Pengingat Harian Manajer: </span>
              <span>
                {trainingAlertCount} deadline pelatihan mendekati batas akhir · {talentAlertCount} evaluasi talenta menunggu tindak lanjut.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenNotifications}
            className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            Tinjau Pengingat ({unreadReminders.length})
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Ringkasan Performa SDM & Analitik Prediktif
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ekspor laporan performa talenta, skor budaya Kaffah, dan status sinkronisasi departemen untuk pelaporan manajerial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadPerformanceSummaryPDF({ talents, trainings, departments })}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <FileDown className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          Unduh Laporan Performa (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Indeks Kinerja SDM
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {avgPerf}%
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              +4,2% vs kuartal lalu
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {talents.length} talenta inti terukur
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Adopsi Budaya Islamicity Kaffah
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {avgKaffah}%
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Etos Cerdas-Keras-Tuntas-Ikhlas
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Menopang stabilitas retensi tim
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Proyeksi ROI Investasi Diklat
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {avgRoi}%
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {trainings.length} program aktif
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Pelatihan sebagai investasi jangka panjang
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Konektivitas API Departemen
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {syncedDepts}/{departments.length}
            </span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {highRiskCount} risiko attrition tinggi
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enkripsi AES-256-GCM · TLS 1.3
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Analitik Prediktif Kinerja & Efisiensi Operasional
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbandingan tren aktual dengan proyeksi AI lintas departemen
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {([3, 6, 12] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHorizon(m)}
                  className={`rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    horizon === m
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {m} Bulan
                </button>
              ))}
            </div>
          </div>

          <PredictiveTrendChart data={PREDICTIVE_SERIES} horizonMonths={horizon} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Peta Kesenjangan Kompetensi Talenta
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kapasitas saat ini dibanding target strategis 2027
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('training')}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Kelola Diklat
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <CompetencyRadarChart axes={COMPETENCY_RADAR} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Status Sinkronisasi API Lintas Departemen
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aliran data otomatis antar Finance/ERP, Operasional, Pemasaran, Keamanan, dan L&D
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('platform')}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Buka Pusat API & Keamanan
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2.5 pr-4">Departemen</th>
                <th className="py-2.5 pr-4">Cakupan Data</th>
                <th className="py-2.5 pr-4 text-right">Entri Tersinkron</th>
                <th className="py-2.5 pr-4 text-right">Latensi</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {departments.map((dept) => (
                <tr key={dept.id} className="h-11 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    {dept.name}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-400">
                    {dept.dataScope}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                    {dept.recordsSynced.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                    {dept.latencyMs} ms
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        dept.status === 'Tersinkron'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {dept.status === 'Tersinkron' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {dept.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIPanel
        mode="predictive_hr"
        title="Mesin Pengambilan Keputusan Strategis AI"
        subtitle="Analisis prediktif risiko attrition, efisiensi operasional, dan peluang pengembangan talenta berdasarkan metrik real-time."
        defaultPrompt="Identifikasi departemen dengan risiko turnover tertinggi dan rekomendasikan strategi intervensi ROI terbaik dalam 90 hari."
        isOnline={isOnline}
        quickPrompts={[
          'Simulasi dampak peningkatan anggaran diklat 20% terhadap efisiensi operasional',
          'Mitigasi risiko attrition pada talenta kunci divisi IT dan SDM',
          'Strategi penyelarasan budaya Islamicity Kaffah dengan target bisnis kuartal depan',
        ]}
        contextData={{
          totalTalents: talents.length,
          avgPerformance: avgPerf,
          avgKaffahIndex: avgKaffah,
          highAttritionRiskTalents: talents
            .filter((t) => t.attritionRisk !== 'Rendah')
            .map((t) => ({ name: t.name, dept: t.department, risk: t.attritionRisk, perf: t.performanceScore })),
          trainingSummary: trainings.map((tr) => ({
            title: tr.title,
            roiPercent: tr.projectedRoiPercent,
            completion: tr.completionRate,
          })),
          departmentsSynced: `${syncedDepts}/${departments.length}`,
        }}
      />
    </div>
  );
};
