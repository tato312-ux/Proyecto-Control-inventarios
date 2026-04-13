import { Router } from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { allowRoles, authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, getCategories);
router.post("/", authRequired, allowRoles("admin", "almacen"), createCategory);

export default router;
