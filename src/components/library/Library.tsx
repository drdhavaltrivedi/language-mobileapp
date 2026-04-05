import { useState, useMemo } from 'react';
import { Plus, Search, Volume2, CreditCard as Edit2, Trash2, BookOpen, Filter } from 'lucide-react';
import { LanguageItem, LANGUAGES, DIFFICULTY_LABELS } from '../../lib/types';
import AddItemModal from './AddItemModal';

interface LibraryProps {
  items: LanguageItem[];
  loading: boolean;
  onCreateItem: (item: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<LanguageItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export default function Library({ items, loading, onCreateItem, onUpdateItem, onDeleteItem }: LibraryProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<LanguageItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [filterDiff, setFilterDiff] = useState('all');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = !search ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        (item.translation ?? '').toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchLang = filterLang === 'all' || item.language === filterLang;
      const matchDiff = filterDiff === 'all' || item.difficulty === Number(filterDiff);
      return matchSearch && matchLang && matchDiff;
    });
  }, [items, search, filterLang, filterDiff]);

  const usedLanguages = useMemo(() => {
    const langs = new Set(items.map((i) => i.language));
    return LANGUAGES.filter((l) => langs.has(l.code));
  }, [items]);

  function speak(item: LanguageItem) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(item.content);
      utt.lang = item.language;
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  async function handleSaveNew(data: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    await onCreateItem(data);
  }

  async function handleSaveEdit(data: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!editItem) return;
    await onUpdateItem(editItem.id, data);
  }

  function getDiffColor(d: number) {
    const colors: Record<number, string> = {
      1: 'bg-emerald-50 text-emerald-700',
      2: 'bg-sky-50 text-sky-700',
      3: 'bg-amber-50 text-amber-700',
      4: 'bg-orange-50 text-orange-700',
      5: 'bg-red-50 text-red-700',
    };
    return colors[d] ?? 'bg-slate-100 text-slate-600';
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Library</h1>
          <p className="text-slate-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, translations, tags..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {usedLanguages.length > 1 && (
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="all">All languages</option>
            {usedLanguages.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
        )}

        <select
          value={filterDiff}
          onChange={(e) => setFilterDiff(e.target.value)}
          className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          <option value="all">All levels</option>
          {Object.entries(DIFFICULTY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          {items.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Start building your library</h3>
              <p className="text-slate-500 text-sm max-w-xs mb-6">Add words and phrases you want to practice. Each item can have a translation, pronunciation, and notes.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Add your first item
              </button>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No items match your search.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const lang = LANGUAGES.find((l) => l.code === item.language);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{item.content}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDiffColor(item.difficulty)}`}>
                      {DIFFICULTY_LABELS[item.difficulty]}
                    </span>
                  </div>
                  {item.translation && (
                    <p className="text-sm text-slate-500 mt-0.5">{item.translation}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {lang && (
                      <span className="text-xs text-slate-400">{lang.flag} {lang.name}</span>
                    )}
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => speak(item)}
                    className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditItem(item)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this item?')) onDeleteItem(item.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onSave={handleSaveNew}
        />
      )}

      {editItem && (
        <AddItemModal
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
          editItem={editItem}
        />
      )}
    </div>
  );
}
