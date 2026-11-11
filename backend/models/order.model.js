import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Add By Pawan (START) — Meta tracking data captured when checkout starts.
// It is stored WITH the order so the payment webhook (which has no browser)
// can later send a correct, de-duplicated server-side Purchase.
//   * select:false  -> never returned by normal queries
//   * toJSON strips it -> never leaks to the browser / admin socket events
// ---------------------------------------------------------------------------
const metaTrackingSchema = new mongoose.Schema(
  {
    fbp: { type: String },
    fbc: { type: String },
    fbclid: { type: String },
    fbclidCapturedAt: { type: Date },
    clientIp: { type: String },
    userAgent: { type: String },
    eventSourceUrl: { type: String }, // real GemRishi page URL at checkout
    externalId: { type: String }, // opaque customer id (never an e-mail)
    consent: { type: Boolean }, // marketing consent at checkout time (undefined = unknown)
    // Idempotency state for the server-side Purchase event
    purchase: {
      status: { type: String, enum: ["sending", "sent", "failed"] },
      claimedAt: { type: Date },
      sentAt: { type: Date },
      eventName: { type: String },
      eventId: { type: String },
      valueSent: { type: Number },
      valueBasis: { type: String },
      lastError: { type: String },
    },
  },
  { _id: false }
);
// Add By Pawan (END)

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Retailer",
    },
    orderId: {
      type: String,
      unique: true,
      required: false,
    },
    // Cashfree Identifiers
    cashfreeOrderId: {
      type: String,
      default: null,
    },
    cashfreePaymentId: {
      type: String,
      default: null,
    },
    // Legacy fields preserved for historical orders
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: false,
    },
    discountAmount: {
      type: Number,
      required: false,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "InProgress", "Completed", "Failed", "Cancelled","Pending Refund","Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "InProgress", "Completed", "Cancelled","Failed"],
      default: "Pending",
    },
    cancelOrderReason: {
      type: String,
      required: false,
      trim: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Product",
        },
        jewelryId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Jewelry",
        },
        quantity: {
          type: Number,
          required: true,
        },
        cancelStatus: {
          type: Boolean,
        },
        cancelOrderReason: {
          type: String,
          required: false,
          trim: true,
        },
        itemTotal: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          trim: true,
          required: false,
        },
        image: {
          type: String,
          trim: true,
          required: false,
        },
        jewelryTitle: {
          type: String,
          trim: true,
          required: false,
        },
        jewelryImage: {
          type: String,
          trim: true,
          required: false,
        },
        customization: {
          appliedCoupon: {
            type: String,
          },
          originalPrice: {
            type: Number,
          },
          discountedPrice: {
            type: Number,
          },
          discountAmount: {
            type: Number,
          },
          metal: {
            type: String,
          },
          note: {
            type: String,
          },
          certificate: {
            certificateType: {
              type: String,
            },
            price: {
              type: Number,
            },
          },
          jewelryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Jewelry",
          },
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          goldKarat: {
            karatType: {
              type: String,
              enum: ["gold24k", "gold22k", "gold18k"],
            },
            price: { type: Number },
          },
          gemstoneWeight: {
            weight: { type: String },
            price: { type: Number },
          },
          sizeSystem: {
            sizeType: { type: String },
            sizeNumber: { type: String },
          },
          isDiamondSubstitute: {
            type: Boolean,
          },
          diamondSubstitute: {
            name: { type: String },
            price: { type: Number },
          },
          quality: {
            qualityType: { type: String },
            price: { type: Number },
          },
        },
      },
    ],
    address: {
      addressType: {
        type: String,
        trim: true,
        required: false,
      },
      fullName: {
        type: String,
        trim: true,
        required: false,
      },
      email: {
        type: String,
        trim: true,
        required: false,
      },
      mobileNo: {
        type: String,
        trim: true,
        required: false,
      },
      addressLine1: {
        type: String,
        trim: true,
        required: false,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
        required: false,
      },
      pinCode: {
        type: String,
        trim: true,
        required: false,
      },
      state: {
        type: String,
        trim: true,
        required: false,
      },
      country: {
        type: String,
        trim: true,
        required: false,
      },
      note: {
        trim: true,
        type: String,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "cashfree", "razorpay"],
      default: "cashfree",
    },
    paymentMode: {
      type: String,
      trim: true,
    },
    paidAmount: {
      type: Number,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    onlinePayAmount: {
      type: Number,
    },
    offlinePayAmount: {
      type: Number,
    },
    partialPay: {
      type: Boolean,
      default: false,
    },
    // breezeTransactionId: {
    //   type: String,
    // },--------------Update By Pawan-------------
    attribution: {
      firstTouch: { type: Object, default: {} },
      lastTouch: { type: Object, default: {} },
    },
    // ---- Add By Pawan (START): Meta tracking / Purchase idempotency (private) ----
    metaTracking: {
      type: metaTrackingSchema,
      select: false,
      default: undefined,
    },
    // ---- Add By Pawan (END) ----
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // ---- Add By Pawan (START): never serialise Meta tracking data (IP, user agent, fbp...) to clients ----
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.metaTracking;
        return ret;
      },
    },
    // ---- Add By Pawan (END) ----
  }
);

export const Order = mongoose.model("Order", orderSchema);