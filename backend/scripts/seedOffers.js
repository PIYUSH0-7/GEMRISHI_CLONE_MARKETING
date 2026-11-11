import mongoose from "mongoose";

const mongoUrl =
  process.env.MONGODB_URL ||
  "mongodb://formorechatgg_db_user:Pawan12345@ac-ikyeajb-shard-00-00.b51mueu.mongodb.net:27017,ac-ikyeajb-shard-00-01.b51mueu.mongodb.net:27017,ac-ikyeajb-shard-00-02.b51mueu.mongodb.net:27017/gemrishi?ssl=true&replicaSet=atlas-ap5wcy-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    const Offer = mongoose.connection.collection("offers");

    // 1. GEMRISHI20
    await Offer.updateOne(
      { promoCode: "gemrishi20" },
      {
        $set: {
          name: "Navratri Gemstone 20% Discount",
          description:
            "Flat 20% discount on natural certified gemstones with minimum value of Rs 10,000",
          isActive: true,
          expiryDate: new Date("2030-12-31T23:59:59.000Z"),
          offerType: "promocode",
          promoCode: "gemrishi20",
          productType: "Product",
          isSubCategory: false,
          isJewelryType: false,
          isJewelryMetal: false,
          discountValue: 20,
          discountType: "percent",
          itemAmount: true,
          minItemAmount: 10000,
          totalAmount: false,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // 2. NAVRATRI
    await Offer.updateOne(
      { promoCode: "navratri" },
      {
        $set: {
          name: "Navratri Free Silver Ring Offer",
          description:
            "Complimentary silver ring worth Rs 1,500 on shopping bag value of Rs 10,000 and above",
          isActive: true,
          expiryDate: new Date("2030-12-31T23:59:59.000Z"),
          offerType: "promocode",
          promoCode: "navratri",
          productType: "Product",
          isSubCategory: false,
          isJewelryType: false,
          isJewelryMetal: false,
          discountValue: 0,
          discountType: "flat",
          itemAmount: false,
          totalAmount: true,
          minTotalAmount: 10000,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const allOffers = await Offer.find({}).toArray();
    console.log("OFFERS UPDATED SUCCESSFULLY. Current count:", allOffers.length);
    allOffers.forEach((o) =>
      console.log(
        "- Code:",
        o.promoCode,
        "| Name:",
        o.name,
        "| Val:",
        o.discountValue,
        "| Type:",
        o.discountType,
        "| MinItem:",
        o.minItemAmount,
        "| MinTotal:",
        o.minTotalAmount
      )
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
