import { Request, Response } from "express";
import { CarService, DealerService, AuctionService, BidService } from "../../services";
import { AuctionStatus } from "../../types";

export class AuctionController {
  private carService: CarService;
  private dealerService: DealerService;
  private auctionService: AuctionService;
  private bidService: BidService;

  constructor() {
    this.carService = new CarService();
    this.dealerService = new DealerService();
    this.auctionService = new AuctionService();
    this.bidService = new BidService();
  }

  // POST /api/v1/auction/createAuction
  public createAuction = async (request: Request, response: Response): Promise<void> => {
    try {
      const { auctionId, carId, startingPrice, startTime, endTime } = request.body;

      // Validate required fields
      if (!auctionId || !carId || !startingPrice || !startTime || !endTime) {
        response.status(400).json({
          success: false,
          message: "Missing required fields: auctionId, carId, startingPrice, startTime, endTime"
        });
        return;
      }

      // Validate startingPrice
      if (typeof startingPrice !== "number" || startingPrice <= 0) {
        response.status(400).json({
          success: false,
          message: "Starting price must be a positive number"
        });
        return;
      }

      // Validate dates
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        response.status(400).json({
          success: false,
          message: "Invalid date format for startTime or endTime"
        });
        return;
      }

      if (endDate <= startDate) {
        response.status(400).json({
          success: false,
          message: "End time must be after start time"
        });
        return;
      }

      // Create the auction
      const auction = await this.auctionService.createAuction({
        auctionId,
        carId,
        startingPrice,
        startTime: startDate,
        endTime: endDate
      });

      response.status(201).json({
        success: true,
        message: "Auction created successfully",
        data: {
          auctionId: auction.auctionId,
          carId: auction.carId,
          startingPrice: auction.startingPrice,
          startTime: auction.startTime,
          endTime: auction.endTime,
          auctionStatus: auction.auctionStatus,
          createdAt: auction.createdAt
        }
      });

    } catch (error) {
      response.status(500).json({
        success: false,
        message: "Failed to create auction",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // PATCH /api/v1/auction/status/:auctionId
  public updateAuctionStatus = async (request: Request, response: Response): Promise<void> => {
    try {
      const { auctionId } = request.params;
      const { status, winnerId } = request.body;

      if (!auctionId) {
        response.status(400).json({
          success: false,
          message: "Auction ID is required"
        });
        return;
      }

      // Validate status
      if (!status || !Object.values(AuctionStatus).includes(status)) {
        response.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(AuctionStatus).join(", ")}`
        });
        return;
      }

      // Update auction status
      const updatedAuction = await this.auctionService.updateAuctionStatus(
        auctionId,
        status,
        winnerId
      );

      if (!updatedAuction) {
        response.status(404).json({
          success: false,
          message: "Auction not found"
        });
        return;
      }

      response.status(200).json({
        success: true,
        message: "Auction status updated successfully",
        data: {
          auctionId: updatedAuction.auctionId,
          auctionStatus: updatedAuction.auctionStatus,
          winnerId: updatedAuction.winnerId,
          updatedAt: updatedAuction.updatedAt
        }
      });

    } catch (error) {
      response.status(500).json({
        success: false,
        message: "Failed to update auction status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // GET /api/v1/auction/:auctionId/winner-bid
  public getWinnerBid = async (request: Request, response: Response): Promise<void> => {
    try {
      const { auctionId } = request.params;

      if (!auctionId) {
        response.status(400).json({
          success: false,
          message: "Auction ID is required"
        });
        return;
      }

      // Get auction details
      const auction = await this.auctionService.getAuctionById(auctionId);
      if (!auction) {
        response.status(404).json({
          success: false,
          message: "Auction not found"
        });
        return;
      }

      // Get highest bid
      const highestBid = await this.bidService.getHighestBidForAuction(auctionId);

      if (!highestBid) {
        response.status(200).json({
          success: true,
          message: "No bids found for this auction",
          data: {
            auctionId: auction.auctionId,
            startingPrice: auction.startingPrice,
            currentHighestBid: null,
            highestBid: null,
            winningDealer: null
          }
        });
        return;
      }

      response.status(200).json({
        success: true,
        message: "Winner bid retrieved successfully",
        data: {
          auctionId: auction.auctionId,
          startingPrice: auction.startingPrice,
          currentHighestBid: auction.currentHighestBid,
          highestBid: {
            bidId: highestBid.bidId,
            bidAmount: highestBid.bidAmount,
            bidTime: highestBid.bidTime,
            dealer: {
              dealerId: (highestBid as any).dealerId?.dealerId || highestBid.dealerId,
              name: (highestBid as any).dealerId?.name,
              email: (highestBid as any).dealerId?.email
            }
          }
        }
      });

    } catch (error) {
      response.status(500).json({
        success: false,
        message: "Failed to get winner bid",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // POST /api/v1/auction/placeBids
  public placeBid = async (request: Request, response: Response): Promise<void> => {
    try {
      const { bidId, auctionId, dealerId, bidAmount } = request.body;

      // Validate required fields
      if (!bidId || !auctionId || !dealerId || !bidAmount) {
        response.status(400).json({
          success: false,
          message: "Missing required fields: bidId, auctionId, dealerId, bidAmount"
        });
        return;
      }

      // Validate bid amount
      if (typeof bidAmount !== "number" || bidAmount <= 0) {
        response.status(400).json({
          success: false,
          message: "Bid amount must be a positive number"
        });
        return;
      }

      // Place the bid
      const bid = await this.bidService.placeBid({
        bidId,
        auctionId,
        dealerId,
        bidAmount
      });

      response.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: {
          bidId: bid.bidId,
          auctionId: bid.auctionId,
          dealerId: bid.dealerId,
          bidAmount: bid.bidAmount,
          bidTime: bid.bidTime,
          previousBid: bid.previousBid
        }
      });

    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes("not found") ? 404 :
                        error instanceof Error && (
                          error.message.includes("not active") ||
                          error.message.includes("higher than") ||
                          error.message.includes("not within")
                        ) ? 400 : 500;

      response.status(statusCode).json({
        success: false,
        message: "Failed to place bid",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
}