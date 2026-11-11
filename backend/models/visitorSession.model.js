import mongoose from "mongoose";

const visitorSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      default: "",
      index: true,
    },
    customerName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    currentUrl: {
      type: String,
      default: "",
    },
    pages: [
      {
        url: String,
        title: String,
        enteredAt: { type: Date, default: Date.now },
        secondsSpent: { type: Number, default: 0 },
      },
    ],
    clicks: [
      {
        label: String,
        tag: String,
        time: { type: Date, default: Date.now },
      },
    ],
    gemstonesViewed: [
      {
        name: String,
        sku: String,
        price: Number,
      },
    ],
    cartValue: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      default: "",
    },
    clarityUserId: {
      type: String,
      default: "",
    },
    clarityProjectId: {
      type: String,
      default: "y5uk9ao8cf",
    },
    utmSource: {
      type: String,
      default: "",
    },
    utmCampaign: {
      type: String,
      default: "",
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const VisitorSession = mongoose.model("VisitorSession", visitorSessionSchema);
export default VisitorSession;
