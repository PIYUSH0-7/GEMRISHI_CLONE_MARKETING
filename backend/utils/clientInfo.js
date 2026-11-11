// utils/clientInfo.js
// Reads the visitor's IP address and device details from an Express request.
// No extra npm package needed.
import { getClientIpFromRequest } from "./metacapicore.js";

const parseUserAgent = (ua = "") => {
  let browser = "Unknown";
  let m;
  if ((m = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/))) browser = `Edge ${m[1]}`;
  else if ((m = ua.match(/OPR\/([\d.]+)/))) browser = `Opera ${m[1]}`;
  else if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) browser = `Samsung Internet ${m[1]}`;
  else if ((m = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/))) browser = `Chrome ${m[1]}`;
  else if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) browser = `Firefox ${m[1]}`;
  else if (/Safari\//.test(ua) && (m = ua.match(/Version\/([\d.]+)/))) browser = `Safari ${m[1]}`;

  let os = "Unknown";
  if ((m = ua.match(/Windows NT ([\d.]+)/))) os = `Windows ${m[1]}`;
  else if ((m = ua.match(/Android ([\d.]+)/))) os = `Android ${m[1]}`;
  else if ((m = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/))) os = `iOS ${m[1].replace(/_/g, ".")}`;
  else if ((m = ua.match(/Mac OS X ([\d_]+)/))) os = `macOS ${m[1].replace(/_/g, ".")}`;
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType = "desktop";
  if (/iPad|Tablet/.test(ua)) deviceType = "tablet";
  else if (/Mobi|iPhone|Android/.test(ua)) deviceType = "mobile";

  // Android user agents carry the phone model, e.g. "Android 13; SM-S918B)"
  const model = ua.match(/Android [\d.]+;\s*([^;)]+)/)?.[1]?.trim();
  let deviceName = model && model !== "K" ? model : "";
  if (!deviceName) {
    if (/iPhone/.test(ua)) deviceName = "iPhone";
    else if (/iPad/.test(ua)) deviceName = "iPad";
    else if (deviceType === "desktop") deviceName = `${os.split(" ")[0]} Computer`;
    else deviceName = `${os.split(" ")[0]} ${deviceType}`;
  }

  return { deviceName, deviceType, os, browser };
};

export const getClientInfo = (req) => {
  const userAgent = String(req?.headers?.["user-agent"] || "").slice(0, 500);
  return {
    ipAddress: getClientIpFromRequest(req) || "",
    userAgent,
    deviceInfo: parseUserAgent(userAgent),
  };
};