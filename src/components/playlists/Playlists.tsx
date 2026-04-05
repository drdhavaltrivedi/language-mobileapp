import { useState } from 'react';
import { Plus, ListMusic, Play, Trash2, MoreHorizontal } from 'lucide-react';
import { Playlist, LANGUAGES } from '../../lib/types';
import CreatePlaylistModal from './CreatePlaylistModal';

interface PlaylistsProps {
  playlists: Playlist[];
  onCreatePlaylist: (data: { name: string; description: string; language: string; cover_color: string }) => Promise<void>;
  onDeletePlaylist: (id: string) => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  onStartPlaylist: (playlist: Playlist) => void;
}

export default function Playlists({
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onOpenPlaylist,
  onStartPlaylist,
}: PlaylistsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  function getLanguageName(code: string) {
    return LANGUAGES.find((l) => l.code === code)?.name ?? code;
  }

  function getLanguageFlag(code: string) {
    return LANGUAGES.find((l) => l.code === code)?.flag ?? '';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Playlists</h1>
          <p className="text-slate-500 mt-0.5">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <ListMusic className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No playlists yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mb-6">
            Create a playlist to organize words and phrases you want to practice together.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer"
              onClick={() => onOpenPlaylist(pl)}
            >
              <div
                className="h-20 flex items-center justify-center"
                style={{ backgroundColor: pl.cover_color + '18' }}
              >
                <ListMusic className="w-8 h-8" style={{ color: pl.cover_color }} />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{pl.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {getLanguageFlag(pl.language)} {getLanguageName(pl.language)} · {pl.item_count ?? 0} items
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuId(menuId === pl.id ? null : pl.id); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === pl.id && (
                      <div className="absolute right-0 top-8 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartPlaylist(pl); setMenuId(null); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Play className="w-3.5 h-3.5" /> Practice
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this playlist?')) { onDeletePlaylist(pl.id); } setMenuId(null); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {pl.description && (
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{pl.description}</p>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onStartPlaylist(pl); }}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Practice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          onCreate={onCreatePlaylist}
        />
      )}
    </div>
  );
}
