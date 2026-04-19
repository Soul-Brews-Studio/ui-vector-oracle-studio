import { apiUrl } from './host';
export { apiUrl, hostLabel, activeHost, isDefault, isRemote } from './host';

export const API_BASE = apiUrl('/api');

export interface Document {
  id: string;
  type: 'principle' | 'learning' | 'retro';
  content: string;
  source_file: string;
  concepts: string[];
  project?: string;
  source?: 'fts' | 'vector' | 'hybrid';
  score?: number;
  distance?: number;
  model?: string;
  created_at?: string;
}

export interface SearchResult {
  results: Document[];
  total: number;
  query: string;
}

export async function search(
  query: string,
  type: string = 'all',
  limit: number = 20,
  mode: 'hybrid' | 'fts' | 'vector' = 'hybrid',
  model?: string,
): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query, type, limit: String(limit), mode });
  if (model) params.set('model', model);
  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`search ${res.status}`);
  return res.json();
}

export interface VectorEmbedder {
  model: string;
  dim?: number;
  count?: number;
  enabled?: boolean;
}

export interface Stats {
  vectors?: VectorEmbedder[];
  [key: string]: unknown;
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return res.json();
}

export interface CompareResponse {
  query: string;
  byModel: Record<string, { results: Document[]; elapsed_ms: number }>;
  agreement: {
    top1: number;
    top5_jaccard: number;
    avg_rank_shift: number;
    shared_ids: string[];
  };
}

export async function compareSearch({
  query,
  models,
  limit = 20,
}: {
  query: string;
  models: string[];
  limit?: number;
}): Promise<CompareResponse> {
  const params = new URLSearchParams({
    q: query,
    models: models.join(','),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/compare?${params}`);
  if (!res.ok) throw new Error(`compare ${res.status}`);
  return res.json();
}

/** Ping the backend — used by BackendGate for soft-mode detection. */
export async function ping(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/stats`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
