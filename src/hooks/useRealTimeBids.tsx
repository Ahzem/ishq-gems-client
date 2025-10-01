'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  BidUpdateEvent,
  AuctionData,
  UseRealTimeBidsOptions,
  UseRealTimeBidsReturn,
  UseRealTimeAuctionReturn
} from '@/types'

// Global state for polling
const GLOBAL_STATE = {
  activePolls: new Map<string, {
    lastUpdate: string;
    interval: number;
    subscribers: Set<string>;
    timeoutId?: NodeJS.Timeout;
    isPolling: boolean;
    consecutiveErrors: number;
  }>(),
  retryCount: 0,
  maxRetries: 5,
  baseInterval: 15000, // Increased from 10s to 15s to reduce API calls
  maxInterval: 120000, // Increased max interval to 2 minutes
};

// Shared polling function
const sharedPoll = async (gemId: string) => {
  const pollState = GLOBAL_STATE.activePolls.get(gemId);
  if (!pollState || pollState.isPolling) return;

  // Prevent concurrent polling for the same gem
  pollState.isPolling = true;

  try {
    const { default: bidService } = await import('@/services/bid.service');
    const response = await bidService.getBidUpdates(gemId, pollState.lastUpdate);

    if (response.success && response.data) {
      // Reset error counters on success
      pollState.consecutiveErrors = 0;
      GLOBAL_STATE.retryCount = 0;
      pollState.interval = GLOBAL_STATE.baseInterval;
      pollState.lastUpdate = new Date().toISOString();

      // Notify all subscribers about successful connection
      window.dispatchEvent(new CustomEvent(`connection-status-${gemId}`, {
        detail: { connected: true, error: null }
      }));

      // Notify all subscribers about data update
      window.dispatchEvent(new CustomEvent(`bid-update-${gemId}`, {
        detail: response.data
      }));
    } else {
      pollState.consecutiveErrors++;
      // Notify subscribers about connection issues
      window.dispatchEvent(new CustomEvent(`connection-status-${gemId}`, {
        detail: { connected: false, error: 'No data received' }
      }));
    }
  } catch (error) {
    pollState.consecutiveErrors++;
    
    const isRateLimit = error instanceof Error && 
      (error.message.includes('Too many requests') || 
       error.message.includes('rate limit') || 
       error.message.includes('BID_READ_RATE_LIMIT_EXCEEDED'));

    if (isRateLimit) {
      GLOBAL_STATE.retryCount++;
      // More aggressive backoff for rate limiting
      pollState.interval = Math.min(
        GLOBAL_STATE.baseInterval * Math.pow(2, GLOBAL_STATE.retryCount), // Exponential backoff
        GLOBAL_STATE.maxInterval
      );
      
      console.warn(`Rate limited for gem ${gemId}. Backing off to ${pollState.interval / 1000}s intervals.`);
    } else {
      // Regular error backoff
      pollState.interval = Math.min(
        GLOBAL_STATE.baseInterval * Math.pow(1.5, pollState.consecutiveErrors),
        GLOBAL_STATE.maxInterval
      );
    }

    // Notify subscribers about connection error
    window.dispatchEvent(new CustomEvent(`connection-status-${gemId}`, {
      detail: { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isRateLimit 
      }
    }));

    console.error(`Polling error for gem ${gemId}:`, error);
  } finally {
    pollState.isPolling = false;
    
    // Schedule next poll if we still have subscribers
    if (pollState.subscribers.size > 0) {
      pollState.timeoutId = setTimeout(() => sharedPoll(gemId), pollState.interval);
    } else {
      GLOBAL_STATE.activePolls.delete(gemId);
    }
  }
};

export function useRealTimeBids(options: UseRealTimeBidsOptions = {}): UseRealTimeBidsReturn {
  const {
    gemIds = [],
    autoConnect = true
  } = options;

  const { isAuthenticated } = useAuth();
  const [auctionData, setAuctionData] = useState<AuctionData>({});
  const [bidUpdates, setBidUpdates] = useState<BidUpdateEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const instanceIdRef = useRef<string>(Math.random().toString(36).substr(2, 9));
  const eventHandlersRef = useRef<{ [key: string]: (e: CustomEvent) => void }>({});
  const gemIdsRef = useRef<string[]>(gemIds);

  // Update ref when gemIds changes
  useEffect(() => {
    const oldGemIds = gemIdsRef.current;
    gemIdsRef.current = gemIds;

    // If connected, handle changes to gem subscriptions
    if (isConnected) {
      // Find gems that were removed
      const removedGems = oldGemIds.filter(id => !gemIds.includes(id));
      // Find gems that were added
      const addedGems = gemIds.filter(id => !oldGemIds.includes(id));

      // Unsubscribe from removed gems
      removedGems.forEach(gemId => {
        const pollState = GLOBAL_STATE.activePolls.get(gemId);
        if (pollState) {
          pollState.subscribers.delete(instanceIdRef.current);
          if (pollState.subscribers.size === 0) {
            if (pollState.timeoutId) {
              clearTimeout(pollState.timeoutId);
            }
            GLOBAL_STATE.activePolls.delete(gemId);
          }
        }
      });

      // Subscribe to added gems
      addedGems.forEach(gemId => {
        if (!GLOBAL_STATE.activePolls.has(gemId)) {
          GLOBAL_STATE.activePolls.set(gemId, {
            lastUpdate: new Date().toISOString(),
            interval: GLOBAL_STATE.baseInterval,
            subscribers: new Set([instanceIdRef.current]),
            timeoutId: setTimeout(() => sharedPoll(gemId), 0),
            isPolling: false,
            consecutiveErrors: 0
          });
        } else {
          GLOBAL_STATE.activePolls.get(gemId)?.subscribers.add(instanceIdRef.current);
        }
      });
    }
  }, [gemIds, isConnected]);

  // Handle bid updates and connection status from shared polling
  useEffect(() => {
    // Capture current handlers at effect setup time
    const currentHandlers = eventHandlersRef.current;
    const connectionHandlers: { [key: string]: (e: CustomEvent) => void } = {};
    
    // Create event handlers for each gem
    gemIds.forEach(gemId => {
      // Store bid update handler in ref to maintain reference across renders
      currentHandlers[gemId] = (e: CustomEvent) => {
        const data = e.detail;
        if (!data) return;

        setAuctionData(prev => {
          const newData = { ...prev };
          newData[gemId] = {
            currentHighestBid: data.currentHighestBid || prev[gemId]?.currentHighestBid || 0,
            totalBids: data.totalBids || prev[gemId]?.totalBids || 0,
            auctionStatus: data.auctionStatus || prev[gemId]?.auctionStatus || 'not-started',
            lastUpdate: new Date().toISOString(),
            winningBidder: data.winningBidder
          };
          return newData;
        });

        if (data.updates?.length > 0) {
          setBidUpdates(prev => {
            const newUpdates = [...data.updates, ...prev];
            return newUpdates.slice(0, 50); // Keep last 50 updates
          });
        }
      };

      // Connection status handler
      connectionHandlers[gemId] = (e: CustomEvent) => {
        const { connected, error } = e.detail;
        setIsConnected(connected);
        if (error) {
          setError(error);
        } else {
          setError(null);
        }
      };

      // Add event listeners
      window.addEventListener(
        `bid-update-${gemId}`, 
        currentHandlers[gemId] as EventListener
      );
      
      window.addEventListener(
        `connection-status-${gemId}`, 
        connectionHandlers[gemId] as EventListener
      );
    });

    // Cleanup function
    return () => {
      gemIds.forEach(gemId => {
        if (currentHandlers[gemId]) {
          window.removeEventListener(
            `bid-update-${gemId}`,
            currentHandlers[gemId] as EventListener
          );
          delete currentHandlers[gemId];
        }
        
        if (connectionHandlers[gemId]) {
          window.removeEventListener(
            `connection-status-${gemId}`,
            connectionHandlers[gemId] as EventListener
          );
          delete connectionHandlers[gemId];
        }
      });
    };
  }, [gemIds]); // Only re-run if gemIds changes

  const connect = useCallback(() => {
    if (isConnected) return;
    setIsLoading(true);
    setError(null);

    // Subscribe to each gem's polling using ref value
    gemIdsRef.current.forEach(gemId => {
      if (!GLOBAL_STATE.activePolls.has(gemId)) {
        GLOBAL_STATE.activePolls.set(gemId, {
          lastUpdate: new Date().toISOString(),
          interval: GLOBAL_STATE.baseInterval,
          subscribers: new Set([instanceIdRef.current]),
          timeoutId: setTimeout(() => sharedPoll(gemId), 0),
          isPolling: false,
          consecutiveErrors: 0
        });
      } else {
        GLOBAL_STATE.activePolls.get(gemId)?.subscribers.add(instanceIdRef.current);
      }
    });

    // Don't set isConnected immediately - let the polling results determine connection status
    setIsLoading(false);
  }, [isConnected]); // Remove gemIds dependency

  const disconnect = useCallback(() => {
    // Unsubscribe from each gem's polling using ref value
    gemIdsRef.current.forEach(gemId => {
      const pollState = GLOBAL_STATE.activePolls.get(gemId);
      if (pollState) {
        pollState.subscribers.delete(instanceIdRef.current);
        if (pollState.subscribers.size === 0) {
          if (pollState.timeoutId) {
            clearTimeout(pollState.timeoutId);
          }
          GLOBAL_STATE.activePolls.delete(gemId);
        }
      }
    });

    setIsConnected(false);
  }, []); // No dependencies

  // Initialize connection on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated && !isConnected) {
      connect();
    }
    return () => {
      // Only disconnect on unmount, not on every re-render
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect, isConnected]);

  return {
    auctionData,
    bidUpdates,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    subscribeTo: useCallback((gemId: string) => {
      if (!GLOBAL_STATE.activePolls.has(gemId)) {
        GLOBAL_STATE.activePolls.set(gemId, {
          lastUpdate: new Date().toISOString(),
          interval: GLOBAL_STATE.baseInterval,
          subscribers: new Set([instanceIdRef.current]),
          timeoutId: setTimeout(() => sharedPoll(gemId), 0),
          isPolling: false,
          consecutiveErrors: 0
        });
      } else {
        GLOBAL_STATE.activePolls.get(gemId)?.subscribers.add(instanceIdRef.current);
      }
    }, []),
    unsubscribeFrom: useCallback((gemId: string) => {
      const pollState = GLOBAL_STATE.activePolls.get(gemId);
      if (pollState) {
        pollState.subscribers.delete(instanceIdRef.current);
        if (pollState.subscribers.size === 0) {
          if (pollState.timeoutId) {
            clearTimeout(pollState.timeoutId);
          }
          GLOBAL_STATE.activePolls.delete(gemId);
        }
      }
    }, []),
    clearUpdates: useCallback(() => setBidUpdates([]), []),
    refreshData: useCallback(async () => {
      gemIdsRef.current.forEach(gemId => {
        const pollState = GLOBAL_STATE.activePolls.get(gemId);
        if (pollState?.timeoutId) {
          clearTimeout(pollState.timeoutId);
          sharedPoll(gemId);
        }
      });
    }, []) // Remove gemIds dependency
  };
}

// Helper hook for single gem
export function useRealTimeAuction(gemId: string): UseRealTimeAuctionReturn {
  const realTimeBids = useRealTimeBids({
    gemIds: [gemId],
    autoConnect: true
  })

  return {
    ...realTimeBids,
    gemData: realTimeBids.auctionData[gemId] || null,
    latestUpdate: realTimeBids.bidUpdates.find(update => update.gemId === gemId) || null
  }
} 