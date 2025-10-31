import axios from "axios";

// Install axios: npm install axios

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class AuctionApiTester {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "http://localhost:3000/api/v1/auction") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    method: "GET" | "POST" | "PATCH",
    endpoint: string,
    data?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async generateToken(): Promise<void> {
    console.log("🔐 Generating authentication token...");

    const response = await this.makeRequest<{ token: string }>("POST", "/token", {
      username: "Admin",
      password: "Admin",
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      console.log("✅ Token generated successfully");
      console.log(`📝 Token: ${this.token.substring(0, 20)}...`);
    } else {
      console.log("❌ Failed to generate token:", response.message);
      throw new Error("Token generation failed");
    }
  }

  async createAuction(): Promise<string> {
    console.log("\n🏁 Creating auction...");

    const auctionData = {
      auctionId: `AUCTION_${Date.now()}`,
      carId: "CAR001",
      startingPrice: 15000,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    };

    const response = await this.makeRequest("POST", "/createAuction", auctionData);

    if (response.success) {
      console.log("✅ Auction created successfully");
      console.log(`📝 Auction ID: ${auctionData.auctionId}`);
      return auctionData.auctionId;
    } else {
      console.log("❌ Failed to create auction:", response.message);
      throw new Error("Auction creation failed");
    }
  }

  async updateAuctionStatus(auctionId: string): Promise<void> {
    console.log(`\n🔄 Updating auction status for ${auctionId}...`);

    const response = await this.makeRequest("PATCH", `/status/${auctionId}`, {
      status: "active",
    });

    if (response.success) {
      console.log("✅ Auction status updated successfully");
    } else {
      console.log("❌ Failed to update auction status:", response.message);
    }
  }

  async placeBid(auctionId: string): Promise<void> {
    console.log(`\n💰 Placing bid on auction ${auctionId}...`);

    const bidData = {
      bidId: `BID_${Date.now()}`,
      auctionId,
      dealerId: "DEALER001",
      bidAmount: 18000,
    };

    const response = await this.makeRequest("POST", "/placeBids", bidData);

    if (response.success) {
      console.log("✅ Bid placed successfully");
      console.log(`📝 Bid ID: ${bidData.bidId}, Amount: $${bidData.bidAmount}`);
    } else {
      console.log("❌ Failed to place bid:", response.message);
    }
  }

  async getWinnerBid(auctionId: string): Promise<void> {
    console.log(`\n🏆 Getting winner bid for auction ${auctionId}...`);

    const response = await this.makeRequest("GET", `/${auctionId}/winner-bid`);

    if (response.success) {
      console.log("✅ Winner bid retrieved successfully");
      console.log("📊 Auction details:", JSON.stringify(response.data, null, 2));
    } else {
      console.log("❌ Failed to get winner bid:", response.message);
    }
  }

  async runFullTest(): Promise<void> {
    try {
      console.log("🚀 Starting Car Auction API Test Suite...\n");

      // Step 1: Generate token
      await this.generateToken();

      // Step 2: Create auction
      const auctionId = await this.createAuction();

      // Step 3: Update auction status
      await this.updateAuctionStatus(auctionId);

      // Step 4: Place bid
      await this.placeBid(auctionId);

      // Step 5: Get winner bid
      await this.getWinnerBid(auctionId);

      console.log("\n🎉 All tests completed successfully!");
    } catch (error) {
      console.error("\n💥 Test suite failed:", error);
    }
  }
}

// Run the test suite
const tester = new AuctionApiTester();
tester.runFullTest();

export { AuctionApiTester };
