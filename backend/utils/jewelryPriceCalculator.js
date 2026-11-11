import { Jewelry } from "../models/jewelry.model.js";

/**
 * Maps a jewelry metal string to the corresponding metal rate per gram (without GST)
 * from the latest MetalRates document.
 */
export function getMetalRatePerGram(rates, metal) {
  if (!rates || !metal) return 0;
  const m = String(metal).toLowerCase().trim();

  if (m.includes("18k")) {
    return Number(rates.gold?.gold18k?.withoutGSTRate || 0);
  }
  if (m.includes("24k")) {
    return Number(rates.gold?.gold24k?.withoutGSTRate || 0);
  }
  if (m.includes("gold") || m.includes("22k")) {
    return Number(rates.gold?.gold22k?.withoutGSTRate || 0);
  }
  if (m.includes("silver")) {
    return Number(rates.silver?.withoutGSTRate || 0);
  }
  if (m.includes("platinum")) {
    return Number(rates.platinum?.withoutGSTRate || 0);
  }
  if (
    m.includes("panchadhatu") ||
    m.includes("brass") ||
    m.includes("panchdhatu")
  ) {
    return Number(rates.panchadhatu?.withoutGSTRate || 0);
  }
  return 0;
}

/**
 * Calculates Jewellery Making Price using the formula:
 * Total = [Metal Rate + (Metal Rate * (Making Charge % / 100))] * Metal Weight
 * GST = Total * 3 / 100
 * Jewellery Making Price = Total + GST
 */
export function calculateJewelryPrice(metalRate, weight, makingChargePercent) {
  const rate = Number(metalRate) || 0;
  const wt = Number(weight) || 0;
  const percent = Number(makingChargePercent) || 0;

  if (rate <= 0 || wt <= 0) return 0;

  const ratePerGramWithMaking = rate + (rate * percent) / 100;
  const total = ratePerGramWithMaking * wt;
  return Math.round(total * 1.03);
}

/**
 * Syncs the making prices of all jewellery in the database based on the provided rates.
 */
export async function syncJewelryMakingPrices(rates) {
  if (!rates) return { updatedCount: 0 };

  const jewelries = await Jewelry.find({}).lean();
  if (!jewelries || jewelries.length === 0) return { updatedCount: 0 };

  const bulkOps = [];

  for (const j of jewelries) {
    const metalRate = getMetalRatePerGram(rates, j.metal);
    const weight = Number(j.jewelryMetalWeight) || 0;
    const chargePercent = j.makingChargePercent !== undefined && j.makingChargePercent !== null ? Number(j.makingChargePercent) : 10;

    let newPrice = j.jewelryPrice;
    if (metalRate > 0 && weight > 0 && chargePercent >= 0) {
      newPrice = calculateJewelryPrice(metalRate, weight, chargePercent);
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: j._id },
        update: {
          $set: {
            jewelryPrice: newPrice,
            makingChargePercent: chargePercent,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await Jewelry.bulkWrite(bulkOps);
  }

  return { updatedCount: bulkOps.length };
}
