import { Schema, model, Document, Types } from "mongoose";

export interface IBid extends Document {
  _id: Types.ObjectId;
  bidId: string;
  bidAmount: number;
  previousBid?: Types.ObjectId;
  bidTime: Date;
  auctionId: Types.ObjectId;
  dealerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>(
  {
    bidId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    previousBid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      required: false,
    },
    bidTime: {
      type: Date,
      required: true,
      default: Date.now,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
bidSchema.index({ bidId: 1 });
bidSchema.index({ auctionId: 1, bidAmount: -1 }); // For finding highest bid per auction
bidSchema.index({ dealerId: 1, bidTime: -1 }); // For dealer bid history
bidSchema.index({ bidTime: -1 }); // For chronological ordering
bidSchema.index({ auctionId: 1, bidTime: -1 }); // For auction bid history

export const Bid = model<IBid>("Bid", bidSchema);
