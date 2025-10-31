import { Schema, model, Document, Types } from "mongoose";

export interface IDealer extends Document {
  _id: Types.ObjectId;
  dealerId: string;
  name: string;
  email: string;
  currentAuctionId?: Types.ObjectId; // Dealer can only participate in one auction at a time
  createdAt: Date;
  updatedAt: Date;
}

const dealerSchema = new Schema<IDealer>(
  {
    dealerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    currentAuctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
dealerSchema.index({ dealerId: 1 });
dealerSchema.index({ email: 1 });
dealerSchema.index({ currentAuctionId: 1 });
dealerSchema.index({ auctionId: 1 });

export const Dealer = model<IDealer>("Dealer", dealerSchema);
