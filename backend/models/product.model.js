import mongoose from "mongoose";
import { type } from "os";
import appendDomainPlugin from "../plugins/appendDomain.js";
import { invalidateProductFeed } from "../utils/productFeedCache.js"; //-----Add By Pawan---
// need to add more
const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    pastSlugs: [
      {
        type: String,
        index: true,
      },
    ],
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    carat: {
      type: Number,
      required: [true, "Carat is required"],
      min: [0, "Carat must be a positive number"],
    },
    ratti: {
      type: Number,
      required: [true, "Ratti is required"],
      min: [0, "Ratti must be a positive number"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    certificate: [
      {
        certificateType: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    weight: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    images: [
      {
        fileName: String,
        url: String,
      },
    ],
    videos: [
      {
        fileName: String,
        url: String,
      },
    ],
    treatment: { type: String, required: false },
    shape: { type: String, required: false },
    color: { type: String, required: false },
    cut: { type: String, required: false },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    stock: {
      type: Number,
      min: [0, "Stock must be positive"],
    },
    orderCount: {
      type: Number,
    },
    offerId: {
      type: String,
    },
    sellPrice: {
      type: Number,
    },
    // ----------add By Pawan----------
    soldOutAt: {
    type: Date,
    default: null,
    index: true,
      },
    // ----------add By Pawan----------
    deliveryDays: {
      type: Number,
    },

    wishlistedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    upSellingProductSKU: [
      {
        type: String,
      },
    ],

    reviewRating: [
      {
        rating: {
          type: Number,
          default: 0,
          min: [0, "Rating must be positive"],
          max: [5, "Rating must be less than or equal to 5"],
        },
        review: {
          type: String,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        image: {
          fileName: String,
          url: String,
        },
        dateAdded: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

import { createCleanSlug, cleanSku, getCanonicalSlug, getCanonicalProductPath } from "../utils/slugify.js";

export { createCleanSlug, cleanSku, getCanonicalSlug, getCanonicalProductPath };

productSchema.pre("save", function (next) {
  const targetSlug = getCanonicalSlug(this.name, this.sku);
  if (!this.slug) {
    this.slug = targetSlug;
  }
  next();
});

productSchema.plugin(appendDomainPlugin, { fields: ["url"] });
// ------------------------Add by Pawan---------------------------
  async function syncSoldOutAndRefreshFeed(model, id) {
    try {
      if (id) {
        await model.updateOne(
          { _id: id, stock: { $lte: 0 }, soldOutAt: null },
          { $set: { soldOutAt: new Date() } },
          { timestamps: false },
        );
        await model.updateOne(
          { _id: id, stock: { $gt: 0 }, soldOutAt: { $ne: null } },
          { $set: { soldOutAt: null } },
          { timestamps: false },
        );
      }
    } catch (err) {
      console.error("[productFeed] soldOutAt sync failed:", err.message);
    }
    invalidateProductFeed();
  }

  productSchema.post("save", async function (doc) {
    await syncSoldOutAndRefreshFeed(doc.constructor, doc._id);
  });
  productSchema.post("findOneAndUpdate", async function (doc) {
    if (doc) await syncSoldOutAndRefreshFeed(this.model, doc._id);
  });
  productSchema.post("findOneAndDelete", function () {
    invalidateProductFeed();
  });
// ---------------------Add by Pawan------------------------

export const Product = mongoose.model("Product", productSchema);
