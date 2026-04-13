import { Router } from "express";
import { createSale, getSales } from "../controllers/salesController.js";
import { allowRoles, authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, getSales);
router.post("/", authRequired, allowRoles("admin", "almacen", "ventas"), createSale);

export default router;
