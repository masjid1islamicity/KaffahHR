export type ModuleKey =
  | 'overview'
  | 'training'
  | 'talent'
  | 'culture'
  | 'business'
  | 'platform';

export interface PredictivePoint {
  month: string;
  actualPerformance: number;
  predictedPerformance: number;
  attritionRisk: number;
  operationalEfficiency: number;
}

export interface CompetencyAxis {
  axis: string;
  current: number;
  target: number;
}

export interface TalentMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  performanceScore: number;
  kaffahScore: number;
  potentialTier: 'Siap Suksesi' | 'Talenta Inti' | 'Perlu Akselerasi';
  attritionRisk: 'Rendah' | 'Sedang' | 'Tinggi';
  compensationIndex: number;
  monthlySalaryMillion: number;
  trainingHours: number;
  status: 'Aktif' | 'Onboarding' | 'Cuti Belajar';
  workEthicNotes: string;
  evaluationDueDate?: string;
  evaluationPending?: boolean;
}

export interface TrainingProgram {
  id: string;
  title: string;
  category:
    | 'Kompetensi Digital & AI'
    | 'Kepemimpinan Adaptif'
    | 'Budaya Islamicity Kaffah'
    | 'Kewirausahaan & Bisnis';
  status: 'Berjalan' | 'Terjadwal' | 'Selesai';
  participants: number;
  completionRate: number;
  investmentMillion: number;
  projectedRoiPercent: number;
  preTestAvg: number;
  postTestAvg: number;
  targetOutcome: string;
  deadlineDate?: string;
}

export interface InAppNotification {
  id: string;
  type: 'training_deadline' | 'talent_followup';
  severity: 'urgent' | 'upcoming';
  title: string;
  message: string;
  dueLabel: string;
  targetModule: ModuleKey;
  targetId: string;
  read: boolean;
  dismissed: boolean;
}

export interface CulturePillar {
  id: string;
  name: string;
  arabicValue: string;
  description: string;
  adoptionScore: number;
  businessImpact: string;
}

export interface ChangeInitiative {
  id: string;
  title: string;
  driver: string;
  phase: 'Kesadaran' | 'Adopsi Aktif' | 'Institusionalisasi';
  readinessPercent: number;
  leaderAlignment: number;
  motivationFactor: string;
}

export interface InnovationIdea {
  id: string;
  title: string;
  proposer: string;
  department: string;
  stage: 'Ideasi' | 'Validasi Pasar' | 'Inkubasi' | 'Implementasi';
  marketImpactScore: number;
  efficiencyGainPercent: number;
  summary: string;
}

export interface StrategicPartnership {
  id: string;
  partnerName: string;
  sector: string;
  integrationType: string;
  status: 'Aktif' | 'Negosiasi';
  operationalReachBoost: string;
}

export interface DepartmentSyncRecord {
  id: string;
  name: string;
  endpoint: string;
  protocol: string;
  encryption: string;
  recordsSynced: number;
  lastSyncedAt: string;
  status: 'Tersinkron' | 'Tertunda' | 'Perlu Verifikasi';
  latencyMs: number;
  dataScope: string;
}

export interface SyncLogItem {
  id: string;
  departmentId: string;
  departmentName: string;
  timestamp: string;
  recordsProcessed: number;
  status: 'Sukses' | 'Sebagian';
  summary: string;
}

export interface SubscriptionPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  audience: string;
  monthlyPriceMillion: number;
  annualPriceMillion: number;
  maxEmployees: string;
  aiQuota: string;
  apiSyncRate: string;
  offlineSupport: string;
  securitySla: string;
}

export interface OfflineQueueItem {
  id: string;
  actionType: 'ADD_TALENT' | 'UPDATE_PERFORMANCE' | 'ADD_TRAINING' | 'ADD_INNOVATION' | 'SYNC_DEPARTMENT';
  label: string;
  createdAt: string;
  payloadSummary: string;
}

export interface AIAnalysisResult {
  headline: string;
  executiveSummary: string;
  projectedImpact: string;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | string;
  strategicActions: Array<{
    title: string;
    owner: string;
    horizon: string;
    rationale: string;
  }>;
}
