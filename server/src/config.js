// Đọc cấu hình từ biến môi trường (file .env, nạp bằng --env-file)
module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "tmdt",
  tokenSecret: process.env.TOKEN_SECRET || "dev-secret",
};
