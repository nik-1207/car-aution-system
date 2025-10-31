import { Car, Auction, AuctionStatus, type IAuction } from '../models';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export interface CreateAuctionData {
  auctionId: string;
  startingPrice: number;
  startTime: Date;
  endTime: Date;
  carId: string;
}

export class AuctionService {
  /**
   * Create a new auction
   */
  public async createAuction(auctionData: CreateAuctionData): Promise<IAuction> {
    const { auctionId, startingPrice, startTime, endTime, carId } = auctionData;

    // Validate input data
    if (!auctionId || !startingPrice || !startTime || !endTime || !carId) {
      throw createHttpError(400, 'All auction fields are required');
    }

    if (startingPrice <= 0) {
      throw createHttpError(400, 'Starting price must be greater than 0');
    }

    if (new Date(startTime) >= new Date(endTime)) {
      throw createHttpError(400, 'End time must be after start time');
    }

    if (new Date(startTime) <= new Date()) {
      throw createHttpError(400, 'Start time must be in the future');
    }

    // Check if auction ID already exists
    const existingAuction = await Auction.findOne({ auctionId });
    if (existingAuction) {
      throw createHttpError(409, 'Auction ID already exists');
    }

    // Verify car exists
    const car = await Car.findOne({ carId });
    if (!car) {
      throw createHttpError(404, 'Car not found');
    }

    // Check if car is already in an active auction
    const activeAuction = await Auction.findOne({
      carId: car._id,
      auctionStatus: { $in: [AuctionStatus.PENDING, AuctionStatus.ACTIVE] }
    });

    if (activeAuction) {
      throw createHttpError(409, 'Car is already in an active auction');
    }

    // Create new auction
    const auction = new Auction({
      auctionId,
      startingPrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      carId: car._id,
      auctionStatus: AuctionStatus.PENDING
    });

    const savedAuction = await auction.save();
    
    // Populate car details in response
    await savedAuction.populate('carId');
    
    return savedAuction;
  }
}