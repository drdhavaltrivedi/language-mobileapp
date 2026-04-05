import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { usePlaylists } from './hooks/usePlaylists';
import { useLibrary } from './hooks/useLibrary';
import { useSessions } from './hooks/useSessions';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Playlists from './components/playlists/Playlists';
import PlaylistDetail from './components/playlists/PlaylistDetail';
import PracticeSession from './components/practice/PracticeSession';
import Library from './components/library/Library';
import Discovery from './components/discovery/Discovery';
import BottomNav from './components/layout/BottomNav';
import { Page, Playlist, PlaylistItem, LanguageItem, Rating } from './lib/types';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { playlists, loading: playlistsLoading, createPlaylist, deletePlaylist, fetchPlaylistItems, addItemToPlaylist, removeItemFromPlaylist } = usePlaylists(user?.id);
  const { items, loading: libraryLoading, createItem, updateItem, deleteItem } = useLibrary(user?.id);
  const { sessions, createSession, completeSession, recordItemProgress } = useSessions(user?.id);

  const [page, setPage] = useState<Page>('dashboard');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [practicePlaylist, setPracticePlaylist] = useState<Playlist | null>(null);
  const [practiceItems, setPracticeItems] = useState<PlaylistItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !authLoading) setPage('dashboard');
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onSignIn={async (email, password) => {
          const result = await signIn(email, password);
          return { error: result.error };
        }}
        onSignUp={async (email, password) => {
          const result = await signUp(email, password);
          return { error: result.error };
        }}
      />
    );
  }

  async function handleStartPlaylist(playlist: Playlist) {
    const playlistItems = await fetchPlaylistItems(playlist.id);
    if (playlistItems.length === 0) {
      setSelectedPlaylist(playlist);
      setPage('playlist-detail');
      return;
    }
    const session = await createSession(playlist.id, playlist.name);
    setSessionId(session?.id ?? null);
    setPracticePlaylist(playlist);
    setPracticeItems(playlistItems);
    setPage('practice');
  }

  async function handleStartQuickSession() {
    if (items.length === 0) {
      setPage('library');
      return;
    }
    const session = await createSession(null, 'Quick Session');
    setSessionId(session?.id ?? null);
    setPracticePlaylist(null);
    const quickItems: PlaylistItem[] = items.slice(0, 10).map((item, i) => ({
      id: `quick-${i}`,
      playlist_id: '',
      item_id: item.id,
      position: i,
      added_at: new Date().toISOString(),
      language_items: item,
    }));
    setPracticeItems(quickItems);
    setPage('practice');
  }

  async function handleSessionComplete(
    totalItems: number,
    correctItems: number,
    durationSeconds: number,
    ratings: { itemId: string; rating: Rating }[]
  ) {
    if (sessionId) {
      await completeSession(sessionId, totalItems, correctItems, durationSeconds);
    }
    await Promise.all(ratings.map(({ itemId, rating }) => recordItemProgress(itemId, rating)));
  }

  function handleNavigate(target: Page) {
    if (target === 'practice') {
      handleStartQuickSession();
      return;
    }
    setPage(target);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {page !== 'practice' && (
        <Sidebar
          currentPage={page}
          onNavigate={handleNavigate}
          onSignOut={signOut}
          userEmail={user.email}
        />
      )}

      <main className="flex-1 overflow-y-auto min-h-screen pb-20 lg:pb-0">
        {page === 'dashboard' && (
          <Dashboard
            playlists={playlists}
            sessions={sessions}
            totalItems={items.length}
            onNavigate={(p) => {
              if (p === 'practice') { handleStartQuickSession(); return; }
              setPage(p);
            }}
            onStartPlaylist={handleStartPlaylist}
          />
        )}

        {page === 'playlists' && (
          <Playlists
            playlists={playlists}
            onCreatePlaylist={async (data) => { await createPlaylist({ ...data, is_public: false }); }}
            onDeletePlaylist={deletePlaylist}
            onOpenPlaylist={(pl) => { setSelectedPlaylist(pl); setPage('playlist-detail'); }}
            onStartPlaylist={handleStartPlaylist}
          />
        )}

        {page === 'playlist-detail' && selectedPlaylist && (
          <PlaylistDetail
            playlist={selectedPlaylist}
            onBack={() => setPage('playlists')}
            onStartPractice={() => handleStartPlaylist(selectedPlaylist)}
            fetchPlaylistItems={fetchPlaylistItems}
            removeItemFromPlaylist={removeItemFromPlaylist}
            userItems={items}
            addItemToPlaylist={addItemToPlaylist}
          />
        )}

        {page === 'practice' && (
          <PracticeSession
            playlist={practicePlaylist}
            playlistItems={practiceItems}
            onClose={() => setPage('dashboard')}
            onComplete={async (total, correct, duration, ratings) => {
              await handleSessionComplete(total, correct, duration, ratings);
            }}
          />
        )}

        {page === 'library' && (
          <Library
            items={items}
            loading={libraryLoading}
            onCreateItem={async (data) => { await createItem(data); }}
            onUpdateItem={async (id, updates) => { await updateItem(id, updates); }}
            onDeleteItem={async (id) => { await deleteItem(id); }}
          />
        )}

        {page === 'discovery' && (
          <Discovery
            userItems={items}
            onAddToLibrary={async (data) => { await createItem(data); }}
          />
        )}
      </main>

      {page !== 'practice' && (
        <BottomNav
          currentPage={page}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
