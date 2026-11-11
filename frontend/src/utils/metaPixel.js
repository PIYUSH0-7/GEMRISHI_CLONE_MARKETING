import {
  hasMarketingConsent,
  isMetaTrackingEnabled,
  META_CUSTOM_EVENTS,
  META_PIXEL_ID,
  META_STANDARD_EVENTS,
  sanitizeMetaParams,
} from "./Trackingconfig.js";

const META_PIXEL_SCRIPT_ID = "gemrishi-meta-pixel";
const META_PIXEL_INITIALIZED_KEY = "__GEMRISHI_META_PIXEL_INITIALIZED_ID";

let metaDisabledLogged = false;
function isMetaAllowed() {
  if (typeof window === "undefined") return false;
  const enabled = isMetaTrackingEnabled();
  const consent = hasMarketingConsent();
  if (!enabled && !metaDisabledLogged) {
    metaDisabledLogged = true;
    console.info(
      "[MetaPixel] Disabled: set VITE_META_TRACKING_ENABLED=true and a numeric VITE_META_PIXEL_ID, then rebuild (Vite bakes env vars in at build time)."
    );
  }
  return enabled && consent;
}

export function initializeMetaPixel() {
  if (!isMetaAllowed()) return false;

  if (typeof window.fbq !== "function") {
    const fbq = function (...args) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    if (!document.getElementById(META_PIXEL_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = META_PIXEL_SCRIPT_ID;
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }
  }

  if (window[META_PIXEL_INITIALIZED_KEY] !== META_PIXEL_ID) {
    window.fbq("init", META_PIXEL_ID);
    window[META_PIXEL_INITIALIZED_KEY] = META_PIXEL_ID;
  }

  return true;
}

export function getActiveTestCode() {
  if (typeof window === "undefined") return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get("test_event_code");
    if (fromUrl) {
      sessionStorage.setItem("meta_test_event_code", fromUrl);
      return fromUrl;
    }
    const fromStorage = sessionStorage.getItem("meta_test_event_code");
    if (fromStorage) return fromStorage;
    // Only use env test code in development/localhost mode to protect real production data
    if (import.meta.env?.DEV || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const fromEnv = import.meta.env?.VITE_META_TEST_EVENT_CODE;
      if (fromEnv) return fromEnv;
    }
  } catch (e) {}
  return null;
}

function getEventOptions(options) {
  const eventID = options?.eventID;
  if (
    typeof eventID !== "string" ||
    !eventID.trim() ||
    eventID.length > 120 ||
    /[\s@]/.test(eventID)
  ) {
    return undefined;
  }
  return { eventID: eventID.trim() };
}


function forwardToServerCapi(eventName, params, options, testCode) {
  if (typeof window === "undefined") return;
  try {
    const apiUrl = import.meta.env?.VITE_URL || "/api/v1";
    const endpoint = `${apiUrl}/analytics/meta-event`;
    const eventId = options?.eventID;
    
    let fbp = "";
    let fbc = "";
    try {
      const matchFbp = document.cookie.split("; ").find((r) => r.startsWith("_fbp="));
      if (matchFbp) fbp = decodeURIComponent(matchFbp.slice(5));
      const matchFbc = document.cookie.split("; ").find((r) => r.startsWith("_fbc="));
      if (matchFbc) fbc = decodeURIComponent(matchFbc.slice(5));
    } catch (e) {}

    const payload = {
      eventName,
      eventId,
      customData: params,
      testEventCode: testCode || undefined,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      eventSourceUrl: window.location.href.split("?")[0],
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Non-blocking
  }
}

// ================= Meta Pixel & Advanced Matching Helper ===========================
export function fbqTrack(eventName, params = {}, options = undefined) {
  if (!META_STANDARD_EVENTS.has(eventName) || !initializeMetaPixel()) return;

  const safeParams = sanitizeMetaParams(params);
  const testCode = getActiveTestCode();
  if (testCode && !safeParams.test_event_code) safeParams.test_event_code = testCode;

  // Deduplication Event ID
  const eventId = options?.eventID || `gem_${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const safeOptions = { eventID: eventId };

  try {
    window.fbq("track", eventName, safeParams, safeOptions);
    if (window.__IS_DEV__) {
      console.log(`[MetaPixel] ${eventName} fired`, safeParams, safeOptions);
    }
  } catch (err) {
    console.warn(`[MetaPixel] Error tracking "${eventName}":`, err);
  }

  // Dual-dispatch: Server CAPI guarantees delivery even if browser blocks Meta.
  // PageView is strictly a browser lifecycle event in SPAs; excluding it from the CAPI
  // forward bridge eliminates duplicate virtual-route page views and prevents OpenBridge collisions.
  // Crucial conversion events (ViewContent, AddToCart, InitiateCheckout, Lead, Purchase)
  // maintain full browser + server CAPI dual-dispatch with deduplication.
  if (eventName !== "PageView") {
    forwardToServerCapi(eventName, safeParams, safeOptions, testCode);
  }
}

export function fbqTrackCustom(customEventName, params = {}, options = undefined) {
  if (!META_CUSTOM_EVENTS.has(customEventName) || !initializeMetaPixel()) return;

  const safeParams = sanitizeMetaParams(params);
  const testCode = getActiveTestCode();
  if (testCode && !safeParams.test_event_code) safeParams.test_event_code = testCode;
  const safeOptions = getEventOptions(options);
  try {
    if (safeOptions) {
      window.fbq("trackCustom", customEventName, safeParams, safeOptions);
    } else {
      window.fbq("trackCustom", customEventName, safeParams);
    }
    if (window.__IS_DEV__) {
      console.log(`[MetaPixel Custom] ${customEventName} fired`, safeParams, safeOptions);
    }
  } catch (err) {
    console.warn(`[MetaPixel Custom] Error tracking "${customEventName}":`, err);
  }
}

/**
 * Initializes Google Enhanced Conversions and Clarity from authenticated user state.
 * Meta customer matching is handled by the backend Conversions API.
 */
export function initAdvancedMatching() {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return;

    let user = JSON.parse(raw);
    if (user?.user) user = user.user;

    const email = user.email || "";
    const phone = user.mobileNo || user.phone || "";
    const name = user.fullName || user.name || "";

    if (!email && !phone) return;

    const parts = (name || "").trim().split(/\s+/);
    const fn = parts[0] || "";
    const ln = parts.slice(1).join(" ") || "";
    const rawDigits = String(phone).replace(/\D/g, "");
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

    // Google Enhanced Conversions dataLayer push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      user_data: {
        email: email ? email.trim().toLowerCase() : undefined,
        phone_number: cleanPhone ? `+${cleanPhone}` : undefined,
        address: {
          first_name: fn || undefined,
          last_name: ln || undefined,
          country: "IN",
        },
      },
    });

    // Clarity identify
    if (typeof window.clarity === "function") {
      window.clarity("identify", email || cleanPhone);
      window.clarity("set", "auth_status", "logged_in");
    }

    if (window.__IS_DEV__) {
      console.log("[Advanced Matching] Customer PII match initialized.");
    }
  } catch (e) {
    console.warn("[Advanced Matching notice]:", e);
  }
}

export default {
  initializeMetaPixel,
  fbqTrack,
  fbqTrackCustom,
  initAdvancedMatching,
};