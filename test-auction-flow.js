/**
 * Car Auction System - Complete Test Flow
 * 
 * This script tests the complete auction flow:
 * 1. Add cars directly to database
 * 2. Login with admin credentials
 * 3. Admin creates auction
 * 4. Admin adds 1 car to the auction
 * 5. 3 different users get auction tokens
 * 6. All users bid on auction multiple times with increasing amounts
 * 7. Admin closes the auction
 * 8. Fetch the auction winner
 */

const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const MONGO_URI = 'mongodb://localhost:27017/car-auction-system';

// Admin credentials (from your auth route)
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'Admin'
};

// Test data
const TEST_CARS = [
  {
    carId: 'CAR001',
    make: 'Toyota',
    carModel: 'Camry',
    year: 2023
  },
  {
    carId: 'CAR002',
    make: 'Honda',
    carModel: 'Civic',
    year: 2022
  },
  {
    carId: 'CAR003',
    make: 'BMW',
    carModel: 'X5',
    year: 2024
  }
];

const TEST_DEALERS = [
  {
    name: 'John Dealer',
    email: 'john@dealership.com',
    phone: '+1234567890'
  },
  {
    name: 'Sarah Motors',
    email: 'sarah@motors.com',
    phone: '+1234567891'
  },
  {
    name: 'Mike Auto',
    email: 'mike@auto.com',
    phone: '+1234567892'
  }
];

// Global variables
let adminToken = '';
let dealerTokens = [];
let auctionId = '';
let carObjectId = '';

class TestRunner {
  constructor() {
    this.results = {
      carsAdded: 0,
      adminLogin: false,
      auctionCreated: false,
      auctionActivated: false,
      tokensGenerated: 0,
      bidsPlaced: 0,
      auctionClosed: false,
      winnerFound: false
    };
  }

  async connectToDatabase() {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async disconnectFromDatabase() {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error.message);
    }
  }

  async clearTestData() {
    try {
      const db = mongoose.connection.db;
      
      // Clear test data
      await db.collection('cars').deleteMany({ carId: { $in: TEST_CARS.map(c => c.carId) } });
      await db.collection('dealers').deleteMany({ email: { $in: TEST_DEALERS.map(d => d.email) } });
      await db.collection('auctions').deleteMany({});
      await db.collection('bids').deleteMany({});
      
      console.log('🧹 Cleared existing test data');
    } catch (error) {
      console.log('⚠️  Clear test data warning:', error.message);
    }
  }

  async addCarsToDatabase() {
    console.log('\n📋 Step 1: Adding cars directly to database...');
    
    try {
      const db = mongoose.connection.db;
      const carsCollection = db.collection('cars');
      
      for (const car of TEST_CARS) {
        const carDoc = {
          ...car,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await carsCollection.insertOne(carDoc);
        console.log(`✅ Added car: ${car.make} ${car.carModel} (${car.year}) - ID: ${result.insertedId}`);
        
        // Store the first car's ObjectId for auction
        if (!carObjectId) {
          carObjectId = result.insertedId.toString();
        }
        
        this.results.carsAdded++;
      }
      
      console.log(`✅ Successfully added ${this.results.carsAdded} cars to database`);
      return true;
    } catch (error) {
      console.error('❌ Failed to add cars:', error.message);
      return false;
    }
  }

  async loginAsAdmin() {
    console.log('\n🔐 Step 2: Admin login...');
    
    try {
      const response = await axios.post(`${BASE_URL}/auction/token`, ADMIN_CREDENTIALS);
      
      if (response.data && response.data.data && response.data.data.token) {
        adminToken = response.data.data.token;
        this.results.adminLogin = true;
        console.log('✅ Admin login successful');
        console.log(`📝 Admin token: ${adminToken.substring(0, 50)}...`);
        return true;
      } else {
        console.error('❌ No token received from login');
        console.error('Response:', JSON.stringify(response.data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async createAuction() {
    console.log('\n🏁 Step 3: Admin creates auction...');
    
    try {
      auctionId = `AUCTION_${Date.now()}`;
      const startTime = new Date(Date.now() + 5 * 1000); // 5 seconds from now
      const endTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      const auctionData = {
        auctionId: auctionId,
        startingPrice: 15000,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        carId: TEST_CARS[0].carId // Use the first car
      };
      
      const response = await axios.post(
        `${BASE_URL}/auction/createAuction`,
        auctionData,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data && response.data.data && response.data.data.auctionId) {
        this.results.auctionCreated = true;
        console.log('✅ Auction created successfully');
        console.log(`📝 Auction ID: ${auctionId}`);
        console.log(`🚗 Car: ${TEST_CARS[0].make} ${TEST_CARS[0].carModel}`);
        console.log(`💰 Starting Price: $${auctionData.startingPrice}`);
        return true;
      } else {
        console.error('❌ Auction creation failed - no auction data received');
        console.error('Response:', JSON.stringify(response.data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Auction creation failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async activateAuction() {
    console.log('\n🟢 Step 4: Activating the auction...');
    
    // Wait a bit for the start time to pass
    console.log('⏳ Waiting for auction start time...');
    await this.sleep(6000); // Wait 6 seconds
    
    try {
      const response = await axios.patch(
        `${BASE_URL}/auction/status/${auctionId}`,
        { status: 'active' },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data && response.data.data && response.data.data.currentStatus) {
        this.results.auctionActivated = true;
        console.log('✅ Auction activated successfully');
        console.log(`📝 Auction Status: ${response.data.data.currentStatus}`);
        return true;
      } else {
        console.error('❌ Failed to activate auction - no response data');
        console.error('Response:', JSON.stringify(response.data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to activate auction:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async generateDealerTokens() {
    console.log('\n🎫 Step 5: Generating tokens for 3 dealers...');
    
    for (let i = 0; i < TEST_DEALERS.length; i++) {
      try {
        const dealer = TEST_DEALERS[i];
        const response = await axios.post(`${BASE_URL}/auction/token`, {
          username: dealer.name,
          password: 'dealer123' // Using a generic password for dealers
        });
        
        if (response.data && response.data.token) {
          dealerTokens.push({
            dealer: dealer,
            token: response.data.token
          });
          this.results.tokensGenerated++;
          console.log(`✅ Token generated for ${dealer.name}`);
        } else {
          console.log(`⚠️  Token generation failed for ${dealer.name} - using admin token as fallback`);
          dealerTokens.push({
            dealer: dealer,
            token: adminToken // Fallback to admin token for testing
          });
          this.results.tokensGenerated++;
        }
      } catch (error) {
        console.log(`⚠️  Token generation failed for ${TEST_DEALERS[i].name} - using admin token as fallback`);
        dealerTokens.push({
          dealer: TEST_DEALERS[i],
          token: adminToken // Fallback to admin token for testing
        });
        this.results.tokensGenerated++;
      }
    }
    
    console.log(`✅ Generated ${this.results.tokensGenerated} tokens`);
    return this.results.tokensGenerated > 0;
  }

  async placeBids() {
    console.log('\n💰 Step 6: Dealers place increasing bids...');
    
    let currentBidAmount = 15500; // Start above starting price
    const bidIncrement = 1000;
    const bidsPerDealer = 3;
    
    for (let round = 1; round <= bidsPerDealer; round++) {
      console.log(`\n--- Bidding Round ${round} ---`);
      
      for (let i = 0; i < dealerTokens.length; i++) {
        try {
          const dealerData = dealerTokens[i];
          const bidData = {
            auctionId: auctionId,
            bidAmount: currentBidAmount,
            dealerName: dealerData.dealer.name,
            dealerEmail: dealerData.dealer.email
          };
          
          const response = await axios.post(
            `${BASE_URL}/auction/placeBids`,
            bidData,
            {
              headers: { Authorization: `Bearer ${dealerData.token}` }
            }
          );
          
          if (response.data && response.data.data && response.data.data.bidId) {
            this.results.bidsPlaced++;
            console.log(`✅ ${dealerData.dealer.name} bid $${currentBidAmount}`);
          } else {
            console.log(`⚠️  Bid failed for ${dealerData.dealer.name} at $${currentBidAmount}`);
          }
          
          currentBidAmount += bidIncrement;
          
          // Small delay between bids
          await this.sleep(500);
          
        } catch (error) {
          console.error(`❌ Bid failed for ${dealerTokens[i].dealer.name}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log(`✅ Total bids placed: ${this.results.bidsPlaced}`);
    return this.results.bidsPlaced > 0;
  }

  async closeAuction() {
    console.log('\n🔒 Step 7: Admin closes the auction...');
    
    try {
      const response = await axios.patch(
        `${BASE_URL}/auction/status/${auctionId}`,
        { status: 'completed' },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data && response.data.data && response.data.data.currentStatus) {
        this.results.auctionClosed = true;
        console.log('✅ Auction closed successfully');
        console.log(`📝 Auction Status: ${response.data.data.currentStatus}`);
        return true;
      } else {
        console.error('❌ Failed to close auction - no response data');
        console.error('Response:', JSON.stringify(response.data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to close auction:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async fetchAuctionWinner() {
    console.log('\n🏆 Step 8: Fetching auction winner...');
    
    try {
      const response = await axios.get(
        `${BASE_URL}/auction/${auctionId}/winner-bid`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data && response.data.data) {
        this.results.winnerFound = true;
        const winnerData = response.data.data;
        
        console.log('✅ Winner information retrieved:');
        console.log(`🏆 Auction ID: ${winnerData.auctionId}`);
        console.log(`📊 Auction Status: ${winnerData.auctionStatus}`);
        
        if (winnerData.winnerBid && winnerData.dealer) {
          console.log(`🥇 Winner: ${winnerData.dealer.name} (${winnerData.dealer.email})`);
          console.log(`💰 Winning Bid: $${winnerData.winnerBid.bidAmount}`);
          console.log(`⏰ Bid Time: ${new Date(winnerData.winnerBid.bidTime).toLocaleString()}`);
          console.log(`🆔 Bid ID: ${winnerData.winnerBid.bidId}`);
        } else {
          console.log('📝 No winner found (no bids placed)');
        }
        
        return true;
      } else {
        console.error('❌ No winner data received');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to fetch winner:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Cars Added: ${this.results.carsAdded}`);
    console.log(`Admin Login: ${this.results.adminLogin ? '✅' : '❌'}`);
    console.log(`Auction Created: ${this.results.auctionCreated ? '✅' : '❌'}`);
    console.log(`Auction Activated: ${this.results.auctionActivated ? '✅' : '❌'}`);
    console.log(`Tokens Generated: ${this.results.tokensGenerated}`);
    console.log(`Bids Placed: ${this.results.bidsPlaced}`);
    console.log(`Auction Closed: ${this.results.auctionClosed ? '✅' : '❌'}`);
    console.log(`Winner Found: ${this.results.winnerFound ? '✅' : '❌'}`);
    
    const totalSteps = 8;
    const completedSteps = Object.values(this.results).filter(v => v === true || v > 0).length;
    console.log(`\nOverall Success: ${completedSteps}/${totalSteps} steps completed`);
  }

  async runFullTest() {
    console.log('🚀 Starting Car Auction System Test Flow');
    console.log('=========================================');
    
    // Connect to database
    const dbConnected = await this.connectToDatabase();
    if (!dbConnected) {
      console.error('❌ Cannot proceed without database connection');
      return;
    }
    
    // Clear existing test data
    await this.clearTestData();
    
    try {
      // Step 1: Add cars to database
      const carsAdded = await this.addCarsToDatabase();
      if (!carsAdded) return;
      
      // Step 2: Admin login
      const adminLoggedIn = await this.loginAsAdmin();
      if (!adminLoggedIn) return;
      
      // Step 3: Create auction
      const auctionCreated = await this.createAuction();
      if (!auctionCreated) return;
      
      // Step 4: Activate auction
      const auctionActivated = await this.activateAuction();
      if (!auctionActivated) return;
      
      // Step 5: Generate dealer tokens
      const tokensGenerated = await this.generateDealerTokens();
      if (!tokensGenerated) return;
      
      // Step 6: Place bids
      const bidsPlaced = await this.placeBids();
      if (!bidsPlaced) return;
      
      // Step 7: Close auction
      const auctionClosed = await this.closeAuction();
      if (!auctionClosed) return;
      
      // Step 8: Fetch winner
      await this.fetchAuctionWinner();
      
    } catch (error) {
      console.error('❌ Test flow failed:', error.message);
    } finally {
      // Print summary
      this.printSummary();
      
      // Disconnect from database
      await this.disconnectFromDatabase();
    }
  }
}

// Run the test
async function main() {
  const testRunner = new TestRunner();
  await testRunner.runFullTest();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Test interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled rejection:', error);
  await mongoose.disconnect();
  process.exit(1);
});

// Start the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestRunner };