import { MetalRates } from "../models/metalRates.model.js";

export const getLatestMetalRates = async () => {
  try {
    const latestRates = await MetalRates.findOne()
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

    if (!latestRates) {
      throw new Error("Latest metal rates not found.");
    }

    return latestRates;
  } catch (error) {
    console.error("Error while fetching latest metal rates:", error);

    throw new Error(
      error?.message || "Unable to fetch latest metal rates."
    );
  }
};