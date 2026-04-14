import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const defaultJwtSecret = "dev-secret";

export const config = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
};

if (config.isProduction && config.jwtSecret === defaultJwtSecret) {
  throw new Error("JWT_SECRET debe configurarse en produccion");
}
