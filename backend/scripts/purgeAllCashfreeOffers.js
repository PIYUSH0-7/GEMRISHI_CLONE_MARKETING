import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { getCashfreeConfig, deactivateCashfreeOffer } from "../utils/cashfree.js";

async function purgeOffersForEnv(envOverride = null) {
  const baseConfig = getCashfreeConfig();
  const env = (envOverride || baseConfig.env || "TEST").toUpperCase();
  const isProd = env === "PROD" || env === "PRODUCTION";
  const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  const appId = baseConfig.appId;
  const secretKey = baseConfig.secretKey;
  const apiVersion = baseConfig.apiVersion;

  console.log("==================================================");
  console.log(` Purging All Cashfree Offers — Environment: ${env}`);
  console.log(` Base URL: ${baseUrl}`);
  console.log("==================================================");

  if (!appId || !secretKey) {
    console.error("❌ Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY in environment");
    return;
  }

  // Probe across different cart amount tiers to discover all offers
  const amountTiers = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000];
  const discoveredOffers = new Map();

  for (const amount of amountTiers) {
    try {
      const res = await fetch(`${baseUrl}/eligibility/offers`, {
        method: "POST",
        headers: {
          "x-api-version": apiVersion,
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          queries: { amount },
        }),
      });

      if (!res.ok) {
        continue;
      }

      const list = await res.json().catch(() => null);
      if (Array.isArray(list)) {
        for (const item of list) {
          const details = item.entity_details || {};
          const id = details.offer_id || item.entity_value;
          const code = details.offer_meta?.offer_code || id;
          const status = details.offer_status;
          if (id && status !== "inactive") {
            discoveredOffers.set(id, { id, code, status, title: details.offer_meta?.offer_title });
          }
        }
      }
    } catch (err) {
      console.warn(`Warning checking tier ₹${amount}:`, err.message);
    }
  }

  console.log(`Discovered ${discoveredOffers.size} active offers to deactivate.\n`);

  let count = 0;
  for (const [offerId, offer] of discoveredOffers.entries()) {
    try {
      console.log(`[${++count}/${discoveredOffers.size}] Deactivating ${offer.code} (${offerId})...`);
      const patchRes = await fetch(`${baseUrl}/offers/${offerId}`, {
        method: "PATCH",
        headers: {
          "x-api-version": apiVersion,
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ offer_status: "inactive" }),
      });

      if (patchRes.ok) {
        console.log(`  ✅ Deactivated ${offer.code}`);
      } else {
        const errData = await patchRes.json().catch(() => null);
        console.error(`  ❌ Failed to deactivate ${offer.code}:`, errData);
      }
    } catch (err) {
      console.error(`  ❌ Error deactivating ${offer.code}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed purging offers for ${env}. Total deactivated: ${count}\n`);
}

async function main() {
  const targetEnv = process.argv[2]; // e.g. "PROD" or "TEST"
  await purgeOffersForEnv(targetEnv);
}

main().catch(console.error);
