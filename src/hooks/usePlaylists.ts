import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Playlist, PlaylistItem } from '../lib/types';

export function usePlaylists(userId: string | undefined) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchPlaylists();
  }, [userId]);

  async function fetchPlaylists() {
    setLoading(true);
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (pl) => {
          const { count } = await supabase
            .from('playlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', pl.id);
          return { ...pl, item_count: count ?? 0 };
        })
      );
      setPlaylists(withCounts);
    }
    setLoading(false);
  }

  async function createPlaylist(playlist: Omit<Playlist, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('playlists')
      .insert({ ...playlist, user_id: userId })
      .select()
      .maybeSingle();
    if (data) await fetchPlaylists();
    return { data, error };
  }

  async function updatePlaylist(id: string, updates: Partial<Playlist>) {
    const { data } = await supabase
      .from('playlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) await fetchPlaylists();
    return data;
  }

  async function deletePlaylist(id: string) {
    await supabase.from('playlists').delete().eq('id', id);
    await fetchPlaylists();
  }

  async function fetchPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const { data } = await supabase
      .from('playlist_items')
      .select('*, language_items(*)')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });
    return data ?? [];
  }

  async function addItemToPlaylist(playlistId: string, itemId: string, position: number) {
    const { data, error } = await supabase
      .from('playlist_items')
      .insert({ playlist_id: playlistId, item_id: itemId, position })
      .select()
      .maybeSingle();
    await fetchPlaylists();
    return { data, error };
  }

  async function removeItemFromPlaylist(playlistId: string, itemId: string) {
    await supabase
      .from('playlist_items')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('item_id', itemId);
    await fetchPlaylists();
  }

  return {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    fetchPlaylistItems,
    addItemToPlaylist,
    removeItemFromPlaylist,
    refetch: fetchPlaylists,
  };
}
