import { Auction, Car } from "../models";
import { IAuction, AuctionStatus } from "../types";
import { ObjectId } from "mongoose";

export class AuctionService {
  public async createAuction(auctionData: {
    auctionId: string;
    carId: string;
    startingPrice: number;
    startTime: Date;
    endTime: Date;
  }): Promise<IAuction> {
    try {
      // Verify car exists
      const car = await Car.findOne({ carId: auctionData.carId });
      if (car === null) {
        throw new Error(`Car with ID ${auctionData.carId} not found`);
      }

      // Check if car is already in an active auction
      const existingAuction = await Auction.findOne({
        carId: car._id,
        auctionStatus: { $in: [AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE] },
      });

      if (existingAuction !== null) {
        throw new Error(`Car is already in an active auction`);
      }

      const auction = new Auction({
        auctionId: auctionData.auctionId,
        carId: car._id,
        startingPrice: auctionData.startingPrice,
        startTime: auctionData.startTime,
        endTime: auctionData.endTime,
      });

      const savedAuction = await auction.save();
      return savedAuction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create auction: ${error.message}`);
      }
      throw new Error("Failed to create auction: Unknown error");
    }
  }

  public async getAuctionById(auctionId: string): Promise<IAuction | null> {
    try {
      const auction = await Auction.findOne({ auctionId }).populate("carId").populate("winnerId");
      return auction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get auction: ${error.message}`);
      }
      throw new Error("Failed to get auction: Unknown error");
    }
  }

  public async getAllAuctions(): Promise<IAuction[]> {
    try {
      const auctions = await Auction.find({}).populate("carId").populate("winnerId").sort({ createdAt: -1 });
      return auctions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get auctions: ${error.message}`);
      }
      throw new Error("Failed to get auctions: Unknown error");
    }
  }

  public async getAuctionsByStatus(status: AuctionStatus): Promise<IAuction[]> {
    try {
      const auctions = await Auction.find({ auctionStatus: status })
        .populate("carId")
        .populate("winnerId")
        .sort({ startTime: 1 });
      return auctions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get auctions by status: ${error.message}`);
      }
      throw new Error("Failed to get auctions by status: Unknown error");
    }
  }

  public async updateAuctionStatus(
    auctionId: string,
    status: AuctionStatus,
    winnerId?: ObjectId,
  ): Promise<IAuction | null> {
    try {
      const updateData: any = { auctionStatus: status };
      if (winnerId !== undefined) {
        updateData.winnerId = winnerId;
      }

      const auction = await Auction.findOneAndUpdate({ auctionId }, updateData, { new: true, runValidators: true })
        .populate("carId")
        .populate("winnerId");

      return auction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update auction status: ${error.message}`);
      }
      throw new Error("Failed to update auction status: Unknown error");
    }
  }

  public async updateCurrentHighestBid(auctionId: string, bidAmount: number): Promise<IAuction | null> {
    try {
      const auction = await Auction.findOneAndUpdate(
        { auctionId },
        { currentHighestBid: bidAmount },
        { new: true, runValidators: true },
      );
      return auction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update highest bid: ${error.message}`);
      }
      throw new Error("Failed to update highest bid: Unknown error");
    }
  }

  public async getActiveAuctions(): Promise<IAuction[]> {
    const now = new Date();
    try {
      const auctions = await Auction.find({
        startTime: { $lte: now },
        endTime: { $gte: now },
        auctionStatus: AuctionStatus.ACTIVE,
      })
        .populate("carId")
        .populate("winnerId")
        .sort({ endTime: 1 });
      return auctions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get active auctions: ${error.message}`);
      }
      throw new Error("Failed to get active auctions: Unknown error");
    }
  }

  public async getUpcomingAuctions(): Promise<IAuction[]> {
    const now = new Date();
    try {
      const auctions = await Auction.find({
        startTime: { $gt: now },
        auctionStatus: AuctionStatus.SCHEDULED,
      })
        .populate("carId")
        .sort({ startTime: 1 });
      return auctions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get upcoming auctions: ${error.message}`);
      }
      throw new Error("Failed to get upcoming auctions: Unknown error");
    }
  }
}
