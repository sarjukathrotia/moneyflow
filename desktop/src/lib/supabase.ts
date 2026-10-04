import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_CREDENTIALS_KEY = 'moneyflow_supabase_credentials';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    anonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_CREDENTIALS_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_CREDENTIALS_KEY);
  }
}

export function createCustomSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (
    url &&
    url.startsWith('https://') &&
    !url.includes('your-project') &&
    anonKey &&
    anonKey.length > 20
  ) {
    try {
      return createSupabaseClient(url, anonKey);
    } catch {
      return null;
    }
  }
  return null;
}

export function getActiveSupabaseClient(): {
  client: SupabaseClient | null;
  isConfigured: boolean;
  url: string;
  anonKey: string;
} {
  const config = getStoredSupabaseConfig();
  const client = createCustomSupabaseClient(config.url, config.anonKey);
  return {
    client,
    isConfigured: client !== null,
    url: config.url,
    anonKey: config.anonKey,
  };
}

const initial = getActiveSupabaseClient();
export const isLiveSupabaseConfigured = initial.isConfigured;
export const supabase = initial.client;
