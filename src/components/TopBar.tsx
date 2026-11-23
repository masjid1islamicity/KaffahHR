import { Bell, Download, Menu, Moon, RefreshCw, Sun, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { ModuleKey } from '../types';

interface TopBarProps {
  activeModule: ModuleKey;
  onOpenMobileMenu: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncAll: () => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
}

const MODULE_TITLES: Record<ModuleKey, string> = {
  overview: 'Dasbor Eksekutif & Analitik Prediktif',
  training: 'Pendidikan, Pelatihan & ROI SDM',
  talent: 'Operasional SDM & Talenta Strategis',
  culture: 'Budaya Islamicity Kaffah & Kepemimpinan',
  business: 'Manajemen Bisnis, Kewirausahaan & Inovasi',
  platform: 'Integrasi API, Keamanan Siber & Langganan',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeModule,
  onOpenMobileMenu,
  isDark,
  onToggleTheme,
  isOnline,
  isSyncing,
  onSyncAll,
  unreadNotificationCount,
  onOpenNotifications,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Buka menu navigasi"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden font-medium text-slate-500 sm:inline dark:text-slate-400">
              KaffahHR
            </span>
            <span className="hidden text-slate-300 sm:inline dark:text-slate-600">/</span>
            <h1 className="truncate font-display font-semibold text-slate-900 dark:text-white">
              {MODULE_TITLES[activeModule]}
            </h1>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {!isOnline && (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
              <WifiOff className="h-3.5 w-3.5" />
              Mode Offline
            </span>
          )}

          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              Pasang Aplikasi
            </button>
          )}

          {!isInstalled && !isInstallable && isIOS && (
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              Pasang iOS
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Buka pengingat harian (${unreadNotificationCount} belum dibaca)`}
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-600 px-1 font-mono text-[10px] font-bold tabular-nums text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi API'}
          </button>
        </div>
      </header>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Pasang KaffahHR di iPhone / iPad
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              1. Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah Safari.
              <br />
              2. Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong> untuk akses offline penuh.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
