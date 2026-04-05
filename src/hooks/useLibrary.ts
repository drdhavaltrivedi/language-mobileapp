import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LanguageItem } from '../lib/types';

export function useLibrary(userId: string | undefined) {
  const [items, setItems] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchItems();
  }, [userId]);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('language_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function createItem(item: Omit<LanguageItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('language_items')
      .insert({ ...item, user_id: userId })
      .select()
      .maybeSingle();
    if (data) await fetchItems();
    return { data, error };
  }

  async function updateItem(id: string, updates: Partial<LanguageItem>) {
    const { data } = await supabase
      .from('language_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) await fetchItems();
    return data;
  }

  async function deleteItem(id: string) {
    await supabase.from('language_items').delete().eq('id', id);
    await fetchItems();
  }

  return { items, loading, createItem, updateItem, deleteItem, refetch: fetchItems };
}
