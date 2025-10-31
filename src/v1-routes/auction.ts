import { Router, Request, Response, NextFunction } from "express";
import { sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { config } from "../config/config";
import { 
  AuctionService, 
  type CreateAuctionData, 
  type UpdateAuctionStatusData,
  type PlaceBidData 
} from "../services";
import { AuctionStatus } from "../models";

class AuctionRoutes {
  private router: Router;
  private auctionService: AuctionService;

  constructor() {
    this.router = Router();
    this.auctionService = new AuctionService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /api/v1/auction/token - Generate authentication token
    this.router.post("/token", this.generateToken.bind(this));

    // POST /api/v1/auction/createAuction - Create new auction
    this.router.post("/createAuction", this.createAuction.bind(this));

    // PATCH /api/v1/auction/status/:auctionId - Update auction status
    this.router.patch("/status/:auctionId", this.updateAuctionStatus.bind(this));

    // GET /api/v1/auction/:auctionId/winner-bid - Get winner bid
    this.router.get("/:auctionId/winner-bid", this.getWinnerBid.bind(this));

    // POST /api/v1/auction/placeBids - Place bid
    this.router.post("/placeBids", this.placeBid.bind(this));
  }

  // Generate authentication token
  private async generateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        throw createHttpError(400, "Username and password are required");
      }

      // Check static credentials
      if (username !== config.adminUsername || password !== config.adminPassword) {
        throw createHttpError(401, "Invalid username or password");
      }

      // Generate JWT token
      const payload = {
        username: config.adminUsername,
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      const token = sign(payload, config.jwtSecret);

      // Send successful response
      res.status(200).json({
        success: true,
        message: "Token generated successfully",
        data: {
          token,
          tokenType: "Bearer",
          expiresIn: config.jwtExpiresIn,
          user: {
            username: config.adminUsername,
            role: "admin",
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new auction
  private async createAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId, startingPrice, startTime, endTime, carId } = req.body;

      // Validate required fields
      if (!auctionId || !startingPrice || !startTime || !endTime || !carId) {
        throw createHttpError(400, "Missing required fields: auctionId, startingPrice, startTime, endTime, carId");
      }

      const auctionData: CreateAuctionData = {
        auctionId,
        startingPrice: Number(startingPrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        carId,
      };

      // Create auction using service
      const auction = await this.auctionService.createAuction(auctionData);

      res.status(201).json({
        success: true,
        message: "Auction created successfully",
        data: {
          auctionId: auction.auctionId,
          startingPrice: auction.startingPrice,
          startTime: auction.startTime,
          endTime: auction.endTime,
          auctionStatus: auction.auctionStatus,
          car: auction.carId,
          createdAt: auction.createdAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Update auction status
  private async updateAuctionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId } = req.params;
      const { status } = req.body;

      // Validate required fields
      if (!status) {
        throw createHttpError(400, "Status is required in request body");
      }

      const updateData: UpdateAuctionStatusData = {
        status: status as AuctionStatus,
      };

      // Update auction status using service
      const updatedAuction = await this.auctionService.updateAuctionStatus(auctionId, updateData);

      res.status(200).json({
        success: true,
        message: "Auction status updated successfully",
        data: {
          auctionId: updatedAuction.auctionId,
          previousStatus: req.body.previousStatus, // This would come from frontend for tracking
          currentStatus: updatedAuction.auctionStatus,
          startTime: updatedAuction.startTime,
          endTime: updatedAuction.endTime,
          car: updatedAuction.carId,
          updatedAt: updatedAuction.updatedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get winner bid
  private async getWinnerBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId } = req.params;

      // Validate required fields
      if (!auctionId) {
        throw createHttpError(400, "Auction ID is required");
      }

      // Get winner bid using service
      const winnerBidData = await this.auctionService.getWinnerBid(auctionId);

      res.status(200).json({
        success: true,
        message: winnerBidData.winnerBid 
          ? "Winner bid retrieved successfully" 
          : "No bids found for this auction",
        data: winnerBidData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Place bid
  private async placeBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId, bidAmount, dealerName, dealerEmail } = req.body;

      // Validate required fields
      if (!auctionId || !bidAmount || !dealerName || !dealerEmail) {
        throw createHttpError(400, "Missing required fields: auctionId, bidAmount, dealerName, dealerEmail");
      }

      const bidData: PlaceBidData = {
        auctionId,
        bidAmount: Number(bidAmount),
        dealerName: dealerName.trim(),
        dealerEmail: dealerEmail.trim().toLowerCase()
      };

      // Place bid using service
      const bid = await this.auctionService.placeBid(bidData);

      res.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: {
          bidId: bid.bidId,
          bidAmount: bid.bidAmount,
          bidTime: bid.bidTime,
          auction: {
            auctionId: (bid.auctionId as any).auctionId,
            car: (bid.auctionId as any).carId
          },
          dealer: {
            dealerId: (bid.dealerId as any).dealerId,
            name: (bid.dealerId as any).name,
            email: (bid.dealerId as any).email
          },
          previousBid: bid.previousBid
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default AuctionRoutes;
