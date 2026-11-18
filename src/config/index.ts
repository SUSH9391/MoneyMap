import dotenv from "dotenv";
dotenv.config();
export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl: process.env.DATABASE_URL || "development_database_url",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    jwtSecret: process.env.JWT_SECRET || "default_secret_key",
    jwtExpiresIn: process.env.JWT_EXPIRES || "15m",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    uploadsDir: process.env.UPLOADS_DIR || "uploads",
    appDeepLinkBase: process.env.APP_DEEP_LINK_BASE || 'ledgernest://reset-password',
    passwordResetExpiryMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES || '60', 10),
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    emailFrom: process.env.EMAIL_FROM || 'noreply@mybudget.app',
}

