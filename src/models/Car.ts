import { Schema, model } from "mongoose";

const CarSchema = new Schema(
  {
    carId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    carModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
    collection: "cars",
  },
);

// Additional compound index for searching
CarSchema.index({ make: 1, carModel: 1, year: 1 });

export const Car = model("Car", CarSchema);
