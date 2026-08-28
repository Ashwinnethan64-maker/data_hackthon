/**
 * In-memory TTL Cache service for backend routes.
 * Provides high-speed caching for compute/DB-heavy read endpoints.
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  /**
   * Express middleware helper for route-level caching
   * @param {number} ttlSeconds
   */
  middleware(ttlSeconds = 60) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `${req.baseUrl || ''}${req.path}_${JSON.stringify(req.query || {})}`;
      const cachedResponse = this.get(key);

      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      // Override res.json to capture response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, ttlSeconds);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    };
  }
}

const memoryCache = new MemoryCache();
module.exports = { memoryCache, MemoryCache };
