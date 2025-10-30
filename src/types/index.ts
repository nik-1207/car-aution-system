import { Document, Types } from "mongoose";

// Car Interface
export interface ICar extends Document {
  _id: Types.ObjectId;
  carId: string;
  make: string;
  carModel: string; // Renamed to avoid conflict with Document.model
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// Dealer Interface
export interface IDealer extends Document {
  _id: Types.ObjectId;
  dealerId: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auction Status Enum
export enum AuctionStatus {
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ENDED = "ended",
  CANCELLED = "cancelled",
}

// Auction Interface
export interface IAuction extends Document {
  _id: Types.ObjectId;
  auctionId: string;
  carId: Types.ObjectId;
  startingPrice: number;
  currentHighestBid?: number | null;
  startTime: Date;
  endTime: Date;
  auctionStatus: AuctionStatus;
  winnerId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// Bid Interface
export interface IBid extends Document {
  _id: Types.ObjectId;
  bidId: string;
  auctionId: Types.ObjectId;
  dealerId: Types.ObjectId;
  bidAmount: number;
  previousBid?: Types.ObjectId | null;
  bidTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
