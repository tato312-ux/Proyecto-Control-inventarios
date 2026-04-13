import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: "8h" }
  );
}
