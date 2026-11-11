import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import "./cron/orderCleanup.js";
import "./cron/abandonedCheckoutSync.js";
import fs from "fs";
import cashfreeRoutes from "./routers/cashfree.route.js";
// import breezeRoutes from "./routers/breeze.route.js";
import razorpayRoutes from "./routers/razorpay.route.js";
import abandonedCheckoutRoutes from "./routers/abandonedCheckout.route.js";
import googleMerchantRoutes from "./routers/googleMerchant.route.js";
import productFeedRoutes from "./routers/productFeed.route.js"; //------add by pawan----
import leadRoutes from "./routers/lead.route.js";
import sitemapRoutes from "./routers/sitemap.route.js";
import { Product } from "./models/product.model.js";
import { Jewelry } from "./models/jewelry.model.js";
import { cleanSku, createCleanSlug } from "./utils/slugify.js";
// Add By Pawan for currency ---------------------------------------
import "./cron/currencyRateUpdate.js";
import currencyRoutes from "./routers/currency.routes.js";
import logger from "./utils/logger.js";
const router = express.Router();
// Add By Pawan for currency ---------------------------------------

//-----------------------Setup-----------------------------------------------------------
const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert comma-separated origins from .env into an array
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim().replace(/\/+$/, ""))
  : [];

console.log("✅ Allowed CORS Origins:", allowedOrigins);

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like Postman, curl, server-to-server)
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, "");

  // If wildcard * is present in CORS_ORIGIN, allow all
  if (allowedOrigins.includes("*")) {
    return true;
  }

  // Exact match in configured origins (case-insensitive)
  if (allowedOrigins.some((allowed) => allowed.toLowerCase() === normalized.toLowerCase())) {
    return true;
  }

  // Localhost & 127.0.0.1 on any port (HTTP or HTTPS)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return true;
  }

  // Stagging domain & subdomains (e.g., https://stagging.io, https://www.stagging.io, https://admin.stagging.io)
  if (/^https?:\/\/([a-z0-9-]+\.)*stagging\.io(:\d+)?$/i.test(normalized)) {
    return true;
  }

  // Production domain & subdomains (e.g., https://gemrishi.com, https://www.gemrishi.com, https://admin.gemrishi.com)
  if (/^https?:\/\/([a-z0-9-]+\.)*gemrishi\.com(:\d+)?$/i.test(normalized)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS blocked request from: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  // Add By Pawan for fixing google Analytics Error ---------------------------------------
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-Access-Token",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true, // allow cookies or auth headers
  // Add By Pawan for fixing google Analytics Error ---------------------------------------
  optionsSuccessStatus: 200,
};

// Apply CORS globally
app.use(cors(corsOptions));

//------------------Add By Pawan for currency ---------------------------------------
app.use("/api/v1/currency",currencyRoutes);
// -----------------Add By Pawan for currency ---------------------------------------

// ✅ Static uploads configuration - Always resolve relative to __dirname for consistency
const uploadsDirectory = path.resolve(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}
const staticUploadsMiddleware = express.static(uploadsDirectory, {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
});

app.use("/uploads", staticUploadsMiddleware);
app.use("/public/uploads", staticUploadsMiddleware);
app.use("/api/v1/uploads", staticUploadsMiddleware);
app.use("/api/v1/public/uploads", staticUploadsMiddleware);

// Body Parsers configuration
app.use(
  express.json({
    limit: "10mb", // Limiting the size of incoming JSON payloads
    // Keep the exact bytes: Razorpay's webhook signature is computed over the raw body.
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true })); // Limiting the size of URL-encoded form data

app.use(cookieParser());

// Social Sharing
// app.get("/gemstones/:slug/:id", async (req, res) => {
//   console.log("🔥 OG ROUTE HIT");

//   const { slug } = req.params;

//   try {
//     const product = {
//       name: slug,
//       description: "Gemstone product",
//       image: "https://gemrishi.com/logo.jpg",
//     };

//     const ua = req.headers["user-agent"] || "";

//     const isBot =
//       ua.includes("facebookexternalhit") ||
//       ua.includes("WhatsApp") ||
//       ua.includes("Twitterbot") ||
//       ua.includes("LinkedInBot");

//     if (isBot) {
//       return res.send(`
//         <!doctype html>
//         <html>
//           <head>
//             <title>${product.name}</title>
//             <meta property="og:title" content="${product.name}" />
//             <meta property="og:description" content="${product.description}" />
//             <meta property="og:image" content="${product.image}" />
//             <meta property="og:url" content="https://gemrishi.com${req.originalUrl}" />
//           </head>
//           <body></body>
//         </html>
//       `);
//     }

//     // ✅ FIXED PATH HERE
//     return res.sendFile(
//       path.resolve("../frontend/dist/index.html")
//     );

//   } catch (err) {
//     console.error("❌ OG ERROR:", err);
//     return res.sendFile(
//       path.resolve("../frontend/dist/index.html")
//     );
//   }
// });



// Universal Product & Gemstone OpenGraph / SSR / 301 Redirect Route
app.get([
  "/products/:name/:sku",
  "/products/:slug",
  "/gemstones/:slug",
  "/gemstones/:slug/:id",
  "/details/product/:slug",
  "/details/product/:slug/:id"
], async (req, res) => {
  const { name, sku, slug, id } = req.params;
  const identifier = slug || id || name || "";
  let imageUrl = "https://gemrishi.com/logo.jpg";
  let title = "GemRishi Product";

  try {
    let product = null;
    if (sku) {
      product = await Product.findOne({ sku: { $regex: `^${cleanSku(sku)}$`, $options: "i" } }).lean();
      if (!product) product = await Jewelry.findOne({ sku: { $regex: `^${cleanSku(sku)}$`, $options: "i" } }).lean();
    }
    if (!product && identifier) {
      product = await Product.findOne({ $or: [{ slug: identifier }, { pastSlugs: identifier }] }).lean();
      if (!product) product = await Jewelry.findOne({ $or: [{ slug: identifier }, { pastSlugs: identifier }] }).lean();
    }

    if (product) {
      title = product.name || product.jewelryName || title;
      if (product.images && product.images.length > 0) {
        const raw = product.images[0].url;
        if (raw) {
          imageUrl = raw.startsWith("http") ? raw : `https://gemrishi.com${raw}`;
        }
      }
    }
  } catch (e) {
    console.log("Product metadata fetch skipped:", e.message);
  }

  const ua = req.headers["user-agent"] || "";
  const isBot =
    ua.includes("facebookexternalhit") ||
    ua.includes("WhatsApp") ||
    ua.includes("Twitterbot") ||
    ua.includes("LinkedInBot");

  if (isBot) {
    return res.send(`
      <!doctype html>
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="Gemstone & Jewellery collection at GemRishi" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="https://gemrishi.com${req.originalUrl}" />
        </head>
        <body></body>
      </html>
    `);
  }

  // normal user: serve SPA index.html
  const distPath = path.resolve("../frontend/dist/index.html");
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  return res.sendFile(path.resolve("./public/index.html"));
});


// Static Files
app.use(express.static(path.resolve(__dirname, "public")));

// Route Imports
// import superAdminRouter from "./routers/superAdmin.routes.js";
import superAdminRouter from "./routers/superAdmin.routes.js";
import userRoutes from "./routers/user.route.js";
import retailerRoutes from "./routers/retailer.route.js";
import productRoutes from "./routers/product.route.js";
import { exportProductsCsv, viewProductsDashboard } from "./controllers/product.controller.js";
import jewelryRoutes from "./routers/jewelry.route.js";
import orderRoutes from "./routers/order.route.js";
import dashboardRoutes from "./routers/dashboard.route.js";
import categoryRoutes from "./routers/category.route.js";
import adminRouter from "./routers/admin.routes.js";
import subcategoryRoutes from "./routers/subcategory.route.js";
import jewelryCategoryRoutes from "./routers/jewelry.category.route.js";
import jewelrySubCategoryRoutes from "./routers/jewelry.subcategory.route.js";
import recommendedRoutes from "./routers/recommended.routes.js";
import bannerRoutes from "./routers/banner.routes.js";
import refundRoutes from "./routers/refund.routes.js";
import wishlistRoutes from "./routers/wishlist.routes.js";
import reviewRatingRoutes from "./routers/reviewRating.routes.js";
import analyticsRoutes from "./routers/analytics.route.js";
import cartRoutes from "./routers/cart.routes.js";
import metalRates from "./routers/metalRates.routes.js";
import originCountryMap from "./routers/originCountryMap.routes.js";
import retailerCartRoutes from "./routers/retailerCart.routes.js";
import emailSubRoutes from "./routers/emailSub.routes.js";
import buyBackReqRoutes from "./routers/buy.back.req.route.js";
import offerRoutes from "./routers/offer.routes.js";
import contactUsRoutes from "./routers/contactUs.route.js";
import webhookRoutes from "./routers/webhook.route.js";

//& Color codes for console output
const reset = "\x1b[0m"; // Reset
const green = "\x1b[32m"; // Green
const red = "\x1b[31m"; // Red
const skyblue = "\x1b[94m"; // Sky Blue
const cyan = "\x1b[36m"; // Cyan
const yellow = "\x1b[33m"; // Yellow
const magenta = "\x1b[35m"; // Magenta

// const colors = {
// 	GET: "\x1b[36m", // Cyan
// 	POST: "\x1b[32m", // Green
// 	PUT: "\x1b[35m", // Mangenta
// 	DELETE: "\x1b[31m", // Red
// 	PATCH: "\x1b[33m", // Yellow
// 	DEFAULT: "\x1b[0m", // Reset
// };

// const logMiddleware = (req, res, next) => {
// 	const color = colors[req.method] || colors.DEFAULT;
// 	const reset = colors.DEFAULT;

// 	logger.info({
// 		message: ${color}${req.method} Request received${reset},
// 		method: ${color}${req.method}${reset},
// 		url: ${color}${req.originalUrl}${reset},
// 		status: ${color}${res.statusCode}${reset},
// 		headers: ${color}${JSON.stringify(req.headers, null, 2)}${reset},
// 		params: ${color}${JSON.stringify(req.params, null, 2)}${reset},
// 		query: ${color}${JSON.stringify(req.query, null, 2)}${reset},
// 		formdata: ${color}${JSON.stringify(req.files, null, 2)}${reset},
// 	});

// 	const originalSend = res.send;
// 	res.send = function (body) {
// 		logger.info({
// 			message: ${color}${req.method} Response sent${reset},
// 			status: ${color}${res.statusCode}${reset},
// 			body: `${color}${
// 				typeof body === "object" ? JSON.stringify(body, null, 2) : body
// 			}${reset}`,
// 		});
// 		originalSend.call(this, body);
// 	};
// 	next();
// };
// app.use(logMiddleware);

// console lgging request details
// Request Logging Middleware
app.use((req, res, next) => {
  const methodColors = {
    GET: "\x1b[32m", // Green
    POST: "\x1b[36m", // Cyan
    PATCH: "\x1b[33m", // Yellow
    PUT: "\x1b[35m", // Magenta
    DELETE: "\x1b[31m", // Red
    DEFAULT: "\x1b[0m", // Reset
  };

  const reset = "\x1b[0m"; // Reset
  const color = methodColors[req.method] || methodColors.DEFAULT;

  res.on("finish", () => {
    let statusColor = "\x1b[32m"; // Green by default
    if (res.statusCode >= 500)
      statusColor = "\x1b[31m"; // Red
    else if (res.statusCode >= 400) statusColor = "\x1b[33m"; // Yellow

    console.log(
      `${skyblue}[${new Date().toISOString()}]${reset} ${statusColor}[${
        res.statusCode
      }]${reset} ${color}${req.method}${reset}\t ${statusColor}${
        req.originalUrl
      }${reset}`,
    );

    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
      });
    } else {
      logger.info(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
      });
    }
  });

  next();
});

// API Status Checking URL
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    server: "Gemstone Backend Server",
    status: "OK",
    branch: "Master Branch",
    version: "1.0.0",
    date: new Date().toISOString(),
    message: "API Server is up and running!",
  });
});
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
// Route Declarations
const apiVersion = "/api/v1";
app.use(`${apiVersion}/superAdmin`, superAdminRouter); // Not Using
app.use(`${apiVersion}/admin`, adminRouter);
app.use("/api/v1/superAdmin", superAdminRouter);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/retailer", retailerRoutes);

app.use("/api/v1/product", productRoutes);
app.get("/api/v1/products-export", exportProductsCsv);
app.get("/api/v1/products-view", viewProductsDashboard);

app.use("/api/v1/jewelry", jewelryRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/subcategory", subcategoryRoutes);
app.use("/api/v1/jewelryCategory", jewelryCategoryRoutes);
app.use("/api/v1/jewelrySubCategory", jewelrySubCategoryRoutes);
app.use("/api/v1/recommended", recommendedRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/refund", refundRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/reviewRating", reviewRatingRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/metalRates", metalRates);
app.use("/api/v1/cashfree", cashfreeRoutes);
// app.use("/api/v1/breeze", breezeRoutes);
app.use("/api/v1/razorpay", razorpayRoutes);
app.use("/api/v1/admin/abandoned-checkouts", abandonedCheckoutRoutes);
app.use("/api/v1/originCountryMap", originCountryMap);
app.use("/api/v1/retailerCart", retailerCartRoutes);
app.use("/api/v1/emailSub", emailSubRoutes);
app.use("/api/v1/buyBackReq", buyBackReqRoutes);
app.use("/api/v1/offer", offerRoutes);
app.use("/api/v1/contactUs", contactUsRoutes);
app.use("/api/v1/lead", leadRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/google-merchant", googleMerchantRoutes);
app.use("/feeds", productFeedRoutes); // -----Add By Pawan---------
app.use("/", sitemapRoutes);
app.use("/api/v1", sitemapRoutes);
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API WORKING", autoDeploy: "active", version: "1.0.1" });
});
// 404 Handler
app.use((req, res, next) => {
  console.log(
    `${skyblue}[${new Date().toISOString()}]${reset} ${red}[${
      res.statusCode
    }] ${req.method}\t ${req.originalUrl}\t\t<-- * Endpoint Not Found${reset}`,
  );
  return res.status(404).json({
    success: false,
    message: "Endpoint not found!",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.log(
    `${skyblue}[${new Date().toISOString()}]${reset} ${red}[${statusCode}] ${req.method}\t ${
      req.originalUrl
    }\t\t<-- * Something Went Wrong Here${reset}`,
  );
  console.error(err);

  logger.error(err.message || "Internal Server Error", {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    meta: {
      stack: err.stack,
    },
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
//& 201 is the status code for created
//& 400 is the status code for bad request
//& 500 is the status code for internal server error
//& 404 is the status code for not found
//& 401 is the status code for unauthorized
//& 403 is the status code for forbidden
//& 409 is the status code for conflict(duplicate entries)
//& 200 is the status code for success
//& 202 is the status code for accepted
//& 204 is the status code for no content
//& 422 is the status code for unprocessable entity
