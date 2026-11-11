// ============================================================================
// Add By Pawan — NEW FILE: backend/utils/metaCapiCore.js
// ----------------------------------------------------------------------------
// Pure helper functions for the Meta Conversions API (CAPI).
// This file has NO third-party imports (only Node built-ins) so it can be
// unit-tested without a database or network:   node --test tests/metaCapi.test.js
//
// It contains:
//   * Meta-spec normalisation + SHA-256 hashing of customer identifiers
//   * fbp / fbc / fbclid validation (these are NEVER hashed)
//   * Safe client-IP and event_source_url validation
//   * Environment configuration (production / staging / localhost separation)
//   * The event payload builder
// ============================================================================
import crypto from "crypto";
import net from "net";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Server-side events we are willing to send to Meta. */
export const ALLOWED_CAPI_EVENTS = new Set([
  "Purchase",
  "PageView",
  "AddToCart",
  "Lead",
  "ViewContent",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Refund", // existing custom event kept for backward compatibility
]);

/**
 * Resolve CAPI configuration from the environment.
 * Nothing falls back to a production dataset: if META_DATASET_ID or
 * META_CAPI_ACCESS_TOKEN is missing, or META_CAPI_ENABLED is not exactly
 * "true", CAPI is OFF and every call is a safe no-op.
 */
export function resolveCapiConfig(env = process.env) {
  const enabledEnv = env.META_CAPI_ENABLED;
  const datasetId = String(env.META_DATASET_ID || env.FB_PIXEL_ID || "").trim();
  const accessToken = String(
    env.META_CAPI_ACCESS_TOKEN || env.FB_ACCESS_TOKEN || env.FACEBOOK_ACCESS_TOKEN || ""
  ).trim();
  const testEventCode = String(env.META_TEST_EVENT_CODE || env.FB_TEST_EVENT_CODE || "").trim();
  const apiVersion = /^v\d+\.\d+$/.test(String(env.META_GRAPH_API_VERSION || "").trim())
    ? String(env.META_GRAPH_API_VERSION).trim()
    : "v25.0";

  const enabledFlag =
    enabledEnv === undefined
      ? Boolean(datasetId && accessToken)
      : String(enabledEnv).trim().toLowerCase() === "true";

  let reason = null;
  if (!enabledFlag) reason = "META_CAPI_ENABLED is not 'true'";
  else if (!/^\d{10,20}$/.test(datasetId)) reason = "META_DATASET_ID / FB_PIXEL_ID missing or invalid";
  else if (!accessToken) reason = "META_CAPI_ACCESS_TOKEN / FB_ACCESS_TOKEN missing";

  return {
    enabled: reason === null,
    reason,
    datasetId,
    accessToken,
    testEventCode: testEventCode || null,
    apiVersion,
  };
}

/** Hosts that are allowed as event_source_url (the real GemRishi website). */
export function resolveAllowedSourceHosts(env = process.env) {
  const hosts = new Set(["gemrishi.com", "www.gemrishi.com"]);
  const extra = String(env.META_ALLOWED_SOURCE_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  extra.forEach((h) => hosts.add(h));
  return hosts;
}

/** Site origin used only when the real source URL is genuinely unknown. */
export function resolveSiteOrigin(env = process.env) {
  const raw = String(env.META_SITE_ORIGIN || "https://gemrishi.com").trim();
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u.origin : "https://gemrishi.com";
  } catch {
    return "https://gemrishi.com";
  }
}

/**
 * Consent rule for server events.
 *   consent === false     -> never send
 *   consent === true      -> send
 *   consent undefined/null (unknown) -> send unless META_CAPI_REQUIRE_CONSENT=true
 */
export function shouldSendForConsent(consent, env = process.env) {
  if (consent === false) return false;
  if (consent === true) return true;
  return String(env.META_CAPI_REQUIRE_CONSENT || "").trim().toLowerCase() !== "true";
}

/**
 * Which event name a confirmed full-COD order is reported as.
 * Default "Purchase" (with payment_type: "cod" so it stays distinguishable).
 * Set META_COD_EVENT_NAME=off to stop sending anything for COD orders.
 */
export function resolveCodEventName(env = process.env) {
  if (env.META_COD_EVENT_NAME === undefined) return "Purchase";
  const v = String(env.META_COD_EVENT_NAME).trim();
  if (!v || ["off", "none", "false", "disabled"].includes(v.toLowerCase())) return null;
  return v;
}

// ---------------------------------------------------------------------------
// Hashing + normalisation (per Meta Conversions API customer-information spec)
// ---------------------------------------------------------------------------

export function sha256(value) {
  if (value === undefined || value === null || value === "") return null;
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email) {
  if (!email) return null;
  const v = String(email).trim().toLowerCase();
  return EMAIL_RE.test(v) ? v : null;
}

/**
 * Indian-aware phone normalisation. Returns digits including country code,
 * or null if the number cannot be trusted. Never invents digits.
 *   9876543210        -> 919876543210
 *   09876543210       -> 919876543210
 *   +91 98765-43210   -> 919876543210
 *   0091 9876543210   -> 919876543210
 *   +1 415 555 2671   -> 14155552671   (already has a country code)
 */
export function normalizePhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  digits = digits.replace(/^0+/, ""); // trunk prefix (0) and international prefix (00)
  if (!digits) return null;

  if (digits.length === 10) {
    return /^[6-9]/.test(digits) ? `91${digits}` : null; // unknown country for a non-Indian 10-digit number
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^[6-9]/.test(digits[2]) ? digits : null;
  }
  if (digits.length >= 8 && digits.length <= 15) return digits; // assume country code already present
  return null;
}

export function normalizeName(name) {
  if (!name) return null;
  const v = String(name)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return v || null;
}

/** "Rahul Kumar Sharma" -> { first: "rahul", last: "kumar sharma" } */
export function splitFullName(fullName) {
  const n = normalizeName(fullName);
  if (!n) return { first: null, last: null };
  const parts = n.split(" ");
  return { first: parts[0] || null, last: parts.length > 1 ? parts.slice(1).join(" ") : null };
}

/** city / state: lowercase letters only, no spaces or punctuation. */
export function normalizeAlphaOnly(value) {
  if (!value) return null;
  const v = String(value).normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}]/gu, "");
  return v || null;
}

export function normalizeZip(zip) {
  if (!zip) return null;
  const v = String(zip).toLowerCase().replace(/[^a-z0-9]/g, "");
  return v || null;
}

const COUNTRY_NAME_TO_ISO = {
  india: "in",
  "united states": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
  "united arab emirates": "ae",
  uae: "ae",
  canada: "ca",
  australia: "au",
  singapore: "sg",
};

export function normalizeCountry(country) {
  if (!country) return null;
  const v = String(country).trim().toLowerCase();
  if (/^[a-z]{2}$/.test(v)) return v;
  return COUNTRY_NAME_TO_ISO[v] || null;
}

/** external_id: opaque id only. An e-mail address is rejected, never sent raw. */
export function normalizeExternalId(id) {
  if (id === undefined || id === null) return null;
  const v = String(id).trim();
  if (!v || v.includes("@") || v.length > 128) return null;
  return v;
}

// ---------------------------------------------------------------------------
// Browser identifiers (fbp / fbc / fbclid) — NEVER hashed
// ---------------------------------------------------------------------------

const FBP_RE = /^fb\.\d\.\d{10,13}\.\d{4,20}$/;
const FBC_RE = /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{8,500}$/;
const FBCLID_RE = /^[A-Za-z0-9_-]{8,500}$/;

export const sanitizeFbp = (v) => (typeof v === "string" && FBP_RE.test(v.trim()) ? v.trim() : null);
export const sanitizeFbc = (v) => (typeof v === "string" && FBC_RE.test(v.trim()) ? v.trim() : null);
export const sanitizeFbclid = (v) => (typeof v === "string" && FBCLID_RE.test(v.trim()) ? v.trim() : null);

/** Build the fbc value from a captured fbclid + the time (ms) it was captured. */
export function buildFbc(fbclid, capturedAtMs) {
  const id = sanitizeFbclid(fbclid);
  const ts = Number(capturedAtMs);
  if (!id || !Number.isFinite(ts) || ts <= 0) return null;
  return `fb.1.${Math.floor(ts)}.${id}`;
}

// ---------------------------------------------------------------------------
// Client IP / user agent / source URL
// ---------------------------------------------------------------------------

function isPrivateOrLocalIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) // carrier-grade NAT
    );
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}

/** Returns a single, public, valid IP string — or null. Rejects "a, b, c" lists. */
export function sanitizeClientIp(ip) {
  if (!ip || typeof ip !== "string") return null;
  let v = ip.trim();
  if (v.toLowerCase().startsWith("::ffff:") && net.isIPv4(v.slice(7))) v = v.slice(7);
  if (!net.isIP(v)) return null;
  return isPrivateOrLocalIp(v) ? null : v;
}

/**
 * Safe client IP from an Express request.
 * Uses req.ip (which honours app.set("trust proxy", N) — i.e. only the proxy
 * hops YOU configured). A raw X-Forwarded-For header is never read directly.
 * If your edge sets a single-IP header you trust (e.g. Cloudflare's
 * CF-Connecting-IP), name it in META_CLIENT_IP_HEADER.
 */
export function getClientIpFromRequest(req, env = process.env) {
  if (!req) return null;
  const headerName = String(env.META_CLIENT_IP_HEADER || "").trim().toLowerCase();
  if (headerName && req.headers && typeof req.headers[headerName] === "string") {
    const fromHeader = sanitizeClientIp(req.headers[headerName]);
    if (fromHeader) return fromHeader;
  }
  return sanitizeClientIp(req.ip || req.socket?.remoteAddress || "");
}

export function sanitizeUserAgent(ua) {
  if (!ua || typeof ua !== "string") return null;
  // eslint-disable-next-line no-control-regex
  const v = ua.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 512);
  return v || null;
}

const PII_IN_PATH_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\d{10,})/;

/**
 * Validate an event_source_url. Only real GemRishi website URLs pass.
 * The query string and hash are removed (they can carry personal data);
 * a path that contains an e-mail address or a 10+ digit number is reduced
 * to the site root.
 * Returns the cleaned URL, or null when invalid.
 */
export function sanitizeEventSourceUrl(url, env = process.env) {
  if (!url || typeof url !== "string" || url.length > 2048) return null;
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const isDevLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (u.protocol !== "https:" && !(isDevLocal && u.protocol === "http:")) return null;
  if (u.username || u.password) return null;
  if (!resolveAllowedSourceHosts(env).has(u.hostname.toLowerCase())) return null;

  let path = u.pathname || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw path */
  }
  if (PII_IN_PATH_RE.test(path)) return `${u.origin}/`;
  return `${u.origin}${u.pathname}`;
}

// ---------------------------------------------------------------------------
// user_data + event builders
// ---------------------------------------------------------------------------

/**
 * Build Meta `user_data` from raw customer fields.
 * Hashed (SHA-256): em, ph, fn, ln, ct, st, zp, country, external_id
 * NOT hashed:       client_ip_address, client_user_agent, fbp, fbc
 * Fields that are missing/invalid are simply omitted (nothing is invented).
 */
export function buildUserData(input = {}, eventName = "") {
  // Fix Errors 3 & 4: Browsing events (PageView, ViewContent) must NEVER attach
  // customer emails or phone numbers. Repeated PII on browsing triggers Meta duplicate warnings.
  const isBrowsingEvent = eventName === "PageView" || eventName === "ViewContent";
  const rawInput = isBrowsingEvent
    ? { clientIp: input.clientIp, userAgent: input.userAgent, fbp: input.fbp, fbc: input.fbc }
    : input;

  const {
    email,
    phone,
    fullName,
    firstName,
    lastName,
    city,
    state,
    zip,
    pinCode,
    country,
    externalId,
    clientIp,
    userAgent,
    fbp,
    fbc,
  } = rawInput;

  let fn = normalizeName(firstName);
  let ln = normalizeName(lastName);
  if (!fn && fullName) {
    const split = splitFullName(fullName);
    fn = split.first;
    ln = ln || split.last;
  } else if (fn && !ln && !lastName && fn.includes(" ")) {
    const split = splitFullName(fn);
    fn = split.first;
    ln = split.last;
  }

  const em = sha256(normalizeEmail(email));
  const ph = sha256(normalizePhone(phone));
  const hFn = sha256(fn);
  const hLn = sha256(ln);
  const ct = sha256(normalizeAlphaOnly(city));
  const st = sha256(normalizeAlphaOnly(state));
  const zp = sha256(normalizeZip(zip || pinCode));
  const co = sha256(normalizeCountry(country));
  const ext = sha256(normalizeExternalId(externalId));
  const ip = sanitizeClientIp(clientIp);
  const ua = sanitizeUserAgent(userAgent);
  const cleanFbp = sanitizeFbp(fbp);
  const cleanFbc = sanitizeFbc(fbc);

  return {
    ...(em && { em: [em] }),
    ...(ph && { ph: [ph] }),
    ...(hFn && { fn: [hFn] }),
    ...(hLn && { ln: [hLn] }),
    ...(ct && { ct: [ct] }),
    ...(st && { st: [st] }),
    ...(zp && { zp: [zp] }),
    ...(co && { country: [co] }),
    ...(ext && { external_id: [ext] }),
    ...(ip && { client_ip_address: ip }),
    ...(ua && { client_user_agent: ua }),
    ...(cleanFbp && { fbp: cleanFbp }),
    ...(cleanFbc && { fbc: cleanFbc }),
  };
}

const finiteNumber = (n) => (typeof n === "number" ? Number.isFinite(n) : n !== "" && n != null && Number.isFinite(Number(n)));

/** Strict allow-list for custom_data. Anything else is dropped. */
const SENSITIVE_TERMS_RE =
  /\b(vedic|spiritual|religio\w*|deity|hindu|temple|puja|pooja|mantra|tantra|chakra|astrolog\w*|horoscope|kundli|kundali|graha|rashi|dosh\w*|manglik|remed\w*|jyotish|birth\s*(date|time|place)|cancer|diabet\w*|depress\w*|anxiety|disease|illness|cure|treat\w*|therap\w*|pregnan\w*|fertil\w*|surgery|medical|medicine)\b/gi;

function sanitizeSensitiveString(val, fallback = "Natural Gemstone") {
  if (!val || typeof val !== "string") return fallback;
  const cleaned = val.replace(new RegExp(SENSITIVE_TERMS_RE.source, 'gi'), '').replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

/** Strict allow-list for custom_data. Content name and category are sanitized against sensitive religious policies. */
export function buildCustomData(customData = {}) {
  const out = { currency: String(customData.currency || "INR").toUpperCase() };
  if (finiteNumber(customData.value)) out.value = Math.round(Number(customData.value) * 100) / 100;
  if (Array.isArray(customData.contents) && customData.contents.length) {
    out.contents = customData.contents
      .filter((c) => c && c.id)
      .map((c) => ({
        id: String(c.id),
        quantity: Math.max(1, Math.round(Number(c.quantity) || 1)),
        ...(finiteNumber(c.item_price) && { item_price: Math.round(Number(c.item_price) * 100) / 100 }),
      }));
  }
  if (Array.isArray(customData.content_ids) && customData.content_ids.length) {
    out.content_ids = customData.content_ids.map(String);
  }
  if (customData.content_type) out.content_type = String(customData.content_type);
  if (finiteNumber(customData.num_items)) out.num_items = Math.round(Number(customData.num_items));
  if (customData.order_id) out.order_id = String(customData.order_id);
  if (customData.payment_type) out.payment_type = String(customData.payment_type);
  if (customData.content_name) {
    out.content_name = sanitizeSensitiveString(customData.content_name, "Gemstone Consultation").slice(0, 100);
  }
  if (customData.content_category) {
    out.content_category = sanitizeSensitiveString(customData.content_category, "Precious Gemstone").slice(0, 100);
  }
  return out;
}

/**
 * Build one CAPI event object (the thing that goes into `data: [...]`).
 * Throws if the event name is not allowed or eventSourceUrl is not provided.
 */
export function buildCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData = {},
  customData = {},
  eventTime,
  env = process.env,
}) {
  if (!ALLOWED_CAPI_EVENTS.has(eventName)) {
    throw new Error(`Event "${eventName}" is not in the CAPI allow-list`);
  }

  let sourceUrl = sanitizeEventSourceUrl(eventSourceUrl, env);
  let usedFallbackUrl = false;
  if (!sourceUrl) {
    // The real URL is unknown or invalid; fall back to the site root rather than send a bad/foreign URL.
    sourceUrl = `${resolveSiteOrigin(env)}/`;
    usedFallbackUrl = true;
  }

  const event = {
    event_name: eventName,
    event_time: Number.isFinite(Number(eventTime)) && Number(eventTime) > 0 ? Math.floor(Number(eventTime)) : Math.floor(Date.now() / 1000),
    event_id: String(eventId || crypto.randomUUID()),
    event_source_url: sourceUrl,
    action_source: "website",
    user_data: buildUserData(userData, eventName),
    custom_data: buildCustomData(customData),
  };
  return { event, usedFallbackUrl };
}

// ---------------------------------------------------------------------------
// Purchase value rules
// ---------------------------------------------------------------------------

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Decide the Purchase value from the SERVER's order record. Never from the cart.
 *  - Full COD                 : server final total
 *  - Partial COD (online part): server final total (default) or the verified online amount
 *                               when META_PARTIAL_COD_VALUE=paid_amount
 *  - Prepaid online           : the verified paid amount (falls back to the server total)
 * Returns { value, basis } or { value: null, basis } when no valid positive value exists.
 */
export function resolvePurchaseValue(order, env = process.env) {
  const total = Number(order?.totalAmount);
  const paid = Number(order?.paidAmount);
  const online = Number(order?.onlinePayAmount);
  const isCod = order?.paymentMethod === "cod";
  const partial = !!order?.partialPay;

  let value;
  let basis;
  if (isCod && !partial) {
    value = total;
    basis = "order_total_cod";
  } else if (partial) {
    const mode = String(env.META_PARTIAL_COD_VALUE || "order_total").trim().toLowerCase();
    if (mode === "paid_amount") {
      value = paid > 0 ? paid : online;
      basis = "verified_online_part";
    } else {
      value = total;
      basis = "order_total_partial_cod";
    }
  } else {
    value = paid > 0 ? paid : total;
    basis = paid > 0 ? "verified_paid_amount" : "order_total";
  }

  if (!Number.isFinite(value) || value <= 0) return { value: null, basis };
  return { value: round2(value), basis };
}

/** "prepaid" | "partial_cod" | "cod" — keeps COD and online revenue distinguishable. */
export function resolvePaymentType(order) {
  if (order?.paymentMethod === "cod" && !order?.partialPay) return "cod";
  if (order?.partialPay) return "partial_cod";
  return "prepaid";
}

/** Purchase contents from the server's order items (unit price, no free gifts). */
export function buildPurchaseContents(items = []) {
  const contents = [];
  for (const item of items || []) {
    const id = item?.productId || item?.jewelryId;
    const qty = Math.max(1, Math.round(Number(item?.quantity) || 1));
    const lineTotal = Number(item?.itemTotal);
    if (!id || !Number.isFinite(lineTotal) || lineTotal <= 0) continue; // skips complimentary gifts / invalid lines
    contents.push({
      id: String(id?._id || id),
      quantity: qty,
      item_price: round2(lineTotal / qty),
    });
  }
  return contents;
}

// ---------------------------------------------------------------------------
// Checkout capture: what we persist with the order when checkout starts
// ---------------------------------------------------------------------------

function parseCaptureTime(value, now) {
  const n = Number(value);
  const min = Date.UTC(2020, 0, 1);
  if (Number.isFinite(n) && n >= min && n <= now + 24 * 3600 * 1000) return n;
  return null;
}

/**
 * Build the `metaTracking` object stored on the order at checkout.
 *  - Browser-supplied values (fbp, fbc, fbclid, page URL, consent) are validated, never trusted blindly.
 *  - IP and user agent come from the SERVER's view of the request, not from the body.
 *  - Nothing is invented: absent values stay absent.
 *
 * @param {Object} p
 * @param {Object} [p.metaContext]  req.body.metaContext from the frontend
 * @param {Object} [p.server]       { clientIp, userAgent, eventSourceUrl } from the request (already sanitised)
 * @param {string} [p.userId]       opaque internal customer id
 */
export function buildOrderMetaTracking({ metaContext, server = {}, userId, env = process.env, now = Date.now() } = {}) {
  const mc = metaContext && typeof metaContext === "object" ? metaContext : {};
  const fbclid = sanitizeFbclid(mc.fbclid);
  const capturedAt = fbclid ? parseCaptureTime(mc.fbclidCapturedAt, now) || now : null;

  const raw = {
    fbp: sanitizeFbp(mc.fbp),
    fbc: sanitizeFbc(mc.fbc),
    fbclid,
    fbclidCapturedAt: capturedAt ? new Date(capturedAt) : null,
    clientIp: sanitizeClientIp(server.clientIp),
    userAgent: sanitizeUserAgent(server.userAgent) || sanitizeUserAgent(mc.userAgent),
    eventSourceUrl: sanitizeEventSourceUrl(mc.eventSourceUrl, env) || sanitizeEventSourceUrl(server.eventSourceUrl, env),
    externalId: normalizeExternalId(userId),
    consent: typeof mc.marketingConsent === "boolean" ? mc.marketingConsent : null,
  };

  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out;
}