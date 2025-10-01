'use client';

import { useEffect } from 'react';
import { patchCacheAPI } from '@/lib/cache-patch';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Apply cache API patch to prevent chrome-extension URL errors
    patchCacheAPI();
  }, []);

  return null; // This component doesn't render anything
}
