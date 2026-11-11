/**
 * SEO & Content Engagement Scroll Depth Tracking (25%, 50%, 75%, 90%)
 */

let reachedMilestones = new Set();
let scrollListenerActive = false;

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (docHeight <= 0) return;

  const scrollPercent = Math.round((scrollTop / docHeight) * 100);
  const thresholds = [25, 50, 75, 90];

  for (const milestone of thresholds) {
    if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
      reachedMilestones.add(milestone);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "scroll",
        scroll_depth: milestone,
        page_path: window.location.pathname,
        page_title: document.title,
      });

      // Clarity Content Engagement Tagging
      if (typeof window.clarity === "function" && (milestone === 50 || milestone === 90)) {
        window.clarity("set", "max_scroll_depth", `${milestone}%`);
        if (milestone === 90) {
          window.clarity("set", "deep_content_reader", "true");
        }
      }

      if (window.__IS_DEV__) {
        console.log(`[Analytics Event: scroll] Reached ${milestone}%`);
      }
    }
  }
}

/**
 * Attaches scroll listener if not already attached, and resets milestones for new route.
 */
export function initScrollTracking() {
  if (typeof window === "undefined") return;

  reachedMilestones.clear();

  if (!scrollListenerActive) {
    window.addEventListener("scroll", handleScroll, { passive: true });
    scrollListenerActive = true;
  }
}

export function cleanupScrollTracking() {
  if (typeof window !== "undefined" && scrollListenerActive) {
    window.removeEventListener("scroll", handleScroll);
    scrollListenerActive = false;
  }
}

export default {
  initScrollTracking,
  cleanupScrollTracking,
};
