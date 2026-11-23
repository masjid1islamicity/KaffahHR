import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  onFinalTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({
  lang = 'id-ID',
  onFinalTranscript,
}: UseSpeechRecognitionOptions) {
  const [isSupported] = useState<boolean>(() => getSpeechRecognitionConstructor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onFinalTranscript);

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors when already inactive
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRec = getSpeechRecognitionConstructor();
    if (!SpeechRec) {
      setError('Peramban ini belum mendukung Web Speech API. Gunakan Chrome atau Edge terbaru.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    setError(null);
    setInterimTranscript('');

    const recognition = new SpeechRec();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += transcriptText;
        } else {
          interimChunk += transcriptText;
        }
      }

      if (finalChunk.trim()) {
        callbackRef.current(finalChunk.trim());
      }
      setInterimTranscript(interimChunk.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'aborted') return;
      const errorMessages: Record<string, string> = {
        'not-allowed':
          'Izin mikrofon ditolak. Aktifkan akses mikrofon pada peramban untuk menggunakan dikte suara.',
        'service-not-allowed':
          'Layanan pengenalan suara tidak diizinkan oleh peramban saat ini.',
        'no-speech':
          'Tidak ada suara terdeteksi. Pastikan mikrofon aktif dan berbicara dengan jelas.',
        'audio-capture':
          'Mikrofon tidak ditemukan pada perangkat Anda.',
        network:
          'Koneksi jaringan dibutuhkan oleh layanan pengenalan suara peramban.',
      };
      setError(errorMessages[event.error] ?? `Gagal memproses suara (${event.error}).`);
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError('Gagal memulai perekaman suara. Silakan coba lagi.');
      setIsListening(false);
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError: () => setError(null),
  };
}
