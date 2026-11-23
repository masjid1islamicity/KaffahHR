import { ArrowRight, Bell, Check, CheckCheck, Clock, RotateCcw, X } from 'lucide-react';
import React, { useState } from 'react';
import type { InAppNotification } from '../types';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  dailyDigestEnabled: boolean;
  onToggleDailyDigest: () => void;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onRestoreDismissed: () => void;
  onActionNotification: (item: InAppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  dailyDigestEnabled,
  onToggleDailyDigest,
  onMarkRead,
  onDismiss,
  onMarkAllRead,
  onRestoreDismissed,
  onActionNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'training_deadline' | 'talent_followup'>('all');

  if (!open) return null;

  const activeItems = notifications.filter((n) => !n.dismissed);
  const dismissedCount = notifications.length - activeItems.length;
  const unreadCount = activeItems.filter((n) => !n.read).length;

  const visibleItems =
    filter === 'all' ? activeItems : activeItems.filter((n) => n.type === filter);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Pusat Pengingat Harian Manajer"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Pengingat Harian Manajer
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {todayFormatted} · {unreadCount} belum dibaca
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pusat pengingat"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="text-xs">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              Ringkasan Pengingat Harian
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tampilkan sorotan harian di dasbor utama
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dailyDigestEnabled}
            onClick={onToggleDailyDigest}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              dailyDigestEnabled ? 'bg-emerald-700 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dailyDigestEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { key: 'all' as const, label: `Semua (${activeItems.length})` },
              {
                key: 'training_deadline' as const,
                label: `Pelatihan (${activeItems.filter((i) => i.type === 'training_deadline').length})`,
              },
              {
                key: 'talent_followup' as const,
                label: `Evaluasi (${activeItems.filter((i) => i.type === 'talent_followup').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-400"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai Semua Dibaca
            </button>

            {dismissedCount > 0 && (
              <button
                type="button"
                onClick={onRestoreDismissed}
                className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                Pulihkan ({dismissedCount})
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-5 dark:divide-slate-800">
          {visibleItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Tidak ada pengingat aktif pada kategori ini.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Seluruh deadline pelatihan dan tindak lanjut evaluasi talenta telah ditangani.
              </p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <div
                key={item.id}
                className={`space-y-2.5 py-4 ${
                  item.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        item.severity === 'urgent'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.severity === 'urgent' ? 'Mendesak' : 'Segera'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.type === 'training_deadline'
                        ? 'Deadline Pelatihan'
                        : 'Evaluasi Talenta'}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <Clock className="h-3 w-3" />
                    {item.dueLabel}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.message}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onActionNotification(item)}
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Tindak Lanjuti
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(item.id)}
                        className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Dibaca
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDismiss(item.id)}
                      className="inline-flex min-h-[34px] items-center rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
