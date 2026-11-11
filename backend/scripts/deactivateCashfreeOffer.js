import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { getCashfreeConfig, deactivateCashfreeOffer } from "../utils/cashfree.js";

async function main() {
  const config = getCashfreeConfig();

  // Allow passing offer ID via CLI argument: node deactivateCashfreeOffer.js <OFFER_ID>
  const cliOfferId = process.argv[2] || process.env.OFFER_ID;
  const defaultTestOfferId = "eeb1f579-fb37-424e-9419-9533eb7c2817"; // GEMUPI5 in Sandbox
  const targetOfferId = cliOfferId || defaultTestOfferId;

  console.log("==================================================");
  console.log(" Cashfree Offer Deactivator — GemRishi");
  console.log("==================================================");
  console.log(`- Environment : ${config.env}`);
  console.log(`- Base URL    : ${config.baseUrl}`);
  console.log(`- Target ID   : ${targetOfferId}`);
  console.log("==================================================\n");

  if (!config.appId || !config.secretKey) {
    console.error("❌ ERROR: CASHFREE_APP_ID or CASHFREE_SECRET_KEY missing in backend/.env");
    process.exit(1);
  }

  try {
    console.log(`Deactivating offer ${targetOfferId} on Cashfree...`);
    const result = await deactivateCashfreeOffer(targetOfferId);

    if (result.success) {
      console.log(`\n✅ Offer [${targetOfferId}] successfully DEACTIVATED on Cashfree (${config.env}).`);
      console.log("Response:", JSON.stringify(result.data, null, 2));
    } else {
      console.error(`\n❌ Failed to deactivate offer (HTTP ${result.status}):`, result.data);
    }
  } catch (err) {
    console.error("\n❌ Exception while deactivating offer:", err.message);
  }
}

main().catch(console.error);
