import {
  Activity,
  Briefcase,
  Compass,
  GraduationCap,
  Layers,
  ServerCog,
  Users,
  X,
} from 'lucide-react';
import React from 'react';
import type { ModuleKey } from '../types';
import { AvatarWithFallback } from './AvatarWithFallback';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (mod: ModuleKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activePlanName: string;
  offlineQueueCount: number;
}

const NAV_ITEMS: Array<{
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'overview', label: 'Dasbor Prediktif', icon: Activity },
  { key: 'training', label: 'Diklat & ROI SDM', icon: GraduationCap },
  { key: 'talent', label: 'Operasional & Talenta', icon: Users },
  { key: 'culture', label: 'Budaya & Kepemimpinan', icon: Compass },
  { key: 'business', label: 'Bisnis & Kewirausahaan', icon: Briefcase },
  { key: 'platform', label: 'API, Keamanan & Paket', icon: ServerCog },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  mobileOpen,
  onCloseMobile,
  activePlanName,
  offlineQueueCount,
}) => {
  const handleSelect = (key: ModuleKey) => {
    onSelectModule(key);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => handleSelect('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white dark:bg-emerald-600">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap dark:text-white">
              KaffahHR
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Navigasi Modul Utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        {offlineQueueCount > 0 && (
          <button
            type="button"
            onClick={() => handleSelect('platform')}
            className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
          >
            {offlineQueueCount} perubahan menunggu sinkronisasi
          </button>
        )}

        <div className="flex items-center gap-3 px-1">
          <AvatarWithFallback
            src="/src/assets/images/avatar_hr_director_1795385314636.jpg"
            name="Rahmawati Hidayah"
            sizeClass="h-9 w-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              Rahmawati Hidayah
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Direktur SDM · {activePlanName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 h-screen overflow-y-auto">{navContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-slate-200 shadow-xl dark:border-slate-800">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
