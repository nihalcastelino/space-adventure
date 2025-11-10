import { useState, useEffect, useCallback } from 'react';

/*
 * Analytics & Monetization Tracking
 *
 * For production, integrate with analytics services:
 *
 * Google Analytics 4:
 * - npm install react-ga4
 * - Track custom events, user properties, conversions
 *
 * Mixpanel:
 * - npm install mixpanel-browser
 * - Advanced user analytics, funnels, retention
 *
 * Amplitude:
 * - npm install @amplitude/analytics-browser
 * - Product analytics, user behavior tracking
 *
 * Firebase Analytics (mobile):
 * - Already included with Firebase SDK
 * - Automatic screen tracking, user engagement
 */

// Event categories
export const EVENT_CATEGORIES = {
  GAMEPLAY: 'gameplay',
  MONETIZATION: 'monetization',
  SOCIAL: 'social',
  PROGRESSION: 'progression',
  ENGAGEMENT: 'engagement'
};

// Monetization event types
export const MONETIZATION_EVENTS = {
  // Purchases
  IAP_INITIATED: 'iap_initiated',
  IAP_COMPLETED: 'iap_completed',
  IAP_FAILED: 'iap_failed',
  IAP_CANCELLED: 'iap_cancelled',

  // Subscriptions
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

  // Ads
  AD_REQUESTED: 'ad_requested',
  AD_LOADED: 'ad_loaded',
  AD_SHOWN: 'ad_shown',
  AD_CLICKED: 'ad_clicked',
  AD_COMPLETED: 'ad_completed',
  AD_FAILED: 'ad_failed',

  // Virtual currency
  CURRENCY_EARNED: 'currency_earned',
  CURRENCY_SPENT: 'currency_spent',

  // Conversions
  FIRST_PURCHASE: 'first_purchase',
  PREMIUM_CONVERSION: 'premium_conversion'
};

export function useAnalytics() {
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [eventsTracked, setEventsTracked] = useState(0);

  // Initialize analytics session
  useEffect(() => {
    setSessionStart(Date.now());

    // Track session start
    trackEvent('session_start', {
      category: EVENT_CATEGORIES.ENGAGEMENT,
      timestamp: Date.now()
    });

    // Track session end on unmount
    return () => {
      const sessionDuration = Date.now() - sessionStart;
      trackEvent('session_end', {
        category: EVENT_CATEGORIES.ENGAGEMENT,
        duration: sessionDuration
      });
    };
  }, []);

  // Track event
  const trackEvent = useCallback((eventName, properties = {}) => {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: sessionStart,
      ...properties
    };

    // Log to console (replace with actual analytics service)
    console.log('[Analytics]', event);

    // Save to local storage for debugging
    const savedEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
    savedEvents.push(event);
    // Keep only last 100 events
    if (savedEvents.length > 100) {
      savedEvents.shift();
    }
    localStorage.setItem('analyticsEvents', JSON.stringify(savedEvents));

    setEventsTracked(prev => prev + 1);

    /*
     * Production integration examples:
     *
     * Google Analytics 4:
     * import ReactGA from 'react-ga4';
     * ReactGA.event({
     *   category: properties.category,
     *   action: eventName,
     *   label: properties.label,
     *   value: properties.value
     * });
     *
     * Mixpanel:
     * import mixpanel from 'mixpanel-browser';
     * mixpanel.track(eventName, properties);
     *
     * Amplitude:
     * import * as amplitude from '@amplitude/analytics-browser';
     * amplitude.track(eventName, properties);
     *
     * Firebase Analytics:
     * import { getAnalytics, logEvent } from 'firebase/analytics';
     * const analytics = getAnalytics();
     * logEvent(analytics, eventName, properties);
     */

    return event;
  }, [sessionStart]);

  // Track monetization event
  const trackMonetization = useCallback((eventType, data = {}) => {
    return trackEvent(eventType, {
      category: EVENT_CATEGORIES.MONETIZATION,
      ...data
    });
  }, [trackEvent]);

  // Track purchase
  const trackPurchase = useCallback((itemType, itemId, price, currency = 'USD') => {
    trackMonetization(MONETIZATION_EVENTS.IAP_COMPLETED, {
      itemType,
      itemId,
      price,
      currency,
      revenue: price
    });

    // Track as conversion
    trackEvent('purchase', {
      category: EVENT_CATEGORIES.MONETIZATION,
      value: price,
      currency,
      items: [{ id: itemId, name: itemType, price }]
    });
  }, [trackMonetization, trackEvent]);

  // Track ad impression
  const trackAdImpression = useCallback((adType, placement, revenue = 0) => {
    trackMonetization(MONETIZATION_EVENTS.AD_SHOWN, {
      adType,
      placement,
      revenue
    });
  }, [trackMonetization]);

  // Track gameplay metrics
  const trackGameplay = useCallback((action, data = {}) => {
    return trackEvent(action, {
      category: EVENT_CATEGORIES.GAMEPLAY,
      ...data
    });
  }, [trackEvent]);

  // Track progression
  const trackProgression = useCallback((action, data = {}) => {
    return trackEvent(action, {
      category: EVENT_CATEGORIES.PROGRESSION,
      ...data
    });
  }, [trackEvent]);

  // Track social interaction
  const trackSocial = useCallback((action, data = {}) => {
    return trackEvent(action, {
      category: EVENT_CATEGORIES.SOCIAL,
      ...data
    });
  }, [trackEvent]);

  // Set user properties (for segmentation)
  const setUserProperty = useCallback((propertyName, value) => {
    console.log('[Analytics] User Property:', propertyName, value);

    /*
     * Production examples:
     *
     * Google Analytics:
     * ReactGA.set({ [propertyName]: value });
     *
     * Mixpanel:
     * mixpanel.people.set({ [propertyName]: value });
     *
     * Amplitude:
     * amplitude.identify(new amplitude.Identify().set(propertyName, value));
     */
  }, []);

  // Track funnel step
  const trackFunnelStep = useCallback((funnelName, stepName, stepNumber) => {
    return trackEvent('funnel_step', {
      category: EVENT_CATEGORIES.ENGAGEMENT,
      funnelName,
      stepName,
      stepNumber
    });
  }, [trackEvent]);

  // Calculate metrics (for dashboard)
  const getSessionMetrics = useCallback(() => {
    const savedEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
    const sessionEvents = savedEvents.filter(e => e.sessionId === sessionStart);

    return {
      totalEvents: sessionEvents.length,
      duration: Date.now() - sessionStart,
      purchases: sessionEvents.filter(e => e.name === 'purchase').length,
      adViews: sessionEvents.filter(e => e.name === MONETIZATION_EVENTS.AD_SHOWN).length
    };
  }, [sessionStart]);

  return {
    // Core tracking
    trackEvent,
    trackMonetization,
    trackPurchase,
    trackAdImpression,

    // Category-specific tracking
    trackGameplay,
    trackProgression,
    trackSocial,

    // User properties
    setUserProperty,

    // Funnels
    trackFunnelStep,

    // Metrics
    getSessionMetrics,
    eventsTracked
  };
}

// Revenue tracking helper
export function useRevenueTracking() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueBySource, setRevenueBySource] = useState({
    iap: 0,
    ads: 0,
    subscriptions: 0
  });

  // Load from storage
  useEffect(() => {
    const saved = localStorage.getItem('revenueTracking');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTotalRevenue(data.total || 0);
        setRevenueBySource(data.bySource || { iap: 0, ads: 0, subscriptions: 0 });
      } catch (e) {
        console.error('Failed to load revenue tracking:', e);
      }
    }
  }, []);

  // Save to storage
  useEffect(() => {
    const data = {
      total: totalRevenue,
      bySource: revenueBySource
    };
    localStorage.setItem('revenueTracking', JSON.stringify(data));
  }, [totalRevenue, revenueBySource]);

  // Track revenue
  const trackRevenue = useCallback((amount, source) => {
    setTotalRevenue(prev => prev + amount);
    setRevenueBySource(prev => ({
      ...prev,
      [source]: (prev[source] || 0) + amount
    }));
  }, []);

  // Get metrics
  const getMetrics = useCallback(() => {
    return {
      total: totalRevenue,
      bySource: revenueBySource,
      averageRevenuePerUser: totalRevenue, // Would divide by user count in production
      conversionRate: 0 // Would calculate from analytics data
    };
  }, [totalRevenue, revenueBySource]);

  return {
    trackRevenue,
    getMetrics
  };
}
