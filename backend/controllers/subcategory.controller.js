import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { Order } from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const filesUploadPath = process.env.FILES_UPLOAD_PATH;

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

export const createSubcategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    name,
    description,
    targetAudience,
    benefits,
    qualityLevel,
    pricingDetails,
    faqs,
    tags,
  } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ msg: "No category found" });
  }

  const parsedFaqs = JSON.parse(faqs);
  const parsedBenefits = JSON.parse(benefits);
  const parsedTags = JSON.parse(tags);

  const filesUploadPath = process.env.FILES_UPLOAD_PATH;
  const subcategory = new SubCategory({
    name,
    description,
    targetAudience,
    benefits: parsedBenefits,
    qualityLevel,
    pricingDetails,
    faqs: parsedFaqs,
    tags: parsedTags,
    category: categoryId,
    image: {
      fileName: req.file ? req.file.filename : "",
      url: req.file ? `/public/uploads/${req.file.filename}` : null,
    },
  });

  await Category.findByIdAndUpdate(categoryId, {
    $push: {
      subCategories: subcategory._id,
    },
  });

  await subcategory.save();

  return res.status(200).json({
    msg: "Sub-category created",
    subcategory,
  });
});

export const getAllSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await SubCategory.find().populate({
    path: "products",
    options: { limit: 15 },
  });
  if (!subcategories) {
    return res.status(404).json({
      msg: "No Subcategories found",
    });
  }
  return res.status(200).json({
    msg: "Subcategories fetched successfully",
    subcategories,
  });
});

export const getSingleSubcategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const cleanInput = (slug || "").trim().toLowerCase().replace(/^-+|-+$/g, "");

  let subcategory = await SubCategory.findOne({ slug: slug });
  if (!subcategory) {
    subcategory = await SubCategory.findOne({ slug: `${cleanInput}-` });
  }
  if (!subcategory) {
    subcategory = await SubCategory.findOne({
      slug: { $regex: `^${cleanInput}-?$`, $options: "i" },
    });
  }
  if (!subcategory) {
    subcategory = await SubCategory.findOne({
      name: { $regex: `^${cleanInput.replace(/-/g, " ")}`, $options: "i" },
    });
  }
  if (!subcategory && mongoose.Types.ObjectId.isValid(slug)) {
    subcategory = await SubCategory.findById(slug);
  }

  if (!subcategory) {
    return res.status(404).json({
      msg: "No Subcategory found",
    });
  }

  // Find products associated with this subcategory
  const query = { subCategory: subcategory._id };
  const totalProducts = await Product.countDocuments(query);
  let products = await Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Fallback to subcategory.products array if query returned empty
  if ((!products || products.length === 0) && subcategory.products?.length > 0) {
    const paginatedProductsIds = subcategory.products
      .slice(skip, skip + limit)
      .map((id) => new mongoose.Types.ObjectId(id));

    products = await Product.find({
      _id: { $in: paginatedProductsIds },
    });
  }

  return res.status(200).json({
    msg: "Subcategory with products fetched successfully",
    subcategory,
    products: products || [],
    totalPage: Math.ceil((totalProducts || products.length) / limit),
    currentPage: page,
  });
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { subcategoryId } = req.params;

  const subcategory = await SubCategory.findByIdAndDelete(subcategoryId);
  if (!subcategory) {
    return res.status(404).json({
      msg: "No Subcategory found",
    });
  }

  await Category.updateMany(
    { subCategories: subcategoryId },
    {
      $pull: {
        subCategories: subcategoryId,
      },
    },
  );

  return res.status(200).json({
    msg: "Subcategory deleted successfulyy",
    subcategory,
  });
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const { subcategoryId } = req.params;
  const updates = { ...req.body };

  const subcategory = await SubCategory.findById(subcategoryId);
  if (!subcategory) {
    return res.status(404).json({ msg: "No Subcategory found" });
  }
  // Parse faqs
  if (updates.faqs) {
    try {
      updates.faqs = JSON.parse(updates.faqs);
      if (!Array.isArray(updates.faqs)) {
        return res.status(400).json({ message: "Invalid faqs format" });
      }
    } catch {
      return res.status(400).json({ message: "Invalid faqs JSON" });
    }
  }

  // Parse benefits
  if (updates.benefits) {
    if (typeof updates.benefits === "string") {
      try {
        updates.benefits = JSON.parse(updates.benefits);
      } catch {
        return res.status(400).json({ message: "Invalid benefits JSON" });
      }
    }
    if (!Array.isArray(updates.benefits)) {
      return res.status(400).json({ message: "Invalid benefits format" });
    }
  }

  // Parse tags
  if (updates.tags) {
    if (typeof updates.tags === "string") {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch {
        return res.status(400).json({ message: "Invalid tags JSON" });
      }
    }
    if (!Array.isArray(updates.tags)) {
      return res.status(400).json({ message: "Invalid tags format" });
    }
  }

  // Handle image update
  if (req.file) {
    const filesUploadPath = process.env.FILES_UPLOAD_PATH;
    updates.image = {
      fileName: req.file.filename,
      url: `/public/uploads/${req.file.filename}`,
    };
  }

  if (updates.category) {
    const catExists = await Category.findById(updates.category);
    if (!catExists) {
      return res.status(400).json({ msg: "Invalid category" });
    }
    if (subcategory.category.toString() !== updates.category) {
      await Category.findByIdAndUpdate(subcategory.category, {
        $pull: { subCategories: subcategoryId },
      });

      await Category.findByIdAndUpdate(updates.category, {
        $push: { subCategories: subcategoryId },
      });
    }
  }

  // Handle slug if name is updated
  if (updates?.name) {
    const newSlug = updates.name.toLowerCase().replace(/ /g, "-");
    if (newSlug !== subcategory.slug) {
      const existingSlug = await SubCategory.findOne({
        slug: newSlug,
        _id: { $ne: subcategory._id },
      });
      if (existingSlug) {
        return res.status(400).json({
          message: "Name change failed. This slug already exists.",
        });
      }
      updates.slug = newSlug;
    }
  }

  const updatedsubcategory = await SubCategory.findByIdAndUpdate(
    subcategoryId,
    updates,
    { new: true },
  );

  res.status(200).json({
    msg: "Subcategory updated successfully",
    subcategory: updatedsubcategory,
    newSlug: updatedsubcategory.slug,
  });
});

export const getBestSellingSubCategories = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const bestSellingSubCategories = await Order.aggregate([
    // 1. Filter valid orders (exclude pending razorpay payments and cancelled orders)
    {
      $match: {
        $nor: [{ paymentMethod: "razorpay", paymentStatus: "Pending" }],
        orderStatus: { $ne: "Cancelled" },
      },
    },
    // 2. Unwind items to process each sold item individually
    { $unwind: "$items" },
    // 3. Filter to keep only items that are Products (gemstones) and not cancelled
    {
      $match: {
        "items.productId": { $exists: true, $ne: null },
        "items.cancelStatus": { $ne: true },
      },
    },
    // 4. Lookup product details to get the subCategory ID
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    // 5. Group by subCategory and sum the quantities
    {
      $group: {
        _id: "$product.subCategory",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    // 6. Sort by totalSold in descending order
    { $sort: { totalSold: -1 } },
    // 7. Limit to top 5
    { $limit: limit },
    // 8. Lookup subCategory details
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "_id",
        as: "subCategoryDetails",
      },
    },
    { $unwind: "$subCategoryDetails" },
    {
      $project: {
        "subCategoryDetails.products": 0,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    msg: `Top ${limit} best selling subcategories fetched successfully`,
    data: bestSellingSubCategories,
  });
});

// app api
const getAllGemstoneCategory = asyncHandler(async (req, res) => {
  const gemstoneCategory = await SubCategory.find().select(
    "id name image description",
  );
  res.status(200).json(gemstoneCategory);
});

export { getAllGemstoneCategory };
