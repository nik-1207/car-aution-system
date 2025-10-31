import { Schema, model, Document, Types } from "mongoose";

export interface ICar extends Document {
  _id: Types.ObjectId;
  carId: string;
  make: string;
  carModel: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
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
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
carSchema.index({ carId: 1 });
carSchema.index({ make: 1, carModel: 1, year: 1 });

export const Car = model<ICar>("Car", carSchema);
