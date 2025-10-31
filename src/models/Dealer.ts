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

// Indexes are automatically created by unique: true

export const Dealer = model("Dealer", DealerSchema);
