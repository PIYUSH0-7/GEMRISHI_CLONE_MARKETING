import { load } from "@cashfreepayments/cashfree-js";

const instances = {};

/**
 * Returns an instance of the Cashfree JS SDK
 * mode: "sandbox" (for testing) or "production" (for live)
 */
export async function getCashfree(preferredMode = null) {
  let mode = "sandbox";
  if (preferredMode) {
    const clean = String(preferredMode).toLowerCase();
    mode = clean === "production" || clean === "prod" ? "production" : "sandbox";
  } else {
    const envVal = String(import.meta.env.VITE_CASHFREE_ENV || "").toLowerCase();
    if (envVal === "production" || envVal === "prod") {
      mode = "production";
    }
  }

  if (!instances[mode]) {
    instances[mode] = await load({ mode });
  }
  return instances[mode];
}
