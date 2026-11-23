import type {
  InAppNotification,
  TalentMember,
  TrainingProgram,
} from '../types';

function daysBetweenToday(isoDate?: string): number | null {
  if (!isoDate) return null;
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatDueLabel(daysDiff: number | null, fallback: string): string {
  if (daysDiff === null) return fallback;
  if (daysDiff < 0) return `Terlambat ${Math.abs(daysDiff)} hari`;
  if (daysDiff === 0) return 'Jatuh tempo hari ini';
  if (daysDiff === 1) return 'Berakhir besok';
  return `Sisa ${daysDiff} hari`;
}

export function buildDailyReminders(params: {
  talents: TalentMember[];
  trainings: TrainingProgram[];
  readIds: string[];
  dismissedIds: string[];
}): InAppNotification[] {
  const { talents, trainings, readIds, dismissedIds } = params;
  const items: InAppNotification[] = [];

  for (const tr of trainings) {
    if (tr.status === 'Selesai') continue;
    const defaultDays = tr.id === 'trn-01' ? 2 : tr.id === 'trn-03' ? 5 : null;
    const diff = tr.deadlineDate ? daysBetweenToday(tr.deadlineDate) : defaultDays;

    if (diff !== null && diff <= 7) {
      const id = `notif-trn-${tr.id}`;
      items.push({
        id,
        type: 'training_deadline',
        severity: diff <= 2 ? 'urgent' : 'upcoming',
        title: `Deadline Pelatihan: ${tr.title}`,
        message: `Program ${tr.category} baru mencapai ${tr.completionRate}% penyelesaian dengan ${tr.participants} peserta aktif.`,
        dueLabel: formatDueLabel(diff, 'Segera berakhir'),
        targetModule: 'training',
        targetId: tr.id,
        read: readIds.includes(id),
        dismissed: dismissedIds.includes(id),
      });
    }
  }

  for (const tal of talents) {
    const needsFollowUp =
      tal.evaluationPending === true ||
      tal.attritionRisk === 'Tinggi' ||
      tal.potentialTier === 'Perlu Akselerasi' ||
      tal.status === 'Onboarding';

    if (!needsFollowUp) continue;

    const fallbackDays =
      tal.id === 'tal-07' ? -1 : tal.id === 'tal-08' ? 2 : tal.id === 'tal-02' ? 4 : 3;
    const diff = tal.evaluationDueDate ? daysBetweenToday(tal.evaluationDueDate) : fallbackDays;

    const id = `notif-tal-${tal.id}`;
    const reason =
      tal.attritionRisk === 'Tinggi'
        ? `Risiko attrition tinggi (${tal.department}) · perlu sesi coaching dan peninjauan motivasi kerja.`
        : tal.status === 'Onboarding'
          ? `Tahap ${tal.status} (${tal.department}) · jadwal evaluasi adaptasi budaya Islamicity Kaffah.`
          : `Penilaian kinerja berkala & peninjauan suksesi (${tal.department}) menunggu tindak lanjut.`;

    items.push({
      id,
      type: 'talent_followup',
      severity: diff !== null && diff <= 1 ? 'urgent' : 'upcoming',
      title: `Tindak Lanjut Evaluasi: ${tal.name}`,
      message: reason,
      dueLabel: formatDueLabel(diff, 'Evaluasi tertunda'),
      targetModule: 'talent',
      targetId: tal.id,
      read: readIds.includes(id),
      dismissed: dismissedIds.includes(id),
    });
  }

  return items.sort((a, b) => {
    if (a.dismissed !== b.dismissed) return a.dismissed ? 1 : -1;
    if (a.severity !== b.severity) return a.severity === 'urgent' ? -1 : 1;
    return 0;
  });
}
