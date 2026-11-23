import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BusinessInnovationView } from './components/views/BusinessInnovationView';
import { CultureLeadershipView } from './components/views/CultureLeadershipView';
import { ExecutiveOverview } from './components/views/ExecutiveOverview';
import { IntegrationPlatformView } from './components/views/IntegrationPlatformView';
import { TalentOperationsView } from './components/views/TalentOperationsView';
import { TrainingDevelopmentView } from './components/views/TrainingDevelopmentView';
import {
  CULTURE_PILLARS,
  INITIAL_CHANGES,
  INITIAL_INNOVATIONS,
  INITIAL_PARTNERSHIPS,
  INITIAL_TALENTS,
  INITIAL_TRAININGS,
  SUBSCRIPTION_PLANS,
} from './data/initialData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type {
  ChangeInitiative,
  DepartmentSyncRecord,
  InAppNotification,
  InnovationIdea,
  ModuleKey,
  OfflineQueueItem,
  SubscriptionPlan,
  SyncLogItem,
  TalentMember,
  TrainingProgram,
} from './types';
import { buildDailyReminders } from './utils/notifications';

const STORAGE_KEY = 'kaffah_hr_workspace_v1';

interface PersistedWorkspace {
  talents: TalentMember[];
  trainings: TrainingProgram[];
  changes: ChangeInitiative[];
  innovations: InnovationIdea[];
  departments: DepartmentSyncRecord[];
  syncHistory: SyncLogItem[];
  activePlanId: SubscriptionPlan['id'];
  offlineQueue: OfflineQueueItem[];
  isDark: boolean;
  readNotificationIds: string[];
  dismissedNotificationIds: string[];
  dailyDigestEnabled: boolean;
}

const DEFAULT_DEPARTMENTS: DepartmentSyncRecord[] = [
  {
    id: 'dept-finance',
    name: 'Keuangan & Kompensasi (ERP)',
    endpoint: '/api/v1/erp/payroll-roi',
    protocol: 'REST Webhook + HMAC-SHA256',
    encryption: 'AES-256-GCM / TLS 1.3',
    recordsSynced: 1420,
    lastSyncedAt: new Date().toISOString(),
    status: 'Tersinkron',
    latencyMs: 118,
    dataScope: 'Anggaran L&D, Payroll Merit, ROI Pelatihan',
  },
  {
    id: 'dept-ops',
    name: 'Operasional & Produksi',
    endpoint: '/api/v1/ops/productivity-kpi',
    protocol: 'GraphQL Stream + OAuth2',
    encryption: 'AES-256-GCM / TLS 1.3',
    recordsSynced: 3890,
    lastSyncedAt: new Date().toISOString(),
    status: 'Tersinkron',
    latencyMs: 94,
    dataScope: 'Output Shift, Efisiensi Proses, SLA Tim',
  },
  {
    id: 'dept-marketing',
    name: 'Pemasaran & Wawasan Pasar',
    endpoint: '/api/v1/mkt/market-signals',
    protocol: 'REST Batch Sync',
    encryption: 'AES-256-GCM / TLS 1.3',
    recordsSynced: 964,
    lastSyncedAt: new Date().toISOString(),
    status: 'Tersinkron',
    latencyMs: 145,
    dataScope: 'Konversi Kampanye, Tren Pelanggan, Kemitraan',
  },
  {
    id: 'dept-it-sec',
    name: 'IT & Keamanan Siber',
    endpoint: '/api/v1/sec/rbac-audit',
    protocol: 'Zero-Trust mTLS Webhook',
    encryption: 'ChaCha20-Poly1305 / TLS 1.3',
    recordsSynced: 2150,
    lastSyncedAt: new Date().toISOString(),
    status: 'Tersinkron',
    latencyMs: 62,
    dataScope: 'Akses RBAC, Integritas Data, Audit Sesi',
  },
  {
    id: 'dept-culture',
    name: 'Pengembangan Budaya & L&D',
    endpoint: '/api/v1/culture/kaffah-index',
    protocol: 'Event Webhook',
    encryption: 'AES-256-GCM / TLS 1.3',
    recordsSynced: 785,
    lastSyncedAt: new Date().toISOString(),
    status: 'Tertunda',
    latencyMs: 132,
    dataScope: 'Skor Islamicity Kaffah, Kehadiran Pelatihan, Mentoring',
  },
];

function loadWorkspace(): PersistedWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>;
      return {
        talents: parsed.talents ?? INITIAL_TALENTS,
        trainings: parsed.trainings ?? INITIAL_TRAININGS,
        changes: parsed.changes ?? INITIAL_CHANGES,
        innovations: parsed.innovations ?? INITIAL_INNOVATIONS,
        departments: parsed.departments ?? DEFAULT_DEPARTMENTS,
        syncHistory: parsed.syncHistory ?? [],
        activePlanId: parsed.activePlanId ?? 'growth',
        offlineQueue: parsed.offlineQueue ?? [],
        isDark: parsed.isDark ?? false,
        readNotificationIds: parsed.readNotificationIds ?? [],
        dismissedNotificationIds: parsed.dismissedNotificationIds ?? [],
        dailyDigestEnabled: parsed.dailyDigestEnabled ?? true,
      };
    }
  } catch {
    // Ignore corrupted storage and fall back to defaults
  }

  return {
    talents: INITIAL_TALENTS,
    trainings: INITIAL_TRAININGS,
    changes: INITIAL_CHANGES,
    innovations: INITIAL_INNOVATIONS,
    departments: DEFAULT_DEPARTMENTS,
    syncHistory: [],
    activePlanId: 'growth',
    offlineQueue: [],
    isDark: false,
    readNotificationIds: [],
    dismissedNotificationIds: [],
    dailyDigestEnabled: true,
  };
}

export default function App() {
  const initial = loadWorkspace();

  const [activeModule, setActiveModule] = useState<ModuleKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [focusedTalentId, setFocusedTalentId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(initial.isDark);

  const [talents, setTalents] = useState<TalentMember[]>(initial.talents);
  const [trainings, setTrainings] = useState<TrainingProgram[]>(initial.trainings);
  const [changes, setChanges] = useState<ChangeInitiative[]>(initial.changes);
  const [innovations, setInnovations] = useState<InnovationIdea[]>(initial.innovations);
  const [departments, setDepartments] = useState<DepartmentSyncRecord[]>(initial.departments);
  const [syncHistory, setSyncHistory] = useState<SyncLogItem[]>(initial.syncHistory);
  const [activePlanId, setActivePlanId] = useState<SubscriptionPlan['id']>(initial.activePlanId);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(initial.offlineQueue);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(initial.readNotificationIds);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(
    initial.dismissedNotificationIds
  );
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState<boolean>(initial.dailyDigestEnabled);

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isOnline = useOnlineStatus();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    try {
      const payload: PersistedWorkspace = {
        talents,
        trainings,
        changes,
        innovations,
        departments,
        syncHistory,
        activePlanId,
        offlineQueue,
        isDark,
        readNotificationIds,
        dismissedNotificationIds,
        dailyDigestEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota exceeded errors
    }
  }, [
    talents,
    trainings,
    changes,
    innovations,
    departments,
    syncHistory,
    activePlanId,
    offlineQueue,
    isDark,
    readNotificationIds,
    dismissedNotificationIds,
    dailyDigestEnabled,
  ]);

  const fetchDepartmentStatus = useCallback(async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/departments/status');
      if (!res.ok) return;
      const data = (await res.json()) as {
        departments?: DepartmentSyncRecord[];
        history?: SyncLogItem[];
      };
      if (data.departments) setDepartments(data.departments);
      if (data.history) setSyncHistory(data.history);
    } catch {
      // Keep local cached state when network request cannot reach server
    }
  }, [isOnline]);

  useEffect(() => {
    fetchDepartmentStatus();
  }, [fetchDepartmentStatus]);

  const queueOfflineChange = useCallback(
    (actionType: OfflineQueueItem['actionType'], label: string, payloadSummary: string) => {
      if (isOnline) return;
      const item: OfflineQueueItem = {
        id: `q-${Date.now()}`,
        actionType,
        label,
        createdAt: new Date().toISOString(),
        payloadSummary,
      };
      setOfflineQueue((prev) => [item, ...prev]);
      showToast('Tersimpan lokal (Offline). Akan disinkronkan otomatis saat daring.');
    },
    [isOnline, showToast]
  );

  const handleSyncDepartment = useCallback(
    async (departmentId?: string) => {
      if (!isOnline) {
        queueOfflineChange(
          'SYNC_DEPARTMENT',
          departmentId ? `Sinkronisasi ${departmentId}` : 'Sinkronisasi Semua Departemen',
          'Permintaan sinkronisasi dijadwalkan saat koneksi kembali.'
        );
        return;
      }

      setIsSyncing(true);
      try {
        const res = await fetch('/api/departments/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departmentId }),
        });
        if (!res.ok) {
          throw new Error('Gagal melakukan sinkronisasi API.');
        }
        const data = (await res.json()) as {
          departments: DepartmentSyncRecord[];
          history: SyncLogItem[];
          processed: SyncLogItem[];
        };
        setDepartments(data.departments);
        setSyncHistory(data.history);
        showToast(
          `Sinkronisasi selesai: ${data.processed.length} konektor departemen diperbarui.`
        );
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Sinkronisasi gagal.');
      } finally {
        setIsSyncing(false);
      }
    },
    [isOnline, queueOfflineChange, showToast]
  );

  const handleFlushOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;
    await handleSyncDepartment();
    setOfflineQueue([]);
    showToast('Seluruh antrean offline berhasil disinkronkan ke server.');
  }, [isOnline, offlineQueue.length, handleSyncDepartment, showToast]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      handleFlushOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, handleFlushOfflineQueue]);

  const handleAddTraining = (program: Omit<TrainingProgram, 'id'>) => {
    const newItem: TrainingProgram = {
      ...program,
      id: `trn-${Date.now()}`,
    };
    setTrainings((prev) => [newItem, ...prev]);
    queueOfflineChange('ADD_TRAINING', 'Program Pelatihan Baru', newItem.title);
    if (isOnline) {
      showToast(`Program "${newItem.title}" ditambahkan ke portofolio L&D.`);
    }
  };

  const handleAddTalent = (talent: Omit<TalentMember, 'id'>) => {
    const newItem: TalentMember = {
      ...talent,
      id: `tal-${Date.now()}`,
    };
    setTalents((prev) => [newItem, ...prev]);
    queueOfflineChange('ADD_TALENT', 'Talenta Baru', `${newItem.name} (${newItem.department})`);
    if (isOnline) {
      showToast(`Talenta ${newItem.name} berhasil ditambahkan.`);
    }
  };

  const handleUpdateTalentScore = (
    id: string,
    performanceScore: number,
    kaffahScore: number,
    monthlySalaryMillion: number,
    workEthicNotes?: string
  ) => {
    setTalents((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const potentialTier: TalentMember['potentialTier'] =
          performanceScore >= 88 && kaffahScore >= 90
            ? 'Siap Suksesi'
            : performanceScore >= 80
              ? 'Talenta Inti'
              : 'Perlu Akselerasi';
        const attritionRisk: TalentMember['attritionRisk'] =
          performanceScore < 80 ? 'Tinggi' : kaffahScore < 85 ? 'Sedang' : 'Rendah';

        return {
          ...t,
          performanceScore,
          kaffahScore,
          monthlySalaryMillion,
          potentialTier,
          attritionRisk,
          workEthicNotes: workEthicNotes !== undefined ? workEthicNotes : t.workEthicNotes,
        };
      })
    );
  };

  const handleUpdateChangeReadiness = (id: string, readinessPercent: number) => {
    setChanges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const phase: ChangeInitiative['phase'] =
          readinessPercent >= 88
            ? 'Institusionalisasi'
            : readinessPercent >= 70
              ? 'Adopsi Aktif'
              : 'Kesadaran';
        return { ...c, readinessPercent, phase };
      })
    );
  };

  const handleAddInnovation = (idea: Omit<InnovationIdea, 'id'>) => {
    const newItem: InnovationIdea = {
      ...idea,
      id: `inn-${Date.now()}`,
    };
    setInnovations((prev) => [newItem, ...prev]);
    queueOfflineChange('ADD_INNOVATION', 'Ide Inovasi Baru', newItem.title);
    if (isOnline) {
      showToast(`Inisiatif "${newItem.title}" masuk ke pipeline inovasi.`);
    }
  };

  const notifications = useMemo(
    () =>
      buildDailyReminders({
        talents,
        trainings,
        readIds: readNotificationIds,
        dismissedIds: dismissedNotificationIds,
      }),
    [talents, trainings, readNotificationIds, dismissedNotificationIds]
  );

  const unreadNotificationCount = notifications.filter((n) => !n.dismissed && !n.read).length;

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMarkAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
  };

  const handleRestoreDismissedNotifications = () => {
    setDismissedNotificationIds([]);
  };

  const handleActionNotification = (item: InAppNotification) => {
    handleMarkNotificationRead(item.id);
    if (item.targetModule === 'talent') {
      setFocusedTalentId(item.targetId);
    }
    setActiveModule(item.targetModule);
    setNotificationDrawerOpen(false);
  };

  const handleCompleteTalentEvaluation = (id: string) => {
    setTalents((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              evaluationPending: false,
              attritionRisk: t.attritionRisk === 'Tinggi' ? 'Sedang' : t.attritionRisk,
            }
          : t
      )
    );
    const notifId = `notif-tal-${id}`;
    setDismissedNotificationIds((prev) => (prev.includes(notifId) ? prev : [...prev, notifId]));
    showToast('Tindak lanjut evaluasi talenta telah ditandai selesai.');
  };

  const activePlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId) ?? SUBSCRIPTION_PLANS[1];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activePlanName={activePlan.name}
        offlineQueueCount={offlineQueue.length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeModule={activeModule}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onSyncAll={() => handleSyncDepartment()}
          unreadNotificationCount={unreadNotificationCount}
          onOpenNotifications={() => setNotificationDrawerOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {activeModule === 'overview' && (
            <ExecutiveOverview
              talents={talents}
              trainings={trainings}
              departments={departments}
              isOnline={isOnline}
              onNavigate={setActiveModule}
              notifications={notifications}
              dailyDigestEnabled={dailyDigestEnabled}
              onOpenNotifications={() => setNotificationDrawerOpen(true)}
            />
          )}

          {activeModule === 'training' && (
            <TrainingDevelopmentView
              trainings={trainings}
              onAddTraining={handleAddTraining}
              isOnline={isOnline}
            />
          )}

          {activeModule === 'talent' && (
            <TalentOperationsView
              talents={talents}
              onAddTalent={handleAddTalent}
              onUpdateTalentScore={handleUpdateTalentScore}
              onCompleteEvaluation={handleCompleteTalentEvaluation}
              focusedTalentId={focusedTalentId}
              isOnline={isOnline}
            />
          )}

          {activeModule === 'culture' && (
            <CultureLeadershipView
              pillars={CULTURE_PILLARS}
              changes={changes}
              onUpdateChangeReadiness={handleUpdateChangeReadiness}
              isOnline={isOnline}
            />
          )}

          {activeModule === 'business' && (
            <BusinessInnovationView
              innovations={innovations}
              partnerships={INITIAL_PARTNERSHIPS}
              onAddInnovation={handleAddInnovation}
              isOnline={isOnline}
            />
          )}

          {activeModule === 'platform' && (
            <IntegrationPlatformView
              departments={departments}
              syncHistory={syncHistory}
              isSyncing={isSyncing}
              onSyncDepartment={handleSyncDepartment}
              activePlanId={activePlanId}
              onSelectPlan={(planId) => {
                setActivePlanId(planId);
                const chosen = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
                if (chosen) {
                  showToast(`Paket langganan diperbarui ke ${chosen.name}.`);
                }
              }}
              offlineQueue={offlineQueue}
              onFlushOfflineQueue={handleFlushOfflineQueue}
              isOnline={isOnline}
            />
          )}
        </main>
      </div>

      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        dailyDigestEnabled={dailyDigestEnabled}
        onToggleDailyDigest={() => setDailyDigestEnabled((prev) => !prev)}
        onMarkRead={handleMarkNotificationRead}
        onDismiss={handleDismissNotification}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onRestoreDismissed={handleRestoreDismissedNotifications}
        onActionNotification={handleActionNotification}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
