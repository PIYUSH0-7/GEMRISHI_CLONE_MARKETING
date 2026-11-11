import { Product } from "../models/product.model.js";
import { Jewelry } from "../models/jewelry.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { createCleanSlug, cleanSku, getCanonicalSlug } from "../utils/slugify.js";
const BATCH_SIZE = 500;

// Returns { slug, pastSlugs } if the document needs updating, otherwise null.
function buildUpdate(doc, name) {
  const cName = createCleanSlug(name);
  if (!cName) return null;

  const cSku = cleanSku(doc.sku);
  const canonical = getCanonicalSlug(name, doc.sku);

  const past = new Set(doc.pastSlugs || []);
  if (doc.slug && doc.slug !== canonical) past.add(doc.slug);

  // Variations kept for 301 redirects (without SKU, with slash, etc.)
  [
    cName,
    `${cName}/${cSku}`,
    `${cName}-${cSku}`,
    doc.sku ? String(doc.sku).toLowerCase() : null,
  ]
    .filter(Boolean)
    .forEach((v) => {
      if (v !== canonical) past.add(v);
    });

  const pastSlugs = [...past];
  const changed =
    doc.slug !== canonical ||
    !Array.isArray(doc.pastSlugs) ||
    pastSlugs.length !== doc.pastSlugs.length;

  return changed ? { slug: canonical, pastSlugs } : null;
}

async function syncModel(Model, getName) {
  let updated = 0;
  let ops = [];

  const cursor = Model.find({})
    .select("name jewelryName sku slug pastSlugs")
    .lean()
    .cursor();

  for await (const doc of cursor) {
    const set = buildUpdate(doc, getName(doc));
    if (!set) continue;

    ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: set } } });

    if (ops.length >= BATCH_SIZE) {
      await Model.bulkWrite(ops, { ordered: false });
      updated += ops.length;
      ops = [];
    }
  }

  if (ops.length) {
    await Model.bulkWrite(ops, { ordered: false });
    updated += ops.length;
  }
  return updated;
}

export async function syncAllDatabaseSlugs() {
  console.log("🔄 Slug sync started...");
  try {
    // 1. Subcategories
    let updatedSubs = 0;
    const subCursor = SubCategory.find({}).select("name slug").lean().cursor();
    for await (const sub of subCursor) {
      const clean = createCleanSlug(sub.name || sub.slug);
      if (clean && sub.slug !== clean) {
        await SubCategory.updateOne({ _id: sub._id }, { $set: { slug: clean } });
        updatedSubs++;
      }
    }

    // 2. Gemstone products
    const updatedProducts = await syncModel(Product, (d) => d.name);

    // 3. Jewelry
    const updatedJewelries = await syncModel(Jewelry, (d) => d.jewelryName || d.name);

    console.log(
      `✅ Slug sync done: ${updatedProducts} gemstones, ${updatedJewelries} jewelry, ${updatedSubs} subcategories updated.`
    );
  } catch (error) {
    console.error("⚠️ Slug sync error:", error.message);
  }
}