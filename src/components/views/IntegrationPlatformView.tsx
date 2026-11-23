import { Check, Lock, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../../data/initialData';
import type {
  DepartmentSyncRecord,
  OfflineQueueItem,
  SubscriptionPlan,
  SyncLogItem,
} from '../../types';

interface IntegrationPlatformViewProps {
  departments: DepartmentSyncRecord[];
  syncHistory: SyncLogItem[];
  isSyncing: boolean;
  onSyncDepartment: (departmentId?: string) => void;
  activePlanId: SubscriptionPlan['id'];
  onSelectPlan: (planId: SubscriptionPlan['id']) => void;
  offlineQueue: OfflineQueueItem[];
  onFlushOfflineQueue: () => void;
  isOnline: boolean;
}

export const IntegrationPlatformView: React.FC<IntegrationPlatformViewProps> = ({
  departments,
  syncHistory,
  isSyncing,
  onSyncDepartment,
  activePlanId,
  onSelectPlan,
  offlineQueue,
  onFlushOfflineQueue,
  isOnline,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [inspectedDept, setInspectedDept] = useState<DepartmentSyncRecord | null>(
    departments[0] ?? null
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Integrasi API Otomatis Lintas Departemen
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konektivitas real-time antar sistem ERP Keuangan, Operasional, Pemasaran, Keamanan Siber, dan Pengembangan SDM.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSyncDepartment()}
            disabled={isSyncing}
            className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sinkronkan Semua Departemen
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="overflow-x-auto lg:col-span-7">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Departemen & Endpoint</th>
                  <th className="py-2 pr-3">Protokol</th>
                  <th className="py-2 pr-3 text-right">Entri</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => setInspectedDept(dept)}
                    className={`h-12 cursor-pointer ${
                      inspectedDept?.id === dept.id
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{dept.name}</p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {dept.endpoint}
                      </p>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-600 dark:text-slate-400">
                      {dept.protocol}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-slate-900 dark:text-white">
                      {dept.recordsSynced.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSyncDepartment(dept.id);
                        }}
                        disabled={isSyncing}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Sinkron
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:col-span-5">
            {inspectedDept && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Inspeksi Payload API: {inspectedDept.name}
                </p>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
{JSON.stringify(
  {
    endpoint: inspectedDept.endpoint,
    encryption: inspectedDept.encryption,
    status: inspectedDept.status,
    recordsSynced: inspectedDept.recordsSynced,
    lastSyncedAt: inspectedDept.lastSyncedAt,
    scope: inspectedDept.dataScope,
  },
  null,
  2
)}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Riwayat Sinkronisasi Terbaru
              </h3>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {syncHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-slate-100 pb-2 text-xs last:border-b-0 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-slate-900 dark:text-slate-100">
                      <span className="font-medium">{item.departmentName}</span>
                      <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                        +{item.recordsProcessed} entri
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-base font-semibold">Keamanan Siber, Enkripsi & Skalabilitas</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Perlindungan integritas data talenta dan infrastruktur skalabel untuk pertumbuhan multi-entitas.
          </p>

          <dl className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-600 dark:text-slate-400">Enkripsi Data Tersimpan</dt>
              <dd className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                AES-256-GCM
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-600 dark:text-slate-400">Keamanan Transmisi API</dt>
              <dd className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                TLS 1.3 + HMAC Signature
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-600 dark:text-slate-400">Kontrol Akses Organisasi</dt>
              <dd className="text-xs font-semibold text-slate-900 dark:text-white">
                RBAC Lintas Departemen
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-600 dark:text-slate-400">Arsitektur Skalabilitas</dt>
              <dd className="text-xs font-semibold text-slate-900 dark:text-white">
                Lintas Platform Web & PWA Seluler
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Produktivitas Offline & Antrean Sinkronisasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perubahan data tetap tersimpan lokal saat tanpa internet dan disinkronkan otomatis saat daring.
              </p>
            </div>

            <button
              type="button"
              onClick={onFlushOfflineQueue}
              disabled={!isOnline || offlineQueue.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Sinkronkan Antrean ({offlineQueue.length})
            </button>
          </div>

          {!isOnline && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              Koneksi terputus — seluruh input baru otomatis masuk ke penyimpanan lokal perangkat.
            </div>
          )}

          <div className="mt-4">
            {offlineQueue.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                Semua perubahan data lokal telah tersinkronisasi sempurna dengan server pusat.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {offlineQueue.map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{q.label}</p>
                      <p className="text-slate-500 dark:text-slate-400">{q.payloadSummary}</p>
                    </div>
                    <span className="font-mono text-amber-700 dark:text-amber-400">Menunggu</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Paket Langganan Platform KaffahHR
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Model langganan bulanan transparan dengan kapasitas skala tim, kuota AI prediktif, dan integrasi API.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Tahunan (Hemat 15%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = activePlanId === plan.id;
            const price =
              billingCycle === 'monthly' ? plan.monthlyPriceMillion : plan.annualPriceMillion;

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/30 dark:border-emerald-500 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {plan.audience}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                      Rp {price.toFixed(1)} Jt
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
                  </div>

                  <ul className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{plan.maxEmployees}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{plan.aiQuota}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{plan.apiSyncRate}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{plan.offlineSupport}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{plan.securitySla}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`mt-6 w-full rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                  }`}
                >
                  {isCurrent ? 'Paket Aktif Saat Ini' : `Pilih Paket ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
