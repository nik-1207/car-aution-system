import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import auctionRoutes from "./routes/auction";
import { CarAuctionSystem } from "../index";
import { AuctionController } from "./controllers/AuctionController";

export class ApiServer {
  private app: Application;
  private port: number;
  private auctionSystem: CarAuctionSystem;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.auctionSystem = new CarAuctionSystem();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    // Logging middleware
    this.app.use(morgan("combined"));

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (request: Request, response: Response) => {
      response.status(200).json({
        success: true,
        message: "Car Auction API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    });

    // API routes
    this.app.use("/api/v1/auction", auctionRoutes);

    // 404 handler for all unmatched routes
    this.app.use((request: Request, response: Response) => {
      response.status(404).json({
        success: false,
        message: `Route ${request.originalUrl} not found`,
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, request: Request, response: Response, next: Function) => {
      console.error("Global error handler:", error);

      response.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
      });
    });
  }

  public async initialize(mongoConnectionString: string): Promise<void> {
    try {
      // Initialize the auction system
      await this.auctionSystem.initialize(mongoConnectionString);

      // Initialize controllers with the auction system
      AuctionController.initialize(this.auctionSystem);

      console.log("Car Auction System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Car Auction System:", error);
      throw error;
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`
🚀 Car Auction API Server is running!
📍 Port: ${this.port}
🔗 Base URL: http://localhost:${this.port}
📚 API Documentation: http://localhost:${this.port}/api/v1
🏥 Health Check: http://localhost:${this.port}/health

Available Endpoints:
├── POST   /api/v1/auction/token                    - Generate authentication token
├── POST   /api/v1/auction/createAuction            - Create a new auction
├── PATCH  /api/v1/auction/status/{auctionId}       - Update auction status
├── GET    /api/v1/auction/{auctionId}/winner-bid   - Get highest bid for auction
└── POST   /api/v1/auction/placeBids                - Place a bid on auction

Authentication:
- Username: Admin
- Password: Admin
      `);
    });
  }

  public async shutdown(): Promise<void> {
    try {
      await this.auctionSystem.shutdown();
      console.log("Car Auction API Server shut down successfully");
    } catch (error) {
      console.error("Error during server shutdown:", error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
