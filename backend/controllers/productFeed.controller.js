// ----------------------------Add By Pawan (Updated)----------------------------------------
import { Product } from "../models/product.model.js";
import { getCanonicalProductPath } from "../utils/slugify.js";
import { getProductFeed, FEED_TTL_MS } from "../utils/productFeedCache.js";

const SITE_URL = (process.env.FEED_SITE_URL || "https://gemrishi.com").replace(/\/+$/, "");
const ASSET_URL = (process.env.FEED_ASSET_URL || "https://api.gemrishi.com").replace(/\/+$/, "");
const BRAND = "GemRishi";
const SOLD_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const GEMSTONE_ASTROLOGY = {
  emerald: { hindi: "Panna", planet: "Mercury (Budh)" },
  "yellow sapphire": { hindi: "Pukhraj", planet: "Jupiter (Guru)" },
  "blue sapphire": { hindi: "Neelam", planet: "Saturn (Shani)" },
  "white sapphire": { hindi: "Safed Pukhraj", planet: "Venus (Shukra)" },
  ruby: { hindi: "Manik", planet: "Sun (Surya)" },
  "red coral": { hindi: "Moonga", planet: "Mars (Mangal)" },
  coral: { hindi: "Moonga", planet: "Mars (Mangal)" },
  pearl: { hindi: "Moti", planet: "Moon (Chandra)" },
  "cat's eye": { hindi: "Lehsunia", planet: "Ketu" },
  "cats eye": { hindi: "Lehsunia", planet: "Ketu" },
  hessonite: { hindi: "Gomed", planet: "Rahu" },
};

const esc = (v) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const stripHtml = (s) =>
  String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const absUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${ASSET_URL}${u.startsWith("/") ? "" : "/"}${u}`;
};

const money = (n) => `${Number(n).toFixed(2)} INR`;
const tag = (name, value) =>
  value === undefined || value === null || value === ""
    ? "" : `      <g:${name}>${esc(value)}</g:${name}>\n`;

const fetchFeedProducts = () => {
  const cutoff = new Date(Date.now() - SOLD_RETENTION_MS);
  return Product.find({
    isAvailable: true,
    $or: [
      { stock: { $gt: 0 } },
      { stock: { $lte: 0 }, soldOutAt: { $gte: cutoff } },
    ],
  })
    .select("sku name description price sellPrice stock soldOutAt images color origin carat shape cut treatment certificate subCategory updatedAt")
    .populate("subCategory", "name")
    .lean();
};

const getGemstoneName = (product) =>
  String(product.subCategory?.name || "").replace(/\s+/g, " ").trim();

const getGemstoneTitle = (product, gemstoneName) => {
  if (!gemstoneName || !product.carat) {
    return String(product.name).replace(/\s+/g, " ").trim().slice(0, 150);
  }

  const astrology = GEMSTONE_ASTROLOGY[gemstoneName.toLowerCase()];
  const hindiName = astrology ? ` (${astrology.hindi})` : "";
  const weight = Number(product.carat).toFixed(2);
  const shapeAndCut = [product.shape, product.cut]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter((value, index, values) =>
      values.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index
    )
    .join(" ");
  const cut = shapeAndCut ? ` ${shapeAndCut}` : "";

  return `${BRAND} Certified Natural ${gemstoneName}${hindiName} – ${weight} Ct${cut}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
};

// Builds "Oval Cut" from shape/cut values without repeating the word "Cut"
const formatShapeAndCut = (product) => {
  const parts = [product.shape, product.cut]
    .filter(Boolean)
    .map((value) => String(value).replace(/\s+/g, " ").replace(/\s*cut$/i, "").trim())
    .filter(Boolean)
    .filter((value, index, values) =>
      values.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index
    );
  return parts.length ? `${parts.join(" ")} Cut` : "";
};

const getGemstoneDescription = (product, gemstoneName) => {
  if (!gemstoneName) return stripHtml(product.description).slice(0, 5000);

  const astrology = GEMSTONE_ASTROLOGY[gemstoneName.toLowerCase()];
  const hindiName = astrology ? ` (${astrology.hindi})` : "";
  const weight = Number(product.carat);
  const weightText = Number.isFinite(weight) && weight > 0 ? weight.toFixed(2) : "";
  const cutText = formatShapeAndCut(product);
  const origin = String(product.origin || "").trim();
  const treatment = String(product.treatment || "").trim();
  const isUntreated = /unheated|untreated/i.test(treatment);
  const isCertified = Array.isArray(product.certificate) && product.certificate.length > 0;

  const intro = `Discover 100% authentic${isUntreated ? ", unheated, and untreated" : ""} natural ${gemstoneName}${hindiName}${origin ? ` ethically sourced from premium mines in ${origin}` : ""}.`;

  const featured = weightText
    ? `Each gemstone, like our featured ${weightText}-carat${cutText ? ` ${cutText}` : ""} piece, is ${isCertified ? "certified by leading gemological laboratories to ensure maximum astrological benefits and clarity" : "selected for its natural color, clarity, and luster"}.`
    : `Each gemstone is ${isCertified ? "certified by leading gemological laboratories to ensure clarity and authenticity" : "selected for its natural color, clarity, and luster"}.`;

  const treatmentText = !isUntreated && treatment ? `Treatment: ${treatment}.` : "";

  const planetaryText = astrology
    ? `Designed for planetary alignment with ${astrology.planet}, our vibrant gemstones deliver unmatched elegance for both astrological remedies and bespoke fine jewelry creation.`
    : "Our gemstones deliver unmatched elegance for bespoke fine jewelry creation.";

  return [intro, featured, treatmentText, planetaryText]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 5000);
};

const buildItem = (p) => {
  const images = (p.images || []).map((i) => absUrl(i?.url)).filter(Boolean);
  const price = Number(p.price) || 0;
  if (!p.sku || !p.name || price <= 0 || images.length === 0) return null;

  const hasDiscount = Number(p.sellPrice) > price;
  const inStock = Number(p.stock) > 0;
  const gemstoneName = getGemstoneName(p);
  const title = getGemstoneTitle(p, gemstoneName);
  const description =
    getGemstoneDescription(p, gemstoneName) || title;
  const shapeAndCut = formatShapeAndCut(p);

  let x = "    <item>\n";
  x += tag("id", p.sku); // matches GA4 item_id / Meta content_ids
  x += tag("title", title);
  x += tag("description", description);
  x += tag("link", `${SITE_URL}${getCanonicalProductPath(p.name, p.sku)}`);
  x += tag("image_link", images[0]);
  images.slice(1, 11).forEach((img) => (x += tag("additional_image_link", img)));
  x += tag("availability", inStock ? "in_stock" : "out_of_stock"); // Underscore standard preferred by Meta & Google
  x += tag("price", money(hasDiscount ? p.sellPrice : price));
  if (hasDiscount) x += tag("sale_price", money(price));
  x += tag("condition", "new");
  x += tag("brand", BRAND);
  // REMOVED tag("mpn", p.sku) to resolve conflict with identifier_exists=no
  x += tag("identifier_exists", "no");
  x += tag("google_product_category", "5122"); // 5122 = Loose Gemstones
  x += tag("product_type", gemstoneName ? `Gemstones > ${gemstoneName}` : "Gemstones");
  x += tag("color", p.color);
  x += tag("custom_label_0", p.origin);
  x += tag("custom_label_1", p.carat ? `${p.carat} ct` : "");
  x += tag("custom_label_2", shapeAndCut);
  x += "    </item>\n";
  return x;
};

const buildFeedXml = async () => {
  const products = await fetchFeedProducts();
  let items = "", skipped = 0;
  for (const p of products) {
    const item = buildItem(p);
    if (item) items += item; else skipped += 1;
  }
  if (skipped) console.warn(`[productFeed] skipped ${skipped} product(s) with missing sku/price/image`);

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n` +
    `    <title>${esc(BRAND)} Product Feed</title>\n` +
    `    <link>${esc(SITE_URL)}</link>\n` +
    `    <description>${esc(BRAND)} natural certified gemstones</description>\n` +
    items + `  </channel>\n</rss>\n`
  );
};

export const getProductFeedXml = async (req, res) => {
  try {
    const { xml, builtAt } = await getProductFeed(buildFeedXml);
    res.set({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${Math.floor(FEED_TTL_MS / 1000 / 2)}`,
      "Last-Modified": new Date(builtAt).toUTCString(),
    });
    return res.status(200).send(xml);
  } catch (err) {
    console.error("❌ Product feed error:", err);
    return res.status(500).type("text/plain").send("Feed temporarily unavailable");
  }
};
// ----------------------------End By Pawan----------------------------------------