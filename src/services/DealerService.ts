import { Dealer } from "../models";
import { IDealer } from "../types";

export class DealerService {
  public async createDealer(dealerData: { dealerId: string; name: string; email: string }): Promise<IDealer> {
    try {
      const existingDealer = await Dealer.findOne({
        $or: [{ dealerId: dealerData.dealerId }, { email: dealerData.email }],
      });

      if (existingDealer !== null) {
        if (existingDealer.dealerId === dealerData.dealerId) {
          throw new Error(`Dealer with ID ${dealerData.dealerId} already exists`);
        }
        if (existingDealer.email === dealerData.email) {
          throw new Error(`Dealer with email ${dealerData.email} already exists`);
        }
      }

      const dealer = new Dealer(dealerData);
      const savedDealer = await dealer.save();
      return savedDealer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create dealer: ${error.message}`);
      }
      throw new Error("Failed to create dealer: Unknown error");
    }
  }

  public async getDealerById(dealerId: string): Promise<IDealer | null> {
    try {
      const dealer = await Dealer.findOne({ dealerId });
      // eslint-disable-next-line single-return/single-return
      return dealer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get dealer: ${error.message}`);
      }
      throw new Error("Failed to get dealer: Unknown error");
    }
  }

  public async getDealerByEmail(email: string): Promise<IDealer | null> {
    try {
      const dealer = await Dealer.findOne({ email: email.toLowerCase() });
      return dealer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get dealer by email: ${error.message}`);
      }
      throw new Error("Failed to get dealer by email: Unknown error");
    }
  }

  public async getAllDealers(): Promise<IDealer[]> {
    try {
      const dealers = await Dealer.find({}).sort({ createdAt: -1 });
      return dealers;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get dealers: ${error.message}`);
      }
      throw new Error("Failed to get dealers: Unknown error");
    }
  }

  public async updateDealer(
    dealerId: string,
    updateData: Partial<Pick<IDealer, "name" | "email">>,
  ): Promise<IDealer | null> {
    try {
      // If email is being updated, check for duplicates
      if (updateData.email !== undefined) {
        const existingDealer = await Dealer.findOne({
          email: updateData.email.toLowerCase(),
          dealerId: { $ne: dealerId },
        });

        if (existingDealer !== null) {
          throw new Error(`Email ${updateData.email} is already in use by another dealer`);
        }

        // Convert email to lowercase
        updateData.email = updateData.email.toLowerCase();
      }

      const dealer = await Dealer.findOneAndUpdate({ dealerId }, updateData, { new: true, runValidators: true });

      return dealer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update dealer: ${error.message}`);
      }
      throw new Error("Failed to update dealer: Unknown error");
    }
  }

  public async deleteDealer(dealerId: string): Promise<boolean> {
    try {
      const result = await Dealer.findOneAndDelete({ dealerId });
      return result !== null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete dealer: ${error.message}`);
      }
      throw new Error("Failed to delete dealer: Unknown error");
    }
  }

  public async searchDealers(searchCriteria: { name?: string; email?: string }): Promise<IDealer[]> {
    try {
      const query: Record<string, any> = {};

      if (searchCriteria.name !== undefined && searchCriteria.name.trim() !== "") {
        query.name = new RegExp(searchCriteria.name.trim(), "i");
      }

      if (searchCriteria.email !== undefined && searchCriteria.email.trim() !== "") {
        query.email = new RegExp(searchCriteria.email.trim(), "i");
      }

      const dealers = await Dealer.find(query).sort({ createdAt: -1 });
      return dealers;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search dealers: ${error.message}`);
      }
      throw new Error("Failed to search dealers: Unknown error");
    }
  }
}
