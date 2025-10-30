import { DatabaseConnection } from "./database";
import { CarService, DealerService, AuctionService, BidService } from "./services";
import { AuctionStatus } from "./types";

// Main application class
export class CarAuctionSystem {
  private db: DatabaseConnection;
  private carService: CarService;
  private dealerService: DealerService;
  private auctionService: AuctionService;
  private bidService: BidService;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.carService = new CarService();
    this.dealerService = new DealerService();
    this.auctionService = new AuctionService();
    this.bidService = new BidService();
  }

  public async initialize(mongoConnectionString: string): Promise<void> {
    try {
      await this.db.connect(mongoConnectionString);
      console.log("Car Auction System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Car Auction System:", error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.db.disconnect();
      console.log("Car Auction System shut down successfully");
    } catch (error) {
      console.error("Failed to shut down Car Auction System:", error);
      throw error;
    }
  }

  // Getter methods for services
  public getCarService(): CarService {
    return this.carService;
  }

  public getDealerService(): DealerService {
    return this.dealerService;
  }

  public getAuctionService(): AuctionService {
    return this.auctionService;
  }

  public getBidService(): BidService {
    return this.bidService;
  }
}

// Example usage function
export async function demonstrateAuctionSystem(): Promise<void> {
  const auctionSystem = new CarAuctionSystem();

  try {
    // Initialize with MongoDB connection string
    await auctionSystem.initialize("mongodb://localhost:27017/car-auction-db");

    // Create some sample data
    const carService = auctionSystem.getCarService();
    const dealerService = auctionSystem.getDealerService();
    const auctionService = auctionSystem.getAuctionService();
    const bidService = auctionSystem.getBidService();

    // Create a car
    const car = await carService.createCar({
      carId: "CAR001",
      make: "Toyota",
      model: "Camry",
      year: 2022,
    });
    console.log("Created car:", car.carId);

    // Create dealers
    const dealer1 = await dealerService.createDealer({
      dealerId: "DEALER001",
      name: "John Smith",
      email: "john@example.com",
    });

    const dealer2 = await dealerService.createDealer({
      dealerId: "DEALER002",
      name: "Jane Doe",
      email: "jane@example.com",
    });

    console.log("Created dealers:", dealer1.dealerId, dealer2.dealerId);

    // Create an auction
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour from now

    const auction = await auctionService.createAuction({
      auctionId: "AUCTION001",
      carId: car.carId,
      startingPrice: 15000,
      startTime,
      endTime,
    });

    // Update auction status to active
    await auctionService.updateAuctionStatus(auction.auctionId, AuctionStatus.ACTIVE);
    console.log("Created and activated auction:", auction.auctionId);

    // Place some bids
    const bid1 = await bidService.placeBid({
      bidId: "BID001",
      auctionId: auction.auctionId,
      dealerId: dealer1.dealerId,
      bidAmount: 16000,
    });

    const bid2 = await bidService.placeBid({
      bidId: "BID002",
      auctionId: auction.auctionId,
      dealerId: dealer2.dealerId,
      bidAmount: 17000,
    });

    console.log("Placed bids:", bid1.bidAmount, bid2.bidAmount);

    // Get auction with current highest bid
    const updatedAuction = await auctionService.getAuctionById(auction.auctionId);
    console.log("Current highest bid:", updatedAuction?.currentHighestBid);

    // Get bid history
    const bidHistory = await bidService.getBidHistory(auction.auctionId);
    console.log("Bid history length:", bidHistory.length);
  } catch (error) {
    console.error("Error in demonstration:", error);
  } finally {
    await auctionSystem.shutdown();
  }
}

// Uncomment the line below to run the demonstration
// demonstrateAuctionSystem().catch(console.error);
