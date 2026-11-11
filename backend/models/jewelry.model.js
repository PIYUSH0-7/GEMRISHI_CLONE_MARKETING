import mongoose from "mongoose";
import appendDomainPlugin from "../plugins/appendDomain.js";
import { createCleanSlug, cleanSku, getCanonicalSlug, getCanonicalProductPath } from "../utils/slugify.js";

const jewelrySchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    productSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JewelrySubCategory",
    },
    jewelryName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    jewelryMetalWeight: {
      type: Number,
    },
    makingChargePercent: {
      type: Number,
      min: [0, "Making charge must be at least 0%"],
      max: [100, "Making charge cannot exceed 100%"],
      default: 10,
    },
    jewelryPrice: {
      type: Number,
      min: [0, "Must be positive"],
      required: true,
    },
    jewelryDesc: {
      type: String,
    },
    jewelryType: {
      type: String,
      enum: ["Ring", "Pendant", "Bracelet", "Brooch", "Necklace", "Earrings"],
      required: true,
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
    gemstoneWeight: [
      {
        weight: { type: Number },
        price: { type: Number },
      },
    ],
    isDiamondSubstitute: {
      type: Boolean,
      default: false,
    },
    diamondSubstitute: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    certificate: [
      {
        certificateType: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    sizeSystem: [
      {
        sizeType: { type: String },
        sizeNumbers: [{ type: String }],
      },
    ],
    // quality: [
    //   {
    //     qualityType: { type: String, required: true },
    //     price: { type: Number, required: true },
    //   },
    // ],
    metal: {
      type: String,
      enum: [
        "gold",
        "silver",
        "platinum",
        "panchadhatu",
        "18k Gold",
        "22k Gold",
        "Silver",
        "Platinum",
        "Brass",
      ],
      required: true,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
    },
    stock: { type: Number, min: [0, "Stock must be positive"] },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // price: { type: Number, min: [0, "Must be positive"], required: true }, // price is replaced by jewelryPrice
    color: { type: String, required: false, trim: true },
    cut: { type: String, required: false, trim: true },
    shape: { type: String, required: false, trim: true },
    origin: { type: String, required: false, trim: true },
    orderCount: {
      type: Number,
    },
    offerId: { type: String },

    deliveryDays: {
      type: Number,
    },

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

jewelrySchema.pre("save", function (next) {
  const targetSlug = getCanonicalSlug(this.jewelryName || this.name, this.sku);
  if (!this.slug) {
    this.slug = targetSlug;
  }
  next();
});

jewelrySchema.plugin(appendDomainPlugin, { fields: ["url"] });

export const Jewelry = mongoose.model("Jewelry", jewelrySchema);
