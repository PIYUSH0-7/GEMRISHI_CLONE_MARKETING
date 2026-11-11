import { Router } from "express";
import { Product } from "../models/product.model.js";

const router = Router();
import uploadPath from "../utils/uploadPaths.js";
// import Product from "../models/product.model.js";
import { body, validationResult } from "express-validator";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProduct,
  deleteImage,
  deleteProduct,
  deleteVideo,
  editImage,
  editVideo,
  filterProducts,
  getAllProducts,
  getFeaturedProducts,
  getSingleProduct,
  updateProduct,
  getOriginCountryForSubCat,
  crossSellingProductList,
  upSellingProductSKU,
  filterProductsByPurpose,
  getProductBySlugDirect,
  exportProductsCsv,
  viewProductsDashboard,
} from "../controllers/product.controller.js";
import {
  protect,
  checkUserLoggedIn,
  protectAdmin,
} from "../middlewares/authMiddleware.js";
import {
  searchApi,
  similarJewelries,
  similarProducts,
} from "../controllers/jewelry.controller.js";
import {
  customUpload,
  customUploadFields,
} from "../middlewares/multer.middleware.js";
// import { cacheMiddleware } from "../middlewares/cache.middleware.js";

const gemstoneValidators = [
  body("sku").notEmpty().withMessage("SKU is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("origin").notEmpty().withMessage("Origin is required"),
  body("carat").isNumeric().withMessage("Carat must be a number"),
  body("ratti").optional().isNumeric(),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("certificateTypes").optional(),
  body("weight").optional(),
  body("description").optional().isString(),
  body("treatment").optional().isString(),
  body("shape").optional().isString(),
  body("color").optional().isString(),
  body("cut").optional().isString(),
  body("isAvailable").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("stock").optional().isInt({ min: 0 }),
  // middleware to check validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const gemstoneUpdateValidators = [
  body("sku").optional(),
  body("name").optional(),
  body("origin").optional(),
  body("carat").optional().isNumeric().withMessage("Carat must be a number"),
  body("ratti").optional().isNumeric(),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("weight").optional(),
  body("description").optional().isString(),
  body("treatment").optional().isString(),
  body("shape").optional().isString(),
  body("color").optional().isString(),
  body("cut").optional().isString(),
  body("isAvailable").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("stock").optional().isInt({ min: 0 }),
  body("upSellingProductSKU").optional(),
  // middleware to check validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Live Products CSV Export & Web Dashboard View
router.get("/products-export", exportProductsCsv);
router.get("/products-view", viewProductsDashboard);
router.get("/export", exportProductsCsv);
router.get("/view", viewProductsDashboard);
router.get("/excel", exportProductsCsv);

router.get("/search", searchApi);
router.get("/filter", filterProducts);
// new one added here
router.get("/filter-by-purpose", filterProductsByPurpose);
router.get("/featured-products", getFeaturedProducts);

router.post(
  "/create-gemstone/:subcategoryId",
  customUploadFields({
    fields: [
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ],
    uploadDir: uploadPath.productUpload,
    fileNamePrefix: "product-asset",
  }),
  gemstoneValidators,
  createProduct,
);

router.get(
  "/get-all-gemstones",
  /* cacheMiddleware("gemstones"), */ getAllProducts,
);

router.get("/single-gemstone/:name/:sku", getSingleProduct);
router.get("/single-gemstone/:slug", getSingleProduct);
router.get("/single-product/:name/:sku", getSingleProduct);
router.get("/single-product/:slug", getSingleProduct);
router.get("/universal/:name/:sku", getSingleProduct);
router.get("/universal/:slug", getSingleProduct);

router.delete("/delete-gemstone/:productId", protectAdmin, deleteProduct);

router.put(
  "/update-gemstone/:productId",
  customUploadFields({
    fields: [
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ],
    uploadDir: uploadPath.productUpload,
    fileNamePrefix: "product-asset",
  }),
  gemstoneUpdateValidators,
  protectAdmin,
  updateProduct,
);

router.put(
  "/edit-image/:productId/:imageId",
  customUpload({
    fieldName: "images",
    uploadDir: uploadPath.productUpload,
    fileNamePrefix: "product-asset",
  }),
  protectAdmin,
  editImage,
);
router.delete("/delete-image/:productId/:imageId", protectAdmin, deleteImage);

router.put(
  "/edit-video/:productId/:videoId",
  customUpload({
    fieldName: "videos",
    uploadDir: uploadPath.productUpload,
    fileNamePrefix: "product-asset",
  }),
  protectAdmin,
  editVideo,
);
router.delete("/delete-video/:productId/:videoId", protectAdmin, deleteVideo);

router.get("/similar-products/:productId", similarProducts);

router.get("/similar-jewelleries/:jewelryId", similarJewelries);

router.get(
  "/get-product-origin-countries-list/:slug",
  getOriginCountryForSubCat,
);

router.get("/cross-selling-product-list", protect, crossSellingProductList);

router.get("/upselling-product-list/:productId", upSellingProductSKU);

// helpers
const getAbsoluteImageUrl = (url, domain) => {
  if (!url) return `${domain}/logo.jpg`;
  if (url.startsWith("http")) return url;
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${domain}${clean}`;
};

// new route for WhatsApp & social conversion.
router.get("/share/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await getProductBySlugDirect(slug);

    if (!product) return res.status(404).send("Product not found");

    const domain = process.env.DOMAIN_NAME || "https://api.gemrishi.com";
    const image = getAbsoluteImageUrl(product.images?.[0]?.url, domain);

    const title = product.name || "Gemrishi Product";
    const price =
      product.sellPrice || product.price
        ? `₹${Number(product.sellPrice || product.price).toLocaleString("en-IN")}`
        : "";
    const details = [
      product.carat ? `${product.carat} Carats` : "",
      product.origin || "",
      product.color || "",
      product.shape || "",
    ]
      .filter(Boolean)
      .join(" · ");

    const desc = ((product.description || "Premium gemstone") + " " + details)
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .slice(0, 150);

    const pageUrl = `${domain}/share/${encodeURIComponent(slug)}`;
    const canonical = `${process.env.FRONTEND_URL}/gemstones/${encodeURIComponent(
      slug,
    )}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${desc}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${title} — ${details} ${price}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:site_name" content="Gemrishi">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} — ${details} ${price}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${image}">

    <link rel="canonical" href="${canonical}">
    <script>
      window.location.replace("${canonical}");
    </script>
  </head>
  <body>
    <p>Redirecting… <a href="${canonical}">click here</a></p>
  </body>
</html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
