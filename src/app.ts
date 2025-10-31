import { ApiServer } from "./api/server";

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/car-auction-db";

async function startServer(): Promise<void> {
  const apiServer = new ApiServer(PORT);

  try {
    // Initialize the server with database connection
    await apiServer.initialize(MONGO_URI);

    // Start the server
    apiServer.start();

    // Graceful shutdown handling
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully...");
      await apiServer.shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully...");
      await apiServer.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error("Unhandled error during server startup:", error);
  process.exit(1);
});
