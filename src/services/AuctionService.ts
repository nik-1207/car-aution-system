import { Car, Auction, AuctionStatus, Bid, Dealer, type IAuction, type IBid } from "../models";
import createHttpError from "http-errors";
import { Types } from "mongoose";

export interface CreateAuctionData {
  auctionId: string;
  startingPrice: number;
  startTime: Date;
  endTime: Date;
  carId: string;
}

export interface UpdateAuctionStatusData {
  status: AuctionStatus;
}

export interface PlaceBidData {
  auctionId: string;
  bidAmount: number;
  dealerName: string;
  dealerEmail: string;
}

export interface WinnerBidResponse {
  auctionId: string;
  winnerBid: {
    bidId: string;
    bidAmount: number;
    bidTime: Date;
  } | null;
  dealer: {
    dealerId: string;
    name: string;
    email: string;
  } | null;
  auctionStatus: AuctionStatus;
}

export class AuctionService {
  /**
   * Create a new auction
   */
  public async createAuction(auctionData: CreateAuctionData): Promise<IAuction> {
    const { auctionId, startingPrice, startTime, endTime, carId } = auctionData;

    // Validate input data
    if (!auctionId || !startingPrice || !startTime || !endTime || !carId) {
      throw createHttpError(400, "All auction fields are required");
    }

    if (startingPrice <= 0) {
      throw createHttpError(400, "Starting price must be greater than 0");
    }

    if (new Date(startTime) >= new Date(endTime)) {
      throw createHttpError(400, "End time must be after start time");
    }

    if (new Date(startTime) <= new Date()) {
      throw createHttpError(400, "Start time must be in the future");
    }

    // Check if auction ID already exists
    const existingAuction = await Auction.findOne({ auctionId });
    if (existingAuction) {
      throw createHttpError(409, "Auction ID already exists");
    }

    // Verify car exists
    const car = await Car.findOne({ carId });
    if (!car) {
      throw createHttpError(404, "Car not found");
    }

    // Check if car is already in an active auction
    const activeAuction = await Auction.findOne({
      carId: car._id,
      auctionStatus: { $in: [AuctionStatus.PENDING, AuctionStatus.ACTIVE] },
    });

    if (activeAuction) {
      throw createHttpError(409, "Car is already in an active auction");
    }

    // Create new auction
    const auction = new Auction({
      auctionId,
      startingPrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      carId: car._id,
      auctionStatus: AuctionStatus.PENDING,
    });

    const savedAuction = await auction.save();

    // Populate car details in response
    await savedAuction.populate("carId");

    return savedAuction;
  }

  /**
   * Update auction status
   */
  public async updateAuctionStatus(auctionId: string, updateData: UpdateAuctionStatusData): Promise<IAuction> {
    const { status } = updateData;

    // Validate input data
    if (!auctionId) {
      throw createHttpError(400, "Auction ID is required");
    }

    if (!status) {
      throw createHttpError(400, "Status is required");
    }

    // Validate status is a valid enum value
    if (!Object.values(AuctionStatus).includes(status)) {
      throw createHttpError(400, `Invalid status. Must be one of: ${Object.values(AuctionStatus).join(", ")}`);
    }

    // Find the auction
    const auction = await Auction.findOne({ auctionId });
    if (!auction) {
      throw createHttpError(404, "Auction not found");
    }

    // Validate status transitions
    const currentStatus = auction.auctionStatus;

    // Define allowed status transitions
    const allowedTransitions: { [key in AuctionStatus]: AuctionStatus[] } = {
      [AuctionStatus.PENDING]: [AuctionStatus.ACTIVE, AuctionStatus.CANCELLED],
      [AuctionStatus.ACTIVE]: [AuctionStatus.COMPLETED, AuctionStatus.CANCELLED],
      [AuctionStatus.COMPLETED]: [], // Cannot change from completed
      [AuctionStatus.CANCELLED]: [], // Cannot change from cancelled
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      throw createHttpError(400, `Cannot change status from ${currentStatus} to ${status}`);
    }

    // Additional business rules
    if (status === AuctionStatus.ACTIVE) {
      const now = new Date();
      if (now < auction.startTime) {
        throw createHttpError(400, "Cannot start auction before start time");
      }
      if (now > auction.endTime) {
        throw createHttpError(400, "Cannot start auction after end time");
      }
    }

    if (status === AuctionStatus.COMPLETED) {
      const now = new Date();
      if (now < auction.endTime && currentStatus === AuctionStatus.ACTIVE) {
        // Allow manual completion of active auctions
      } else if (currentStatus !== AuctionStatus.ACTIVE) {
        throw createHttpError(400, "Can only complete an active auction");
      }
    }

    // Update the auction status
    auction.auctionStatus = status;
    const updatedAuction = await auction.save();

    // Populate car details in response
    await updatedAuction.populate("carId");

    return updatedAuction;
  }
}
