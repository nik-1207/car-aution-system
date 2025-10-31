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

  /**
   * Place a bid on an auction
   */
  public async placeBid(bidData: PlaceBidData): Promise<IBid> {
    const { auctionId, bidAmount, dealerName, dealerEmail } = bidData;

    // Validate input data
    if (!auctionId || !bidAmount || !dealerName || !dealerEmail) {
      throw createHttpError(400, "All bid fields are required: auctionId, bidAmount, dealerName, dealerEmail");
    }

    if (bidAmount <= 0) {
      throw createHttpError(400, "Bid amount must be greater than 0");
    }

    // Find the auction
    const auction = await Auction.findOne({ auctionId }).populate('carId');
    if (!auction) {
      throw createHttpError(404, "Auction not found");
    }

    // Check auction status
    if (auction.auctionStatus !== AuctionStatus.ACTIVE) {
      throw createHttpError(400, "Can only place bids on active auctions");
    }

    // Check auction time
    const now = new Date();
    if (now < auction.startTime) {
      throw createHttpError(400, "Auction has not started yet");
    }
    if (now > auction.endTime) {
      throw createHttpError(400, "Auction has ended");
    }

    // Check if bid amount is higher than starting price
    if (bidAmount < auction.startingPrice) {
      throw createHttpError(400, `Bid amount must be at least ${auction.startingPrice}`);
    }

    // Get current highest bid
    const currentHighestBid = await Bid.findOne({ auctionId: auction._id })
      .sort({ bidAmount: -1 })
      .populate('dealerId');

    // Check if bid is higher than current highest bid
    if (currentHighestBid && bidAmount <= currentHighestBid.bidAmount) {
      throw createHttpError(400, `Bid amount must be higher than current highest bid of ${currentHighestBid.bidAmount}`);
    }

    // Find or create dealer
    let dealer = await Dealer.findOne({ email: dealerEmail });
    if (!dealer) {
      // Create new dealer
      const dealerId = `DEALER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dealer = new Dealer({
        dealerId,
        name: dealerName,
        email: dealerEmail,
        auctionId: auction._id
      });
      await dealer.save();
    } else {
      // Update dealer's current auction
      dealer.auctionId = auction._id;
      await dealer.save();
    }

    // Create new bid
    const bidId = `BID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bid = new Bid({
      bidId,
      bidAmount,
      auctionId: auction._id,
      dealerId: dealer._id,
      previousBid: currentHighestBid?._id,
      bidTime: now
    });

    const savedBid = await bid.save();

    // Populate references
    await savedBid.populate(['auctionId', 'dealerId']);

    return savedBid;
  }

  /**
   * Get winner bid for an auction
   */
  public async getWinnerBid(auctionId: string): Promise<WinnerBidResponse> {
    // Validate input
    if (!auctionId) {
      throw createHttpError(400, "Auction ID is required");
    }

    // Find the auction
    const auction = await Auction.findOne({ auctionId });
    if (!auction) {
      throw createHttpError(404, "Auction not found");
    }

    // Get highest bid for this auction
    const highestBid = await Bid.findOne({ auctionId: auction._id })
      .sort({ bidAmount: -1 })
      .populate('dealerId');

    let winnerBid = null;
    let dealer = null;

    if (highestBid) {
      winnerBid = {
        bidId: highestBid.bidId,
        bidAmount: highestBid.bidAmount,
        bidTime: highestBid.bidTime
      };

      if (highestBid.dealerId) {
        const dealerData = highestBid.dealerId as any;
        dealer = {
          dealerId: dealerData.dealerId,
          name: dealerData.name,
          email: dealerData.email
        };
      }
    }

    return {
      auctionId: auction.auctionId,
      winnerBid,
      dealer,
      auctionStatus: auction.auctionStatus
    };
  }
}
