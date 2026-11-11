import { Router } from "express";
import { Product } from "../models/product.model.js";

const router = Router();

router.get("/excel-data", async (req, res) => {
  try {
    console.log("🔥 Excel JSON API HIT");

    const products = await Product.find();

    const formatted = products.map((p) => ({
      sku: p.sku || "",
      name: p.name || "",
      origin: p.origin || "",
      carat: p.carat || 0,
      ratti: p.ratti || 0,
      price: p.price || 0,
      sellPrice: p.sellPrice || 0,
      stock: p.stock || 0,
      shape: p.shape || "",
      color: p.color || "",
      cut: p.cut || "",
      isAvailable: p.isAvailable || false,
      isFeatured: p.isFeatured || false,

      // PRODUCT PAGE URL
      link: `https://gemrishi.com/gemstones/${p.slug}/dsbhhrujifiuhed4ot340ot04ewgto`,

      // PRODUCT IMAGE URL
      image_link: p.images?.[0]?.url
        ? `https://api.gemrishi.com${p.images[0].url}`
        : "",

      createdAt: p.createdAt || "",
    }));

    res.json(formatted);

  } catch (err) {
    console.error("❌ Excel JSON Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;