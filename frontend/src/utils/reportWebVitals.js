/**
 * Core Web Vitals (CLS, INP, LCP, FCP, TTFB) Reporting Utility
 */

export function reportWebVitals() {
  if (typeof window === "undefined") return;

  import("web-vitals")
    .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const sendMetric = (metric) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "core_web_vitals",
          web_vitals: {
            metric_name: metric.name,
            metric_value:
              metric.name === "CLS"
                ? Math.round(metric.value * 1000)
                : Math.round(metric.value),
            metric_delta:
              metric.name === "CLS"
                ? Math.round(metric.delta * 1000)
                : Math.round(metric.delta),
            metric_rating: metric.rating,
            metric_id: metric.id,
            navigation_type: metric.navigationType,
          },
        });

        if (window.__IS_DEV__) {
          console.log(`[Core Web Vitals] ${metric.name}:`, metric.value, `(${metric.rating})`);
        }
      };

      if (onCLS) onCLS(sendMetric);
      if (onINP) onINP(sendMetric);
      if (onLCP) onLCP(sendMetric);
      if (onFCP) onFCP(sendMetric);
      if (onTTFB) onTTFB(sendMetric);
    })
    .catch((err) => {
      console.warn("[Core Web Vitals] Failed to initialize web-vitals observer:", err);
    });
}

export default reportWebVitals;
