import { useCallback, useEffect, useRef, useState } from 'react';
import { search, type Document } from '../api/oracle';
import { topKAgreement, topKJaccard, avgRankShift, type ByModel } from '../lib/compare';

export interface ModelState {
  results: Document[];
  loading: boolean;
  error: string | null;
  latencyMs: number;
}

export interface Agreement {
  top1: number;
  top5Jaccard: number;
  avgShift: number;
}

export interface CompareSearchState {
  byModel: Record<string, ModelState>;
  agreement: Agreement;
  loading: boolean;
  fire: (q?: string) => void;
}

export interface UseCompareSearchArgs {
  query: string;
  enabledModels: string[];
  limit?: number;
  debounceMs?: number;
  auto?: boolean;
}

const EMPTY: ModelState = { results: [], loading: false, error: null, latencyMs: 0 };

export function useCompareSearch({
  query,
  enabledModels,
  limit = 20,
  debounceMs = 300,
  auto = true,
}: UseCompareSearchArgs): CompareSearchState {
  const [byModel, setByModel] = useState<Record<string, ModelState>>({});
  const reqIdRef = useRef(0);

  const run = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed || enabledModels.length === 0) {
        setByModel({});
        return;
      }
      const myReqId = ++reqIdRef.current;

      setByModel((prev) => {
        const next: Record<string, ModelState> = {};
        for (const m of enabledModels) {
          next[m] = { ...(prev[m] ?? EMPTY), loading: true, error: null };
        }
        return next;
      });

      await Promise.all(
        enabledModels.map(async (model) => {
          const start = performance.now();
          try {
            const data = await search(trimmed, 'all', limit, 'hybrid', model);
            if (myReqId !== reqIdRef.current) return;
            setByModel((prev) => ({
              ...prev,
              [model]: {
                results: data.results,
                loading: false,
                error: null,
                latencyMs: Math.round(performance.now() - start),
              },
            }));
          } catch (err) {
            if (myReqId !== reqIdRef.current) return;
            setByModel((prev) => ({
              ...prev,
              [model]: {
                results: [],
                loading: false,
                error: err instanceof Error ? err.message : String(err),
                latencyMs: Math.round(performance.now() - start),
              },
            }));
          }
        }),
      );
    },
    [enabledModels, limit],
  );

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => void run(query), debounceMs);
    return () => window.clearTimeout(id);
  }, [query, auto, debounceMs, run]);

  const fire = useCallback((q?: string) => void run(q ?? query), [run, query]);

  const agreement = computeAgreement(byModel);
  const loading = Object.values(byModel).some((s) => s.loading);

  return { byModel, agreement, loading, fire };
}

function computeAgreement(byModel: Record<string, ModelState>): Agreement {
  const raw: ByModel = {};
  for (const [m, s] of Object.entries(byModel)) raw[m] = s.results;
  return {
    top1: topKAgreement(raw, 1),
    top5Jaccard: topKJaccard(raw, 5),
    avgShift: avgRankShift(raw),
  };
}
