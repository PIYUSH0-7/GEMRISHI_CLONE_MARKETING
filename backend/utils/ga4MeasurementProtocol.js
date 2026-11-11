import axios from "axios";
import logger from "./logger.js";

/**
 * Dispatches a server-side conversion event to Google Analytics 4 via Measurement Protocol.
 *
 * @param {Object} options
 * @param {string} options.eventName - e.g. "purchase", "refund"
 * @param {string} options.clientId - GA client_id (or fallback customer/order identifier)
 * @param {string} [options.userId] - Optional authenticated user ID / hashed email
 * @param {Object} options.eventParams - GA4 ecommerce parameters (transaction_id, value, currency, items, etc.)
 */
export async function sendGA4MeasurementEvent({
  eventName = "purchase",
  clientId,
  userId,
  eventParams = {},
}) {
  const measurementId =
    process.env.GA4_MEASUREMENT_ID ||
    process.env.VITE_GA4_MEASUREMENT_ID ||
    "G-HBLR53GHM3";
  const apiSecret = process.env.GA4_API_SECRET;

  if (!apiSecret) {
    logger.info(
      `[GA4 Server-side Protocol] Skipped ${eventName}: No GA4_API_SECRET in environment.`
    );
    return;
  }

  try {
    const payload = {
      client_id: String(clientId || `srv_${Date.now()}`),
      ...(userId && { user_id: String(userId) }),
      events: [
        {
          name: eventName,
          params: {
            engagement_time_msec: 100,
            ...eventParams,
          },
        },
      ],
    };

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    await axios.post(url, payload, {
      timeout: 6000,
      headers: { "Content-Type": "application/json" },
    });

    logger.info(
      `[GA4 Server-side Protocol] Successfully dispatched ${eventName} (tx: ${eventParams.transaction_id})`
    );
  } catch (err) {
    logger.warn(
      `[GA4 Server-side Protocol] Failed to dispatch ${eventName}: ${err.message}`
    );
  }
}

export default sendGA4MeasurementEvent;
