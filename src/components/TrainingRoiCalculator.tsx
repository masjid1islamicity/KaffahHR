import { Calculator, FileDown, RotateCcw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { RoiSimulationReportInput } from '../utils/pdfReport';

interface TrainingRoiCalculatorProps {
  onApplyToNewProgram?: (preset: {
    investmentMillion: number;
    projectedRoiPercent: number;
    participants: number;
    targetOutcome: string;
  }) => void;
  onDownloadPdf?: (simulation: RoiSimulationReportInput) => void;
}

export const TrainingRoiCalculator: React.FC<TrainingRoiCalculatorProps> = ({
  onApplyToNewProgram,
  onDownloadPdf,
}) => {
  const [inputMode, setInputMode] = useState<'direct' | 'per_participant'>('direct');
  const [investmentMillion, setInvestmentMillion] = useState<number>(90);
  const [monthlyGainMillion, setMonthlyGainMillion] = useState<number>(22.5);
  const [participants, setParticipants] = useState<number>(30);
  const [gainPerParticipantMillion, setGainPerParticipantMillion] = useState<number>(0.75);
  const [horizonMonths, setHorizonMonths] = useState<6 | 12 | 24>(12);

  const effectiveMonthlyGain = useMemo(() => {
    if (inputMode === 'direct') {
      return Math.max(0, monthlyGainMillion);
    }
    return Math.max(0, participants) * Math.max(0, gainPerParticipantMillion);
  }, [inputMode, monthlyGainMillion, participants, gainPerParticipantMillion]);

  const metrics = useMemo(() => {
    const safeInvestment = Math.max(0.1, investmentMillion);
    const totalGrossBenefit = effectiveMonthlyGain * horizonMonths;
    const netBenefit = totalGrossBenefit - safeInvestment;
    const roiPercent = (netBenefit / safeInvestment) * 100;
    const paybackMonths =
      effectiveMonthlyGain > 0 ? safeInvestment / effectiveMonthlyGain : Infinity;
    const benefitCostRatio = totalGrossBenefit / safeInvestment;

    const timeline = Array.from({ length: horizonMonths }, (_, idx) => {
      const month = idx + 1;
      const cumulativeGain = effectiveMonthlyGain * month;
      const cumulativeNet = cumulativeGain - safeInvestment;
      return {
        month,
        cumulativeGain,
        cumulativeNet,
        isBreakEven: cumulativeGain >= safeInvestment,
      };
    });

    return {
      totalGrossBenefit,
      netBenefit,
      roiPercent,
      paybackMonths,
      benefitCostRatio,
      timeline,
    };
  }, [investmentMillion, effectiveMonthlyGain, horizonMonths]);

  const handleReset = () => {
    setInputMode('direct');
    setInvestmentMillion(90);
    setMonthlyGainMillion(22.5);
    setParticipants(30);
    setGainPerParticipantMillion(0.75);
    setHorizonMonths(12);
  };

  const chartMax = Math.max(
    investmentMillion * 1.15,
    metrics.totalGrossBenefit * 1.05,
    10
  );

  const statusLabel =
    metrics.roiPercent >= 100
      ? 'Investasi Sangat Layak'
      : metrics.roiPercent > 0
        ? 'Investasi Positif'
        : 'Belum Mencapai Titik Impas';

  const statusColorClass =
    metrics.roiPercent >= 100
      ? 'text-emerald-700 dark:text-emerald-400'
      : metrics.roiPercent > 0
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Calculator className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-semibold">Kalkulator Interaktif ROI Investasi Pelatihan</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulasikan perbandingan biaya investasi pelatihan terhadap estimasi peningkatan produktivitas bulanan untuk mengukur kelayakan dan titik impas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setInputMode('direct')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                inputMode === 'direct'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Total Tim Bulanan
            </button>
            <button
              type="button"
              onClick={() => setInputMode('per_participant')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                inputMode === 'per_participant'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Per Peserta
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="calc-investment"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                Biaya Investasi Pelatihan (Rp Juta)
              </label>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                Rp {investmentMillion.toLocaleString('id-ID')} Jt
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={Math.min(500, investmentMillion)}
                onChange={(e) => setInvestmentMillion(Number(e.target.value))}
                aria-label="Slider Biaya Investasi Pelatihan"
                className="flex-1 accent-emerald-700"
              />
              <input
                id="calc-investment"
                type="number"
                min={1}
                step={1}
                value={investmentMillion}
                onChange={(e) => setInvestmentMillion(Math.max(1, Number(e.target.value) || 0))}
                className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right font-mono text-sm tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {inputMode === 'direct' ? (
            <div>
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="calc-monthly-gain"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  Estimasi Peningkatan Produktivitas Bulanan (Rp Juta)
                </label>
                <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  Rp {monthlyGainMillion.toLocaleString('id-ID')} Jt/bln
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={150}
                  step={0.5}
                  value={Math.min(150, monthlyGainMillion)}
                  onChange={(e) => setMonthlyGainMillion(Number(e.target.value))}
                  aria-label="Slider Peningkatan Produktivitas Bulanan"
                  className="flex-1 accent-emerald-700"
                />
                <input
                  id="calc-monthly-gain"
                  type="number"
                  min={0}
                  step={0.5}
                  value={monthlyGainMillion}
                  onChange={(e) => setMonthlyGainMillion(Math.max(0, Number(e.target.value) || 0))}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right font-mono text-sm tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="calc-participants"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    Jumlah Peserta Pelatihan
                  </label>
                  <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                    {participants} Orang
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={250}
                    step={5}
                    value={Math.min(250, participants)}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    aria-label="Slider Jumlah Peserta"
                    className="flex-1 accent-emerald-700"
                  />
                  <input
                    id="calc-participants"
                    type="number"
                    min={1}
                    step={1}
                    value={participants}
                    onChange={(e) => setParticipants(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right font-mono text-sm tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="calc-per-person"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    Kenaikan Nilai Output / Peserta / Bulan (Rp Juta)
                  </label>
                  <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    Rp {gainPerParticipantMillion.toFixed(2)} Jt
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.05}
                    value={Math.min(5, gainPerParticipantMillion)}
                    onChange={(e) => setGainPerParticipantMillion(Number(e.target.value))}
                    aria-label="Slider Kenaikan Nilai Output Per Peserta"
                    className="flex-1 accent-emerald-700"
                  />
                  <input
                    id="calc-per-person"
                    type="number"
                    min={0}
                    step={0.05}
                    value={gainPerParticipantMillion}
                    onChange={(e) =>
                      setGainPerParticipantMillion(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right font-mono text-sm tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Total Peningkatan Bulanan</span>
                <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  Rp {effectiveMonthlyGain.toFixed(2)} Jt / bulan
                </span>
              </div>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Horizon Evaluasi Dampak
            </span>
            <div className="mt-2 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {([6, 12, 24] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHorizonMonths(m)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    horizonMonths === m
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {m} Bulan
                </button>
              ))}
            </div>
          </div>

          {(onApplyToNewProgram || onDownloadPdf) && (
            <div className="flex flex-col gap-2.5 border-t border-slate-200 pt-4 sm:flex-row dark:border-slate-800">
              {onApplyToNewProgram && (
                <button
                  type="button"
                  onClick={() =>
                    onApplyToNewProgram({
                      investmentMillion: Math.round(investmentMillion),
                      projectedRoiPercent: Math.max(0, Math.round(metrics.roiPercent)),
                      participants,
                      targetOutcome: `Mencapai peningkatan produktivitas Rp ${effectiveMonthlyGain.toFixed(
                        1
                      )} Jt/bulan dengan titik impas ${
                        Number.isFinite(metrics.paybackMonths)
                          ? `${metrics.paybackMonths.toFixed(1)} bulan`
                          : 'belum tercapai'
                      }.`,
                    })
                  }
                  className="flex-1 rounded-lg bg-slate-900 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Terapkan ke Program Baru
                </button>
              )}

              {onDownloadPdf && (
                <button
                  type="button"
                  onClick={() =>
                    onDownloadPdf({
                      inputMode,
                      investmentMillion,
                      effectiveMonthlyGain,
                      participants,
                      gainPerParticipantMillion,
                      horizonMonths,
                      roiPercent: metrics.roiPercent,
                      netBenefit: metrics.netBenefit,
                      totalGrossBenefit: metrics.totalGrossBenefit,
                      paybackMonths: metrics.paybackMonths,
                      benefitCostRatio: metrics.benefitCostRatio,
                      statusLabel,
                      timeline: metrics.timeline,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <FileDown className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  Unduh PDF ROI
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-6 border-t border-slate-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                ROI ({horizonMonths} Bln)
              </p>
              <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${statusColorClass}`}>
                {metrics.roiPercent.toFixed(0)}%
              </p>
              <p className={`mt-0.5 text-[11px] font-medium ${statusColorClass}`}>
                {statusLabel}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Manfaat Bersih
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                {metrics.netBenefit >= 0 ? '+' : '-'}Rp{' '}
                {Math.abs(metrics.netBenefit).toFixed(1)} Jt
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Bruto: Rp {metrics.totalGrossBenefit.toFixed(1)} Jt
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Titik Impas (BEP)
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                {Number.isFinite(metrics.paybackMonths)
                  ? `${metrics.paybackMonths.toFixed(1)} Bln`
                  : 'N/A'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Waktu balik modal
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Rasio Manfaat/Biaya
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                {metrics.benefitCostRatio.toFixed(2)}x
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Setiap Rp 1 investasi
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Kurva Akumulasi Produktivitas vs. Titik Impas Investasi
              </span>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
                  Surplus Produktivitas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-600" />
                  Menuju Impas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-amber-600 dark:border-amber-400" />
                  Biaya Investasi
                </span>
              </div>
            </div>

            <div className="relative flex h-44 items-end gap-1.5 pt-6">
              <div
                className="pointer-events-none absolute right-0 left-0 border-t-2 border-dashed border-amber-600/80 dark:border-amber-400/80"
                style={{
                  bottom: `${Math.min(96, Math.max(4, (investmentMillion / chartMax) * 100))}%`,
                }}
              >
                <span className="absolute -top-5 right-0 font-mono text-[10px] font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                  Investasi: Rp {investmentMillion} Jt
                </span>
              </div>

              {metrics.timeline.map((pt) => {
                const heightPct = Math.min(100, Math.max(3, (pt.cumulativeGain / chartMax) * 100));
                return (
                  <div
                    key={pt.month}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    title={`Bulan ${pt.month}: Akumulasi Rp ${pt.cumulativeGain.toFixed(1)} Jt (${
                      pt.cumulativeNet >= 0 ? '+' : ''
                    }Rp ${pt.cumulativeNet.toFixed(1)} Jt)`}
                  >
                    <div
                      className={`w-full rounded-t-xs transition-colors ${
                        pt.isBreakEven
                          ? 'bg-emerald-600 group-hover:bg-emerald-700 dark:bg-emerald-500 dark:group-hover:bg-emerald-400'
                          : 'bg-slate-300 group-hover:bg-slate-400 dark:bg-slate-700 dark:group-hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    {(horizonMonths <= 12 || pt.month % 2 === 0 || pt.month === 1) && (
                      <span className="mt-1.5 font-mono text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                        B{pt.month}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
