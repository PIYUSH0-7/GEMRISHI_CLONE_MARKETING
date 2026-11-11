import { Router } from "express";
import { Product } from "../models/product.model.js";
import { Jewelry } from "../models/jewelry.model.js";

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://gemrishi.com";
    const today = new Date().toISOString().split("T")[0];

    // Static priority URLs
    const staticUrls = [
      { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${baseUrl}/gemstone`, priority: "0.9", changefreq: "daily" },
      { loc: `${baseUrl}/gemstone/yellow-sapphire`, priority: "0.85", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/blue-sapphire`, priority: "0.85", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/emerald`, priority: "0.85", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/ruby`, priority: "0.85", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/coral`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/pearl`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/hessonite`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/cats-eye`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone/diamond`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/filter-gemstone`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/jewellery`, priority: "0.9", changefreq: "weekly" },
      { loc: `${baseUrl}/jewelry-list`, priority: "0.8", changefreq: "weekly" },
      { loc: `${baseUrl}/exclusive-jewellery`, priority: "0.75", changefreq: "weekly" },
      { loc: `${baseUrl}/suggest`, priority: "0.85", changefreq: "weekly" },
      { loc: `${baseUrl}/gemstone-buy-guide`, priority: "0.75", changefreq: "monthly" },
      { loc: `${baseUrl}/carat-to-ratti-converter`, priority: "0.75", changefreq: "monthly" },
      { loc: `${baseUrl}/certificate`, priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/aboutUs`, priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/contactUs`, priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/shipping`, priority: "0.5", changefreq: "monthly" },
      { loc: `${baseUrl}/return-policy`, priority: "0.5", changefreq: "monthly" },
      { loc: `${baseUrl}/terms`, priority: "0.4", changefreq: "monthly" },
      { loc: `${baseUrl}/privacy`, priority: "0.4", changefreq: "monthly" },
      { loc: `${baseUrl}/offers`, priority: "0.7", changefreq: "weekly" },
    ];

    // Fetch active Gemstones from MongoDB
    const gemstones = await Product.find({}, "sku name slug updatedAt images").lean();
    
    // Fetch active Jewelry from MongoDB
    const jewelryItems = await Jewelry.find({}, "sku jewelryName slug updatedAt images").lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Append static URLs
    for (const page of staticUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Append Gemstones
    for (const gem of gemstones) {
      const cleanName = gem.name ? gem.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : "gemstone";
      const cleanSku = gem.sku ? gem.sku.toUpperCase() : "";
      const path = cleanSku ? `${cleanName}/${cleanSku}` : (gem.slug || gem._id);
      const loc = `${baseUrl}/products/${path}`;
      const lastmod = gem.updatedAt ? new Date(gem.updatedAt).toISOString().split("T")[0] : today;

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      if (Array.isArray(gem.images) && gem.images.length > 0 && gem.images[0]?.url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${gem.images[0].url.startsWith("http") ? gem.images[0].url : `${baseUrl}${gem.images[0].url}`}</image:loc>\n`;
        xml += `      <image:title>${gem.name || "Natural Gemstone"}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // Append Jewelry Items
    for (const jwl of jewelryItems) {
      const path = jwl.slug || (jwl.sku ? `details/product/${jwl.sku}` : jwl._id);
      const loc = `${baseUrl}/jewellery/${path}`;
      const lastmod = jwl.updatedAt ? new Date(jwl.updatedAt).toISOString().split("T")[0] : today;

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.75</priority>\n`;

      if (Array.isArray(jwl.images) && jwl.images.length > 0 && jwl.images[0]?.url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${jwl.images[0].url.startsWith("http") ? jwl.images[0].url : `${baseUrl}${jwl.images[0].url}`}</image:loc>\n`;
        xml += `      <image:title>${jwl.jewelryName || "Fine Jewellery"}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600"); // Cache 1 hour
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
    return res.status(500).send("Error generating sitemap");
  }
});

router.get("/llms.txt", (req, res) => {
  const content = `# GemRishi

> GemRishi is a premier e-commerce platform offering 100% natural, laboratory-certified Vedic gemstones and fine astrology jewellery with worldwide insured shipping and astrological consultation.

GemRishi has a five-generation legacy since 1904, providing authentic, untreated, and lab-certified gemstones backed by reputed gemological laboratories such as GIA, IGI, and government-recognized testing centers.

## Primary Collections

- [Natural Gemstones](https://gemrishi.com/gemstone): Complete inventory of certified natural Vedic astrological gemstones.
- [Yellow Sapphire (Pukhraj)](https://gemrishi.com/gemstone/yellow-sapphire): Natural unheated Ceylon and Burma yellow sapphires for Jupiter (Brihaspati).
- [Blue Sapphire (Neelam)](https://gemrishi.com/gemstone/blue-sapphire): Certified Kashmir, Ceylon, and Burma blue sapphires for Saturn (Shani).
- [Emerald (Panna)](https://gemrishi.com/gemstone/emerald): Natural Colombian and Zambian emeralds for Mercury (Budh).
- [Ruby (Manik)](https://gemrishi.com/gemstone/ruby): Certified natural Burma and Mozambique rubies for Sun (Surya).
- [Red Coral (Moonga)](https://gemrishi.com/gemstone/coral): Authentic Italian and Mediterranean red corals for Mars (Mangal).
- [Natural Pearl (Moti)](https://gemrishi.com/gemstone/pearl): Certified Basra and South Sea natural pearls for Moon (Chandra).
- [Hessonite (Gomed)](https://gemrishi.com/gemstone/hessonite): Natural Ceylon hessonite garnets for Rahu.
- [Cat's Eye (Lehsuniya)](https://gemrishi.com/gemstone/cats-eye): Natural chrysoberyl cat's eye gemstones for Ketu.
- [Fine Jewellery](https://gemrishi.com/jewellery): Custom astrological rings, pendants, and bracelets crafted in gold and silver.

## Guides & Tools

- [Free Astrological Recommendation](https://gemrishi.com/suggest): Personalized Vedic gemstone consultation based on birth chart / Kundli.
- [Gemstone Buying Guide](https://gemrishi.com/gemstone-buy-guide): Expert handbook on evaluating color, clarity, origin, and certifications.
- [Carat to Ratti Converter](https://gemrishi.com/carat-to-ratti-converter): Precision weight conversion calculator for Vedic astrology.
- [Lab Certification Verification](https://gemrishi.com/certificate): Information on lab reports and third-party authenticity tests.

## Company & Policies

- [About Us](https://gemrishi.com/aboutUs): GemRishi history, heritage, and five generations of gemstone craftsmanship since 1904.
- [Contact Support](https://gemrishi.com/contactUs): Customer support, WhatsApp hotline, and showroom locations.
- [Shipping Policy](https://gemrishi.com/shipping): Free insured shipping across India and global delivery details.
- [Return Policy](https://gemrishi.com/return-policy): 10-day hassle-free return and replacement policy.
- [Terms & Conditions](https://gemrishi.com/terms): Official terms of service.
- [Privacy Policy](https://gemrishi.com/privacy): User data protection and privacy policy.
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400"); // Cache 24 hours
  return res.status(200).send(content);
});

export default router;

