// Patch the Cache API to prevent chrome-extension URL caching errors
export function patchCacheAPI() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  // Store original methods
  const originalCachePut = Cache.prototype.put;
  const originalCacheAdd = Cache.prototype.add;
  const originalCacheAddAll = Cache.prototype.addAll;

  // Helper function to check if URL should be cached
  function shouldCacheUrl(url: string | Request | URL): boolean {
    try {
      const urlString = typeof url === 'string' 
        ? url 
        : url instanceof URL 
          ? url.toString() 
          : url.url;
      const urlObj = new URL(urlString);
      
      // Don't cache browser extension URLs
      if (urlObj.protocol === 'chrome-extension:' || 
          urlObj.protocol === 'moz-extension:' || 
          urlObj.protocol === 'webkit-extension:' ||
          urlObj.protocol === 'ms-browser-extension:') {
        console.warn(`Skipping cache for browser extension URL: ${urlString}`);
        return false;
      }
      
      return true;
    } catch (e) {
      console.warn(`Invalid URL for caching: ${url}`, e);
      return false;
    }
  }

  // Patch Cache.put
  Cache.prototype.put = function(request: RequestInfo | URL, response: Response) {
    if (!shouldCacheUrl(request)) {
      // Return a resolved promise to avoid breaking the cache operation
      return Promise.resolve();
    }
    return originalCachePut.call(this, request, response);
  };

  // Patch Cache.add
  Cache.prototype.add = function(request: RequestInfo | URL) {
    if (!shouldCacheUrl(request)) {
      return Promise.resolve();
    }
    return originalCacheAdd.call(this, request);
  };

  // Patch Cache.addAll
  Cache.prototype.addAll = function(requests: RequestInfo[]) {
    const filteredRequests = requests.filter(shouldCacheUrl);
    if (filteredRequests.length === 0) {
      return Promise.resolve();
    }
    return originalCacheAddAll.call(this, filteredRequests);
  };

  console.log('Cache API patched to filter browser extension URLs');
}
