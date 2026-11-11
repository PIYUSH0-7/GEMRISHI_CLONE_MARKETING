import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        "recommender",
        "contact",
        "abandoned_cart",
        "newsletter",
        "manual",
        "whatsapp",
        "inquiry",
      ],
      default: "inquiry",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "in_progress", "converted", "lost"],
      default: "new",
    },
    message: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    notes: [
      {
        content: { type: String, required: true },
        author: { type: String, default: "Admin" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
