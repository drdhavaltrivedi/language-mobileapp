import { useMemo } from 'react';
import { Flame, ListMusic, BookOpen, TrendingUp, Play, Clock, ChevronRight } from 'lucide-react';
import { Playlist, PracticeSession } from '../../lib/types';

interface DashboardProps {
  playlists: Playlist[];
  sessions: PracticeSession[];
  totalItems: number;
  onNavigate: (page: 'playlists' | 'library' | 'practice' | 'discovery') => void;
  onStartPlaylist: (playlist: Playlist) => void;
}

export default function Dashboard({ playlists, sessions, totalItems, onNavigate, onStartPlaylist }: DashboardProps) {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.started_at).toDateString() === today);
    const streak = calcStreak(sessions);
    const totalPracticed = sessions.reduce((sum, s) => sum + s.total_items, 0);
    const accuracy = sessions.length
      ? Math.round((sessions.reduce((sum, s) => sum + s.correct_items, 0) / Math.max(totalPracticed, 1)) * 100)
      : 0;

    return {
      todayMinutes: todaySessions.reduce((sum, s) => sum + Math.round(s.duration_seconds / 60), 0),
      streak,
      totalItems,
      accuracy,
    };
  }, [sessions, totalItems]);

  const recentSessions = sessions.slice(0, 5);
  const featuredPlaylists = playlists.slice(0, 4);

  function formatDuration(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m`;
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good {greeting()}</h1>
        <p className="text-slate-500 mt-0.5">Ready to practice? Your next session awaits.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} value={`${stats.streak}d`} label="Streak" bg="bg-orange-50" />
        <StatCard icon={<Clock className="w-5 h-5 text-sky-500" />} value={`${stats.todayMinutes}m`} label="Today" bg="bg-sky-50" />
        <StatCard icon={<BookOpen className="w-5 h-5 text-emerald-500" />} value={stats.totalItems.toString()} label="Items" bg="bg-emerald-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-amber-500" />} value={`${stats.accuracy}%`} label="Accuracy" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Your Playlists</h2>
              <button onClick={() => onNavigate('playlists')} className="text-sm text-sky-600 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {featuredPlaylists.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <ListMusic className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No playlists yet. Create one to get started.</p>
                <button
                  onClick={() => onNavigate('playlists')}
                  className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Create playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {featuredPlaylists.map((pl) => (
                  <div key={pl.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: pl.cover_color + '20', color: pl.cover_color }}
                      >
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <button
                        onClick={() => onStartPlaylist(pl)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-900 rounded-lg"
                      >
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mb-0.5 truncate">{pl.name}</p>
                    <p className="text-slate-400 text-xs">{pl.item_count ?? 0} items</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {recentSessions.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Sessions</h2>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.playlist_name ?? 'Quick Session'}</p>
                        <p className="text-xs text-slate-400">{timeAgo(s.started_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {s.total_items > 0 ? `${Math.round((s.correct_items / s.total_items) * 100)}%` : '—'}
                      </p>
                      <p className="text-xs text-slate-400">{s.total_items} items · {formatDuration(s.duration_seconds)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <Play className="w-6 h-6 text-sky-400 fill-sky-400 mb-4" />
            <h3 className="font-semibold mb-1">Quick Session</h3>
            <p className="text-slate-400 text-sm mb-4">Jump into a 5-minute review of your due items.</p>
            <button
              onClick={() => onNavigate('practice')}
              className="w-full py-2 bg-sky-500 hover:bg-sky-600 transition-colors text-sm font-semibold rounded-xl"
            >
              Start now
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <Compass className="w-5 h-5 text-slate-400 mb-3" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Discover new items</h3>
            <p className="text-slate-400 text-xs mb-3">Expand your vocabulary with curated suggestions.</p>
            <button
              onClick={() => onNavigate('discovery')}
              className="text-sky-600 text-sm font-medium hover:underline"
            >
              Explore →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, bg }: { icon: React.ReactNode; value: string; label: string; bg: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
    </div>
  );
}

function Compass({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function calcStreak(sessions: PracticeSession[]) {
  if (sessions.length === 0) return 0;
  const days = [...new Set(sessions.map(s => new Date(s.started_at).toDateString()))];
  days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) {
      streak++;
      current = d;
    } else break;
  }
  return streak;
}
