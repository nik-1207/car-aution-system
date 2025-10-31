import { Car } from "../models";
import { ICar } from "../types";

export class CarService {
  public async createCar(carData: { carId: string; make: string; model: string; year: number }): Promise<ICar> {
    const existingCar = await Car.findOne({ carId: carData.carId });
    if (existingCar !== null) {
      throw new Error(`Car with ID ${carData.carId} already exists`);
    }

    try {
      // Map model to carModel for the database schema
      const carDocument = new Car({
        carId: carData.carId,
        make: carData.make,
        carModel: carData.model,
        year: carData.year,
      });
      const savedCar = await carDocument.save();
      return savedCar as ICar;
    } catch (error) {
      throw error instanceof Error
        ? new Error(`Failed to create car: ${error.message}`)
        : new Error("Failed to create car: Unknown error");
    }
  }

  public async getCarById(carId: string): Promise<ICar | null> {
    try {
      const car = await Car.findOne({ carId });
      return car as ICar | null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get car: ${error.message}`);
      }
      throw new Error("Failed to get car: Unknown error");
    }
  }

  public async getAllCars(): Promise<ICar[]> {
    try {
      return await Car.find({}).sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get cars: ${error.message}`);
      }
      throw new Error("Failed to get cars: Unknown error");
    }
  }

  public async updateCar(
    carId: string,
    updateData: Partial<Pick<ICar, "make" | "carModel" | "year">>,
  ): Promise<ICar | null> {
    try {
      return await Car.findOneAndUpdate({ carId }, updateData, { new: true, runValidators: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update car: ${error.message}`);
      }
      throw new Error("Failed to update car: Unknown error");
    }
  }

  public async deleteCar(carId: string): Promise<boolean> {
    try {
      const result = await Car.findOneAndDelete({ carId });
      return result !== null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete car: ${error.message}`);
      }
      throw new Error("Failed to delete car: Unknown error");
    }
  }

  public async searchCars(searchCriteria: { make?: string; model?: string; year?: number }): Promise<ICar[]> {
    try {
      const query: any = {};

      if (searchCriteria.make) {
        query.make = new RegExp(searchCriteria.make, "i");
      }
      if (searchCriteria.model) {
        query.carModel = new RegExp(searchCriteria.model, "i");
      }
      if (searchCriteria.year) {
        query.year = searchCriteria.year;
      }

      return await Car.find(query).sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search cars: ${error.message}`);
      }
      throw new Error("Failed to search cars: Unknown error");
    }
  }
}
