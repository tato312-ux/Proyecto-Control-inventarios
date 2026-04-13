import { Router } from "express";
import { createProduct, getLowStockProducts, getProducts } from "../controllers/productController.js";
import { allowRoles, authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, getProducts);
router.get("/low-stock", authRequired, getLowStockProducts);
router.post("/", authRequired, allowRoles("admin", "almacen"), createProduct);

export default router;
