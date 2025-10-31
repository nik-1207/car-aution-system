import { Request, Response } from "express";
import { CarAuctionSystem } from "../../index";
import { AuctionStatus } from "../../types";
import { AuthRequest } from "../middleware/auth";

export class AuctionController {
  private static auctionSystem: CarAuctionSystem;

  public static initialize(auctionSystem: CarAuctionSystem): void {
    AuctionController.auctionSystem = auctionSystem;
  }

  // POST /api/v1/auction/createAuction
  public static async createAuction(request: AuthRequest, response: Response): Promise<void> {
    try {
      const { auctionId, carId, startingPrice, startTime, endTime } = request.body;

      // Validate required fields
      if (!auctionId || !carId || !startingPrice || !startTime || !endTime) {
        response.status(400).json({
          success: false,
          message: "All fields are required: auctionId, carId, startingPrice, startTime, endTime",
        });
        return;
      }

      const auctionService = AuctionController.auctionSystem.getAuctionService();

      const auction = await auctionService.createAuction({
        auctionId,
        carId,
        startingPrice: Number(startingPrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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
        },
      });
    } catch (error) {
      response.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // PATCH /api/v1/auction/status/{auctionId}
  public static async updateAuctionStatus(request: AuthRequest, response: Response): Promise<void> {
    try {
      const { auctionId } = request.params;
      const { status } = request.body;

      if (!auctionId) {
        response.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      if (!status || !Object.values(AuctionStatus).includes(status)) {
        response.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(AuctionStatus).join(", ")}`,
        });
        return;
      }

      const auctionService = AuctionController.auctionSystem.getAuctionService();
      const auction = await auctionService.updateAuctionStatus(auctionId, status);

      if (!auction) {
        response.status(404).json({
          success: false,
          message: "Auction not found",
        });
        return;
      }

      response.status(200).json({
        success: true,
        message: "Auction status updated successfully",
        data: {
          auctionId: auction.auctionId,
          auctionStatus: auction.auctionStatus,
          startTime: auction.startTime,
          endTime: auction.endTime,
        },
      });
    } catch (error) {
      response.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // GET /api/v1/auction/{auctionId}/winner-bid
  public static async getWinnerBid(request: AuthRequest, response: Response): Promise<void> {
    try {
      const { auctionId } = request.params;

      if (!auctionId) {
        response.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      const bidService = AuctionController.auctionSystem.getBidService();
      const auctionService = AuctionController.auctionSystem.getAuctionService();

      // Get auction details
      const auction = await auctionService.getAuctionById(auctionId);
      if (!auction) {
        response.status(404).json({
          success: false,
          message: "Auction not found",
        });
        return;
      }

      // Get highest bid
      const highestBid = await bidService.getHighestBidForAuction(auctionId);

      if (!highestBid) {
        response.status(200).json({
          success: true,
          message: "No bids placed yet",
          data: {
            auctionId: auction.auctionId,
            auctionStatus: auction.auctionStatus,
            startingPrice: auction.startingPrice,
            currentHighestBid: null,
            winnerBid: null,
          },
        });
        return;
      }

      response.status(200).json({
        success: true,
        message: "Winner bid retrieved successfully",
        data: {
          auctionId: auction.auctionId,
          auctionStatus: auction.auctionStatus,
          startingPrice: auction.startingPrice,
          currentHighestBid: auction.currentHighestBid,
          winnerBid: {
            bidId: highestBid.bidId,
            bidAmount: highestBid.bidAmount,
            bidTime: highestBid.bidTime,
            dealerId: highestBid.dealerId,
          },
        },
      });
    } catch (error) {
      response.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // POST /api/v1/auction/placeBids
  public static async placeBid(request: AuthRequest, response: Response): Promise<void> {
    try {
      const { bidId, auctionId, dealerId, bidAmount } = request.body;

      // Validate required fields
      if (!bidId || !auctionId || !dealerId || !bidAmount) {
        response.status(400).json({
          success: false,
          message: "All fields are required: bidId, auctionId, dealerId, bidAmount",
        });
        return;
      }

      const bidService = AuctionController.auctionSystem.getBidService();

      const bid = await bidService.placeBid({
        bidId,
        auctionId,
        dealerId,
        bidAmount: Number(bidAmount),
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
        },
      });
    } catch (error) {
      response.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
