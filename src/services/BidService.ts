import { Bid, Auction, Dealer } from "../models";
import { IBid, AuctionStatus } from "../types";

export class BidService {
  public async placeBid(bidData: {
    bidId: string;
    auctionId: string;
    dealerId: string;
    bidAmount: number;
  }): Promise<IBid> {
    try {
      // Verify dealer exists
      const dealer = await Dealer.findOne({ dealerId: bidData.dealerId });
      if (dealer === null) {
        throw new Error(`Dealer with ID ${bidData.dealerId} not found`);
      }

      // Verify auction exists and is active
      const auction = await Auction.findOne({ auctionId: bidData.auctionId });
      if (auction === null) {
        throw new Error(`Auction with ID ${bidData.auctionId} not found`);
      }

      // Check if auction is active and within time bounds
      const now = new Date();
      if (auction.auctionStatus !== AuctionStatus.ACTIVE) {
        throw new Error("Auction is not active");
      }

      if (now < auction.startTime || now > auction.endTime) {
        throw new Error("Auction is not within active time period");
      }

      // Check if bid amount is higher than current highest bid or starting price
      const minimumBid = auction.currentHighestBid ?? auction.startingPrice;

      if (bidData.bidAmount <= minimumBid) {
        throw new Error(`Bid amount must be higher than ${String(minimumBid)}`);
      }

      // Get the previous highest bid for this auction
      const previousBid = await Bid.findOne({
        auctionId: auction._id,
      }).sort({ bidAmount: -1 });

      // Create the new bid
      const bid = new Bid({
        bidId: bidData.bidId,
        auctionId: auction._id,
        dealerId: dealer._id,
        bidAmount: bidData.bidAmount,
        previousBid: previousBid !== null ? previousBid._id : undefined,
        bidTime: new Date(),
      });

      const savedBid = await bid.save();

      // Update the auction's current highest bid
      auction.currentHighestBid = bidData.bidAmount;
      await auction.save();

      const populatedBid = await Bid.findById(savedBid._id)
        .populate("auctionId")
        .populate("dealerId")
        .populate("previousBid");

      if (populatedBid === null) {
        throw new Error("Failed to retrieve saved bid");
      }

      return populatedBid;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to place bid: ${error.message}`);
      }
      throw new Error("Failed to place bid: Unknown error");
    }
  }

  public async getBidById(bidId: string): Promise<IBid | null> {
    try {
      const bid = await Bid.findOne({ bidId }).populate("auctionId").populate("dealerId").populate("previousBid");
      return bid;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bid: ${error.message}`);
      }
      throw new Error("Failed to get bid: Unknown error");
    }
  }

  public async getBidsByAuction(auctionId: string): Promise<IBid[]> {
    try {
      // First find the auction to get the ObjectId
      const auction = await Auction.findOne({ auctionId });
      if (auction === null) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      const bids = await Bid.find({ auctionId: auction._id })
        .populate("dealerId")
        .populate("previousBid")
        .sort({ bidAmount: -1, bidTime: -1 });

      return bids;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bids for auction: ${error.message}`);
      }
      throw new Error("Failed to get bids for auction: Unknown error");
    }
  }

  public async getBidsByDealer(dealerId: string): Promise<IBid[]> {
    try {
      // First find the dealer to get the ObjectId
      const dealer = await Dealer.findOne({ dealerId });
      if (dealer === null) {
        throw new Error(`Dealer with ID ${dealerId} not found`);
      }

      const bids = await Bid.find({ dealerId: dealer._id })
        .populate("auctionId")
        .populate("previousBid")
        .sort({ bidTime: -1 });

      return bids;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bids for dealer: ${error.message}`);
      }
      throw new Error("Failed to get bids for dealer: Unknown error");
    }
  }

  public async getHighestBidForAuction(auctionId: string): Promise<IBid | null> {
    try {
      // First find the auction to get the ObjectId
      const auction = await Auction.findOne({ auctionId });
      if (auction === null) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      const highestBid = await Bid.findOne({ auctionId: auction._id })
        .populate("dealerId")
        .populate("previousBid")
        .sort({ bidAmount: -1, bidTime: -1 });

      return highestBid;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get highest bid: ${error.message}`);
      }
      throw new Error("Failed to get highest bid: Unknown error");
    }
  }

  public async getBidHistory(auctionId: string): Promise<IBid[]> {
    try {
      // First find the auction to get the ObjectId
      const auction = await Auction.findOne({ auctionId });
      if (auction === null) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      const bids = await Bid.find({ auctionId: auction._id })
        .populate("dealerId")
        .populate("previousBid")
        .sort({ bidTime: 1 }); // Sort by time ascending for history

      return bids;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bid history: ${error.message}`);
      }
      throw new Error("Failed to get bid history: Unknown error");
    }
  }
}
