import dotenv from "dotenv";
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl: process.env.DATABASE_URL || "development_database_url",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    jwtSecret: process.env.JWT_SECRET || "default_secret_key",
    jwtExpiresIn: process.env.JWT_EXPIRES || "15m",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    uploadsDir: process.env.UPLOADS_DIR || "uploads"

}