import { IDealer } from "../types";
import { Schema, model } from "mongoose";

const DealerSchema = new Schema(
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
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
    collection: "dealers",
  },
);

// Create indexes for better query performance
DealerSchema.index({ dealerId: 1 });
DealerSchema.index({ email: 1 });

export const Dealer = model("Dealer", DealerSchema);
