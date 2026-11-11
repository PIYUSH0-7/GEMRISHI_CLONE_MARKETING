import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product, createCleanSlug } from "./models/product.model.js";
import { Jewelry } from "./models/jewelry.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend or root .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/gemrishi";

export async function runMasterFix() {
  console.log("==================================================");
  console.log("💎 GEMRISHI DATABASE MASTER SLUG & SEO FIX MIGRATION");
  console.log("==================================================");
  console.log("Connecting to Database...");
  console.log("URI prefix:", MONGO_URI.substring(0, 35) + "...");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database Connected Successfully!\n");

    // 1. FIX GEMSTONE PRODUCTS
    console.log("--- 1. PROCESSING GEMSTONE PRODUCTS (Product collection) ---");
    const products = await Product.find({});
    console.log(`Found ${products.length} gemstone products in database.`);

    let productSuccessCount = 0;
    let productSkippedCount = 0;

    for (const prod of products) {
      const generatedSlug = createCleanSlug(prod.name, prod.sku);
      if (!generatedSlug) {
        console.warn(
          `⚠️ Warning: Product ID ${prod._id} has no name or SKU to generate slug.`,
        );
        continue;
      }

      if (prod.slug !== generatedSlug) {
        if (!prod.pastSlugs) prod.pastSlugs = [];
        if (prod.slug && !prod.pastSlugs.includes(prod.slug)) {
          prod.pastSlugs.push(prod.slug);
        }

        // Ensure slug uniqueness
        let finalSlug = generatedSlug;
        let counter = 1;
        while (
          await Product.exists({ slug: finalSlug, _id: { $ne: prod._id } })
        ) {
          finalSlug = `${generatedSlug}-${counter++}`;
        }

        const oldSlug = prod.slug;
        prod.slug = finalSlug;
        await prod.save();

        console.log(`[UPDATED] ${prod.name} | SKU: ${prod.sku}`);
        console.log(`  Old: ${oldSlug || "(none)"}`);
        console.log(`  New: ${finalSlug}\n`);
        productSuccessCount++;
      } else {
        productSkippedCount++;
      }
    }

    console.log(
      `Gemstones Summary: ${productSuccessCount} updated, ${productSkippedCount} already up to date.\n`,
    );

    // 2. FIX JEWELRY PRODUCTS
    console.log("--- 2. PROCESSING JEWELRY PRODUCTS (Jewelry collection) ---");
    const jewelries = await Jewelry.find({});
    console.log(`Found ${jewelries.length} jewelry items in database.`);

    let jewelrySuccessCount = 0;
    let jewelrySkippedCount = 0;

    for (const jwl of jewelries) {
      const jwlName = jwl.jewelryName || jwl.name;
      const generatedSlug = createCleanSlug(jwlName, jwl.sku);

      if (!generatedSlug) {
        console.warn(`⚠️ Warning: Jewelry ID ${jwl._id} has no name or SKU.`);
        continue;
      }

      if (jwl.slug !== generatedSlug) {
        if (!jwl.pastSlugs) jwl.pastSlugs = [];
        if (jwl.slug && !jwl.pastSlugs.includes(jwl.slug)) {
          jwl.pastSlugs.push(jwl.slug);
        }

        // Ensure slug uniqueness
        let finalSlug = generatedSlug;
        let counter = 1;
        while (
          await Jewelry.exists({ slug: finalSlug, _id: { $ne: jwl._id } })
        ) {
          finalSlug = `${generatedSlug}-${counter++}`;
        }

        const oldSlug = jwl.slug;
        jwl.slug = finalSlug;
        await jwl.save();

        console.log(`[UPDATED] ${jwlName} | SKU: ${jwl.sku}`);
        console.log(`  Old: ${oldSlug || "(none)"}`);
        console.log(`  New: ${finalSlug}\n`);
        jewelrySuccessCount++;
      } else {
        jewelrySkippedCount++;
      }
    }

    console.log(
      `Jewelry Summary: ${jewelrySuccessCount} updated, ${jewelrySkippedCount} already up to date.\n`,
    );

    console.log("==================================================");
    console.log(" MASTER SLUG & SEO DATABASE MIGRATION COMPLETE!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Fatal Error during migration:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected. Exiting.");
  }
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMasterFix();
}
