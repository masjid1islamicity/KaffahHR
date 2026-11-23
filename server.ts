import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

interface DepartmentSyncRecord {
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

interface SyncLogItem {
  id: string;
  departmentId: string;
  departmentName: string;
  timestamp: string;
  recordsProcessed: number;
  status: 'Sukses' | 'Sebagian';
  summary: string;
}

const departmentStore: DepartmentSyncRecord[] = [
  {
    id: 'dept-finance',
    name: 'Keuangan & Kompensasi (ERP)',
    endpoint: '/api/v1/erp/payroll-roi',
    protocol: 'REST Webhook + HMAC-SHA256',
    encryption: 'AES-256-GCM / TLS 1.3',
    recordsSynced: 1420,
    lastSyncedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
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
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
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
    lastSyncedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
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
    lastSyncedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
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
    lastSyncedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: 'Tertunda',
    latencyMs: 132,
    dataScope: 'Skor Islamicity Kaffah, Kehadiran Pelatihan, Mentoring',
  },
];

const syncHistory: SyncLogItem[] = [
  {
    id: 'log-1',
    departmentId: 'dept-ops',
    departmentName: 'Operasional & Produksi',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    recordsProcessed: 128,
    status: 'Sukses',
    summary: 'Sinkronisasi KPI efisiensi operasional kuartalan dan produktivitas tim selesai.',
  },
  {
    id: 'log-2',
    departmentId: 'dept-finance',
    departmentName: 'Keuangan & Kompensasi (ERP)',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    recordsProcessed: 64,
    status: 'Sukses',
    summary: 'Pembaruan alokasi investasi pelatihan dan kompensasi berbasis kinerja.',
  },
  {
    id: 'log-3',
    departmentId: 'dept-it-sec',
    departmentName: 'IT & Keamanan Siber',
    timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    recordsProcessed: 215,
    status: 'Sukses',
    summary: 'Verifikasi enkripsi data talenta dan rotasi token akses lintas departemen.',
  },
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'kaffah-hr-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/departments/status', (_req, res) => {
  res.json({
    departments: departmentStore,
    history: syncHistory.slice(0, 12),
    securityPosture: {
      encryptionAtRest: 'AES-256-GCM',
      transportLayer: 'TLS 1.3 + mTLS Internal',
      accessControl: 'RBAC Multi-Departemen',
      lastAuditAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  });
});

app.post('/api/departments/sync', (req, res) => {
  const { departmentId } = req.body as { departmentId?: string };
  const now = new Date().toISOString();
  const targets = departmentId
    ? departmentStore.filter((d) => d.id === departmentId)
    : departmentStore;

  if (targets.length === 0) {
    res.status(404).json({ error: 'Departemen tidak ditemukan dalam konfigurasi API.' });
    return;
  }

  const processedDetails: SyncLogItem[] = [];

  for (const dept of targets) {
    const delta = Math.floor(Math.random() * 45) + 12;
    dept.recordsSynced += delta;
    dept.lastSyncedAt = now;
    dept.status = 'Tersinkron';
    dept.latencyMs = Math.floor(Math.random() * 70) + 55;

    const logItem: SyncLogItem = {
      id: `log-${Date.now()}-${dept.id}`,
      departmentId: dept.id,
      departmentName: dept.name,
      timestamp: now,
      recordsProcessed: delta,
      status: 'Sukses',
      summary: `Sinkronisasi otomatis ${delta} entri (${dept.dataScope}) berhasil terverifikasi.`,
    };
    syncHistory.unshift(logItem);
    processedDetails.push(logItem);
  }

  if (syncHistory.length > 30) {
    syncHistory.length = 30;
  }

  res.json({
    syncedAt: now,
    processed: processedDetails,
    departments: departmentStore,
    history: syncHistory.slice(0, 12),
  });
});

app.post('/api/ai/analyze', async (req, res) => {
  const { mode, contextData, question } = req.body as {
    mode?: string;
    contextData?: Record<string, unknown>;
    question?: string;
  };

  if (!mode) {
    res.status(400).json({ error: 'Parameter mode analisis wajib diisi.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({
      error:
        'GEMINI_API_KEY belum terkonfigurasi di server. Silakan periksa panel Settings > Secrets untuk mengaktifkan analitik AI.',
    });
    return;
  }

  const modeInstructions: Record<string, string> = {
    predictive_hr:
      'Anda adalah Kepala Analitik SDM Prediktif pada platform KaffahHR. Analisis data kinerja, risiko turnover, dan efisiensi lintas departemen. Berikan proyeksi strategis dan langkah intervensi berbasis data.',
    training_roi:
      'Anda adalah Direktur Pembelajaran & Pengembangan SDM (L&D). Tekankan bahwa pelatihan adalah investasi strategis jangka panjang, bukan biaya. Evaluasi ROI pelatihan dan rekomendasikan kurikulum berdampak tinggi.',
    culture_change:
      'Anda adalah Penasihat Kepemimpinan, Manajemen Perubahan, dan Budaya Organisasi Islamicity Kaffah (Shiddiq, Amanah, Fathanah, Tabligh, serta etos Cerdas, Keras, Tuntas, Ikhlas). Evaluasi keselarasan visi pemimpin dan adaptasi perubahan teknologi.',
    business_innovation:
      'Anda adalah Ahli Tata Kelola Bisnis, Kewirausahaan, Strategi Pemasaran, dan Kemitraan Ekosistem Digital. Berikan analisis berbasis wawasan pasar untuk mempercepat inovasi berkelanjutan.',
    talent_coach:
      'Anda adalah Konsultan Manajemen Talenta Strategis. Berikan rencana coaching, pengembangan kompetensi, dan penyesuaian kompensasi/motivasi kerja yang objektif untuk talenta yang dipilih.',
  };

  const systemInstruction = `${
    modeInstructions[mode] ?? modeInstructions.predictive_hr
  } Selalu jawab dalam Bahasa Indonesia yang profesional, ringkas, konkret, dan berbasis angka dari data konteks yang diberikan. Jangan mengarang angka di luar konteks tanpa menandainya sebagai proyeksi.`;

  const prompt = `Konteks Data Organisasi:\n${JSON.stringify(
    contextData ?? {},
    null,
    2
  )}\n\nPertanyaan / Fokus Analisis:\n${
    question || 'Berikan ringkasan analitik prediktif dan rekomendasi strategis prioritas.'
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: 'Judul kesimpulan utama maksimal 12 kata.',
            },
            executiveSummary: {
              type: Type.STRING,
              description: 'Ringkasan analisis berbasis data 2-3 kalimat.',
            },
            projectedImpact: {
              type: Type.STRING,
              description: 'Dampak terukur yang diproyeksikan dalam 3-6 bulan.',
            },
            riskLevel: {
              type: Type.STRING,
              description: 'Tingkat risiko: Rendah, Sedang, atau Tinggi.',
            },
            strategicActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  horizon: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['title', 'owner', 'horizon', 'rationale'],
              },
              description: '3 langkah aksi konkret dan terukur.',
            },
          },
          required: [
            'headline',
            'executiveSummary',
            'projectedImpact',
            'riskLevel',
            'strategicActions',
          ],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    res.json({
      generatedAt: new Date().toISOString(),
      mode,
      result: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghubungi layanan Gemini AI.';
    const statusCode =
      message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
        ? 429
        : message.includes('403') || message.includes('API_KEY')
          ? 403
          : 500;
    res.status(statusCode).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('/{*splat}', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KaffahHR Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
