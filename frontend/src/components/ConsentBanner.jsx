import React, { useState, useEffect } from "react";

const CONSENT_STORAGE_KEY = "gemrishi_consent_preferences";

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: true,
  });

  // Restore or set default consent on page load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);

      if (!stored) {
        // First-time visitor: display banner after 600ms.
        // Stays visible until explicit user interaction (no auto-dismiss timer).
        const mountTimer = setTimeout(() => {
          setShowBanner(true);
        }, 600);
        return () => clearTimeout(mountTimer);
      }

      const prefs = JSON.parse(stored);
      if (!prefs || typeof prefs !== "object") {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        setShowBanner(true);
        return;
      }

      const restoredPreferences = {
        analytics: prefs.analytics !== false,
        marketing: prefs.marketing !== false,
      };

      setPreferences(restoredPreferences);
    } catch (error) {
      console.warn("[Consent] Consent initialization notice:", error);
      setShowBanner(true);
    }
  }, []);

  // Update Google consent, Meta Pixel consent, & localStorage
  const updateGtagConsent = (prefs) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: prefs.marketing ? "granted" : "denied",
        ad_user_data: prefs.marketing ? "granted" : "denied",
        ad_personalization: prefs.marketing ? "granted" : "denied",
        analytics_storage: prefs.analytics ? "granted" : "denied",
      });
    }

    let previouslyRevoked = false;
    try {
      const existing = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        previouslyRevoked = parsed && parsed.marketing === false;
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn("[Consent] Could not save preferences:", error);
    }

    // Meta Pixel Consent Management:
    // 1. Initial page load in index.html already grants consent for new visitors.
    // 2. If user declines or unchecks marketing, revoke consent immediately.
    // 3. Only call fbq('consent', 'grant') if consent was previously revoked.
    // This prevents redundant fbq('consent', 'grant') calls that trigger Meta fbevents
    // to re-flush/replay an unwanted duplicate PageView with an ob3_plugin-set ID.
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      if (!prefs.marketing) {
        window.fbq("consent", "revoke");
      } else if (previouslyRevoked) {
        window.fbq("consent", "grant");
      }
    }
  };

  // Smooth dismiss with chosen preferences
  const dismissWithConsent = (prefs) => {
    setIsClosing(true);
    updateGtagConsent(prefs);
    setTimeout(() => {
      setShowBanner(false);
      setShowPreferences(false);
      setIsClosing(false);
    }, 400); // 400ms smooth fade transition
  };

  // Accept all
  const handleAcceptAll = () => {
    const prefs = { analytics: true, marketing: true, explicit: true };
    setPreferences(prefs);
    dismissWithConsent(prefs);
  };

  // Decline optional cookies
  const handleRejectAll = () => {
    const prefs = { analytics: false, marketing: false, explicit: true };
    setPreferences(prefs);
    dismissWithConsent(prefs);
  };

  // Save customized preferences
  const handleSaveCustom = () => {
    const prefs = { ...preferences, explicit: true };
    dismissWithConsent(prefs);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className={`fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[99999] bg-[#0E2820] text-white p-5 rounded-2xl shadow-2xl border border-white/15 transition-all duration-400 ease-out ${
        isClosing
          ? "opacity-0 translate-y-4 pointer-events-none scale-95"
          : "opacity-100 translate-y-0 scale-100 animate-fade-in"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold tracking-wide text-[#E8D8A0]">
              Cookie & Privacy Preferences
            </h4>
            <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
              GemRishi
            </span>
          </div>

          <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
            We use cookies to enhance navigation, analyze traffic, and personalize
            your shopping experience with certified natural gemstones.
          </p>
        </div>
      </div>

      {showPreferences && (
        <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2.5 text-xs text-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Essential / Strictly Necessary</span>
            <input
              type="checkbox"
              checked
              disabled
              className="opacity-70 cursor-not-allowed accent-[#264A3F]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Analytics & Performance</span>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  analytics: e.target.checked,
                }))
              }
              className="accent-[#34D399] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Marketing & Personalization</span>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  marketing: e.target.checked,
                }))
              }
              className="accent-[#34D399] cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {showPreferences ? (
          <button
            onClick={handleSaveCustom}
            className="flex-1 bg-[#264A3F] hover:bg-[#1f3d34] text-white text-xs font-semibold py-2 px-3 rounded-lg transition active:scale-95"
          >
            Save Preferences
          </button>
        ) : (
          <>
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#E8D8A0] hover:bg-[#dac683] text-[#0E2820] text-xs font-bold py-2 px-3 rounded-lg transition active:scale-95"
            >
              Accept All
            </button>

            <button
              onClick={handleRejectAll}
              className="flex-1 bg-white/10 hover:bg-white/15 text-white text-xs font-medium py-2 px-3 rounded-lg transition active:scale-95"
            >
              Decline
            </button>

            <button
              onClick={() => {
                setShowPreferences(true);
              }}
              className="text-xs text-gray-400 hover:text-white underline px-1 py-1"
            >
              Customize
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
