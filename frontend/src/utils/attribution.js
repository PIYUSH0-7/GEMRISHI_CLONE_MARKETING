/**
 * UTM Tracking and First-touch / Last-touch Attribution Engine
 */

const STORAGE_KEY_FIRST_TOUCH = "gemrishi_first_touch";
const STORAGE_KEY_LAST_TOUCH = "gemrishi_last_touch";

/**
 * Extracts UTM and ad click tracking parameters from URL query string.
 */
export function extractTrackingParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  const trackingKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
  ];

  const result = {};
  let hasAny = false;

  for (const key of trackingKeys) {
    const val = params.get(key);
    if (val) {
      result[key] = val;
      hasAny = true;
    }
  }

  return { hasAny, params: result };
}

/**
 * Determines referral source from document.referrer
 */
function getReferrerSource() {
  if (!document.referrer) return "direct";
  try {
    const refUrl = new URL(document.referrer);
    if (refUrl.hostname === window.location.hostname) {
      return "internal";
    }
    return refUrl.hostname;
  } catch (e) {
    return document.referrer;
  }
}

/**
 * Initializes attribution tracking on page load.
 * Captures first touch and maintains last touch.
 */
export function initAttribution() {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const { hasAny, params: utms } = extractTrackingParams();
    const referrer = document.referrer || "";
    const refSource = getReferrerSource();
    const landingPage = window.location.href;
    const now = new Date().toISOString();

    const touchData = {
      ...utms,
      utm_source: utms.utm_source || (refSource !== "internal" ? refSource : "direct"),
      utm_medium: utms.utm_medium || (refSource === "direct" ? "none" : "referral"),
      referrer,
      landing_page: landingPage,
      timestamp: now,
    };

    // 1. First Touch Attribution (persists permanently unless cleared)
    const existingFirstTouch = localStorage.getItem(STORAGE_KEY_FIRST_TOUCH);
    if (!existingFirstTouch) {
      localStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(touchData));
    }

    // 2. Last Touch Attribution (updated if external referrer or UTMs present)
    if (hasAny || refSource !== "internal") {
      localStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(touchData));
    }

    // 3. Push UTM event to dataLayer if UTMs present
    if (hasAny) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "utm_captured",
        ...utms,
      });
    }
  } catch (err) {
    console.warn("[Attribution] Error initializing attribution:", err);
  }
}

/**
 * Retrieves attribution data to attach to checkout and order creation payloads.
 */
export function getAttributionData() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { firstTouch: {}, lastTouch: {} };
  }

  try {
    const firstTouch = JSON.parse(localStorage.getItem(STORAGE_KEY_FIRST_TOUCH) || "{}");
    const lastTouch = JSON.parse(localStorage.getItem(STORAGE_KEY_LAST_TOUCH) || "{}");
    return { firstTouch, lastTouch };
  } catch (err) {
    return { firstTouch: {}, lastTouch: {} };
  }
}

export default {
  initAttribution,
  extractTrackingParams,
  getAttributionData,
};
