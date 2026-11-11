// import { Router } from "express";
// import { Product } from "../models/product.model.js";

// const router = Router();

// router.get("/excel-data", async (req, res) => {
//   try {
//     console.log("🔥 Excel JSON API HIT");

//     const products = await Product.find();

//     const formatted = products.map((p) => ({
//       sku: p.sku || "",
//       name: p.name || "",
//       origin: p.origin || "",
//       carat: p.carat || 0,
//       ratti: p.ratti || 0,
//       price: p.price || 0,
//       sellPrice: p.sellPrice || 0,
//       stock: p.stock || 0,
//       shape: p.shape || "",
//       color: p.color || "",
//       cut: p.cut || "",
//       isAvailable: p.isAvailable || false,
//       isFeatured: p.isFeatured || false,

//       // PRODUCT PAGE URL
//       link: `https://gemrishi.com/gemstones/${p.slug}/dsbhhrujifiuhed4ot340ot04ewgto`,

//       // PRODUCT IMAGE URL
//       image_link: p.images?.[0]?.url
//         ? `https://api.gemrishi.com${p.images[0].url}`
//         : "",

//       createdAt: p.createdAt || "",
//     }));

//     res.json(formatted);

//   } catch (err) {
//     console.error("❌ Excel JSON Error:", err);

//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

// export default router;

import { Router } from "express";
import { Product } from "../models/product.model.js";

const router = Router();

router.get("/excel-data", async (req, res) => {
  try {
    console.log("🔥 Google Merchant CSV Feed HIT");

    const products = await Product.find();

    // Escape CSV safely
    const safe = (value) => {
      return `"${String(value || "").replace(/"/g, '""')}"`;
    };

    // CSV Header
    let csv =
      "id,title,description,link,image_link,additional_image_link,additional_image_link,additional_image_link,availability,price,condition,brand\n";

    products.forEach((p) => {

      // Main image
      const mainImage = p.images?.[0]?.url
        ? `https://api.gemrishi.com${p.images[0].url}`
        : "";

      // Additional images separately
      const additionalImages = p.images
        ?.slice(1, 4)
        .map((img) => `https://api.gemrishi.com${img.url}`) || [];

      // Product URL
      const link =
        `https://gemrishi.com/gemstones/${p.slug}/dsbhhrujifiuhed4ot340ot04ewgto`;

      // Availability
      const availability =
        p.stock > 0 ? "in stock" : "out of stock";

      csv += [
        safe(p.sku),
        safe(p.name),
        safe(p.description || ""),
        safe(link),

        // Main image
        safe(mainImage),

        // Additional images
        safe(additionalImages[0] || ""),
        safe(additionalImages[1] || ""),
        safe(additionalImages[2] || ""),

        safe(availability),
        safe(`${p.price} INR`),
        safe("new"),
        safe("GemRishi"),
      ].join(",") + "\n";
    });

    // Headers
    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      "inline; filename=google-merchant-feed.csv"
    );

    res.status(200).send(csv);

  } catch (err) {
    console.error("❌ Google Merchant Feed Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;