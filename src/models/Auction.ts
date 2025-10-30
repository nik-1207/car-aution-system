import { IAuction, AuctionStatus } from "../types";
import { Schema, model } from "mongoose";

const AuctionSchema = new Schema(
  {
    auctionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentHighestBid: {
      type: Number,
      min: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IAuction, value: Date): boolean {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    auctionStatus: {
      type: String,
      enum: Object.values(AuctionStatus),
      default: AuctionStatus.SCHEDULED,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "Dealer",
    },
  },
  {
    timestamps: true,
    collection: "auctions",
  },
);

// Create indexes for better query performance
AuctionSchema.index({ auctionId: 1 });
AuctionSchema.index({ carId: 1 });
AuctionSchema.index({ auctionStatus: 1 });
AuctionSchema.index({ startTime: 1, endTime: 1 });

// Virtual to populate car details
AuctionSchema.virtual("car", {
  ref: "Car",
  localField: "carId",
  foreignField: "_id",
  justOne: true,
});

// Virtual to populate winner details
AuctionSchema.virtual("winner", {
  ref: "Dealer",
  localField: "winnerId",
  foreignField: "_id",
  justOne: true,
});

export const Auction = model("Auction", AuctionSchema);
