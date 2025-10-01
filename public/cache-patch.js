// Early cache API patch to prevent chrome-extension URL errors
(function() {
  'use strict';
  
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  // Helper function to check if URL should be cached
  function shouldCacheUrl(url) {
    try {
      var urlString = typeof url === 'string' ? url : url.url;
      var urlObj = new URL(urlString);
      
      // Don't cache browser extension URLs
      if (urlObj.protocol === 'chrome-extension:' || 
          urlObj.protocol === 'moz-extension:' || 
          urlObj.protocol === 'webkit-extension:' ||
          urlObj.protocol === 'ms-browser-extension:') {
        console.warn('Skipping cache for browser extension URL:', urlString);
        return false;
      }
      
      return true;
    } catch (e) {
      console.warn('Invalid URL for caching:', url, e);
      return false;
    }
  }

  // Wait for Cache API to be available
  function patchCacheAPI() {
    if (!window.Cache || !window.Cache.prototype) {
      setTimeout(patchCacheAPI, 10);
      return;
    }

    // Store original methods
    var originalCachePut = Cache.prototype.put;
    var originalCacheAdd = Cache.prototype.add;
    var originalCacheAddAll = Cache.prototype.addAll;

    // Patch Cache.put
    Cache.prototype.put = function(request, response) {
      if (!shouldCacheUrl(request)) {
        return Promise.resolve();
      }
      return originalCachePut.call(this, request, response);
    };

    // Patch Cache.add
    Cache.prototype.add = function(request) {
      if (!shouldCacheUrl(request)) {
        return Promise.resolve();
      }
      return originalCacheAdd.call(this, request);
    };

    // Patch Cache.addAll
    Cache.prototype.addAll = function(requests) {
      var filteredRequests = requests.filter(shouldCacheUrl);
      if (filteredRequests.length === 0) {
        return Promise.resolve();
      }
      return originalCacheAddAll.call(this, filteredRequests);
    };

    console.log('Cache API patched to filter browser extension URLs');
  }

  // Apply patch immediately if possible, or wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchCacheAPI);
  } else {
    patchCacheAPI();
  }
})();
