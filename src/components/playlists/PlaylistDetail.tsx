import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Plus, Trash2, BookOpen, Volume2 } from 'lucide-react';
import { Playlist, PlaylistItem, LanguageItem, LANGUAGES, DIFFICULTY_LABELS } from '../../lib/types';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onStartPractice: () => void;
  fetchPlaylistItems: (id: string) => Promise<PlaylistItem[]>;
  removeItemFromPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  userItems: LanguageItem[];
  addItemToPlaylist: (playlistId: string, itemId: string, position: number) => Promise<unknown>;
}

export default function PlaylistDetail({
  playlist,
  onBack,
  onStartPractice,
  fetchPlaylistItems,
  removeItemFromPlaylist,
  userItems,
  addItemToPlaylist,
}: PlaylistDetailProps) {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadItems();
  }, [playlist.id]);

  async function loadItems() {
    setLoading(true);
    const data = await fetchPlaylistItems(playlist.id);
    setItems(data);
    setLoading(false);
  }

  async function handleRemove(itemId: string) {
    await removeItemFromPlaylist(playlist.id, itemId);
    await loadItems();
  }

  async function handleAdd(item: LanguageItem) {
    await addItemToPlaylist(playlist.id, item.id, items.length);
    await loadItems();
    setSearch('');
  }

  const itemIds = new Set(items.map((pi) => pi.item_id));
  const filteredUserItems = userItems.filter(
    (i) => !itemIds.has(i.id) && (i.content.toLowerCase().includes(search.toLowerCase()) || (i.translation ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const lang = LANGUAGES.find((l) => l.code === playlist.language);

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = playlist.language;
      window.speechSynthesis.speak(utt);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Playlists
      </button>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: playlist.cover_color + '20', color: playlist.cover_color }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{playlist.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {lang?.flag} {lang?.name} · {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
            {playlist.description && <p className="text-slate-400 text-xs mt-1">{playlist.description}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Items
          </button>
          <button
            onClick={onStartPractice}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Play className="w-4 h-4 fill-white" /> Practice
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your library..."
              className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredUserItems.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-sm">
                {userItems.length === 0 ? 'Add items to your library first.' : 'No matching items found.'}
              </p>
            ) : (
              filteredUserItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.content}</p>
                    {item.translation && <p className="text-xs text-slate-400">{item.translation}</p>}
                  </div>
                  <button
                    onClick={() => handleAdd(item)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-600 text-xs font-medium rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">This playlist is empty. Add some items to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((pi, idx) => {
            const item = pi.language_items;
            if (!item) return null;
            return (
              <div key={pi.id} className="flex items-center gap-4 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group">
                <span className="text-xs font-mono text-slate-300 w-5 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{item.content}</p>
                  {item.translation && <p className="text-xs text-slate-400 mt-0.5">{item.translation}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => speak(item.content)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {item.difficulty && (
                  <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                    {DIFFICULTY_LABELS[item.difficulty]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
