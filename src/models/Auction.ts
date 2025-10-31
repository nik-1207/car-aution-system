import { Schema, model, Document, Types } from "mongoose";

export enum AuctionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IAuction extends Document {
  _id: Types.ObjectId;
  auctionId: string;
  auctionStatus: AuctionStatus;
  startingPrice: number;
  startTime: Date;
  endTime: Date;
  carId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>(
  {
    auctionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    auctionStatus: {
      type: String,
      enum: Object.values(AuctionStatus),
      default: AuctionStatus.PENDING,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
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
        validator: function (this: IAuction, value: Date) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
auctionSchema.index({ auctionId: 1 });
auctionSchema.index({ auctionStatus: 1 });
auctionSchema.index({ startTime: 1, endTime: 1 });
auctionSchema.index({ carId: 1 });

export const Auction = model<IAuction>("Auction", auctionSchema);
