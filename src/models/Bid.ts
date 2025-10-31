import { Schema, model } from "mongoose";

const BidSchema = new Schema(
  {
    bidId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    dealerId: {
      type: Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    previousBid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
    },
    bidTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "bids",
  },
);

// Create indexes for better query performance (bidId has unique index already)
BidSchema.index({ auctionId: 1, bidAmount: -1 }); // Sort by bid amount descending
BidSchema.index({ dealerId: 1 });
BidSchema.index({ bidTime: -1 });
BidSchema.index({ auctionId: 1, bidTime: -1 }); // Get latest bids for an auction// Virtual to populate auction details
BidSchema.virtual("auction", {
  ref: "Auction",
  localField: "auctionId",
  foreignField: "_id",
  justOne: true,
});

// Virtual to populate dealer details
BidSchema.virtual("dealer", {
  ref: "Dealer",
  localField: "dealerId",
  foreignField: "_id",
  justOne: true,
});

// Virtual to populate previous bid details
BidSchema.virtual("previousBidDetails", {
  ref: "Bid",
  localField: "previousBid",
  foreignField: "_id",
  justOne: true,
});

export const Bid = model("Bid", BidSchema);
