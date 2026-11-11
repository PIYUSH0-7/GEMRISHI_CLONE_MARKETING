/**
 * Utility function to normalize and resolve image and video URLs for admin components.
 * Works seamlessly across both local development and production environments.
 */
export const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><rect width='200' height='200' fill='%23f8fafc' rx='8'/><g fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' transform='translate(50, 50)'><polygon points='50,15 85,35 85,65 50,85 15,65 15,35'/><polyline points='15,35 50,55 85,35'/><line x1='50' y1='55' x2='50' y2='85'/><line x1='50' y1='15' x2='50' y2='55'/><line x1='15' y1='35' x2='85' y2='35'/></g></svg>";

const isLocalEnvironment = () => {
  if (typeof window === "undefined") {
    return import.meta.env?.DEV ?? false;
  }
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.endsWith(".local") ||
    Boolean(import.meta.env?.DEV)
  );
};

export const getImageUrl = (url, fallback = DEFAULT_PLACEHOLDER) => {
  if (!url) return fallback;

  // Handle object wrappers like { url: '...' } or { fileName: '...' } or { src: '...' }
  if (typeof url === "object") {
    if (url.url && typeof url.url === "string") {
      url = url.url;
    } else if (url.fileName && typeof url.fileName === "string") {
      url = `/public/uploads/product/${url.fileName}`;
    } else if (url.src && typeof url.src === "string") {
      url = url.src;
    } else {
      return fallback;
    }
  }

  if (typeof url !== "string") return fallback;
  let trimmed = url.trim();
  if (!trimmed) return fallback;

  // 1. Strip known server origins/domains or localhost prefixes pointing to uploads
  trimmed = trimmed.replace(
    /^https?:\/\/(?:localhost|127\.0\.0\.1|103\.86\.176\.102|187\.127\.163\.127|api\.gemrishi\.com|gemrishi\.com|admin\.gemrishi\.com|admin\.stagging\.io|stagging\.io)(?::\d+)?(?:\/api\/v1)?\/(public\/uploads|uploads)/i,
    "/$1"
  );

  // 2. Strip any generic localhost or 127.0.0.1 prefix
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(trimmed)) {
    trimmed = trimmed.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, "");
  }

  // 3. Strip legacy MilesWeb server IP
  if (trimmed.includes("103.86.176.102")) {
    trimmed = trimmed.replace(/^https?:\/\/103\.86\.176\.102(?::\d+)?/i, "");
  }

  const isLocal = isLocalEnvironment();

  // 4. In local development: redirect live upload URLs to local backend
  if (isLocal) {
    if (
      trimmed.includes("api.gemrishi.com/public/uploads") ||
      trimmed.includes("gemrishi.com/public/uploads") ||
      trimmed.includes("api.gemrishi.com/uploads") ||
      trimmed.includes("gemrishi.com/uploads")
    ) {
      const relativePath = trimmed.replace(/^https?:\/\/(?:api\.)?gemrishi\.com/, "");
      const cleanRelative = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
      const localBackend = import.meta.env.VITE_URL
        ? import.meta.env.VITE_URL.replace(/\/api\/v1\/?$/, "")
        : "http://localhost:7788";
      return `${localBackend}${cleanRelative}`;
    }
  }

  // 5. If already an external absolute URL (CDN, S3, Unsplash), keep as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // 6. Normalize relative path
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // 7. Local development: prefix with local backend
  if (isLocal) {
    const localBackend = import.meta.env.VITE_URL
      ? import.meta.env.VITE_URL.replace(/\/api\/v1\/?$/, "")
      : "http://localhost:7788";
    return `${localBackend}${cleanPath}`;
  }

  // 8. Production: if VITE_URL is absolute, prefix it; otherwise return relative path
  if (import.meta.env.VITE_URL && import.meta.env.VITE_URL.startsWith("http")) {
    const backendOrigin = import.meta.env.VITE_URL.replace(/\/api\/v1\/?$/, "");
    return `${backendOrigin}${cleanPath}`;
  }

  return cleanPath;
};

export const onImageError = (fallback = DEFAULT_PLACEHOLDER) => (e) => {
  const target = e.currentTarget || e.target;
  if (!target) return;
  if (target.dataset.hasError === "true") return;
  target.dataset.hasError = "true";
  target.onerror = null;
  target.src = fallback;
};
