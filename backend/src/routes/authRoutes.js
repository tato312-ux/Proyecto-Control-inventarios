import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { authRequired, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", authRequired, allowRoles("admin"), register);

export default router;
