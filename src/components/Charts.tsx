import React, { useState } from 'react';
import type { CompetencyAxis, PredictivePoint } from '../types';

interface PredictiveTrendChartProps {
  data: PredictivePoint[];
  horizonMonths: 3 | 6 | 12;
}

export const PredictiveTrendChart: React.FC<PredictiveTrendChartProps> = ({
  data,
  horizonMonths,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const visibleData =
    horizonMonths === 3
      ? data.slice(3, 9)
      : horizonMonths === 6
        ? data.slice(1, 10)
        : data;

  const width = 760;
  const height = 270;
  const padL = 42;
  const padR = 20;
  const padT = 20;
  const padB = 34;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const yMin = 60;
  const yMax = 100;

  const xPos = (i: number) =>
    visibleData.length <= 1
      ? padL + plotW / 2
      : padL + (i / (visibleData.length - 1)) * plotW;

  const yPos = (val: number) =>
    padT + ((yMax - Math.max(yMin, Math.min(yMax, val))) / (yMax - yMin)) * plotH;

  const predictedPath = visibleData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(pt.predictedPerformance).toFixed(1)}`)
    .join(' ');

  const actualPath = visibleData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(pt.actualPerformance).toFixed(1)}`)
    .join(' ');

  const efficiencyPath = visibleData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(pt.operationalEfficiency).toFixed(1)}`)
    .join(' ');

  const areaPath = `${predictedPath} L ${xPos(visibleData.length - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xPos(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  const activeIdx = hoveredIdx !== null && hoveredIdx < visibleData.length ? hoveredIdx : visibleData.length - 1;
  const activePoint = visibleData[activeIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="h-0.5 w-4 bg-emerald-600 dark:bg-emerald-400" />
            Proyeksi Kinerja AI
          </span>
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="h-0.5 w-4 bg-slate-900 dark:bg-slate-200" />
            Kinerja Aktual
          </span>
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-600 dark:border-amber-400" />
            Efisiensi Operasional
          </span>
        </div>

        {activePoint && (
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{activePoint.month}</span>
            <span>Proyeksi: {activePoint.predictedPerformance}%</span>
            <span>Aktual: {activePoint.actualPerformance}%</span>
            <span>Efisiensi: {activePoint.operationalEfficiency}%</span>
            <span className="text-amber-700 dark:text-amber-400">Risiko Attrition: {activePoint.attritionRisk}%</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[560px] select-none"
          role="img"
          aria-label="Grafik Proyeksi Kinerja SDM dan Efisiensi Operasional"
        >
          <defs>
            <linearGradient id="kaffahAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[60, 70, 80, 90, 100].map((tick) => {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] font-mono tabular-nums dark:fill-slate-500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#kaffahAreaGrad)" />

          <path
            d={efficiencyPath}
            fill="none"
            className="stroke-amber-600 dark:stroke-amber-400"
            strokeWidth="2"
            strokeDasharray="5 4"
          />

          <path
            d={actualPath}
            fill="none"
            className="stroke-slate-900 dark:stroke-slate-200"
            strokeWidth="2.2"
          />

          <path
            d={predictedPath}
            fill="none"
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="2.5"
          />

          {hoveredIdx !== null && hoveredIdx < visibleData.length && (
            <line
              x1={xPos(hoveredIdx)}
              y1={padT}
              x2={xPos(hoveredIdx)}
              y2={padT + plotH}
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth="1"
            />
          )}

          {visibleData.map((pt, i) => {
            const cx = xPos(i);
            const isActive = i === activeIdx;
            return (
              <g key={pt.month}>
                <circle
                  cx={cx}
                  cy={yPos(pt.predictedPerformance)}
                  r={isActive ? 5 : 3.2}
                  className="fill-emerald-600 stroke-white dark:fill-emerald-400 dark:stroke-slate-900"
                  strokeWidth="2"
                />
                <circle
                  cx={cx}
                  cy={yPos(pt.actualPerformance)}
                  r={isActive ? 4.5 : 2.8}
                  className="fill-slate-900 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${
                    isActive
                      ? 'fill-slate-900 font-semibold dark:fill-white'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {pt.month}
                </text>
                <rect
                  x={cx - plotW / (visibleData.length * 2)}
                  y={padT}
                  width={plotW / visibleData.length}
                  height={plotH + padB}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface CompetencyRadarChartProps {
  axes: CompetencyAxis[];
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({ axes }) => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 90;
  const count = axes.length;

  const angleFor = (index: number) => (Math.PI * 2 * index) / count - Math.PI / 2;

  const pointFor = (index: number, value: number) => {
    const angle = angleFor(index);
    const r = (value / 100) * radius;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  const toPolygon = (values: number[]) =>
    values
      .map((val, i) => {
        const p = pointFor(i, val);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-60 w-60 shrink-0 select-none"
        role="img"
        aria-label="Radar Kesenjangan Kompetensi SDM"
      >
        {[25, 50, 75, 100].map((level) => (
          <polygon
            key={level}
            points={toPolygon(axes.map(() => level))}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="1"
          />
        ))}

        {axes.map((axis, i) => {
          const outer = pointFor(i, 100);
          const labelPt = pointFor(i, 118);
          return (
            <g key={axis.axis}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 text-[9.5px] font-medium dark:fill-slate-400"
              >
                {axis.axis.split(' ').slice(0, 2).join(' ')}
              </text>
            </g>
          );
        })}

        <polygon
          points={toPolygon(axes.map((a) => a.target))}
          className="fill-slate-400/10 stroke-slate-400 dark:fill-slate-500/10 dark:stroke-slate-500"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        <polygon
          points={toPolygon(axes.map((a) => a.current))}
          className="fill-emerald-600/20 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-400"
          strokeWidth="2"
        />
      </svg>

      <div className="w-full flex-1 space-y-2.5">
        {axes.map((axis) => {
          const gap = axis.target - axis.current;
          return (
            <div key={axis.axis} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">{axis.axis}</span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {axis.current}% / Target {axis.target}% ({gap > 0 ? `-${gap}` : 'Tercapai'})
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                  style={{ width: `${axis.current}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
