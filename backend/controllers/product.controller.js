import mongoose from "mongoose";
import { Jewelry } from "../models/jewelry.model.js";
import { Product } from "../models/product.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { originCountryMap } from "../models/originCountryMap.model.js";
import { MetalRates } from "../models/metalRates.model.js";
import { createCleanSlug, cleanSku, getCanonicalSlug, getCanonicalProductPath } from "../utils/slugify.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.model.js";

// imports for file handling
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import uploadPath from "../utils/uploadPaths.js";

// Helper to delete uploaded file if it exists
function deleteUploadedFiles(req, fileUploadPath) {
  const uploadPath = fileUploadPath;

  // For single file (e.g., upload.single)
  if (req.file) {
    const filePath = path.join(__dirname, uploadPath, req.file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // For multiple files (e.g., upload.fields)
  if (req.files) {
    Object.values(req.files).forEach((fileArr) => {
      fileArr.forEach((file) => {
        const filePath = path.join(__dirname, uploadPath, file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    });
  }
}

function toArray(value) {
  if (!value) return [];
  try {
    // If already an array, return as-is
    if (Array.isArray(value)) return value;
    // If JSON string, parse
    return JSON.parse(value);
  } catch {
    // Fallback for comma-separated string
    return value.split(",").map((v) => v.trim());
  }
}

export const createProduct = asyncHandler(async (req, res) => {
  const {
    sku,
    name,
    origin,
    carat,
    ratti,
    price,
    certificateTypes,
    certificatePrices,
    weight,
    description,
    treatment,
    shape,
    color,
    cut,
    isAvailable,
    isFeatured,
    stock,
    sellPrice,
    deliveryDays,
  } = req.body;

  const parsedCertificate = toArray(req.body.certificateTypes);

  const parsedupSellingProductSKU = toArray(req.body.upSellingProductSKU);

  const productUploadPath = uploadPath.productUpload;

  if (!sku || !name || !origin || !price) {
    deleteUploadedFiles(req, productUploadPath);
    return res.status(400).json({ msg: "Pls enter all fields" });
  }
  const files = req.files || {};

  const existingSku = await Product.findOne({ sku });
  if (existingSku) {
    deleteUploadedFiles(req, productUploadPath);
    return res
      .status(400)
      .json({ msg: "Product with this SKU already exists" });
  }

  const { subcategoryId } = req.params;
  if (!subcategoryId) {
    deleteUploadedFiles(req, productUploadPath);
    return res.status(400).json({ msg: "No Subcategory found" });
  }

  const images = Array.isArray(files?.images)
    ? files.images
    : [files?.images].filter(Boolean);
  const videos = Array.isArray(files?.videos)
    ? files.videos
    : [files?.videos].filter(Boolean);

  // Use the centralized uploadPath for consistent URL generation
  const productPath = productUploadPath.replace("../", "/");
  const gemimages = images.map((file) => ({
    fileName: file.filename,
    url: `${productPath}${file.filename}`,
  }));

  const gemvideos = videos.map((file) => ({
    fileName: file.filename,
    url: `${productPath}${file.filename}`,
  }));

  const certificate = Array.isArray(parsedCertificate)
    ? parsedCertificate.map((c) => ({
        certificateType: c.type,
        price: Number(c.price),
      }))
    : [];

  const upSellingProductSKU = Array.isArray(parsedupSellingProductSKU)
    ? parsedupSellingProductSKU
    : [];

  const newProduct = await Product.create({
    sku,
    name: name + " " + carat + " Carats",
    origin,
    carat,
    ratti,
    price,
    certificate,
    weight,
    description,
    treatment,
    shape,
    color,
    cut,
    isAvailable,
    isFeatured,
    stock,
    sellPrice,
    deliveryDays,
    subCategory: subcategoryId,
    images: gemimages, /// images field in postman
    videos: gemvideos, // videos field in postman
    upSellingProductSKU,
  });

  await SubCategory.findByIdAndUpdate(subcategoryId, {
    $push: { products: newProduct._id },
  });

  return res.status(201).json({
    msg: "Gem stone created successfully",
    newProduct,
  });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const colorFilter = req.query.color?.trim();

  const colorMap = {
    "light pink": "pink",
    "dark pink": "pink",
    "pastel pink": "pink",
    pink: "pink",
    rose: "pink",
    "sky blue": "blue",
    "pastel blue": "blue",
    "navy blue": "blue",
    blue: "blue",
    green: "green",
    "forest green": "green",
    "mint green": "green",
    red: "red",
    "maroon red": "red",
    "ruby red": "red",
    purple: "purple",
    violet: "purple",
    yellow: "yellow",
    gold: "yellow",
    grey: "grey",
    gray: "grey",
    brown: "brown",
    orange: "orange",
    turquoise: "blue",
    teal: "blue",
    white: "white",
    black: "black",
  };

  const query = {};
  if (colorFilter) {
    const normalizedColor =
      colorMap[colorFilter.toLowerCase()] || colorFilter.toLowerCase();
    const shadeRegexMap = {
      blue: ["blue", "sky blue", "pastel blue", "turquoise", "teal"],
      green: [
        "green",
        "forest green",
        "mint green",
        "emerald green",
        "sea green",
      ],
      red: ["red", "ruby red", "maroon red", "crimson", "scarlet"],
      pink: ["pink", "light pink", "dark pink", "pastel pink", "rose", "blush"],
      purple: ["purple", "violet", "lavender", "amethyst"],
      yellow: ["yellow", "gold", "lemon", "mustard"],
      grey: ["grey", "gray", "silver", "charcoal"],
      brown: ["brown", "chocolate", "tan", "coffee"],
      orange: ["orange", "coral", "amber"],
      white: ["white", "ivory", "cream"],
      black: ["black", "onyx", "jet"],
    };

    const patterns = shadeRegexMap[normalizedColor]
      ? shadeRegexMap[normalizedColor]
      : [normalizedColor];

    query.color = {
      $regex: patterns.map((pattern) => `(${pattern})`).join("|"),
      $options: "i",
    };
  }

  const total = await Product.countDocuments(query);

  let products;
  if (req.user) {
    const userId = req.user._id;
    products = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          isWishlisted: { $in: [userId, { $ifNull: ["$wishlistedBy", []] }] },
        },
      },
      { $project: { wishlistedBy: 0 } },
      { $skip: skip },
      { $limit: limit },
    ]);
  } else {
    products = await Product.find(query)
      .select("-wishlistedBy")
      .skip(skip)
      .limit(limit);
    if (!products || products.length === 0) {
      return res.status(200).json({ msg: "no products found" });
    }
  }

  // const productsWish = await Product.aggregate([
  //   { $match: {/* your filters */} },
  //   { $addFields: {
  //       isWishlisted: { $in: [userId, "$wishlistedBy"] }
  //     }
  //   },
  //   { $project: { name: 1, price: 1, images: 1, isWishlisted: 1 } },
  //   { $skip: skip }, // for pagination
  //   { $limit: limit }
  // ]);

  return res.status(200).json({
    success: true,
    msg: "All stones fetched successfully",
    products,
    totalPage: Math.ceil(total / limit),
    currentPage: page,
  });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(15);

  return res.status(200).json({
    msg: "Featured products found",
    products,
  });
});

// Helper to fetch latest metal rates for jewelry items
async function getLatestMetalRatesHelper() {
  try {
    return await MetalRates.findOne().sort({ createdAt: -1 }).lean();
  } catch {
    return null;
  }
}

/**
 * Universal Single Product / Jewelry Resolver
 * Supports: /products/:name/:sku, /products/:slug, /gemstones/:slug, /details/product/:slug
 */
export const getSingleProduct = asyncHandler(async (req, res) => {
  const { slug, name, sku } = req.params;
  const rawIdentifier = slug || req.params.slugOrId || "";
  const cleanN = name ? createCleanSlug(name) : "";
  const cleanS = sku ? cleanSku(sku) : "";
  const cleanId = rawIdentifier ? rawIdentifier.trim() : "";

  let product = null;
  let itemType = "Gemstone";
  let isRedirect = false;

  // 1. If explicit SKU is passed (e.g. /products/:name/:sku)
  if (cleanS) {
    product = await Product.findOne({
      sku: { $regex: `^${cleanS}$`, $options: "i" },
    }).populate("subCategory");

    if (!product) {
      product = await Jewelry.findOne({
        sku: { $regex: `^${cleanS}$`, $options: "i" },
      }).populate("subCategory productSubCategory");
      if (product) itemType = "Jewelry";
    }
  }

  // 1b. If rawIdentifier contains slash (e.g. name/sku)
  if (!product && cleanId && cleanId.includes("/")) {
    const parts = cleanId.split("/");
    const pSku = cleanSku(parts[parts.length - 1]);
    if (pSku) {
      product = await Product.findOne({
        sku: { $regex: `^${pSku}$`, $options: "i" },
      }).populate("subCategory");
      if (!product) {
        product = await Jewelry.findOne({
          sku: { $regex: `^${pSku}$`, $options: "i" },
        }).populate("subCategory productSubCategory");
        if (product) itemType = "Jewelry";
      }
    }
  }

  // 2. Lookup in Gemstones by slug, pastSlugs, sku, or ID
  if (!product && cleanId) {
    product = await Product.findOne({ slug: cleanId }).populate("subCategory");
    if (!product) {
      product = await Product.findOne({ pastSlugs: cleanId }).populate("subCategory");
      if (product) isRedirect = true;
    }
    if (!product) {
      product = await Product.findOne({
        sku: { $regex: `^${cleanId}$`, $options: "i" },
      }).populate("subCategory");
    }
  }

  // 3. Lookup in Jewelry by slug, pastSlugs, sku, or ID
  if (!product && cleanId) {
    product = await Jewelry.findOne({
      $or: [
        { slug: cleanId.toLowerCase() },
        { slug: cleanId },
        { slug: { $regex: `^${cleanId}$`, $options: "i" } },
      ],
    }).populate("subCategory productSubCategory");

    if (product) {
      itemType = "Jewelry";
    } else {
      product = await Jewelry.findOne({
        $or: [
          { pastSlugs: cleanId.toLowerCase() },
          { pastSlugs: cleanId },
        ],
      }).populate("subCategory productSubCategory");
      if (product) {
        itemType = "Jewelry";
        isRedirect = true;
      }
    }
    if (!product) {
      product = await Jewelry.findOne({
        sku: { $regex: `^${cleanSku(cleanId)}$`, $options: "i" },
      }).populate("subCategory productSubCategory");
      if (product) itemType = "Jewelry";
    }
    // 3b. If cleanId contains hyphens, check if last token is SKU (e.g. name-sku)
    if (!product && cleanId.includes("-")) {
      const parts = cleanId.split("-");
      const possibleSku = parts[parts.length - 1];
      if (possibleSku) {
        product = await Jewelry.findOne({
          sku: { $regex: `^${cleanSku(possibleSku)}$`, $options: "i" },
        }).populate("subCategory productSubCategory");
        if (product) itemType = "Jewelry";
      }
    }
  }

  // 4. Combined Name-SKU fallback
  if (!product && cleanN && cleanS) {
    const comboSlug = `${cleanN}-${cleanS}`;
    product = await Product.findOne({
      $or: [{ slug: comboSlug }, { pastSlugs: comboSlug }],
    }).populate("subCategory");

    if (!product) {
      product = await Jewelry.findOne({
        $or: [{ slug: comboSlug }, { pastSlugs: comboSlug }],
      }).populate("subCategory productSubCategory");
      if (product) itemType = "Jewelry";
    }
  }

  // 5. MongoDB ObjectId direct fallback
  if (!product && cleanId && mongoose.Types.ObjectId.isValid(cleanId)) {
    product = await Product.findById(cleanId).populate("subCategory");
    if (!product) {
      product = await Jewelry.findById(cleanId).populate("subCategory productSubCategory");
      if (product) itemType = "Jewelry";
    }
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      msg: "Product not found",
    });
  }

  // Calculate canonical name, SKU, slug, and canonical URL
  const prodName = product.name || product.jewelryName || "";
  const cleanNameSlug = createCleanSlug(prodName);
  const cleanSkuSlug = cleanSku(product.sku);
  const canonicalUrl = getCanonicalProductPath(prodName, product.sku);
  const canonicalSlug = getCanonicalSlug(prodName, product.sku);

  // Check if redirect is needed (if requested via old pattern)
  if (req.originalUrl && !req.originalUrl.includes(canonicalUrl)) {
    isRedirect = true;
  }

  // Fetch contextual metadata
  let countryData = null;
  let metalRates = null;

  if (itemType === "Gemstone" && product.origin) {
    countryData = await originCountryMap.findOne({
      countryName: { $regex: `^${product.origin}$`, $options: "i" },
    });
  }

  if (itemType === "Jewelry") {
    metalRates = await getLatestMetalRatesHelper();
  }

  return res.status(200).json({
    success: true,
    msg: "Product fetched successfully",
    product,
    itemType,
    isRedirect,
    canonicalUrl,
    cleanName: cleanNameSlug,
    cleanSku: cleanSkuSlug,
    activeSlug: canonicalSlug,
    countryData,
    metalRates,
  });
});

export const getUniversalProduct = getSingleProduct;

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ msg: "no prod found" });
  }

  const productUploadPath = uploadPath.productUpload;

  // Delete all associated image files
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.fileName) {
        const imagePath = path.join(
          __dirname,
          productUploadPath,
          image.fileName,
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
  }

  // Delete all associated video files
  if (product.videos && product.videos.length > 0) {
    for (const video of product.videos) {
      if (video.fileName) {
        const videoPath = path.join(
          __dirname,
          productUploadPath,
          video.fileName,
        );
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
    }
  }

  const deletStone = await Product.findByIdAndDelete(productId);

  // Remove the deleted product from all users' carts
  await User.updateMany(
    { "cart.item": productId },
    { $pull: { cart: { item: productId } } },
  );

  // Remove the deleted product from all users' wishlists
  await User.updateMany(
    { "wishlist.item": productId },
    { $pull: { wishlist: { item: productId } } },
  );

  return res.status(200).json({
    msg: "Gemstone product, its files, and all associated user cart/wishlist entries have been deleted successfully",
    deletStone,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updateData = req.body;
  const { productId } = req.params;
  // const { imageIndex, videoIndex } = req.body;  need to add logic for to replace old video or old image
  const files = req.files;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "Product not found" });
  }

  // Determine target slug if slug, name, or SKU is updated
  let targetSlug = null;
  if (updateData.slug && updateData.slug.trim()) {
    targetSlug = createCleanSlug(updateData.slug);
  } else if (updateData.name || updateData.sku) {
    targetSlug = createCleanSlug(
      updateData.name || product.name,
      updateData.sku || product.sku
    );
  }

  // If slug has changed, ensure uniqueness and archive previous slug into pastSlugs
  if (targetSlug && targetSlug !== product.slug) {
    let finalSlug = targetSlug;
    let counter = 1;
    while (await Product.exists({ slug: finalSlug, _id: { $ne: productId } })) {
      finalSlug = `${targetSlug}-${counter++}`;
    }

    if (!product.pastSlugs) product.pastSlugs = [];
    if (product.slug && !product.pastSlugs.includes(product.slug)) {
      product.pastSlugs.push(product.slug);
    }
    product.slug = finalSlug;
  }
  delete updateData.slug;
  const productUploadPath = uploadPath.productUpload;
  const productPath = productUploadPath.replace("../", "/");
  if (files?.images) {
    const newImages = files.images.map((file) => ({
      fileName: file.filename,
      url: `${productPath}${file.filename}`,
    }));
    product.images.push(...newImages);
  }

  if (files?.videos) {
    const newVideos = files.videos.map((file) => ({
      fileName: file.filename,
      url: `${productPath}${file.filename}`,
    }));
    product.videos.push(...newVideos);
  }

  // ✅ Parse and replace certificates
  if (updateData.certificate) {
    let parsedCerts = [];
    try {
      // If coming from FormData as a JSON string
      parsedCerts = JSON.parse(updateData.certificate);
    } catch {
      // If coming as array in req.body directly
      parsedCerts = updateData.certificate;
    }

    if (Array.isArray(parsedCerts)) {
      product.certificate = parsedCerts.map((c) => ({
        certificateType: c.certificateType,
        price: Number(c.price),
      }));
    }
  }

  if (typeof updateData.certificate === "string") {
    try {
      updateData.certificate = JSON.parse(updateData.certificate);
    } catch (err) {
      return res.status(400).json({ message: "Invalid certificate format" });
    }
  }

  // ✅ Parse and replace upselling SKU list
  if (updateData.upSellingProductSKU) {
    let parsedupSellingProductSKU = [];
    try {
      // If coming from FormData as a JSON string
      parsedupSellingProductSKU = JSON.parse(updateData.upSellingProductSKU);
    } catch {
      // If coming as array in req.body directly
      parsedupSellingProductSKU = updateData.upSellingProductSKU;
    }

    if (Array.isArray(parsedupSellingProductSKU)) {
      product.upSellingProductSKU = parsedupSellingProductSKU.map((c) => c);
    }
  }

  if (typeof updateData.upSellingProductSKU === "string") {
    try {
      updateData.upSellingProductSKU = JSON.parse(
        updateData.upSellingProductSKU,
      );
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid upSellingProductSKU format" });
    }
  }

  if (
    updateData.subCategory &&
    updateData.subCategory !== String(product.subCategory)
  ) {
    if (product.subCategory) {
      await SubCategory.findByIdAndUpdate(product.subCategory, {
        $pull: {
          products: product._id,
        },
      });
    }
    await SubCategory.findByIdAndUpdate(updateData.subCategory, {
      $push: {
        products: product._id,
      },
    });
    product.subCategory = updateData.subCategory;
  }

  delete updateData.subCategory; /// handled already

  // Update other fields
  Object.assign(product, updateData);

  const updatedProd = await product.save();

  return res.status(200).json({
    msg: "product updated successfully",
    updatedProd,
    newSlug: updatedProd.slug,
  });
});

export const editImage = asyncHandler(async (req, res) => {
  const { imageId, productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "No prod found" });
  }

  const imageIndex = product.images.findIndex(
    (img) => img._id.toString() === imageId,
  );

  if (imageIndex === -1) {
    return res.status(400).json({ msg: "No index found" });
  }

  // Delete the old image file from the server
  const oldImage = product.images[imageIndex];
  if (oldImage && oldImage.fileName) {
    const productUploadPath = uploadPath.productUpload;
    const oldPath = path.join(__dirname, productUploadPath, oldImage.fileName);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const productPath = uploadPath.productUpload.replace("../", "/");
  const payload = {
    fileName: req.file.filename,
    url: `${productPath}${req.file.filename}`,
  };

  product.images[imageIndex] = payload;

  const updatedImage = await product.save();

  return res.status(200).json({
    msg: "Image updated successfully",
    updatedProduct: updatedImage.images,
  });
});

export const editVideo = asyncHandler(async (req, res) => {
  const { videoId, productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "No prod found" });
  }

  const videoIndex = product.videos.findIndex(
    (vid) => vid._id.toString() === videoId,
  );

  if (videoIndex === -1) {
    return res.status(400).json({ msg: "No index found" });
  }

  // Delete the old video file from the server
  const oldVideo = product.videos[videoIndex];
  if (oldVideo && oldVideo.fileName) {
    const productUploadPath = uploadPath.productUpload;
    const oldPath = path.join(__dirname, productUploadPath, oldVideo.fileName);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const productPath = uploadPath.productUpload.replace("../", "/");
  const payload = {
    fileName: req.file.filename,
    url: `${productPath}${req.file.filename}`,
  };

  product.videos[videoIndex] = payload;
  const updatedVideo = await product.save();

  return res.status(200).json({
    msg: "Video updated successfully",
    updatedProduct: updatedVideo.videos,
  });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { productId, videoId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "Product not found" });
  }

  const videoIndex = product.videos.findIndex(
    (vid) => vid._id.toString() === videoId,
  );

  if (videoIndex === -1) {
    return res.status(400).json({ msg: "Video not found in product" });
  }

  // Get the video to be deleted to access its filename
  const videoToDelete = product.videos[videoIndex];

  // Delete the physical file from the server
  if (videoToDelete && videoToDelete.fileName) {
    const productUploadPath = uploadPath.productUpload;
    const oldPath = path.join(
      __dirname,
      productUploadPath,
      videoToDelete.fileName,
    );
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  product.videos.splice(videoIndex, 1); // remove the video

  const updatedProduct = await product.save();

  res.status(200).json({
    msg: "Video deleted successfully",
    updatedVideos: updatedProduct.videos,
  });
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "Product not found" });
  }

  const imageIndex = product.images.findIndex(
    (img) => img._id.toString() === imageId,
  );

  if (imageIndex === -1) {
    return res.status(400).json({ msg: "Image not found in product" });
  }

  // Get the image to be deleted to access its filename
  const imageToDelete = product.images[imageIndex];

  // Delete the physical file from the server
  if (imageToDelete && imageToDelete.fileName) {
    const productUploadPath = uploadPath.productUpload;
    const oldPath = path.join(
      __dirname,
      productUploadPath,
      imageToDelete.fileName,
    );
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  product.images.splice(imageIndex, 1); // remove the image

  const updatedProduct = await product.save();

  res.status(200).json({
    msg: "Image deleted successfully",
    updatedImages: updatedProduct.images,
  });
});

export const filterProductsByPurpose = asyncHandler(async (req, res) => {
  const { purpose } = req.query;

  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 12);
  const skip = (page - 1) * limit;

  if (!purpose) {
    return res.status(400).json({ msg: "Purpose is required" });
  }

  // Find subcategories with this purpose
  const subcategoriesWithPurpose = await SubCategory.find({
    purpose: { $in: Array.isArray(purpose) ? purpose : [purpose] },
  }).select("_id");

  const subcategoryIds = subcategoriesWithPurpose.map((sub) => sub._id);

  if (subcategoryIds.length === 0) {
    return res.status(200).json({
      msg: "No products found for this purpose",
      products: [],
      currentPage: page,
      totalPages: 0,
      totalProducts: 0,
      limit,
    });
  }

  const query = {
    subCategory: { $in: subcategoryIds },
    isAvailable: true,
    stock: { $gt: 0 },
  };

  const totalProducts = await Product.countDocuments(query);

  // 🎲 Random selection using aggregation
  const products = await Product.aggregate([
    { $match: query },
    { $sample: { size: Math.min(totalProducts, limit * 10) } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json({
    msg: "Products fetched by purpose (randomized)",
    products,
    currentPage: page,
    totalPages,
    totalProducts,
    limit,
  });
});

// export const filterProducts = asyncHandler(async (req, res) => {
//   const {
//     gemname,
//     minWeight,
//     maxWeight,
//     minPrice,
//     maxPrice,
//     minRatti,
//     maxRatti,
//     origin,
//     minCarat,
//     maxCarat,
//     color,
//     cut,
//     shape,
//     certificateType,
//     featured,
//     treatment,
//     subcategory,
//     isAvailable,
//     purpose, // ✅ ADD THIS
//   } = req.query;

//   const page = parseInt(req.query.page || 1); // default pages was missing
//   const limit = parseInt(req.query.limit || 12);
//   const skip = (page - 1) * limit;
//   const query = {};

//   if (gemname) query.name = { $regex: gemname, $options: "i" };
//   if (origin) query.origin = origin;
//   if (treatment) query.treatment = treatment;
//   const colorMap = {
//     "Light Pink": "Pink",
//     "Dark Pink": "Pink",
//     Pink: "Pink",
//     "Sky Blue": "Blue",
//     Blue: "Blue",
//     Green: "Green",
//     Red: "Red",
//     Purple: "Purple",
//     Yellow: "Yellow",
//     Grey: "Grey",
//     Brown: "Brown",
//   };
//   //   if (color) query.color = color;
//   if (color) {
//     const colors = Array.isArray(color) ? color : [color];
//     const normalizedColors = colors.map((c) => colorMap[c] || c);
//     query.color = { $in: normalizedColors };
//   }
//   if (cut) query.cut = cut;
//   if (shape) query.shape = shape;
//   if (featured) query.isFeatured = featured;
//   if (isAvailable !== undefined) {
//     query.isAvailable = isAvailable === "true";
//   }
//   // ✅ PURPOSE FILTER for fake gemstone suggestion
//   if (purpose && purpose.length > 0) {
//     const purposes = Array.isArray(purpose) ? purpose : [purpose];
//     query.purpose = { $in: purposes };
//   }
//   if (certificateType) {
//     query.certificate = {
//       $elemMatch: {
//         certificateType: { $regex: certificateType, $options: "i" },
//       },
//     };
//   }
//   if (minCarat && maxCarat) {
//     query.carat = { $gte: Number(minCarat), $lte: Number(maxCarat) };
//   }

//   if (minRatti && maxRatti) {
//     query.ratti = { $gte: Number(minRatti), $lte: Number(maxRatti) };
//   }

//   if (minPrice && maxPrice) {
//     query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
//   }
//   if (minWeight && maxWeight) {
//     query.weight = { $gte: Number(minWeight), $lte: Number(maxWeight) };
//   }

//   if (subcategory && !purpose) {
//     const subcat = await SubCategory.findOne({
//       $or: [{ slug: subcategory }, { name: subcategory }],
//     });

//     if (subcat && subcat.products.length > 0) {
//       query._id = { $in: subcat.products }; /* {
//   _id: { $in: ["664ab12", "664ab13", "664ab14"] },
//   price: { $gte: 100, $lte: 500 },
//   color: "blue"
// }
//  */
//     } else {
//       return res
//         .status(404)
//         .json({ msg: "No products found for this category" });
//     }
//   }

//   // Determine if requester is an admin; if not, enforce stock > 0 and availability true
//   let isAdmin = false;
//   try {
//     const token =
//       req.header("Authorization")?.split(" ")[1] || req.cookies?.token;
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       if (decoded) {
//         const admin = await Admin.findById(decoded.id).select("_id");
//         if (admin) {
//           isAdmin = true;
//         }
//       }
//     }
//   } catch (e) {
//     // ignore token errors for public access
//   }

//   if (!isAdmin) {
//     query.isAvailable = true;
//     query.stock = { $gt: 0 };
//   }

//   // Sorting
//   let sortOption = {};

//   switch (req.query.sort) {
//     case "price_low_to_high":
//       sortOption.price = 1;
//       break;

//     case "price_high_to_low":
//       sortOption.price = -1;
//       break;
//     case "weight_low_to_high":
//       sortOption.weight = 1;
//       break;
//     case "weight_high_to_low":
//       sortOption.weight = -1;
//       break;
//     case "newest":
//       sortOption.createdAt = -1;
//       break;

//     case "oldest":
//       sortOption.createdAt = 1;
//       break;

//     default:
//       break;
//   }

//   const totalProducts = await Product.countDocuments(query);

//   // 👉 Apply pagination here
//   const products = await Product.find(query)
//     .sort(sortOption)
//     .skip(skip)
//     .limit(limit);

//   const totalPages = Math.ceil(totalProducts / limit);

//   return res.status(200).json({
//     msg: "Products fetched with filter",
//     products,
//     currentPage: page,
//     totalPages,
//     totalProducts,
//     limit,
//   });
// });

export const filterProducts = asyncHandler(async (req, res) => {
  const {
    gemname,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
    minRatti,
    maxRatti,
    origin,
    minCarat,
    maxCarat,
    color,
    cut,
    shape,
    certificateType,
    featured,
    treatment,
    subcategory,
    isAvailable,
    purpose, // ✅ Purpose filter from frontend
  } = req.query;

  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 12);
  const skip = (page - 1) * limit;
  const query = {};

  if (gemname) query.name = { $regex: gemname, $options: "i" };
  if (origin) query.origin = origin;
  if (treatment) query.treatment = treatment;

  const colorMap = {
    "Light Pink": "Pink",
    "Dark Pink": "Pink",
    Pink: "Pink",
    "Sky Blue": "Blue",
    Blue: "Blue",
    Green: "Green",
    Red: "Red",
    Purple: "Purple",
    Yellow: "Yellow",
    Grey: "Grey",
    Brown: "Brown",
  };

  if (color) {
    const colors = Array.isArray(color) ? color : [color];
    query.$or = colors.map((c) => ({
      color: { $regex: c, $options: "i" },
    }));
  }

  if (cut) query.cut = cut;
  if (shape) query.shape = shape;
  if (featured) query.isFeatured = featured;
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === "true";
  }

  if (certificateType) {
    query.certificate = {
      $elemMatch: {
        certificateType: { $regex: certificateType, $options: "i" },
      },
    };
  }

  if (minCarat && maxCarat) {
    query.carat = { $gte: Number(minCarat), $lte: Number(maxCarat) };
  }

  if (minRatti && maxRatti) {
    query.ratti = { $gte: Number(minRatti), $lte: Number(maxRatti) };
  }

  if (minPrice && maxPrice) {
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  }

  if (minWeight && maxWeight) {
    query.weight = { $gte: Number(minWeight), $lte: Number(maxWeight) };
  }

  // ✅ NEW LOGIC: Handle purpose-based filtering
  if (purpose) {
    // Find all subcategories that have this purpose
    const subcategoriesWithPurpose = await SubCategory.find({
      purpose: { $in: Array.isArray(purpose) ? purpose : [purpose] },
    }).select("_id");

    const subcategoryIds = subcategoriesWithPurpose.map((sub) => sub._id);

    if (subcategoryIds.length > 0) {
      query.subCategory = { $in: subcategoryIds };
    } else {
      // No subcategories with this purpose found
      return res.status(200).json({
        msg: "No products found for this purpose",
        products: [],
        currentPage: page,
        totalPages: 0,
        totalProducts: 0,
        limit,
      });
    }
  }
  // ✅ Handle subcategory filtering (only if no purpose filter)
  else if (subcategory || req.query.productSubCategory) {
    const rawSubcat = subcategory || req.query.productSubCategory;
    const subcategoryNames = (Array.isArray(rawSubcat) ? rawSubcat : [rawSubcat])
      .flatMap((value) => String(value).split(","))
      .map((value) => value.trim())
      .filter(Boolean);
    const orConditions = [
      { slug: { $in: subcategoryNames } },
      { name: { $in: subcategoryNames } },
    ];
    const validObjectIds = subcategoryNames
      .filter((v) => mongoose.Types.ObjectId.isValid(v))
      .map((v) => new mongoose.Types.ObjectId(v));
    if (validObjectIds.length > 0) {
      orConditions.push({ _id: { $in: validObjectIds } });
    }
    const subcategories = await SubCategory.find({
      $or: orConditions,
    }).select("_id products");
    const subcatIds = subcategories.map((s) => s._id);
    const productIds = subcategories.flatMap((subcat) => subcat.products || []);
    if (productIds.length > 0 || subcatIds.length > 0) {
      query.$or = [
        ...(productIds.length > 0 ? [{ _id: { $in: productIds } }] : []),
        ...(subcatIds.length > 0 ? [{ subCategory: { $in: subcatIds } }] : []),
      ];
    } else {
      return res.status(200).json({
        msg: "No products found for this category",
        products: [],
        currentPage: page,
        totalPages: 0,
        totalProducts: 0,
        limit,
      });
    }
  }

  // Admin check
  let isAdmin = false;
  try {
    const token =
      req.header("Authorization")?.split(" ")[1] || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        const admin = await Admin.findById(decoded.id).select("_id");
        if (admin) {
          isAdmin = true;
        }
      }
    }
  } catch (e) {
    // ignore token errors for public access
  }

  if (!isAdmin) {
    query.isAvailable = true;
    query.stock = { $gt: 0 };
  }

  // Sorting
  let sortOption = {};
  switch (req.query.sort) {
    case "price_low_to_high":
      sortOption.price = 1;
      break;
    case "price_high_to_low":
      sortOption.price = -1;
      break;
    case "weight_low_to_high":
      sortOption.weight = 1;
      break;
    case "weight_high_to_low":
      sortOption.weight = -1;
      break;
    case "newest":
      sortOption.createdAt = -1;
      break;
    case "oldest":
      sortOption.createdAt = 1;
      break;
    default:
      break;
  }

  const totalProducts = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json({
    msg: "Products fetched with filter",
    products,
    currentPage: page,
    totalPages,
    totalProducts,
    limit,
  });
});
export const getOriginCountryForSubCat = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ msg: "Slug is required" });
  }

  // 1. Find the subcategory using slug
  const subcategory = await SubCategory.findOne({ slug });

  if (!subcategory) {
    return res.status(404).json({ msg: "Subcategory not found" });
  }

  // 2. Use the subcategory _id to fetch distinct origins
  const originsList = await Product.distinct("origin", {
    subCategory: subcategory._id,
  });

  return res.status(200).json({
    success: true,
    msg: "Distinct origins fetched successfully",
    originsList,
  });
});

// export const crossSellingProductList = asyncHandler(async (req, res) => {
//   // Assuming req.user is populated by an authentication middleware
//   const userId = req.user?._id;

//   if (!userId) {
//     return res.status(401).json({ msg: "User not authenticated." });
//   }

//   const user = await User.findById(userId)
//     .select("cart")
//     .populate({
//       path: "cart.item",
//       select: "subCategory", // Populate subCategory from the product in the cart
//     });

//   if (!user) {
//     return res.status(404).json({ msg: "User not found." });
//   }

//   // Check if the cart is empty or the first item is not a product
//   if (
//     !user.cart ||
//     user.cart.length === 0 ||
//     user.cart[0].itemType !== "Product"
//   ) {
//     return res.status(200).json({
//       success: false,
//       msg: "The first item in the cart is not a product or the cart is empty.",
//       products: [], // Return empty array
//     });
//   let products = await Product.find({
//     _id: { $ne: firstCartItem.item._id }, // Exclude the original product
//     subCategory: firstCartItem.item.subCategory,
//     price: { $gt: basePrice, $lte: maxPrice },
//     isAvailable: true,
//   }).limit(4); // Limiting to 4 results for a concise list
//   }
//   return res.status(200).json({
//     success: true,
//     msg: "Upselling products fetched successfully.",
//     products,
//   });
// });

export const crossSellingProductList = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ msg: "User not authenticated." });
  }

  const user = await User.findById(userId).select("cart").populate({
    path: "cart.item",
    select: "subCategory price",
  });

  if (!user) {
    return res.status(404).json({ msg: "User not found." });
  }

  // ✅ Find first product item
  const firstProductItem = user.cart.find(
    (item) => item.itemType === "Product",
  );

  if (!firstProductItem) {
    return res.status(200).json({
      success: false,
      msg: "No product found in the cart.",
      products: [],
    });
  }

  const basePrice = firstProductItem.totalPrice;
  const maxPrice = basePrice * 1.1;

  const products = await Product.find({
    _id: { $ne: firstProductItem.item._id },
    subCategory: firstProductItem.item.subCategory,
    price: { $gt: basePrice, $lte: maxPrice },
    isAvailable: true,
  }).limit(4);

  return res.status(200).json({
    success: true,
    msg: "Cross selling products fetched successfully.",
    products,
  });
});

// for social sharing
export const getProductBySlugDirect = async (slug) => {
  let item = await Product.findOne({ slug });
  if (!item) {
    item = await Product.findOne({ pastSlugs: slug });
  }
  if (!item) {
    item = await Jewelry.findOne({ slug });
  }
  if (!item) {
    item = await Jewelry.findOne({ pastSlugs: slug });
  }
  return item;
};

export const upSellingProductSKU = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "productId is Required.",
    });
  }

  const product = await Product.findById(productId).select(
    "upSellingProductSKU",
  );

  // for safty
  if (!product) {
    return res.status(200).json({
      success: false,
      data: [],
      message: "Product not found",
    });
  }

  if (
    !Array.isArray(product.upSellingProductSKU) ||
    product.upSellingProductSKU.length === 0
  ) {
    return res.status(200).json({
      success: false,
      data: [],
      message: "No upselling SKUs available",
    });
  }

  console.log("here are the products ", product);

  const upSellingProductSKU = product.upSellingProductSKU;

  const SKUproducts = await Product.find({ sku: { $in: upSellingProductSKU } })
    .select("-wishlistedBy -reviewRating")
    .limit(2);

  const SKUjewelry = await Jewelry.find({ sku: { $in: upSellingProductSKU } })
    .select("-wishlistedBy -reviewRating")
    .limit(2);

  const data = [...SKUproducts, ...SKUjewelry];

  res.status(200).json({
    message: "Up Selling Proudcts SKU added successFully",
    data: data,
  });
});

// --- Live Products Export & Web Dashboard View (Live sync with Google Sheets & Admin Form) ---

function getFullProductImageUrl(rawUrl, baseUrl) {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  return `${baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
}

function normalizeProductDoc(p, baseUrl) {
  const d = new Date(p.createdAt || Date.now());
  const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN") : "";
  const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString("en-IN") : "";
  const firstImage = p.images?.[0]?.url || "";
  const fullImageUrl = getFullProductImageUrl(firstImage, baseUrl);
  const certs = (p.certificate || [])
    .map((c) => (c.price ? `${c.certificateType} (₹${c.price})` : c.certificateType))
    .filter(Boolean)
    .join("; ");
  const productUrl = p.slug ? `https://gemrishi.com/product/${p.slug}` : "";

  return {
    id: p._id?.toString() || "",
    createdAt: p.createdAt || new Date(),
    dateStr,
    timeStr,
    type: "Gemstone",
    sku: p.sku || "",
    name: p.name || "",
    category: p.subCategory?.name || "Gemstone",
    origin: p.origin || "-",
    carat: p.carat != null ? p.carat : "-",
    ratti: p.ratti != null ? p.ratti : "-",
    weight: p.weight != null ? `${p.weight}g` : (p.carat != null ? `${p.carat} Ct` : "-"),
    shape: p.shape || "-",
    color: p.color || "-",
    cut: p.cut || "-",
    treatmentMetal: p.treatment || "-",
    price: p.price != null ? Number(p.price) : 0,
    sellPrice: p.sellPrice != null ? Number(p.sellPrice) : "-",
    stock: p.stock != null ? Number(p.stock) : 0,
    availability: p.isAvailable ? (p.stock > 0 ? "Available" : "Available (0 Stock)") : "Out of Stock",
    isAvailableBool: Boolean(p.isAvailable && p.stock > 0),
    featured: p.isFeatured ? "Featured" : "Normal",
    isFeaturedBool: Boolean(p.isFeatured),
    deliveryDays: p.deliveryDays != null ? `${p.deliveryDays} Days` : "-",
    certificates: certs || "-",
    imageUrl: fullImageUrl,
    productUrl,
  };
}

function normalizeJewelryDoc(j, baseUrl) {
  const d = new Date(j.createdAt || Date.now());
  const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN") : "";
  const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString("en-IN") : "";
  const firstImage = j.images?.[0]?.url || "";
  const fullImageUrl = getFullProductImageUrl(firstImage, baseUrl);
  const certs = (j.certificate || [])
    .map((c) => (c.price ? `${c.certificateType} (₹${c.price})` : c.certificateType))
    .filter(Boolean)
    .join("; ");
  const productUrl = j.slug ? `https://gemrishi.com/product/${j.slug}` : "";

  return {
    id: j._id?.toString() || "",
    createdAt: j.createdAt || new Date(),
    dateStr,
    timeStr,
    type: j.jewelryType || "Jewellery",
    sku: j.sku || "",
    name: j.jewelryName || "",
    category: j.jewelryType || "Jewellery",
    origin: j.origin || "-",
    carat: "-",
    ratti: "-",
    weight: j.jewelryMetalWeight != null ? `${j.jewelryMetalWeight}g` : "-",
    shape: j.shape || "-",
    color: j.color || "-",
    cut: j.cut || "-",
    treatmentMetal: j.metal || "-",
    price: j.jewelryPrice != null ? Number(j.jewelryPrice) : 0,
    sellPrice: "-",
    stock: j.stock != null ? Number(j.stock) : 0,
    availability: j.isAvailable ? (j.stock > 0 ? "Available" : "Available (0 Stock)") : "Out of Stock",
    isAvailableBool: Boolean(j.isAvailable && j.stock > 0),
    featured: j.isFeatured ? "Featured" : "Normal",
    isFeaturedBool: Boolean(j.isFeatured),
    deliveryDays: j.deliveryDays != null ? `${j.deliveryDays} Days` : "-",
    certificates: certs || "-",
    imageUrl: fullImageUrl,
    productUrl,
  };
}

/**
 * Export all Products (Gemstones + Jewelry) as CSV for Google Sheet live sync (=IMPORTDATA)
 */
export async function exportProductsCsv(req, res) {
  try {
    const { type, availability } = req.query;
    const filterType = (type || "all").toLowerCase();
    const filterAvail = (availability || "").toLowerCase();

    const host = req.get("host") || "";
    const protocol = req.protocol || (req.secure ? "https" : "http");
    const currentServerUrl = host ? `${protocol}://${host}` : "";
    const baseUrl = (process.env.DOMAIN_NAME || currentServerUrl || "https://api.gemrishi.com").replace(/\/+$/, "");

    let productsPromise = Promise.resolve([]);
    let jewelryPromise = Promise.resolve([]);

    if (filterType !== "jewelry" && filterType !== "jewellery") {
      const pQuery = {};
      if (filterAvail === "available") {
        pQuery.isAvailable = true;
        pQuery.stock = { $gt: 0 };
      } else if (filterAvail === "outofstock") {
        pQuery.$or = [{ isAvailable: false }, { stock: { $lte: 0 } }];
      }
      productsPromise = Product.find(pQuery)
        .select("sku name origin carat ratti weight shape color cut treatment price sellPrice stock isAvailable isFeatured deliveryDays certificate images slug createdAt")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (filterType !== "gemstone") {
      const jQuery = {};
      if (filterAvail === "available") {
        jQuery.isAvailable = true;
        jQuery.stock = { $gt: 0 };
      } else if (filterAvail === "outofstock") {
        jQuery.$or = [{ isAvailable: false }, { stock: { $lte: 0 } }];
      }
      jewelryPromise = Jewelry.find(jQuery)
        .select("sku jewelryName jewelryType metal jewelryMetalWeight shape color cut jewelryPrice stock isAvailable isFeatured deliveryDays certificate images slug createdAt origin")
        .sort({ createdAt: -1 })
        .lean();
    }

    const [products, jewelries] = await Promise.all([productsPromise, jewelryPromise]);

    const normalizedProducts = products.map((p) => normalizeProductDoc(p, baseUrl));
    const normalizedJewelries = jewelries.map((j) => normalizeJewelryDoc(j, baseUrl));

    const allItems = [...normalizedProducts, ...normalizedJewelries];
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const headers = [
      "Date Added",
      "Time Added",
      "Type",
      "SKU",
      "Product Name",
      "Origin",
      "Carat",
      "Ratti",
      "Weight",
      "Shape",
      "Color",
      "Cut",
      "Treatment / Metal",
      "Price (INR)",
      "Sell Price (INR)",
      "Stock",
      "Availability",
      "Status",
      "Delivery Days",
      "Certificates",
      "Image URL",
      "Product URL",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
      return `"${str}"`;
    };

    let csvContent = "\uFEFF" + headers.map(escapeCsv).join(",") + "\r\n";

    allItems.forEach((item) => {
      const row = [
        item.dateStr,
        item.timeStr,
        item.type,
        item.sku,
        item.name,
        item.origin,
        item.carat,
        item.ratti,
        item.weight,
        item.shape,
        item.color,
        item.cut,
        item.treatmentMetal,
        item.price,
        item.sellPrice,
        item.stock,
        item.availability,
        item.featured,
        item.deliveryDays,
        item.certificates,
        item.imageUrl,
        item.productUrl,
      ];
      csvContent += row.map(escapeCsv).join(",") + "\r\n";
    });

    const filename = filterType === "gemstone" 
      ? "gemrishi-gemstones-live.csv" 
      : (filterType === "jewelry" || filterType === "jewellery" ? "gemrishi-jewellery-live.csv" : "gemrishi-products-all.csv");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting products CSV:", error);
    return res.status(500).send("Error generating products export: " + error.message);
  }
}

/**
 * Web Dashboard for All Products with Live Google Sheet Sync & Search
 */
export async function viewProductsDashboard(req, res) {
  try {
    const host = req.get("host") || "";
    const protocol = req.protocol || (req.secure ? "https" : "http");
    const currentServerUrl = host
      ? `${protocol}://${host}`
      : (process.env.DOMAIN_NAME || "https://api.gemrishi.com").replace(/\/+$/, "");
    const baseUrl = (process.env.DOMAIN_NAME || currentServerUrl || "https://api.gemrishi.com").replace(/\/+$/, "");

    const exportUrl = `${currentServerUrl}/api/v1/product/products-export`;
    const downloadAllUrl = `/api/v1/product/products-export`;
    const downloadGemUrl = `/api/v1/product/products-export?type=gemstone`;
    const downloadJewUrl = `/api/v1/product/products-export?type=jewelry`;

    const [products, jewelries] = await Promise.all([
      Product.find()
        .select("sku name origin carat ratti weight shape color cut treatment price sellPrice stock isAvailable isFeatured deliveryDays certificate images slug createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Jewelry.find()
        .select("sku jewelryName jewelryType metal jewelryMetalWeight shape color cut jewelryPrice stock isAvailable isFeatured deliveryDays certificate images slug createdAt origin")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const normalizedProducts = products.map((p) => normalizeProductDoc(p, baseUrl));
    const normalizedJewelries = jewelries.map((j) => normalizeJewelryDoc(j, baseUrl));

    const allItems = [...normalizedProducts, ...normalizedJewelries];
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = allItems.length;
    const gemCount = normalizedProducts.length;
    const jewCount = normalizedJewelries.length;
    const inStockCount = allItems.filter((i) => i.isAvailableBool).length;
    const outStockCount = totalCount - inStockCount;
    const featuredCount = allItems.filter((i) => i.isFeaturedBool).length;

    const rowsHtml = allItems
      .map((item) => {
        const isGem = item.type === "Gemstone";
        const specs = isGem
          ? `${item.carat !== "-" ? item.carat + " Ct" : ""} ${item.ratti !== "-" ? "(" + item.ratti + " Ratti)" : ""}`.trim() || item.weight
          : item.weight;

        const thumbImg = item.imageUrl
          ? `<img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.style.display='none';" />`
          : `<span class="icon-ph">💎</span>`;

        const availBadge = item.isAvailableBool
          ? `<span class="badge-instock">Available</span>`
          : `<span class="badge-outstock">Out of Stock</span>`;

        const featuredBadge = item.isFeaturedBool
          ? `<span class="badge-feat">★ Featured</span>`
          : `<span class="dash">-</span>`;

        const priceDisplay = item.price
          ? `₹${Number(item.price).toLocaleString("en-IN")}`
          : "-";

        return `
        <tr class="product-row" data-type="${isGem ? 'gemstone' : 'jewelry'}" data-stock="${item.isAvailableBool ? 'instock' : 'outofstock'}" data-featured="${item.isFeaturedBool ? 'yes' : 'no'}" data-search="${(item.sku + ' ' + item.name + ' ' + item.origin + ' ' + item.type + ' ' + item.color + ' ' + item.shape).toLowerCase()}">
          <td class="col-thumb">${thumbImg}</td>
          <td class="col-sku">${item.sku || "-"}</td>
          <td class="col-name"><a href="${item.productUrl || '#'}" target="_blank" rel="noopener noreferrer">${item.name}</a></td>
          <td class="col-type"><span class="${isGem ? 'badge-gem' : 'badge-jew'}">${item.type}</span></td>
          <td class="col-origin">${item.origin}</td>
          <td class="col-specs">${specs}</td>
          <td class="col-attr">${item.color !== "-" ? item.color : ""} ${item.shape !== "-" ? "(" + item.shape + ")" : ""}</td>
          <td class="col-price">${priceDisplay}</td>
          <td class="col-stock" style="color: ${item.stock > 0 ? '#111827' : '#DC2626'};">${item.stock}</td>
          <td class="col-avail">${availBadge}</td>
          <td class="col-feat">${featuredBadge}</td>
          <td class="col-date">${item.dateStr}</td>
        </tr>`;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GemRishi — Live Products Directory (${totalCount})</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #F4F8F6; margin: 0; padding: 20px; color: #1C332B; line-height: 1.5; }
    .container { max-width: 1400px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 24px; border: 1px solid #DCE7E1; }
    
    .header-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #E5ECE8; }
    .brand-title { display: flex; align-items: center; gap: 12px; }
    .brand-title h1 { margin: 0; font-size: 24px; color: #264A3F; font-weight: 700; }
    .badge-count { background: #264A3F; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }

    .action-group { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 6px; background-color: #2F8F6B; color: #ffffff; text-decoration: none; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; transition: background-color 0.15s ease; border: none; cursor: pointer; }
    .btn:hover { background-color: #267355; color: #ffffff; }
    .btn-secondary { background-color: #ffffff; color: #264A3F; border: 1px solid #2F8F6B; }
    .btn-secondary:hover { background-color: #EAFBEF; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #FAFDFB; border: 1px solid #DCE7E1; border-radius: 8px; padding: 12px 16px; }
    .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #527A6B; font-weight: 600; }
    .stat-value { font-size: 22px; font-weight: 700; color: #142E27; margin-top: 4px; }

    .sync-box { background: #EAFBEF; border: 1px solid #BFE9CC; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .sync-title { font-size: 14.5px; font-weight: 700; color: #142E27; margin-bottom: 6px; }
    .sync-desc { font-size: 13px; color: #264A3F; margin-bottom: 10px; }
    .code-box { display: flex; align-items: center; background: #ffffff; border: 1px dashed #2F8F6B; border-radius: 6px; padding: 8px 14px; gap: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #142E27; overflow-x: auto; }
    .code-formula { flex: 1; white-space: nowrap; }
    .btn-copy { background: #264A3F; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-copy:hover { background: #1C332B; }

    .controls-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .search-input { width: 320px; max-width: 100%; padding: 9px 14px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none; transition: border-color 0.15s; background: #fff; }
    .search-input:focus { border-color: #2F8F6B; box-shadow: 0 0 0 3px rgba(47,143,107,0.15); }

    .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab-btn { background: #F1F5F3; border: 1px solid #D5E2DC; padding: 6px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; }
    .tab-btn.active { background: #264A3F; color: #ffffff; border-color: #264A3F; }

    .table-wrapper { width: 100%; overflow-x: auto; border: 1px solid #E5ECE8; border-radius: 8px; background: #fff; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    thead tr { background: #264A3F; color: #ffffff; }
    th { padding: 12px 10px; font-weight: 600; font-size: 12.5px; letter-spacing: 0.3px; white-space: nowrap; }
    tbody tr { border-bottom: 1px solid #EAEFEA; content-visibility: auto; }
    tbody tr:hover { background-color: #F8FCFA; }

    .col-thumb { width: 44px; text-align: center; padding: 6px 4px !important; }
    .col-thumb img { width: 36px; height: 36px; object-fit: contain; border-radius: 4px; background: #fff; border: 1px solid #E5E7EB; }
    .icon-ph { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; font-size: 16px; background: #F3F4F6; border-radius: 4px; }
    .col-sku { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; font-weight: 600; color: #111827; white-space: nowrap; padding: 9px 8px; }
    .col-name { font-weight: 600; padding: 9px 10px; }
    .col-name a { color: #264A3F; text-decoration: none; }
    .col-name a:hover { text-decoration: underline; }
    .col-type { padding: 9px 8px; white-space: nowrap; }
    .badge-gem { background: #EBF5FF; color: #1E40AF; border: 1px solid #BFDBFE; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-jew { background: #F3E8FF; color: #6B21A8; border: 1px solid #DDD6FE; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .col-origin { font-size: 13px; color: #4B5563; padding: 9px 8px; }
    .col-specs { font-size: 12.5px; color: #374151; white-space: nowrap; padding: 9px 8px; }
    .col-attr { font-size: 12.5px; color: #4B5563; padding: 9px 8px; }
    .col-price { font-size: 13.5px; font-weight: 700; color: #111827; white-space: nowrap; padding: 9px 8px; }
    .col-stock { text-align: center; font-weight: 600; padding: 9px 8px; }
    .col-avail { text-align: center; padding: 9px 8px; white-space: nowrap; }
    .badge-instock { background: #EAFBEF; color: #166534; border: 1px solid #BBF7D0; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-outstock { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .col-feat { text-align: center; padding: 9px 8px; white-space: nowrap; }
    .badge-feat { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 600; }
    .dash { color: #9CA3AF; font-size: 12px; }
    .col-date { font-size: 12px; color: #6B7280; white-space: nowrap; padding: 9px 8px; }

    .footer { margin-top: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; font-size: 12.5px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HEADER -->
    <div class="header-bar">
      <div class="brand-title">
        <h1>💎 GemRishi Products Directory</h1>
        <span class="badge-count" id="headerCount">${totalCount} Uploaded</span>
      </div>
      <div class="action-group">
        <a href="${downloadAllUrl}" class="btn" download="gemrishi-products-all.csv">📥 Download Live CSV (All)</a>
        <a href="${downloadGemUrl}" class="btn btn-secondary" download="gemrishi-gemstones.csv">Gemstones CSV</a>
        <a href="${downloadJewUrl}" class="btn btn-secondary" download="gemrishi-jewellery.csv">Jewellery CSV</a>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Uploaded</div>
        <div class="stat-value">${totalCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Gemstones</div>
        <div class="stat-value" style="color: #1E40AF;">${gemCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Jewellery Items</div>
        <div class="stat-value" style="color: #6B21A8;">${jewCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">In Stock</div>
        <div class="stat-value" style="color: #15803D;">${inStockCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Out of Stock</div>
        <div class="stat-value" style="color: #DC2626;">${outStockCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Featured</div>
        <div class="stat-value" style="color: #D97706;">${featuredCount}</div>
      </div>
    </div>

    <!-- GOOGLE SHEET LIVE SYNC BANNER -->
    <div class="sync-box">
      <div class="sync-title">📊 Google Sheet Live Sync Formula</div>
      <div class="sync-desc">
        Paste this formula into <b>Cell A1</b> of any Google Sheet. Google Sheets will automatically fetch and populate all products. Whenever you add new products in your admin panel, they will <b>automatically update in your sheet</b>!
      </div>
      <div class="code-box">
        <span class="code-formula" id="formulaCode">=IMPORTDATA("${exportUrl}")</span>
        <button class="btn-copy" onclick="copyFormula()">📋 Copy Formula</button>
      </div>
    </div>

    <!-- CONTROLS: SEARCH & TABS -->
    <div class="controls-row">
      <div class="filter-tabs">
        <button class="tab-btn active" data-filter="all" onclick="filterTab('all', this)">All (${totalCount})</button>
        <button class="tab-btn" data-filter="gemstone" onclick="filterTab('gemstone', this)">Gemstones (${gemCount})</button>
        <button class="tab-btn" data-filter="jewelry" onclick="filterTab('jewelry', this)">Jewellery (${jewCount})</button>
        <button class="tab-btn" data-filter="instock" onclick="filterTab('instock', this)">In Stock (${inStockCount})</button>
        <button class="tab-btn" data-filter="outofstock" onclick="filterTab('outofstock', this)">Out of Stock (${outStockCount})</button>
        <button class="tab-btn" data-filter="featured" onclick="filterTab('featured', this)">Featured (${featuredCount})</button>
      </div>
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Instant search by SKU, Name, Origin, Shape..." onkeyup="filterRows()" />
    </div>

    <!-- TABLE -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width: 48px; text-align: center;">Photo</th>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Type</th>
            <th>Origin</th>
            <th>Carats / Weight</th>
            <th>Color / Shape</th>
            <th>Price</th>
            <th style="text-align: center;">Stock</th>
            <th style="text-align: center;">Availability</th>
            <th style="text-align: center;">Featured</th>
            <th>Date Added</th>
          </tr>
        </thead>
        <tbody id="productsBody">
          ${rowsHtml || '<tr><td colspan="12" style="text-align: center; padding: 24px; color: #888;">No products found.</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div>Showing <span id="visibleCount" style="font-weight: 700; color: #264A3F;">${totalCount}</span> of ${totalCount} products</div>
      <div>⚡ Live direct sync with GemRishi MongoDB database &bull; Auto updates on new uploads</div>
    </div>

  </div>

  <script>
    let activeFilter = 'all';

    function filterTab(filter, btn) {
      activeFilter = filter;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRows();
    }

    function filterRows() {
      const query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      const rows = document.querySelectorAll('.product-row');
      let visible = 0;

      rows.forEach(row => {
        const type = row.getAttribute('data-type');
        const stock = row.getAttribute('data-stock');
        const featured = row.getAttribute('data-featured');
        const searchText = row.getAttribute('data-search') || '';

        let matchTab = true;
        if (activeFilter === 'gemstone') matchTab = (type === 'gemstone');
        else if (activeFilter === 'jewelry') matchTab = (type === 'jewelry');
        else if (activeFilter === 'instock') matchTab = (stock === 'instock');
        else if (activeFilter === 'outofstock') matchTab = (stock === 'outofstock');
        else if (activeFilter === 'featured') matchTab = (featured === 'yes');

        const matchSearch = !query || searchText.includes(query);

        if (matchTab && matchSearch) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });

      document.getElementById('visibleCount').textContent = visible;
    }

    function copyText(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✅ Copied!';
        btn.style.background = '#15803D';
        setTimeout(() => {
          btn.innerText = orig;
          btn.style.background = '#264A3F';
        }, 2000);
      }).catch(err => {
        prompt('Copy manually:', text);
      });
    }

    function copyFormula() {
      const formulaEl = document.getElementById('formulaCode');
      const formula = formulaEl ? formulaEl.innerText : '';
      const btn = document.querySelector('.btn-copy');
      if (formula && btn) copyText(formula, btn);
    }
  </script>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error displaying products dashboard:", error);
    return res.status(500).send("Error loading products dashboard: " + error.message);
  }
}
