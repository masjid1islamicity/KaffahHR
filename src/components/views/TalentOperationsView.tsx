import { CheckCircle2, Mic, MicOff, Search, Trash2, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import type { TalentMember } from '../../types';
import { AIPanel } from '../AIPanel';
import { AvatarWithFallback } from '../AvatarWithFallback';

interface TalentOperationsViewProps {
  talents: TalentMember[];
  onAddTalent: (talent: Omit<TalentMember, 'id'>) => void;
  onUpdateTalentScore: (
    id: string,
    performanceScore: number,
    kaffahScore: number,
    monthlySalaryMillion: number,
    workEthicNotes?: string
  ) => void;
  onCompleteEvaluation?: (id: string) => void;
  focusedTalentId?: string | null;
  isOnline: boolean;
}

export const TalentOperationsView: React.FC<TalentOperationsViewProps> = ({
  talents,
  onAddTalent,
  onUpdateTalentScore,
  onCompleteEvaluation,
  focusedTalentId,
  isOnline,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Semua');
  const [tierFilter, setTierFilter] = useState('Semua');
  const [selectedId, setSelectedId] = useState<string>(focusedTalentId || talents[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (focusedTalentId) {
      setSelectedId(focusedTalentId);
    }
  }, [focusedTalentId]);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Operasional & Produksi');
  const [newSalary, setNewSalary] = useState(20);
  const [newStatus, setNewStatus] = useState<TalentMember['status']>('Onboarding');
  const [newNotes, setNewNotes] = useState('');
  const [speechLang, setSpeechLang] = useState<'id-ID' | 'en-US'>('id-ID');
  const [voiceTarget, setVoiceTarget] = useState<'modal' | 'detail'>('modal');

  const departments = useMemo(() => {
    const unique = Array.from(new Set(talents.map((t) => t.department)));
    return ['Semua', ...unique];
  }, [talents]);

  const filtered = useMemo(() => {
    return talents.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'Semua' || t.department === deptFilter;
      const matchTier = tierFilter === 'Semua' || t.potentialTier === tierFilter;
      return matchSearch && matchDept && matchTier;
    });
  }, [talents, search, deptFilter, tierFilter]);

  const selectedTalent = talents.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const handleFinalTranscript = useCallback(
    (transcript: string) => {
      if (voiceTarget === 'modal') {
        setNewNotes((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
      } else if (selectedTalent) {
        const updatedNotes = selectedTalent.workEthicNotes.trim()
          ? `${selectedTalent.workEthicNotes.trim()} ${transcript}`
          : transcript;
        onUpdateTalentScore(
          selectedTalent.id,
          selectedTalent.performanceScore,
          selectedTalent.kaffahScore,
          selectedTalent.monthlySalaryMillion,
          updatedNotes
        );
      }
    },
    [voiceTarget, selectedTalent, onUpdateTalentScore]
  );

  const {
    isSupported: speechSupported,
    isListening,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    lang: speechLang,
    onFinalTranscript: handleFinalTranscript,
  });

  const toggleVoiceFor = (target: 'modal' | 'detail') => {
    if (isListening) {
      stopListening();
      if (voiceTarget !== target) {
        setVoiceTarget(target);
        setTimeout(() => startListening(), 80);
      }
      return;
    }
    setVoiceTarget(target);
    clearSpeechError();
    startListening();
  };

  const closeAddModal = () => {
    if (isListening && voiceTarget === 'modal') {
      stopListening();
    }
    clearSpeechError();
    setShowAddModal(false);
  };

  const successionReadyCount = talents.filter((t) => t.potentialTier === 'Siap Suksesi').length;
  const totalMonthlyPayroll = talents.reduce((s, t) => s + t.monthlySalaryMillion, 0);

  const handleCreateTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;
    if (isListening) {
      stopListening();
    }
    onAddTalent({
      name: newName.trim(),
      role: newRole.trim(),
      department: newDept,
      performanceScore: 84,
      kaffahScore: 90,
      potentialTier: 'Talenta Inti',
      attritionRisk: 'Rendah',
      compensationIndex: 100,
      monthlySalaryMillion: Number(newSalary) || 18,
      trainingHours: 12,
      status: newStatus,
      workEthicNotes:
        newNotes.trim() ||
        'Kandidat baru dalam proses seleksi & orientasi budaya kerja Kaffah.',
    });
    setNewName('');
    setNewRole('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Kesiapan Suksesi Kepemimpinan
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {successionReadyCount} / {talents.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Talenta dengan skor kinerja & amanah &ge; 88
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Kompensasi Bulanan Terukur
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            Rp {totalMonthlyPayroll.toFixed(1)} Jt
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tersinkron otomatis dengan ERP Keuangan
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rekrutmen & Seleksi Talenta
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {talents.filter((t) => t.status === 'Onboarding').length} Talenta Onboarding
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Talenta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau jabatan talenta..."
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === 'Semua' ? 'Semua Departemen' : d}
                  </option>
                ))}
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="Semua">Semua Tingkat Potensi</option>
                <option value="Siap Suksesi">Siap Suksesi</option>
                <option value="Talenta Inti">Talenta Inti</option>
                <option value="Perlu Akselerasi">Perlu Akselerasi</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tidak ada talenta yang sesuai dengan filter pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDeptFilter('Semua');
                  setTierFilter('Semua');
                }}
                className="mt-3 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Reset semua filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2.5 pr-4">Nama & Jabatan</th>
                    <th className="py-2.5 pr-4">Departemen</th>
                    <th className="py-2.5 pr-4 text-right">Kinerja</th>
                    <th className="py-2.5 pr-4 text-right">Kaffah</th>
                    <th className="py-2.5 pr-4">Potensi</th>
                    <th className="py-2.5 text-right">Kompensasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {filtered.map((t) => {
                    const isSelected = selectedTalent?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`h-12 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2.5">
                            <AvatarWithFallback src={t.avatarUrl} name={t.name} sizeClass="h-8 w-8" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                {t.name}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {t.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-400">
                          {t.department}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                          {t.performanceScore}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-400">
                          {t.kaffahScore}
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-700 dark:text-slate-300">
                          {t.potentialTier}
                        </td>
                        <td className="py-2 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                          Rp {t.monthlySalaryMillion.toFixed(1)} Jt
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-4 dark:border-slate-800 dark:bg-slate-900">
          {selectedTalent ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <AvatarWithFallback
                  src={selectedTalent.avatarUrl}
                  name={selectedTalent.name}
                  sizeClass="h-12 w-12"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                    {selectedTalent.name}
                  </h3>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {selectedTalent.role} · {selectedTalent.status}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="detail-ethic-notes"
                    className="text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    Catatan Evaluasi & Etos Kerja
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceFor('detail')}
                    disabled={!speechSupported}
                    title={
                      speechSupported
                        ? 'Tambahkan catatan evaluasi menggunakan perintah suara'
                        : 'Web Speech API tidak tersedia di peramban ini'
                    }
                    className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                      isListening && voiceTarget === 'detail'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isListening && voiceTarget === 'detail' ? (
                      <>
                        <MicOff className="h-3 w-3" />
                        Hentikan Dikte
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                        Dikte Feedback
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  id="detail-ethic-notes"
                  rows={3}
                  value={selectedTalent.workEthicNotes}
                  onChange={(e) =>
                    onUpdateTalentScore(
                      selectedTalent.id,
                      selectedTalent.performanceScore,
                      selectedTalent.kaffahScore,
                      selectedTalent.monthlySalaryMillion,
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />

                {isListening && voiceTarget === 'detail' && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Mendengarkan ({speechLang === 'id-ID' ? 'Bahasa Indonesia' : 'English'}):{' '}
                    <span className="italic">
                      {interimTranscript || 'Silakan ucapkan catatan evaluasi...'}
                    </span>
                  </p>
                )}

                {voiceTarget === 'detail' && speechError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{speechError}</p>
                )}

                {selectedTalent.evaluationPending && onCompleteEvaluation && (
                  <button
                    type="button"
                    onClick={() => onCompleteEvaluation(selectedTalent.id)}
                    className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tandai Tindak Lanjut Evaluasi Selesai
                  </button>
                )}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Penilaian Kinerja ({selectedTalent.performanceScore}/100)
                  </label>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={selectedTalent.performanceScore}
                  onChange={(e) =>
                    onUpdateTalentScore(
                      selectedTalent.id,
                      Number(e.target.value),
                      selectedTalent.kaffahScore,
                      selectedTalent.monthlySalaryMillion
                    )
                  }
                  className="w-full accent-emerald-700"
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Indeks Islamicity Kaffah ({selectedTalent.kaffahScore}/100)
                  </label>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={selectedTalent.kaffahScore}
                  onChange={(e) =>
                    onUpdateTalentScore(
                      selectedTalent.id,
                      selectedTalent.performanceScore,
                      Number(e.target.value),
                      selectedTalent.monthlySalaryMillion
                    )
                  }
                  className="w-full accent-emerald-700"
                />

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Kompensasi Merit (Rp Jt/bln)
                  </span>
                  <input
                    type="number"
                    step={0.5}
                    min={5}
                    value={selectedTalent.monthlySalaryMillion}
                    onChange={(e) =>
                      onUpdateTalentScore(
                        selectedTalent.id,
                        selectedTalent.performanceScore,
                        selectedTalent.kaffahScore,
                        Number(e.target.value)
                      )
                    }
                    className="w-24 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-right font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-xs dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Risiko Attrition</span>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {selectedTalent.attritionRisk}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Jam Diklat Tahunan</span>
                  <p className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                    {selectedTalent.trainingHours} Jam
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Pilih talenta dari tabel untuk melihat detail evaluasi.</p>
          )}
        </div>
      </div>

      {selectedTalent && (
        <AIPanel
          mode="talent_coach"
          title={`Rencana Coaching & Kompensasi AI: ${selectedTalent.name}`}
          subtitle="Analisis jalur suksesi, motivasi psikologis-struktural, dan penyesuaian kompensasi berbasis merit."
          defaultPrompt={`Buat rencana pengembangan kompetensi 90 hari dan strategi retensi untuk ${selectedTalent.name} (${selectedTalent.role}).`}
          isOnline={isOnline}
          contextData={{ talent: selectedTalent }}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Rekrutmen / Tambah Talenta Baru
              </h3>
              <button
                type="button"
                onClick={closeAddModal}
                aria-label="Tutup formulir talenta baru"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTalent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Tariq Al-Faruq"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Jabatan / Peran
                </label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Contoh: Analis Bisnis & Tata Kelola"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Departemen
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Operasional & Produksi">Operasional & Produksi</option>
                    <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                    <option value="IT & Keamanan Siber">IT & Keamanan Siber</option>
                    <option value="Pemasaran & Wawasan Pasar">Pemasaran & Wawasan Pasar</option>
                    <option value="Keuangan & Kompensasi">Keuangan & Kompensasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Status Awal
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TalentMember['status'])}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti Belajar">Cuti Belajar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Kompensasi Awal (Rp Juta / bulan)
                </label>
                <input
                  type="number"
                  min={5}
                  step={0.5}
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="modal-qualitative-notes"
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Catatan Evaluasi & Feedback Kualitatif
                  </label>

                  <div className="flex items-center gap-1.5">
                    <select
                      aria-label="Bahasa Dikte Suara"
                      value={speechLang}
                      onChange={(e) => setSpeechLang(e.target.value as 'id-ID' | 'en-US')}
                      disabled={isListening}
                      className="min-h-[34px] rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <option value="id-ID">ID</option>
                      <option value="en-US">EN</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleVoiceFor('modal')}
                      disabled={!speechSupported}
                      className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                        isListening && voiceTarget === 'modal'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isListening && voiceTarget === 'modal' ? (
                        <>
                          <MicOff className="h-3.5 w-3.5" />
                          Hentikan Rekam
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                          Dikte Suara
                        </>
                      )}
                    </button>

                    {newNotes.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNewNotes('')}
                        aria-label="Hapus catatan"
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="modal-qualitative-notes"
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ketik atau klik Dikte Suara untuk merekam catatan wawancara, etos kerja, serta kesesuaian budaya Islamicity Kaffah..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                {!speechSupported && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Peramban Anda tidak mendukung Web Speech API. Anda tetap dapat mengetik catatan evaluasi secara manual.
                  </p>
                )}

                {isListening && voiceTarget === 'modal' && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <span className="font-semibold">Merekam suara: </span>
                    <span className="italic">
                      {interimTranscript || 'Ucapkan evaluasi kandidat dengan jelas...'}
                    </span>
                  </div>
                )}

                {voiceTarget === 'modal' && speechError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{speechError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Simpan Talenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
