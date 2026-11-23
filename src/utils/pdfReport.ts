import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  DepartmentSyncRecord,
  TalentMember,
  TrainingProgram,
} from '../types';

export interface RoiSimulationReportInput {
  inputMode: 'direct' | 'per_participant';
  investmentMillion: number;
  effectiveMonthlyGain: number;
  participants: number;
  gainPerParticipantMillion: number;
  horizonMonths: 6 | 12 | 24;
  roiPercent: number;
  netBenefit: number;
  totalGrossBenefit: number;
  paybackMonths: number;
  benefitCostRatio: number;
  statusLabel: string;
  timeline: Array<{
    month: number;
    cumulativeGain: number;
    cumulativeNet: number;
    isBreakEven: boolean;
  }>;
}

function addReportHeader(doc: jsPDF, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(4, 120, 87); // Emerald 700
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('KaffahHR', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(title, 14, 19);

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(8.5);
  doc.text(`Dicetak: ${dateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(subtitle, pageWidth - 14, 19, { align: 'right' });
  doc.setTextColor(15, 23, 42);
}

function addPageFooters(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'KaffahHR · Laporan Manajerial Sumber Daya Manusia & Budaya Organisasi Islamicity Kaffah',
      14,
      pageHeight - 8
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 8, {
      align: 'right',
    });
  }
}

export function downloadPerformanceSummaryPDF(params: {
  talents: TalentMember[];
  trainings: TrainingProgram[];
  departments: DepartmentSyncRecord[];
}) {
  const { talents, trainings, departments } = params;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addReportHeader(
    doc,
    'Laporan Ringkasan Performa SDM & Analitik Eksekutif',
    'Dokumen Pelaporan Manajerial'
  );

  const avgPerf =
    talents.length > 0
      ? (talents.reduce((s, t) => s + t.performanceScore, 0) / talents.length).toFixed(1)
      : '0.0';
  const avgKaffah =
    talents.length > 0
      ? (talents.reduce((s, t) => s + t.kaffahScore, 0) / talents.length).toFixed(1)
      : '0.0';
  const avgRoi =
    trainings.length > 0
      ? Math.round(trainings.reduce((s, tr) => s + tr.projectedRoiPercent, 0) / trainings.length)
      : 0;
  const totalPayroll = talents.reduce((s, t) => s + t.monthlySalaryMillion, 0);
  const syncedCount = departments.filter((d) => d.status === 'Tersinkron').length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Ringkasan Indikator Kinerja Utama (KPI)', 14, 38);

  autoTable(doc, {
    startY: 42,
    head: [['Indikator Strategis', 'Nilai Aktual', 'Keterangan Operasional']],
    body: [
      ['Indeks Kinerja SDM Rata-Rata', `${avgPerf}%`, `${talents.length} talenta aktif dievaluasi`],
      ['Indeks Budaya Islamicity Kaffah', `${avgKaffah}%`, 'Etos kerja Cerdas, Keras, Tuntas, Ikhlas'],
      ['Proyeksi ROI Investasi Diklat', `${avgRoi}%`, `${trainings.length} program pelatihan terdaftar`],
      ['Total Kompensasi Merit Bulanan', `Rp ${totalPayroll.toFixed(1)} Juta`, 'Tersinkron dengan sistem ERP Keuangan'],
      ['Konektivitas API Departemen', `${syncedCount} / ${departments.length} Tersinkron`, 'Enkripsi AES-256-GCM & TLS 1.3'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
  });

  const afterKpiY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 90;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Evaluasi Performa, Suksesi & Risiko Talenta', 14, afterKpiY + 10);

  autoTable(doc, {
    startY: afterKpiY + 14,
    head: [['Nama', 'Departemen', 'Kinerja', 'Kaffah', 'Potensi Suksesi', 'Risiko', 'Kompensasi']],
    body: talents.map((t) => [
      `${t.name}\n(${t.role})`,
      t.department,
      `${t.performanceScore}`,
      `${t.kaffahScore}`,
      t.potentialTier,
      t.attritionRisk,
      `Rp ${t.monthlySalaryMillion.toFixed(1)} Jt`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      6: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const afterTalentsY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 170;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const nextSectionY = afterTalentsY > 235 ? 20 : afterTalentsY + 10;
  if (afterTalentsY > 235) {
    doc.addPage();
  }
  doc.text('3. Status Sinkronisasi API Lintas Departemen', 14, nextSectionY);

  autoTable(doc, {
    startY: nextSectionY + 4,
    head: [['Departemen', 'Endpoint API', 'Entri Tersinkron', 'Latensi', 'Status']],
    body: departments.map((d) => [
      d.name,
      d.endpoint,
      d.recordsSynced.toLocaleString('id-ID'),
      `${d.latencyMs} ms`,
      d.status,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  addPageFooters(doc);
  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan-Performa-SDM-KaffahHR-${fileDate}.pdf`);
}

export function downloadTrainingRoiPDF(params: {
  trainings: TrainingProgram[];
  simulation?: RoiSimulationReportInput;
}) {
  const { trainings, simulation } = params;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addReportHeader(
    doc,
    'Laporan Investasi Diklat & Analisis ROI Pelatihan SDM',
    'Dokumen Evaluasi Investasi L&D'
  );

  const totalInvestment = trainings.reduce((s, t) => s + t.investmentMillion, 0);
  const totalParticipants = trainings.reduce((s, t) => s + t.participants, 0);
  const avgRoi =
    trainings.length > 0
      ? Math.round(trainings.reduce((s, t) => s + t.projectedRoiPercent, 0) / trainings.length)
      : 0;

  let currentY = 38;

  if (simulation) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Hasil Simulasi Kalkulator ROI Pelatihan', 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Parameter & Metrik Simulasi', 'Nilai Terukur', 'Catatan Analisis']],
      body: [
        [
          'Biaya Investasi Pelatihan',
          `Rp ${simulation.investmentMillion.toLocaleString('id-ID')} Juta`,
          simulation.inputMode === 'per_participant'
            ? `Skala ${simulation.participants} peserta`
            : 'Anggaran total unit pelatihan',
        ],
        [
          'Estimasi Peningkatan Produktivitas Bulanan',
          `Rp ${simulation.effectiveMonthlyGain.toFixed(2)} Juta / bln`,
          simulation.inputMode === 'per_participant'
            ? `Rp ${simulation.gainPerParticipantMillion.toFixed(2)} Jt per peserta/bln`
            : 'Dampak efisiensi & output tim bulanan',
        ],
        [
          `Proyeksi ROI (${simulation.horizonMonths} Bulan)`,
          `${simulation.roiPercent.toFixed(1)}%`,
          simulation.statusLabel,
        ],
        [
          'Manfaat Bersih (Net Benefit)',
          `${simulation.netBenefit >= 0 ? '+' : '-'}Rp ${Math.abs(simulation.netBenefit).toFixed(1)} Juta`,
          `Total manfaat bruto: Rp ${simulation.totalGrossBenefit.toFixed(1)} Juta`,
        ],
        [
          'Titik Impas (Payback Period)',
          Number.isFinite(simulation.paybackMonths)
            ? `${simulation.paybackMonths.toFixed(1)} Bulan`
            : 'Belum Tercapai',
          `Rasio Manfaat/Biaya: ${simulation.benefitCostRatio.toFixed(2)}x`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [4, 120, 87], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });

    const afterSimY =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. Proyeksi Arus Nilai Kumulatif Bulanan', 14, afterSimY + 10);

    autoTable(doc, {
      startY: afterSimY + 14,
      head: [['Bulan Ke-', 'Akumulasi Produktivitas', 'Saldo Bersih vs. Investasi', 'Status Impas']],
      body: simulation.timeline.map((row) => [
        `Bulan ${row.month}`,
        `Rp ${row.cumulativeGain.toFixed(1)} Juta`,
        `${row.cumulativeNet >= 0 ? '+' : '-'}Rp ${Math.abs(row.cumulativeNet).toFixed(1)} Juta`,
        row.isBreakEven ? 'Surplus (Sudah Impas)' : 'Menuju Impas',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    const afterTimelineY =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 190;
    if (afterTimelineY > 210) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = afterTimelineY + 10;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    simulation
      ? '3. Portofolio Program Pendidikan & Pelatihan Aktif'
      : '1. Portofolio Program Pendidikan & Pelatihan SDM',
    14,
    currentY
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Investasi: Rp ${totalInvestment.toLocaleString('id-ID')} Juta  ·  Total Peserta: ${totalParticipants} Orang  ·  Rata-rata Proyeksi ROI: ${avgRoi}%`,
    14,
    currentY + 5
  );
  doc.setTextColor(15, 23, 42);

  autoTable(doc, {
    startY: currentY + 9,
    head: [['Program & Target Dampak', 'Kategori', 'Peserta', 'Investasi', 'Proyeksi ROI', 'Pre -> Post']],
    body: trainings.map((tr) => [
      `${tr.title}\n${tr.targetOutcome}`,
      tr.category,
      `${tr.participants}`,
      `Rp ${tr.investmentMillion} Jt`,
      `${tr.projectedRoiPercent}%`,
      `${tr.preTestAvg} -> ${tr.postTestAvg}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  addPageFooters(doc);
  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan-ROI-Pelatihan-KaffahHR-${fileDate}.pdf`);
}
