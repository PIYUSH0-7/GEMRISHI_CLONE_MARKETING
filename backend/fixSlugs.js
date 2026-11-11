// fixSlugs.js — run once: node fixSlugs.js
import mongoose from "mongoose";
import { Product } from "./models/product.model.js";
import * as dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URL);
const products = await Product.find({});

for (const product of products) {
  const newSlug = `${product.name}-${product.carat}-carats`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await Product.updateOne({ _id: product._id }, { $set: { slug: newSlug } });
  console.log(`Fixed: ${product.name} → ${newSlug}`);
}

console.log("Done!");
await mongoose.disconnect();
