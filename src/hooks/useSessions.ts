import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PracticeSession, ItemProgress, Rating } from '../lib/types';

export function useSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchSessions();
  }, [userId]);

  async function fetchSessions() {
    setLoading(true);
    const { data } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20);
    setSessions(data ?? []);
    setLoading(false);
  }

  async function createSession(playlistId: string | null, playlistName: string | null) {
    if (!userId) return null;
    const { data } = await supabase
      .from('practice_sessions')
      .insert({ user_id: userId, playlist_id: playlistId, playlist_name: playlistName })
      .select()
      .maybeSingle();
    return data;
  }

  async function completeSession(
    sessionId: string,
    totalItems: number,
    correctItems: number,
    durationSeconds: number
  ) {
    await supabase
      .from('practice_sessions')
      .update({
        completed_at: new Date().toISOString(),
        total_items: totalItems,
        correct_items: correctItems,
        duration_seconds: durationSeconds,
      })
      .eq('id', sessionId);
    await fetchSessions();
  }

  async function recordItemProgress(itemId: string, rating: Rating) {
    if (!userId) return;

    const { data: existing } = await supabase
      .from('item_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    const isCorrect = rating === 'good' || rating === 'easy';
    const now = new Date();

    if (existing) {
      let newEase = existing.ease_factor;
      let newInterval = existing.interval_days;
      let newReps = existing.repetitions;

      if (rating === 'again') {
        newReps = 0;
        newInterval = 1;
      } else if (rating === 'hard') {
        newEase = Math.max(1.3, existing.ease_factor - 0.15);
        newInterval = Math.max(1, Math.ceil(existing.interval_days * 1.2));
        newReps = existing.repetitions + 1;
      } else if (rating === 'good') {
        newInterval = newReps === 0 ? 1 : newReps === 1 ? 6 : Math.ceil(existing.interval_days * existing.ease_factor);
        newReps = existing.repetitions + 1;
      } else {
        newEase = existing.ease_factor + 0.15;
        newInterval = Math.ceil(existing.interval_days * existing.ease_factor * 1.3);
        newReps = existing.repetitions + 1;
      }

      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

      await supabase
        .from('item_progress')
        .update({
          ease_factor: newEase,
          interval_days: newInterval,
          repetitions: newReps,
          next_review: nextReview.toISOString(),
          last_reviewed: now.toISOString(),
          times_practiced: existing.times_practiced + 1,
          times_correct: existing.times_correct + (isCorrect ? 1 : 0),
        })
        .eq('id', existing.id);
    } else {
      const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await supabase
        .from('item_progress')
        .insert({
          user_id: userId,
          item_id: itemId,
          next_review: nextReview.toISOString(),
          last_reviewed: now.toISOString(),
          times_practiced: 1,
          times_correct: isCorrect ? 1 : 0,
        });
    }
  }

  async function fetchProgress(): Promise<ItemProgress[]> {
    if (!userId) return [];
    const { data } = await supabase
      .from('item_progress')
      .select('*')
      .eq('user_id', userId);
    return data ?? [];
  }

  return { sessions, loading, createSession, completeSession, recordItemProgress, fetchProgress, refetch: fetchSessions };
}
