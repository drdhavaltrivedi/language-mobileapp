export interface Profile {
  id: string;
  username: string | null;
  native_language: string;
  target_language: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageItem {
  id: string;
  user_id: string;
  content: string;
  translation: string | null;
  pronunciation: string | null;
  notes: string | null;
  language: string;
  difficulty: number;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: string;
  cover_color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  item_id: string;
  position: number;
  added_at: string;
  language_items?: LanguageItem;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  playlist_id: string | null;
  playlist_name: string | null;
  started_at: string;
  completed_at: string | null;
  total_items: number;
  correct_items: number;
  duration_seconds: number;
}

export interface ItemProgress {
  id: string;
  user_id: string;
  item_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
  times_practiced: number;
  times_correct: number;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SessionItem {
  item: LanguageItem;
  rating?: Rating;
}

export type Page = 'dashboard' | 'playlists' | 'playlist-detail' | 'practice' | 'library' | 'discovery';

export const LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export const COVER_COLORS = [
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
];

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};
