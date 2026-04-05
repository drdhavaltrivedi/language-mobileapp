import { LayoutDashboard, ListMusic, Library, Compass, Play } from 'lucide-react';
import { Page } from '../../lib/types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'playlists', label: 'Lists', icon: ListMusic },
  { id: 'practice', label: 'Play', icon: Play },
  { id: 'library', label: 'Lib', icon: Library },
  { id: 'discovery', label: 'Disc', icon: Compass },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const activePage = currentPage === 'playlist-detail' ? 'playlists' : currentPage === 'practice' ? 'playlists' : currentPage;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-50">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
            activePage === id
              ? 'text-sky-600'
              : 'text-slate-500'
          }`}
        >
          <Icon className={`w-5 h-5 ${activePage === id ? 'fill-sky-50' : ''}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </nav>
  );
}
