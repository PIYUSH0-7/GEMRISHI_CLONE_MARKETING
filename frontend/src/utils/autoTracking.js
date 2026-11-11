import { fbqTrackCustom } from "./metaPixel.js";

/**
 * Universal Advanced Auto-Interaction, Telemetry & Behavioral Analytics Engine
 * 1. Meta Pixel (Action-specific event names + rich parameters)
 * 2. Google Analytics 4 / Google Tag Manager (dataLayer ecommerce + user_action events)
 * 3. Microsoft Clarity (Deep session tagging, VIP visitor classification, exit-intent, rage clicks, multi-tab shopping)
 * 4. Real-time Session Heartbeat & 1-Click Video Replay Sync
 * 5. Instant Session-to-Mobile Identification (converts session ID -> phone number)
 * 6. Admin IP Exclude Filter (blocks tracking for developer/admin browsers)
 */

let isInitialized = false;
let exitIntentFired = false;
let lastClickTarget = null;
let lastClickTime = 0;
let clickCount = 0;
let tabLeaveTime = 0;
let identifiedPhone = null;
let sessionPageEnteredAt = Date.now();
const recentClicksBuffer = [];
const viewedGemstonesBuffer = [];
const reportedErrors = new Set();

const BACKEND_BASE = import.meta.env.VITE_URL || "/api/v1";

// Check if current browser is excluded from tracking (Admin/Developer mode)
export function isTrackingExcluded() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("gemrishi_exclude_tracking") === "true";
  } catch (e) {
    return false;
  }
}

// Generate or retrieve persistent Session ID for visitor journey tracking
export function getSessionId() {
  if (typeof window === "undefined") return "sess_ssr";
  try {
    let sId = sessionStorage.getItem("gemrishi_session_id");
    if (!sId) {
      sId = `sess_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      sessionStorage.setItem("gemrishi_session_id", sId);
    }
    return sId;
  } catch (e) {
    return `sess_${Date.now()}`;
  }
}

// Send non-blocking telemetry heartbeat to backend
export function sendSessionHeartbeat(extra = {}) {
  if (typeof window === "undefined" || isTrackingExcluded()) return;

  try {
    const sessionId = getSessionId();
    const now = Date.now();
    const timeSpentSeconds = Math.max(1, Math.round((now - sessionPageEnteredAt) / 1000));
    sessionPageEnteredAt = now;

    const payload = {
      sessionId,
      currentUrl: window.location.href,
      pageTitle: document.title || "GemRishi",
      timeSpentSeconds,
      clicks: [...recentClicksBuffer],
      gemstonesViewed: [...viewedGemstonesBuffer],
      device: window.innerWidth < 768 ? "Mobile" : "Desktop",
      ...extra,
    };

    recentClicksBuffer.length = 0; // Clear flushed clicks

    const endpoint = `${BACKEND_BASE}/analytics/session-heartbeat`;

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently: telemetry NEVER interrupts user shopping experience
  }
}

// Automatically convert Session ID -> Mobile Number whenever entered anywhere in app
export function initMobileNumberAutoIdentifier() {
  if (typeof document === "undefined" || isTrackingExcluded()) return;

  const checkAndIdentify = (val) => {
    if (!val || typeof val !== "string") return;
    const digits = val.replace(/\D/g, "");
    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits) && digits !== identifiedPhone) {
      identifiedPhone = digits;
      const formatted = `+91 ${digits}`;

      // 1. Identify in Microsoft Clarity
      if (typeof window.clarity === "function") {
        window.clarity("identify", formatted);
        window.clarity("set", "identified_phone", formatted);
      }

      // 2. Identify in Backend Analytics Database
      const sessionId = getSessionId();
      const endpoint = `${BACKEND_BASE}/analytics/identify-session`;
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, phone: formatted }),
        keepalive: true,
      }).catch(() => {});

      if (window.__IS_DEV__) {
        console.log(`[Session Identified] Session converted to phone: ${formatted}`);
      }
    }
  };

  document.addEventListener(
    "input",
    (e) => {
      const target = e.target;
      if (!target || target.type === "password") return;
      checkAndIdentify(target.value);
    },
    { passive: true }
  );

  document.addEventListener(
    "change",
    (e) => {
      const target = e.target;
      if (!target || target.type === "password") return;
      checkAndIdentify(target.value);
    },
    { passive: true }
  );
}

// Convert arbitrary button/link text into clean PascalCase Meta event name (max 40 chars)
function toEventName(rawText) {
  if (!rawText) return "Click_Action";

  const clean = rawText
    .replace(/[₹$€£,.:;!?'"()\[\]{}#@&*\-_=+<>\/\\|~`]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const formatted = clean ? `Click_${clean}` : "Click_Action";
  return formatted.slice(0, 40);
}

// Extract human-readable label from clicked DOM element
function getElementLabel(element) {
  if (!element) return "";

  const explicitLabel =
    element.getAttribute("data-track") ||
    element.getAttribute("data-label") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title");
  if (explicitLabel) return explicitLabel.trim();

  const text = (element.innerText || element.textContent || "").trim();
  if (text && text.length <= 80) {
    return text.replace(/\s+/g, " ");
  }

  if (element.getAttribute("alt")) return `Image: ${element.getAttribute("alt")}`;
  if (element.getAttribute("name")) return element.getAttribute("name");
  if (element.id) return `#${element.id}`;

  return "";
}

function findTrackableTarget(target) {
  let el = target;
  let depth = 0;
  while (el && el !== document.body && depth < 5) {
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (
      tag === "button" ||
      tag === "a" ||
      el.getAttribute("role") === "button" ||
      el.hasAttribute("data-track") ||
      el.hasAttribute("data-label") ||
      el.classList?.contains("cursor-pointer") ||
      el.classList?.contains("clickable")
    ) {
      return el;
    }
    el = el.parentElement;
    depth++;
  }
  return null;
}

/**
 * Dispatches an event across Meta Pixel, GA4/GTM dataLayer, and Microsoft Clarity.
 */
export function trackCustomEvent(eventName, payload = {}) {
  if (isTrackingExcluded()) return;

  try {
    const pageUrl = window.location.href;
    const pagePath = window.location.pathname;
    const pageTitle = document.title || "GemRishi";

    // 1. Meta Pixel Custom Event
    fbqTrackCustom(eventName, {
      content_name: payload.label || payload.click_text || eventName,
      content_category: payload.category || pageTitle,
      button_clicked: payload.click_text || payload.label || eventName,
      page_url: pageUrl,
      page_path: pagePath,
      target_url: payload.click_href || undefined,
      ...payload,
    });

    // 2. Google Tag Manager / GA4 dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "user_action",
      event_category: payload.category || "User Engagement",
      event_action: eventName,
      event_label: payload.label || payload.click_text || eventName,
      click_text: payload.click_text || payload.label || "",
      click_url: payload.click_href || pageUrl,
      page_location: pageUrl,
      page_path: pagePath,
      page_title: pageTitle,
      ...payload,
    });

    // 3. Microsoft Clarity Event & Smart Session Tagging
    if (typeof window.clarity === "function") {
      const safeName = eventName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
      window.clarity("event", safeName);

      if (payload.amount && Number(payload.amount) >= 25000) {
        window.clarity("set", "high_value_action", eventName);
      }
    }

    if (window.__IS_DEV__) {
      console.log(`[Tracking] ${eventName}`, payload);
    }
  } catch (err) {
    console.warn(`[Tracking Error] ${eventName}:`, err);
  }
}

/**
 * Smart VIP Tagging for Microsoft Clarity based on shopping cart value
 */
export function tagClarityCart(amount = 0, itemCount = 1) {
  if (isTrackingExcluded() || typeof window.clarity !== "function") return;

  try {
    const numeric = Number(amount) || 0;
    const tier =
      numeric >= 50000
        ? "Super_VIP_50k+"
        : numeric >= 25000
        ? "VIP_25k+"
        : numeric > 0
        ? "Active_Buyer"
        : "Empty_Cart";

    window.clarity("set", "cart_tier", tier);
    window.clarity("set", "cart_value", String(numeric));
    window.clarity("set", "cart_items", String(itemCount));

    // Update backend session cart value
    sendSessionHeartbeat({ cartValue: numeric });
  } catch (e) {
    console.warn("[Clarity cart tag notice]:", e);
  }
}

/**
 * Smart Completed Order Tagging for Microsoft Clarity
 */
export function tagClarityOrder(orderId, amount, status = "completed") {
  if (isTrackingExcluded() || typeof window.clarity !== "function") return;

  try {
    window.clarity("identify", String(orderId));
    window.clarity("set", "order_id", String(orderId));
    window.clarity("set", "order_status", status);
    window.clarity("set", "order_amount", String(amount));
    window.clarity("set", "customer_type", "Purchased_Customer");

    // Sync order completion to session on backend
    sendSessionHeartbeat({ orderId: String(orderId), orderStatus: status, cartValue: Number(amount) });
  } catch (e) {
    console.warn("[Clarity order tag notice]:", e);
  }
}

/**
 * Lab Certificate Verification Tracker
 */
export function trackCertificateInspection({ certLab = "IGI", certNumber = "", gemstoneName = "" }) {
  trackCustomEvent("Certificate_Inspected", {
    cert_lab: certLab,
    cert_number: certNumber,
    gemstone_name: gemstoneName,
    category: "Trust & Verification",
  });

  if (typeof window.clarity === "function") {
    window.clarity("set", "verified_certificate", certLab);
  }
}

/**
 * Gemstone 360 Video Engagement Tracker
 */
export function trackVideoEngagement({ videoTitle = "Gemstone 360", milestone = 100, currentTime = 0 }) {
  trackCustomEvent(`Video_${milestone}pct_Watched`, {
    video_title: videoTitle,
    milestone_percent: milestone,
    current_seconds: Math.round(currentTime),
    category: "Media Engagement",
  });
}

/**
 * Customizer Telemetry Tracker (Metal, Quality, Ring Size adjustments)
 */
export function trackCustomizerChange({ optionType, selectedValue, previousValue, priceDelta = 0 }) {
  const eventName = `Customize_${toEventName(optionType).replace("Click_", "")}`;
  trackCustomEvent(eventName, {
    option_type: optionType,
    selected_value: String(selectedValue),
    previous_value: String(previousValue || ""),
    price_delta: Number(priceDelta) || 0,
    category: "Product Customizer",
  });

  if (typeof window.clarity === "function") {
    window.clarity("set", `selected_${optionType}`, String(selectedValue));
  }
}

/**
 * Rage Click Detector: Identifies when user clicks rapidly on the same target 3+ times in 800ms
 */
function handleRageClickCheck(target, label) {
  const now = Date.now();
  if (lastClickTarget === target && now - lastClickTime < 800) {
    clickCount++;
    if (clickCount === 3) {
      trackCustomEvent("Rage_Click_Detected", {
        element_label: label || "unlabeled",
        element_tag: target.tagName.toLowerCase(),
        page_path: window.location.pathname,
        category: "UX Friction",
      });

      if (typeof window.clarity === "function") {
        window.clarity("set", "friction_detected", "rage_click");
        window.clarity("set", "rage_element", (label || target.tagName).slice(0, 30));
      }
    }
  } else {
    lastClickTarget = target;
    clickCount = 1;
  }
  lastClickTime = now;
}

/**
 * Copy-to-Clipboard Telemetry: Detects when SKU, Certificate Number, or Promo Code is copied
 */
export function initClipboardTracking() {
  if (typeof window === "undefined" || isTrackingExcluded()) return;

  document.addEventListener("copy", () => {
    try {
      const selected = window.getSelection()?.toString().trim();
      if (!selected || selected.length > 100) return;

      let copyType = "general_text";
      if (/^[A-Z0-9\-]{4,20}$/i.test(selected)) {
        if (/^(IGI|GIA|GII|GR)/i.test(selected)) {
          copyType = "certificate_number";
        } else if (/^(DHANTERAS|FESTIVAL|SAVE)/i.test(selected)) {
          copyType = "coupon_code";
        } else {
          copyType = "sku_or_id";
        }
      }

      trackCustomEvent("Text_Copied_To_Clipboard", {
        copied_type: copyType,
        copied_sample: selected.slice(0, 25),
        page_path: window.location.pathname,
        category: "User Intent",
      });

      if (typeof window.clarity === "function") {
        window.clarity("set", "copied_type", copyType);
      }
    } catch (e) {}
  });
}

/**
 * Global JavaScript Error Beaconing: Captures uncaught frontend script errors
 */
export function initErrorBeaconing() {
  if (typeof window === "undefined" || isTrackingExcluded()) return;

  window.addEventListener("error", (e) => {
    try {
      const errorMsg = e.message || "Unknown error";
      if (reportedErrors.has(errorMsg)) return;
      reportedErrors.add(errorMsg);

      trackCustomEvent("JS_Runtime_Error", {
        error_message: errorMsg.slice(0, 100),
        filename: (e.filename || "").split("/").pop() || "inline",
        lineno: e.lineno,
        category: "Telemetry Error",
      });

      if (typeof window.clarity === "function") {
        window.clarity("set", "runtime_error", errorMsg.slice(0, 40));
      }
    } catch (err) {}
  });
}

/**
 * Multi-Tab Shopping & Tab Visibility Tracker: Detects when user switches away and returns
 */
export function initTabVisibilityTracking() {
  if (typeof document === "undefined" || isTrackingExcluded()) return;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      tabLeaveTime = Date.now();
    } else if (document.visibilityState === "visible") {
      if (tabLeaveTime > 0) {
        const secondsAway = Math.round((Date.now() - tabLeaveTime) / 1000);
        tabLeaveTime = 0;
        if (secondsAway >= 5) {
          trackCustomEvent("Tab_Returned", {
            seconds_away: secondsAway,
            category: "Tab Engagement",
          });
          if (typeof window.clarity === "function") {
            window.clarity("set", "tab_blur_seconds", String(secondsAway));
            window.clarity("set", "multi_tab_shopper", "true");
          }
        }
      }
    }
  });
}

/**
 * Exit-Intent Detector: Triggers when user's cursor leaves towards top of screen with intent to bounce.
 */
export function initExitIntentTracking() {
  if (typeof window === "undefined" || isTrackingExcluded()) return;

  const handleMouseLeave = (e) => {
    if (exitIntentFired) return;
    if (e.clientY <= 0) {
      exitIntentFired = true;
      trackCustomEvent("Exit_Intent_Detected", {
        page_path: window.location.pathname,
        page_location: window.location.href,
        category: "User Abandonment",
      });

      if (typeof window.clarity === "function") {
        window.clarity("set", "exit_intent", "triggered");
      }
    }
  };

  document.addEventListener("mouseleave", handleMouseLeave, { once: true });
}

/**
 * Global click and interaction listener for capturing all user actions across all pages.
 */
export function initAutoTracking() {
  if (typeof window === "undefined" || isInitialized || isTrackingExcluded()) return;
  isInitialized = true;

  // Initialize companion behavioral listeners
  initExitIntentTracking();
  initClipboardTracking();
  initErrorBeaconing();
  initTabVisibilityTracking();
  initMobileNumberAutoIdentifier();

  // Send initial session heartbeat
  sendSessionHeartbeat();

  // Periodic lightweight heartbeat (every 25 seconds of active browsing)
  setInterval(() => {
    sendSessionHeartbeat();
  }, 25000);

  document.addEventListener(
    "click",
    (event) => {
      try {
        const target = findTrackableTarget(event.target);
        if (!target) return;

        if (target.type === "password") return;

        const tag = target.tagName.toLowerCase();
        const label = getElementLabel(target);
        const href = tag === "a" ? target.getAttribute("href") : null;
        const buttonType = target.getAttribute("type") || (tag === "a" ? "link" : "button");
        const elementId = target.id || null;

        // Check for rage click patterns
        handleRageClickCheck(target, label);

        if (!label && !href && !elementId) return;
        if (target.id === "modal-backdrop" || target.classList?.contains("backdrop")) return;

        const descriptiveEventName = toEventName(label);

        const payload = {
          label: label || "unlabeled",
          click_text: label || "unlabeled",
          click_tag: tag,
          click_type: buttonType,
          click_href: href || undefined,
          click_id: elementId || undefined,
          page_path: window.location.pathname,
          page_location: window.location.href,
        };

        // Buffer click for session telemetry
        recentClicksBuffer.push({
          label: label || descriptiveEventName,
          tag,
        });
        if (recentClicksBuffer.length > 20) recentClicksBuffer.shift();

        trackCustomEvent(descriptiveEventName, payload);
      } catch (err) {
        console.warn("[AutoTrack] Click handler error:", err);
      }
    },
    { passive: true, capture: true }
  );

  if (window.__IS_DEV__) {
    console.log("[AutoTrack] Advanced telemetry, rage clicks, multi-tab shopping & Clarity active.");
  }
}

export default {
  initAutoTracking,
  trackCustomEvent,
  tagClarityCart,
  tagClarityOrder,
  trackCertificateInspection,
  trackVideoEngagement,
  trackCustomizerChange,
  initExitIntentTracking,
  initClipboardTracking,
  initErrorBeaconing,
  initTabVisibilityTracking,
  initMobileNumberAutoIdentifier,
  sendSessionHeartbeat,
  getSessionId,
  isTrackingExcluded,
};
