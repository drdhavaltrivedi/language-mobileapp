import { CheckCircle, RotateCcw, Home, Clock, Target } from 'lucide-react';

interface SessionCompleteProps {
  totalItems: number;
  correctItems: number;
  durationSeconds: number;
  playlistName: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function SessionComplete({
  totalItems,
  correctItems,
  durationSeconds,
  playlistName,
  onClose,
  onRetry,
}: SessionCompleteProps) {
  const accuracy = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  function getMessage() {
    if (accuracy >= 90) return 'Outstanding work!';
    if (accuracy >= 70) return 'Great session!';
    if (accuracy >= 50) return 'Good effort!';
    return 'Keep practicing!';
  }

  function getAccuracyColor() {
    if (accuracy >= 90) return 'text-emerald-600';
    if (accuracy >= 70) return 'text-sky-600';
    if (accuracy >= 50) return 'text-amber-600';
    return 'text-red-600';
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">{getMessage()}</h1>
        <p className="text-slate-500 text-sm mb-10">{playlistName}</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-bold mb-1 ${getAccuracyColor()}`}>{accuracy}%</p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" /> Accuracy
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-900 mb-1">{totalItems}</p>
            <p className="text-xs text-slate-400">Items</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {minutes > 0 ? `${minutes}m` : `${seconds}s`}
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Time
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
