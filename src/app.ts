import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { config } from "./config/config";
import { errorHandler } from "./middleware/error";
import AuctionRoutes from "./v1-routes/auction";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private connectToDatabase(): void {
    mongoose
      .connect(config.mongoUri)
      .then(() => {
        console.log("✅ Connected to MongoDB");
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
      });
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: config.corsOrigin,
        credentials: true,
      }),
    );

    // Logging middleware
    this.app.use(morgan("combined"));

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Car Auction System API",
      });
    });
  }

  private initializeRoutes(): void {
    // API v1 routes
    this.app.use("/api/v1/auction", new AuctionRoutes().getRouter());

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        message: "Welcome to Car Auction System API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          generateToken: "POST /api/v1/auction/token",
          createAuction: "POST /api/v1/auction/createAuction",
          updateAuctionStatus: "PATCH /api/v1/auction/status/{auctionId}",
          getWinnerBid: "GET /api/v1/auction/{auctionId}/winner-bid",
          placeBid: "POST /api/v1/auction/placeBids",
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`🚀 Car Auction System API is running on port ${config.port}`);
      console.log(`📖 API Documentation: http://localhost:${config.port}/`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
    });
  }
}

export default App;
