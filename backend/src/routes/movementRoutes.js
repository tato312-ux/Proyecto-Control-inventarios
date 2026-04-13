import { Router } from "express";
import { createMovement, getMovements } from "../controllers/movementController.js";
import { allowRoles, authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, getMovements);
router.post("/", authRequired, allowRoles("admin", "almacen"), createMovement);

export default router;
