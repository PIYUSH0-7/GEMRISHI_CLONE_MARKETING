import mongoose from "mongoose";

const blockedIpSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "Admin Excluded",
    },
  },
  { timestamps: true }
);

export const BlockedIp = mongoose.model("BlockedIp", blockedIpSchema);
export default BlockedIp;
