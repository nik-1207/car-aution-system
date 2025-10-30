import { createServer } from "./api/server";

// Configuration from environment variables
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/car-auction-db";

console.log("🚀 Starting Car Auction API Server...");
console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`🗄️  MongoDB URI: ${MONGODB_URI}`);

// Create and start the server
const server = createServer(PORT);
server.start(MONGODB_URI).catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});