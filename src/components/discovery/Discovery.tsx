import { useState, useEffect, useMemo } from 'react';
import { Compass, Plus, Volume2, ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import { LanguageItem, LANGUAGES, DIFFICULTY_LABELS } from '../../lib/types';

const DISCOVERY_ITEMS: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_public'>[] = [
  { content: 'Buenos días', translation: 'Good morning', pronunciation: '/ˈbwe.nos ˈdi.as/', notes: 'Used until noon. Formal and casual.', language: 'es', difficulty: 1, tags: ['greetings', 'daily'] },
  { content: '¿Cómo estás?', translation: 'How are you?', pronunciation: '/ˈko.mo esˈtas/', notes: 'Informal. Use ¿Cómo está usted? formally.', language: 'es', difficulty: 1, tags: ['greetings', 'social'] },
  { content: 'Me gustaría...', translation: "I would like...", pronunciation: '/me ɡus.taˈɾi.a/', notes: 'Polite way to make requests or orders.', language: 'es', difficulty: 2, tags: ['requests', 'restaurant'] },
  { content: '¿Dónde está el baño?', translation: 'Where is the bathroom?', pronunciation: '/ˈdon.de esˈta el ˈba.ɲo/', notes: 'Essential travel phrase.', language: 'es', difficulty: 2, tags: ['travel', 'essential'] },
  { content: 'Lo siento', translation: 'I am sorry', pronunciation: '/lo ˈsjen.to/', notes: 'Casual apology. More formal: Le pido disculpas.', language: 'es', difficulty: 1, tags: ['social', 'apology'] },
  { content: 'Encantado de conocerte', translation: 'Nice to meet you', pronunciation: '/en.kanˈta.ðo ðe ko.noˈθer.te/', notes: 'Encantada if you are female.', language: 'es', difficulty: 2, tags: ['greetings', 'social'] },
  { content: 'No entiendo', translation: "I don't understand", pronunciation: '/no en.ˈtjen.do/', notes: 'Essential for language learners!', language: 'es', difficulty: 1, tags: ['essential', 'communication'] },
  { content: '¿Puede repetir, por favor?', translation: 'Can you repeat, please?', pronunciation: '/ˈpwe.ðe re.pe.ˈtir por fa.ˈβor/', notes: 'Polite way to ask someone to repeat.', language: 'es', difficulty: 2, tags: ['essential', 'communication'] },
  { content: 'Bonjour', translation: 'Hello / Good day', pronunciation: '/bɔ̃.ʒuʁ/', notes: 'Standard French greeting, used morning to evening.', language: 'fr', difficulty: 1, tags: ['greetings', 'daily'] },
  { content: "C'est la vie", translation: 'That is life', pronunciation: '/sɛ la vi/', notes: 'Used to express acceptance of an unfortunate situation.', language: 'fr', difficulty: 2, tags: ['expressions', 'culture'] },
  { content: 'Je ne sais pas', translation: "I don't know", pronunciation: '/ʒə nə sɛ pa/', notes: 'Very common phrase. Often shortened to "je sais pas" informally.', language: 'fr', difficulty: 1, tags: ['essential', 'daily'] },
  { content: 'Guten Morgen', translation: 'Good morning', pronunciation: '/ˈɡuːtn̩ ˈmɔʁɡŋ̍/', notes: 'Standard German morning greeting.', language: 'de', difficulty: 1, tags: ['greetings', 'daily'] },
  { content: 'Wie geht es Ihnen?', translation: 'How are you? (formal)', pronunciation: '/viː ɡeːt ɛs ˈiːnən/', notes: 'Formal version. Informal: Wie geht es dir?', language: 'de', difficulty: 2, tags: ['greetings', 'formal'] },
  { content: 'こんにちは', translation: 'Hello (daytime)', pronunciation: '/konnichiwa/', notes: 'Used in the afternoon/daytime. おはよう for morning, こんばんは for evening.', language: 'ja', difficulty: 1, tags: ['greetings', 'daily'] },
  { content: 'ありがとうございます', translation: 'Thank you very much', pronunciation: '/arigatou gozaimasu/', notes: 'Formal way to say thank you. ありがとう is casual.', language: 'ja', difficulty: 2, tags: ['social', 'polite'] },
  { content: '안녕하세요', translation: 'Hello (formal)', pronunciation: '/annyeonghaseyo/', notes: 'Standard formal Korean greeting for all times of day.', language: 'ko', difficulty: 1, tags: ['greetings', 'essential'] },
  { content: 'Prego', translation: "You're welcome / Please / Go ahead", pronunciation: '/ˈprɛːɡo/', notes: 'Very versatile Italian word used in many contexts.', language: 'it', difficulty: 1, tags: ['social', 'essential'] },
  { content: 'Dove posso trovare...?', translation: 'Where can I find...?', pronunciation: '/ˈdoːve ˈpɔsso troˈvaːre/', notes: 'Useful travel phrase. Fill in the blank with what you need.', language: 'it', difficulty: 2, tags: ['travel', 'questions'] },
  { content: 'Obrigado / Obrigada', translation: 'Thank you (m/f)', pronunciation: '/obɾiˈɡadu/ /obɾiˈɡadɐ/', notes: 'Use Obrigado if you are male, Obrigada if female.', language: 'pt', difficulty: 1, tags: ['social', 'essential'] },
  { content: 'Tudo bem?', translation: 'Everything okay?', pronunciation: '/ˈtudu bẽj̃/', notes: 'Brazilian Portuguese casual greeting and check-in.', language: 'pt', difficulty: 1, tags: ['greetings', 'casual'] },
  { content: 'Привет', translation: 'Hi (informal)', pronunciation: '/priˈvʲet/', notes: 'Casual Russian greeting between friends.', language: 'ru', difficulty: 1, tags: ['greetings', 'casual'] },
  { content: 'Как дела?', translation: 'How are you?', pronunciation: '/kak dʲɪˈla/', notes: 'Common question. Reply: Хорошо (fine) or Нормально (okay).', language: 'ru', difficulty: 1, tags: ['greetings', 'social'] },
  { content: 'مرحبا', translation: 'Hello', pronunciation: '/marħaba/', notes: 'Standard Arabic greeting used across dialects.', language: 'ar', difficulty: 1, tags: ['greetings', 'essential'] },
  { content: 'شكراً', translation: 'Thank you', pronunciation: '/ʃukran/', notes: 'Universal Arabic thank you across all dialects.', language: 'ar', difficulty: 1, tags: ['social', 'essential'] },
];

interface DiscoveryProps {
  userItems: LanguageItem[];
  onAddToLibrary: (item: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export default function Discovery({ userItems, onAddToLibrary }: DiscoveryProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [filterLang, setFilterLang] = useState('all');
  const [filterDiff, setFilterDiff] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const userContents = useMemo(() => new Set(userItems.map((i) => i.content.toLowerCase())), [userItems]);

  const available = useMemo(() => {
    return DISCOVERY_ITEMS.filter((item) => {
      const alreadyOwned = userContents.has(item.content.toLowerCase());
      const matchLang = filterLang === 'all' || item.language === filterLang;
      const matchDiff = filterDiff === 'all' || item.difficulty === Number(filterDiff);
      return !alreadyOwned && matchLang && matchDiff;
    });
  }, [userContents, filterLang, filterDiff]);

  const recommended = useMemo(() => {
    const userLangs = new Set(userItems.map((i) => i.language));
    if (userLangs.size === 0) return available.slice(0, 12);
    const sameLanguage = available.filter((i) => userLangs.has(i.language));
    const otherLanguage = available.filter((i) => !userLangs.has(i.language));
    return [...sameLanguage, ...otherLanguage].slice(0, 12);
  }, [available, userItems]);

  function speak(item: typeof DISCOVERY_ITEMS[0]) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(item.content);
      utt.lang = item.language;
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  async function handleAdd(item: typeof DISCOVERY_ITEMS[0]) {
    const key = item.content;
    setAdding(key);
    await onAddToLibrary({ ...item, is_public: false });
    setAddedIds((prev) => new Set([...prev, key]));
    setAdding(null);
  }

  function getDiffColor(d: number) {
    const colors: Record<number, string> = {
      1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      2: 'bg-sky-50 text-sky-700 border-sky-200',
      3: 'bg-amber-50 text-amber-700 border-amber-200',
      4: 'bg-orange-50 text-orange-700 border-orange-200',
      5: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[d] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const languages = [...new Set(DISCOVERY_ITEMS.map((i) => i.language))];

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-sky-500" />
          <h1 className="text-2xl font-bold text-slate-900">Discover</h1>
        </div>
        <p className="text-slate-500">Curated phrases to expand beyond your comfort zone. Add anything to your library.</p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <TrendingUp className="w-3.5 h-3.5" />
          Filter:
        </div>
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          <option value="all">All languages</option>
          {languages.map((code) => {
            const l = LANGUAGES.find((x) => x.code === code);
            return <option key={code} value={code}>{l?.flag} {l?.name ?? code}</option>;
          })}
        </select>
        <select
          value={filterDiff}
          onChange={(e) => setFilterDiff(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          <option value="all">All levels</option>
          {Object.entries(DIFFICULTY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{recommended.length} available</span>
      </div>

      {recommended.length === 0 ? (
        <div className="text-center py-24">
          <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">You have them all!</h3>
          <p className="text-slate-500 text-sm">You have added all available items in this filter. Try a different language or difficulty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recommended.map((item) => {
            const key = item.content;
            const isAdded = addedIds.has(key);
            const isExpanded = expandedId === key;
            const lang = LANGUAGES.find((l) => l.code === item.language);

            return (
              <div
                key={key}
                className={`bg-white border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-sky-200' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-lg leading-tight">{item.content}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{item.translation}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => speak(item)}
                        className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : key)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs text-slate-400">{lang?.flag} {lang?.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getDiffColor(item.difficulty)}`}>
                      {DIFFICULTY_LABELS[item.difficulty]}
                    </span>
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  {isExpanded && (
                    <div className="mb-3 pb-3 border-b border-slate-100">
                      {item.pronunciation && (
                        <p className="text-xs font-mono text-slate-400 mb-1.5">{item.pronunciation}</p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-slate-500 leading-relaxed">{item.notes}</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => !isAdded && handleAdd(item)}
                    disabled={isAdded || adding === key}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                    }`}
                  >
                    {isAdded ? (
                      'Added to library'
                    ) : adding === key ? (
                      'Adding...'
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Add to library</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
