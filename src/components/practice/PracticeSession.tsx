import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, ChevronRight, RotateCcw } from 'lucide-react';
import { LanguageItem, Rating, PlaylistItem, Playlist } from '../../lib/types';
import SessionComplete from './SessionComplete';

interface PracticeSessionProps {
  playlist: Playlist | null;
  playlistItems: PlaylistItem[];
  onClose: () => void;
  onComplete: (totalItems: number, correctItems: number, durationSeconds: number, ratings: { itemId: string; rating: Rating }[]) => void;
}

const RATING_CONFIG: { key: Rating; label: string; color: string; bg: string; description: string }[] = [
  { key: 'again', label: 'Again', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 border-red-200', description: 'Missed it' },
  { key: 'hard', label: 'Hard', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200', description: 'Difficult' },
  { key: 'good', label: 'Good', color: 'text-sky-600', bg: 'bg-sky-50 hover:bg-sky-100 border-sky-200', description: 'Got it' },
  { key: 'easy', label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', description: 'Perfect' },
];

export default function PracticeSession({ playlist, playlistItems, onClose, onComplete }: PracticeSessionProps) {
  const items: LanguageItem[] = playlistItems.map((pi) => pi.language_items!).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState<{ itemId: string; rating: Rating }[]>([]);
  const [done, setDone] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const startTime = useRef(Date.now());

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex) / items.length) * 100 : 0;

  const speak = useCallback((text: string, lang?: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    const utt = new SpeechSynthesisUtterance(text);
    if (lang) utt.lang = lang;
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [ttsEnabled]);

  useEffect(() => {
    if (currentItem && !revealed) {
      setTimeout(() => speak(currentItem.content, playlist?.language), 300);
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  function handleReveal() {
    setRevealed(true);
  }

  function handleRate(rating: Rating) {
    if (!currentItem) return;
    const newRatings = [...ratings, { itemId: currentItem.id, rating }];
    setRatings(newRatings);

    if (currentIndex + 1 >= items.length) {
      window.speechSynthesis?.cancel();
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const correct = newRatings.filter((r) => r.rating === 'good' || r.rating === 'easy').length;
      setDone(true);
      onComplete(items.length, correct, duration, newRatings);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  function handleReplay() {
    if (currentItem) speak(currentItem.content, playlist?.language);
  }

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <p className="text-slate-500 text-lg mb-6">No items to practice.</p>
        <button onClick={onClose} className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors">
          Back
        </button>
      </div>
    );
  }

  if (done) {
    const correct = ratings.filter((r) => r.rating === 'good' || r.rating === 'easy').length;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    return (
      <SessionComplete
        totalItems={items.length}
        correctItems={correct}
        durationSeconds={duration}
        playlistName={playlist?.name ?? 'Session'}
        onClose={onClose}
        onRetry={() => {
          setCurrentIndex(0);
          setRevealed(false);
          setRatings([]);
          setDone(false);
          startTime.current = Date.now();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => { window.speechSynthesis?.cancel(); onClose(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">{playlist?.name ?? 'Practice Session'}</p>
            <p className="text-xs text-slate-400">{currentIndex + 1} of {items.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-lg transition-colors ${ttsEnabled ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 max-w-2xl mx-auto w-full">
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-10 mb-8 text-center shadow-sm">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shadow this</span>
          </div>

          <div className="mb-2">
            <p className="text-3xl font-bold text-slate-900 leading-snug">{currentItem.content}</p>
          </div>

          {currentItem.pronunciation && (
            <p className="text-sm text-slate-400 mb-4 font-mono">{currentItem.pronunciation}</p>
          )}

          <button
            onClick={handleReplay}
            className={`mx-auto flex items-center gap-1.5 mt-5 px-4 py-2 text-xs font-medium rounded-xl border transition-colors ${speaking ? 'text-sky-600 bg-sky-50 border-sky-200' : 'text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {speaking ? 'Speaking...' : 'Replay'}
          </button>

          {revealed ? (
            <div className="mt-8 pt-8 border-t border-slate-100">
              {currentItem.translation && (
                <p className="text-lg text-slate-600 mb-2">{currentItem.translation}</p>
              )}
              {currentItem.notes && (
                <p className="text-sm text-slate-400 mt-3 italic">{currentItem.notes}</p>
              )}
            </div>
          ) : (
            <button
              onClick={handleReveal}
              className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Reveal <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {revealed && (
          <div>
            <p className="text-center text-xs text-slate-400 mb-4 font-medium uppercase tracking-wide">How did you do?</p>
            <div className="grid grid-cols-4 gap-3">
              {RATING_CONFIG.map(({ key, label, color, bg, description }) => (
                <button
                  key={key}
                  onClick={() => handleRate(key)}
                  className={`flex flex-col items-center py-3 px-4 border rounded-2xl transition-colors ${bg}`}
                >
                  <span className={`text-sm font-bold ${color}`}>{label}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
