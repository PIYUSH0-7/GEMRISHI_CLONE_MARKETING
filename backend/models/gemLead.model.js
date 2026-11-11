import mongoose from "mongoose";

const gemLeadSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Customer Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },
    unknownTime: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    weightKg: {
      type: String,
      trim: true,
    },
    budgetTier: {
      type: String,
      trim: true,
    },
    focus: {
      type: String,
      trim: true,
    },
    // Astrological & Planetary Data
    lagnaSign: {
      type: String,
      trim: true,
    },
    moonSign: {
      type: String,
      trim: true,
    },
    mahadasha: {
      type: String,
      trim: true,
    },
    antardasha: {
      type: String,
      trim: true,
    },
    // Primary Gemstone Recommendation
    primaryPlanet: {
      type: String,
      trim: true,
    },
    primaryStone: {
      type: String,
      trim: true,
    },
    primaryPurpose: {
      type: String,
      trim: true,
    },
    // Secondary Gemstone Recommendation
    secondaryPlanet: {
      type: String,
      trim: true,
    },
    secondaryStone: {
      type: String,
      trim: true,
    },
    secondaryPurpose: {
      type: String,
      trim: true,
    },
    classification: {
      type: String,
      trim: true,
    },
    recommendedCarats: {
      type: String,
      trim: true,
    },
    recommendedRatti: {
      type: String,
      trim: true,
    },
    wearingFinger: {
      type: String,
      trim: true,
    },
    wearingDay: {
      type: String,
      trim: true,
    },
    metal: {
      type: String,
      trim: true,
    },
    mantra: {
      type: String,
      trim: true,
    },
    // PDF Archive Link
    pdfUrl: {
      type: String,
      trim: true,
    },
    pdfPath: {
      type: String,
      trim: true,
    },
    // Telecaller & Sales Status Updates
    callStatus: {
      type: String,
      default: 'New',
      trim: true,
    },
    callNotes: {
      type: String,
      default: '',
      trim: true,
    },
    lastCallUpdate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt datewise
  }
);

export const GemLead = mongoose.model("GemLead", gemLeadSchema);
