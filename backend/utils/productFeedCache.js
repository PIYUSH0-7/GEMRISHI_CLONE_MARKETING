// ----------------------------Add By Pawan-----------------------------------------
const MAX_TTL_MS = 4 * 60 * 60 * 1000; // never older than 4 hours
const ttlMin = Number(process.env.FEED_CACHE_TTL_MIN) || 30;
export const FEED_TTL_MS = Math.min(ttlMin * 60 * 1000, MAX_TTL_MS);

let cache = null;
let generation = 0;
let inflight = null;

export const invalidateProductFeed = () => {
  generation += 1;
  cache = null;
};

export const getProductFeed = async (buildFn) => {
  if (cache && Date.now() - cache.builtAt < FEED_TTL_MS) return cache;
  if (!inflight) {
    const startedAt = generation;
    inflight = buildFn()
      .then((xml) => {
        const fresh = { xml, builtAt: Date.now() };
        if (startedAt === generation) cache = fresh;
        return fresh;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
};
// ----------------------------End By Pawan-----------------------------------------