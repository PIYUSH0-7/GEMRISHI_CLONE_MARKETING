import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  changeCategoryOrder,
} from "../controllers/category.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/single-category/:slug", getSingleCategory);

router.post("/create-category", protectAdmin, createCategory);

router.get("/get-categories", getAllCategories);

router.put("/update-category/:categoryId", protectAdmin, updateCategory);

router.put("/change-order", protectAdmin, changeCategoryOrder);

router.delete("/delete-category/:categoryId", protectAdmin, deleteCategory);

export default router;
