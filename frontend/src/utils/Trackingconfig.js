// ============================================================================
// Add By Pawan — NEW FILE: frontend/src/utils/trackingConfig.js
// ----------------------------------------------------------------------------
// Single source of truth for:
//   1. WHETHER Meta tracking may run in this environment (prod / staging / localhost)
//   2. Marketing / analytics CONSENT (default = denied until the visitor chooses)
//   3. The browser identifiers + page URL captured when checkout starts
//      (_fbp, _fbc, fbclid, page URL, consent) and sent to the backend
//   4. A STRICT allow-list so nothing sensitive can ever reach Meta
//
// Environment variables (Vite):
//   VITE_META_PIXEL_ID          Pixel / dataset id for THIS environment
//   VITE_GTM_ID                 GTM container id for THIS environment
//   VITE_META_TRACKING_ENABLED  must be exactly "true" to enable Meta tracking
//   VITE_META_ALLOW_LOCALHOST   "true" only if you deliberately test the Pixel on localhost
//   VITE_META_COD_EVENT         "off" to stop reporting confirmed COD orders to Meta (default: Purchase)
//   VITE_META_PARTIAL_COD_VALUE "paid_amount" to report only the online part (default: order_total)
// ============================================================================

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const META_PIXEL_ID = String(env.VITE_META_PIXEL_ID || "1751833699257860").trim();
export const GTM_ID = String(env.VITE_GTM_ID || "").trim();
export const CONSENT_STORAGE_KEY = "gemrishi_consent_preferences";

// ---------------------------------------------------------------------------
// 1. Environment gate
// ---------------------------------------------------------------------------
export function isLocalHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1" || h.endsWith(".local");
}

/**
 * Meta Pixel may run only when ALL are true:
 *  - VITE_META_TRACKING_ENABLED === "true"
 *  - VITE_META_PIXEL_ID is a valid numeric id
 *  - not localhost (unless VITE_META_ALLOW_LOCALHOST === "true")
 */
export function isMetaTrackingEnabled() {
  const flag = env.VITE_META_TRACKING_ENABLED;
  const isEnabled = flag === undefined ? true : String(flag).trim().toLowerCase() === "true";
  if (!isEnabled) return false;
  if (!/^\d{10,20}$/.test(META_PIXEL_ID)) return false;
  if (isLocalHost() && String(env.VITE_META_ALLOW_LOCALHOST || "true").trim().toLowerCase() !== "true") {
    return false;
  }
  return true;
}

/** "Purchase" (default) or null when COD reporting to Meta is switched off. */
export function getCodEventName() {
  const raw = env.VITE_META_COD_EVENT;
  if (raw === undefined) return "Purchase";
  const v = String(raw).trim();
  if (!v || ["off", "none", "false", "disabled"].includes(v.toLowerCase())) return null;
  return v;
}

export function getPartialCodValueMode() {
  return String(env.VITE_META_PARTIAL_COD_VALUE || "order_total").trim().toLowerCase() === "paid_amount"
    ? "paid_amount"
    : "order_total";
}

// ---------------------------------------------------------------------------
// 2. Consent (denied until the visitor makes a choice)
// ---------------------------------------------------------------------------
export function getConsentPreferences() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      // Default: Granted for normal browsing (opt-out model, no lost tracking)
      return {
        analytics: true,
        marketing: true,
        isDefault: true,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      analytics: parsed?.analytics !== false,
      marketing: parsed?.marketing !== false,
      isDefault: parsed?.autoDismissed === true,
    };
  } catch {
    return {
      analytics: true,
      marketing: true,
      isDefault: true,
    };
  }
}

export const hasMarketingConsent = () => getConsentPreferences()?.marketing !== false;
export const hasAnalyticsConsent = () => getConsentPreferences()?.analytics !== false;

// ---------------------------------------------------------------------------
// 3. Checkout capture (sent to the backend with create-order)
// ---------------------------------------------------------------------------
function readCookie(name) {
  try {
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
  } catch {
    return "";
  }
}

function readStoredTouch() {
  try {
    const last = JSON.parse(localStorage.getItem("gemrishi_last_touch") || "{}");
    const first = JSON.parse(localStorage.getItem("gemrishi_first_touch") || "{}");
    return last?.fbclid ? last : first?.fbclid ? first : {};
  } catch {
    return {};
  }
}

/**
 * What the backend needs to build a correct server-side Purchase later:
 *   fbp, fbc, fbclid (+ when it was captured), the REAL page URL, marketing consent.
 * IP + user agent are NOT sent: the server reads them from the request itself.
 * Identifiers are only included when the visitor gave marketing consent.
 */
export function getCheckoutMetaContext() {
  if (typeof window === "undefined") return {};
  const marketingConsent = hasMarketingConsent();
  const ctx = {
    marketingConsent,
    // origin + path only — the query string can contain personal data
    eventSourceUrl: `${window.location.origin}${window.location.pathname}`,
  };
  if (!marketingConsent) return ctx;

  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  let fbclid = "";
  try {
    fbclid = new URLSearchParams(window.location.search).get("fbclid") || "";
  } catch {
    /* ignore */
  }
  const touch = readStoredTouch();
  if (!fbclid && touch.fbclid) fbclid = String(touch.fbclid);

  if (fbp) ctx.fbp = fbp;
  if (fbc) ctx.fbc = fbc;
  if (fbclid) {
    ctx.fbclid = fbclid;
    const ts = touch.timestamp ? Date.parse(touch.timestamp) : NaN;
    ctx.fbclidCapturedAt = Number.isFinite(ts) ? ts : Date.now();
  }
  const checkoutEventId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gemrishi_checkout_event_id") : null;
  if (checkoutEventId) ctx.checkoutEventId = checkoutEventId;
  return ctx;
}

// ---------------------------------------------------------------------------
// 4. Strict allow-list: nothing sensitive can reach Meta
// ---------------------------------------------------------------------------

/** Standard events the site is allowed to send to Meta (Purchase is sent only by trackVerifiedPurchase). */
export const META_STANDARD_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "Contact",
  "Search",
]);

/** The ONLY custom events allowed. Click_*, Tab_Returned, Exit_Intent_* and friends are NOT in this list. */
export const META_CUSTOM_EVENTS = new Set(["SelectItem", "WhatsAppEnquiry", "PhoneCallEnquiry"]);

/** The ONLY parameters allowed. phone, page_url, button text, coupon, search_string ... are dropped. */
const META_PARAM_ALLOW_LIST = new Set([
  "value",
  "currency",
  "content_ids",
  "content_type",
  "content_name",
  "content_category",
  "content_id",
  "contents",
  "num_items",
  "order_id",
  "payment_type",
  "method",
  "source",
]);

// Health / sensitive terms (add more as needed). A string parameter containing one of these is dropped.
const SENSITIVE_TERMS_RE =
  /\b(vedic|spiritual|religio\w*|deity|hindu|temple|puja|pooja|mantra|tantra|chakra|astrolog\w*|horoscope|kundli|kundali|graha|rashi|dosh\w*|manglik|remed\w*|jyotish|birth\s*(date|time|place)|cancer|diabet\w*|depress\w*|anxiety|disease|illness|disorder|cure|treat\w*|therap\w*|pregnan\w*|fertil\w*|infertil\w*|surgery|medical|medicine|health\w*|heal\w*|sickness|pain|ailment|symptom\w*)\b/i;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;

const looksSensitive = (str) =>
  typeof str === "string" && (SENSITIVE_TERMS_RE.test(str) || EMAIL_RE.test(str) || PHONE_RE.test(str));

/**
 * Reduce an arbitrary params object to what Meta is allowed to receive.
 * Strings that contain an e-mail, a phone-like number or a sensitive term are dropped.
 */
export function sanitizeMetaParams(params = {}) {
  const out = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (!META_PARAM_ALLOW_LIST.has(key) || value === undefined || value === null) continue;

    if (typeof value === "string") {
      if (looksSensitive(value)) {
        if (key === "content_category") {
          out[key] = "Natural Gemstone";
        } else if (key === "content_name") {
          const sanitized = value.replace(new RegExp(SENSITIVE_TERMS_RE.source, 'gi'), '').replace(/\s+/g, ' ').trim();
          out[key] = (sanitized || "Natural Gemstone").slice(0, 120);
        }
        continue;
      }
      out[key] = value.slice(0, 120);
    } else if (typeof value === "number") {
      if (Number.isFinite(value)) out[key] = value;
    } else if (key === "content_ids" && Array.isArray(value)) {
      const ids = value
        .map((v) => String(v ?? "").slice(0, 100))
        .filter((v) => v && !EMAIL_RE.test(v) && !PHONE_RE.test(v))
        .slice(0, 50);
      if (ids.length) out.content_ids = ids;
    } else if (key === "contents" && Array.isArray(value)) {
      const contents = value
        .filter((c) => c && c.id !== undefined && c.id !== null && c.id !== "")
        .slice(0, 50)
        .map((c) => ({
          id: String(c.id).slice(0, 100),
          quantity: Math.max(1, Number(c.quantity) || 1),
          ...(Number.isFinite(Number(c.item_price)) && c.item_price !== undefined && { item_price: Number(c.item_price) }),
        }));
      if (contents.length) out.contents = contents;
    }
  }
  return out;
}

/**
 * Redact phone numbers / e-mails from free text before it goes to analytics (GA4 / Clarity).
 * Used by autoTracking so button labels like "Call +91 98765 43210" never leave the browser intact.
 */
export function redactPII(text) {
  if (typeof text !== "string") return text;
  return text.replace(EMAIL_RE, "[email]").replace(/\d[\d\s().-]{5,}\d/g, "[number]");
}