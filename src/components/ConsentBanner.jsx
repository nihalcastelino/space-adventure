import { useState, useEffect } from 'react';
import { X, Settings, Check, XCircle } from 'lucide-react';

/**
 * GDPR Consent Management Platform (CMP)
 * 
 * Implements Google Consent Mode v2 for EEA, UK, and Switzerland users
 * Required for AdSense compliance and to avoid ad revenue loss
 */
export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [consentGiven, setConsentGiven] = useState(null);
  const [isEEAUser, setIsEEAUser] = useState(false);

  // Check if user is a Google crawler/bot
  const isGoogleCrawler = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    const googleBots = [
      'googlebot',
      'mediapartners-google',
      'adsbot-google',
      'google-inspectiontool',
      'apis-google',
      'feedfetcher-google'
    ];
    return googleBots.some(bot => userAgent.includes(bot));
  };

  // Check if user needs consent (EEA, UK, Switzerland)
  useEffect(() => {
    const checkConsentRequirement = async () => {
      // Google crawlers - automatically grant consent and skip banner
      if (isGoogleCrawler()) {
        setConsentGiven('granted');
        initializeConsentMode(true);
        return;
      }

      // Check if consent was already given
      const savedConsent = localStorage.getItem('gdpr_consent');
      if (savedConsent) {
        const consent = JSON.parse(savedConsent);
        setConsentGiven(consent.status);
        
        // Apply consent to Google Consent Mode
        applyConsentMode(consent);
        return;
      }

      // Detect if user is in EEA/UK/Switzerland
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code;
          
          // EEA countries + UK + Switzerland
          const requiresConsent = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH'
          ].includes(countryCode);

          if (requiresConsent) {
            setIsEEAUser(true);
            setShowBanner(true);
            
            // Initialize Google Consent Mode with default deny
            initializeConsentMode(false);
          } else {
            // Non-EEA users - grant consent by default
            setConsentGiven('granted');
            initializeConsentMode(true);
          }
        } else {
          // If API fails, grant consent by default (better for crawlers)
          setConsentGiven('granted');
          initializeConsentMode(true);
        }
      } catch (error) {
        // If detection fails (e.g., network error, CORS), grant consent by default
        // This ensures crawlers and users with network issues can access the site
        console.warn('Failed to detect user location, granting consent by default:', error);
        setConsentGiven('granted');
        initializeConsentMode(true);
      }
    };

    checkConsentRequirement();
  }, []);

  // Initialize Google Consent Mode
  const initializeConsentMode = (granted) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        'ad_storage': granted ? 'granted' : 'denied',
        'ad_user_data': granted ? 'granted' : 'denied',
        'ad_personalization': granted ? 'granted' : 'denied',
        'analytics_storage': granted ? 'granted' : 'denied',
        'functionality_storage': granted ? 'granted' : 'denied',
        'personalization_storage': granted ? 'granted' : 'denied',
        'security_storage': 'granted',
        'wait_for_update': 500
      });
    }
  };

  // Apply consent mode based on user choices
  const applyConsentMode = (consent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': consent.adStorage ? 'granted' : 'denied',
        'ad_user_data': consent.adUserData ? 'granted' : 'denied',
        'ad_personalization': consent.adPersonalization ? 'granted' : 'denied',
        'analytics_storage': consent.analyticsStorage ? 'granted' : 'denied',
        'functionality_storage': consent.functionalityStorage ? 'granted' : 'denied',
        'personalization_storage': consent.personalizationStorage ? 'granted' : 'denied',
        'security_storage': 'granted'
      });
    }
  };

  // Handle consent acceptance
  const handleAccept = () => {
    const consent = {
      status: 'granted',
      timestamp: new Date().toISOString(),
      adStorage: true,
      adUserData: true,
      adPersonalization: true,
      analyticsStorage: true,
      functionalityStorage: true,
      personalizationStorage: true
    };

    localStorage.setItem('gdpr_consent', JSON.stringify(consent));
    setConsentGiven('granted');
    setShowBanner(false);
    setShowManageOptions(false);
    
    applyConsentMode(consent);
    
    // Reload page to apply consent to ads
    window.location.reload();
  };

  // Handle consent rejection
  const handleReject = () => {
    const consent = {
      status: 'denied',
      timestamp: new Date().toISOString(),
      adStorage: false,
      adUserData: false,
      adPersonalization: false,
      analyticsStorage: false,
      functionalityStorage: true, // Required for basic functionality
      personalizationStorage: false
    };

    localStorage.setItem('gdpr_consent', JSON.stringify(consent));
    setConsentGiven('denied');
    setShowBanner(false);
    setShowManageOptions(false);
    
    applyConsentMode(consent);
    
    // Reload page to apply consent
    window.location.reload();
  };

  // Handle manage options
  const handleManageOptions = () => {
    setShowManageOptions(true);
  };

  // Save custom consent preferences
  const handleSavePreferences = (preferences) => {
    const consent = {
      status: 'custom',
      timestamp: new Date().toISOString(),
      ...preferences
    };

    localStorage.setItem('gdpr_consent', JSON.stringify(consent));
    setConsentGiven('custom');
    setShowBanner(false);
    setShowManageOptions(false);
    
    applyConsentMode(consent);
    
    // Reload page to apply consent
    window.location.reload();
  };

  // Don't show if consent already given or user is not in EEA
  if (!showBanner || consentGiven !== null) {
    return null;
  }

  return (
    <>
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gray-900 border-t-2 border-yellow-400 shadow-2xl">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                🍪 Cookie Consent
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                We use cookies and similar technologies to provide, protect, and improve our services. 
                By clicking "Accept All", you consent to our use of cookies for advertising, analytics, 
                and personalization. You can manage your preferences at any time.
              </p>
              <button
                onClick={() => {
                  // Trigger privacy policy modal via custom event
                  window.dispatchEvent(new CustomEvent('showPrivacyPolicy'));
                }}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Learn more in our Privacy Policy
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject All
              </button>
              <button
                onClick={handleManageOptions}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Options
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Options Modal */}
      {showManageOptions && (
        <ConsentManageModal
          onClose={() => setShowManageOptions(false)}
          onSave={handleSavePreferences}
        />
      )}
    </>
  );
}

// Manage Options Modal Component
function ConsentManageModal({ onClose, onSave }) {
  const [preferences, setPreferences] = useState({
    adStorage: false,
    adUserData: false,
    adPersonalization: false,
    analyticsStorage: false,
    functionalityStorage: true, // Required
    personalizationStorage: false
  });

  const handleToggle = (key) => {
    if (key === 'functionalityStorage') return; // Can't disable required storage
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-400">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-yellow-400" />
              Cookie Preferences
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </p>
        </div>

        {/* Preferences */}
        <div className="p-6 space-y-4">
          {/* Required Storage */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold">Required Cookies</h3>
                <p className="text-gray-400 text-sm">Essential for the website to function</p>
              </div>
              <div className="bg-green-600 px-3 py-1 rounded-full">
                <span className="text-white text-xs font-bold">Always Active</span>
              </div>
            </div>
            <p className="text-gray-300 text-xs mt-2">
              These cookies are necessary for the website to function and cannot be disabled.
            </p>
          </div>

          {/* Ad Storage */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold">Advertising Cookies</h3>
                <p className="text-gray-400 text-sm">Used for personalized ads</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.adStorage}
                  onChange={() => handleToggle('adStorage')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
            <p className="text-gray-300 text-xs mt-2">
              Allow us to show you personalized advertisements based on your interests.
            </p>
          </div>

          {/* Analytics Storage */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold">Analytics Cookies</h3>
                <p className="text-gray-400 text-sm">Help us improve our website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analyticsStorage}
                  onChange={() => handleToggle('analyticsStorage')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
            <p className="text-gray-300 text-xs mt-2">
              Help us understand how visitors interact with our website.
            </p>
          </div>

          {/* Personalization Storage */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold">Personalization Cookies</h3>
                <p className="text-gray-400 text-sm">Remember your preferences</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.personalizationStorage}
                  onChange={() => handleToggle('personalizationStorage')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
            <p className="text-gray-300 text-xs mt-2">
              Remember your preferences and settings for a better experience.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-lg transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

