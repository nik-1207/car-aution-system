import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { DatabaseConnection } from "../database";
import auctionRoutes from "./routes/auction";

export class AuctionServer {
  private app: express.Application;
  private port: number;
  private db: DatabaseConnection;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.db = DatabaseConnection.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:3001"],
      credentials: true
    }));
    
    // Logging middleware
    this.app.use(morgan("combined"));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (request, response) => {
      response.status(200).json({
        success: true,
        message: "Car Auction API is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes
    this.app.use("/api/v1/auction", auctionRoutes);

    // 404 handler
    this.app.use("*", (request, response) => {
      response.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: request.originalUrl
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {
      console.error("Unhandled error:", error);
      
      response.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      });
    });
  }

  public async start(mongoConnectionString?: string): Promise<void> {
    try {
      // Connect to database
      if (mongoConnectionString) {
        await this.db.connect(mongoConnectionString);
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Car Auction Server is running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`🔧 API Base URL: http://localhost:${this.port}/api/v1`);
        console.log(`📚 API Documentation available at: http://localhost:${this.port}/api/v1/auction`);
      });

    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.db.disconnect();
      console.log("🛑 Car Auction Server stopped");
    } catch (error) {
      console.error("Error stopping server:", error);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and export server instance
export const createServer = (port?: number, mongoConnectionString?: string): AuctionServer => {
  const server = new AuctionServer(port);
  
  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await server.stop();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await server.stop();
    process.exit(0);
  });

  return server;
};

// Auto-start server if this file is run directly
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/car-auction-db";
  
  const server = createServer(port);
  server.start(mongoUrl).catch(console.error);
}