/**
 * cache.js — Simple in-memory cache + server warm-up
 *
 * - Caches API responses so navigating between pages is instant
 * - Pings the Render backend on startup to wake it from cold sleep
 * - Prefetches members + meetups before the user even logs in
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://ebc-app-backend.onrender.com";

// ── In-memory store ───────────────────────────────────────────────────────────
const store = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet(key, data) {
  store.set(key, { data, ts: Date.now() });
}

export function cacheInvalidate(key) {
  store.delete(key);
}

export function cacheInvalidateAll() {
  store.clear();
}

// ── In-flight deduplication ───────────────────────────────────────────────────
// Prevents two components fetching the same thing simultaneously
const inflight = new Map();

export async function cachedFetch(key, fetchFn) {
  const cached = cacheGet(key);
  if (cached !== null) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = fetchFn()
    .then((data) => {
      cacheSet(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

// ── Server warm-up + data prefetch ───────────────────────────────────────────
// Called once at app startup. Wakes Render from cold sleep and pre-loads
// the two most-needed datasets so they're in cache by the time user logs in.
let warmedUp = false;

export function warmupAndPrefetch() {
  if (warmedUp) return;
  warmedUp = true;

  // Fire-and-forget — don't block anything
  Promise.allSettled([
    fetch(`${API_BASE}/api/members`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) cacheSet("members", data);
      }),
    fetch(`${API_BASE}/api/meetups`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) cacheSet("meetups", data);
      }),
  ]);
}
