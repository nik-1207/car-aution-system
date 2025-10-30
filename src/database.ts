import mongoose from "mongoose";

export class DatabaseConnection {
  private static instance: DatabaseConnection | undefined;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    DatabaseConnection.instance ??= new DatabaseConnection();
    return DatabaseConnection.instance;
  }

  public async connect(connectionString: string): Promise<void> {
    if (!this.isConnected) {
      try {
        await mongoose.connect(connectionString, {
          // Add any mongoose connection options here
        });

        this.isConnected = true;
        console.log("Connected to MongoDB successfully");

        mongoose.connection.on("error", (error) => {
          console.error("MongoDB connection error:", error);
          this.isConnected = false;
        });

        mongoose.connection.on("disconnected", () => {
          console.log("MongoDB disconnected");
          this.isConnected = false;
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
      }
    } else {
      console.log("Database is already connected");
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log("Disconnected from MongoDB successfully");
      } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw error;
      }
    } else {
      console.log("Database is not connected");
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
