import axios from "axios";
import logger from "./logger.js";
// ---------------------------------------------------------------------------
// Add By Pawan (START) — all hashing / normalisation / validation now lives in
// metaCapiCore.js (pure, unit-testable). This file only decides WHETHER to send
// and performs the HTTP call.
// ---------------------------------------------------------------------------
import {
  resolveCapiConfig,
  shouldSendForConsent,
  buildCapiEvent,
  getClientIpFromRequest,
  sanitizeEventSourceUrl,
  sanitizeUserAgent,
} from "./metacapicore.js";
// Add By Pawan (END)

// ---------------------------------------------------------------------------
// One-time startup diagnostic: tells you in the server log WHY CAPI is off
// (the most common reason events never reach Meta is a missing .env value).
// The access token itself is never logged.
// ---------------------------------------------------------------------------
// Add By Pawan — Meta CAPI startup diagnostic
 export function logMetaCapiStartupStatus() {
  const startupCfg = resolveCapiConfig(process.env);

  if (startupCfg.enabled) {
    logger.info(
      `[Meta CAPI] ENABLED -> dataset ${startupCfg.datasetId}, Graph ${startupCfg.apiVersion}` +
        (startupCfg.testEventCode ? ", TEST MODE" : "")
    );
  } else {
    logger.warn(
      `[Meta CAPI] DISABLED: ${startupCfg.reason}. No server events will be sent to Meta.`
    );
  }
}

// ---------------------------------------------------------------------------
// Add By Pawan (START) — helper for controllers: pull the trustworthy request
// context (client IP, user agent, validated page URL) out of an Express req.
// The client IP comes from req.ip (honours app.set("trust proxy", N)); a raw
// X-Forwarded-For header is never trusted directly.
// ---------------------------------------------------------------------------
export function getRequestContextForMeta(req) {
  const candidateUrl =
    req?.body?.eventSourceUrl ||
    req?.body?.metaContext?.eventSourceUrl ||
    req?.headers?.referer ||
    req?.headers?.origin ||
    null;

  return {
    clientIp: getClientIpFromRequest(req),
    userAgent: sanitizeUserAgent(req?.headers?.["user-agent"]),
    eventSourceUrl: sanitizeEventSourceUrl(candidateUrl),
  };
}
// Add By Pawan (END)

/**
 * Sends a server-side conversion event to Meta Conversions API (CAPI).
 *
 * Add By Pawan: returns a structured result instead of raw axios data
 *   { ok: true,  data }                 event accepted by Meta
 *   { ok: false, skipped: true, reason } nothing sent (disabled / no consent / invalid)
 *   { ok: false, error }                 Meta/network error
 * Existing callers ignore the return value, so they keep working unchanged.
 *
 * @param {Object} options
 * @param {string} options.eventName - "Purchase" | "AddToCart" | "Lead" | ...
 * @param {string} options.eventId   - Unique ID for browser/server deduplication (orderId for Purchase)
 * @param {string} [options.eventSourceUrl] - Real GemRishi page URL where the event happened
 * @param {Object} [options.userData] - { email, phone, fullName|firstName+lastName, city, state, zip|pinCode,
 *                                        country, externalId, clientIp, userAgent, fbp, fbc }
 * @param {Object} [options.customData] - { currency, value, contents, content_ids, content_type, num_items, order_id, payment_type }
 * @param {boolean} [options.consent] - marketing consent captured in the browser (true/false/undefined)
 */
export async function sendMetaCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData = {},
  customData = {},
  consent,
  eventTime,
}) {
  // ---- Add By Pawan (START): environment separation — NO production fallback ----
  const cfg = resolveCapiConfig(process.env);
  if (!cfg.enabled) {
    logger.info(`[Meta CAPI] Skipped ${eventName} (${eventId}): ${cfg.reason}`);
    return { ok: false, skipped: true, reason: cfg.reason };
  }
  // ---- Add By Pawan (END) ----

  // ---- Add By Pawan (START): consent gate ----
  if (!shouldSendForConsent(consent, process.env)) {
    logger.info(`[Meta CAPI] Skipped ${eventName} (${eventId}): marketing consent not granted`);
    return { ok: false, skipped: true, reason: "no_marketing_consent" };
  }
  // ---- Add By Pawan (END) ----

  try {
    // ---- Add By Pawan (START): build + validate payload (hashing, fbp/fbc, source URL, IP) ----
    const { event, usedFallbackUrl } = buildCapiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      userData,
      customData,
      eventTime,
      env: process.env,
    });
    if (usedFallbackUrl) {
      logger.warn(`[Meta CAPI] ${eventName} (${eventId}): no valid event_source_url supplied, used site root`);
    }
    if (!event.user_data.client_ip_address || !event.user_data.client_user_agent) {
      logger.info(
        `[Meta CAPI] ${eventName} (${eventId}): sent without ${
          !event.user_data.client_ip_address ? "client_ip_address " : ""
        }${!event.user_data.client_user_agent ? "client_user_agent" : ""}`.trim()
      );
    }
    // ---- Add By Pawan (END) ----

    const requestBody = {
      data: [event],
      // Add By Pawan: token goes in the body, not the URL, so it can never leak into URL logs.
      access_token: cfg.accessToken,
      ...((testEventCode || cfg.testEventCode) && { test_event_code: (testEventCode || cfg.testEventCode) }),
    };

    const response = await axios.post(
      `https://graph.facebook.com/${cfg.apiVersion}/${cfg.datasetId}/events`,
      requestBody,
      {
        timeout: 7000,
        headers: { "Content-Type": "application/json" },
      }
    );

    logger.info(
      `[Meta CAPI] Success: ${eventName} (eventId: ${eventId}) -> events_received: ${response.data?.events_received}`
    );
    return { ok: true, data: response.data };
  } catch (error) {
    const errorDetails = error.response?.data?.error || error.message;
    logger.warn(
      `[Meta CAPI] Failed to dispatch ${eventName} (eventId: ${eventId}): ${JSON.stringify(errorDetails)}`
    );
    return { ok: false, error: errorDetails };
  }
}

export default sendMetaCapiEvent;
