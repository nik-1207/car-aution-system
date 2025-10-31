# Car Auction System API

A RESTful API system for managing car auctions, built with Node.js, Express, TypeScript, and MongoDB.

## API Endpoints

### Authentication

#### Generate Token
- **Endpoint**: `POST /api/v1/auction/token`
- **Description**: Generates JWT authentication token using static admin credentials
- **Request Body**:
  ```json
  {
    "username": "Admin",
    "password": "Admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Token generated successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": "24h",
      "user": {
        "username": "Admin",
        "role": "admin"
      }
    },
    "timestamp": "2025-10-31T10:30:00.000Z"
  }
  ```

### Auction Management

#### Create Auction
- **Endpoint**: `POST /api/v1/auction/createAuction`
- **Description**: Creates a new auction for a specific car
- **Request Body**:
  ```json
  {
    "auctionId": "AUCTION001",
    "startingPrice": 15000,
    "startTime": "2025-11-01T10:00:00.000Z",
    "endTime": "2025-11-01T18:00:00.000Z",
    "carId": "CAR001"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Auction created successfully",
    "data": {
      "auctionId": "AUCTION001",
      "startingPrice": 15000,
      "startTime": "2025-11-01T10:00:00.000Z",
      "endTime": "2025-11-01T18:00:00.000Z",
      "auctionStatus": "pending",
      "car": { /* car details */ },
      "createdAt": "2025-10-31T10:30:00.000Z"
    },
    "timestamp": "2025-10-31T10:30:00.000Z"
  }
  ```

#### Update Auction Status
- **Endpoint**: `PATCH /api/v1/auction/status/{auctionId}`
- **Description**: Updates the status of an existing auction
- **URL Parameters**: 
  - `auctionId`: Unique identifier of the auction
- **Request Body**:
  ```json
  {
    "status": "active"
  }
  ```
- **Valid Status Values**: `pending`, `active`, `completed`, `cancelled`
- **Status Transition Rules**:
  - `pending` → `active` or `cancelled`
  - `active` → `completed` or `cancelled`
  - `completed` → No changes allowed
  - `cancelled` → No changes allowed
- **Response**:
  ```json
  {
    "success": true,
    "message": "Auction status updated successfully",
    "data": {
      "auctionId": "AUCTION001",
      "currentStatus": "active",
      "startTime": "2025-11-01T10:00:00.000Z",
      "endTime": "2025-11-01T18:00:00.000Z",
      "car": { /* car details */ },
      "updatedAt": "2025-10-31T10:35:00.000Z"
    },
    "timestamp": "2025-10-31T10:35:00.000Z"
  }
  ```

### Bidding System

#### Place Bid
- **Endpoint**: `POST /api/v1/auction/placeBids`
- **Description**: Allows dealers to place bids on active auctions
- **Request Body**:
  ```json
  {
    "auctionId": "AUCTION001",
    "bidAmount": 18000,
    "dealerName": "John Doe",
    "dealerEmail": "john.doe@example.com"
  }
  ```
- **Business Rules**:
  - Auction must be in `active` status
  - Bid amount must be higher than starting price
  - Bid amount must exceed current highest bid
  - Auction must be within start and end time
  - **Dealer can only participate in one auction at a time**
- **Response**:
  ```json
  {
    "success": true,
    "message": "Bid placed successfully",
    "data": {
      "bidId": "BID_1698756000_abc123",
      "bidAmount": 18000,
      "bidTime": "2025-10-31T11:00:00.000Z",
      "auction": {
        "auctionId": "AUCTION001",
        "car": { /* car details */ }
      },
      "dealer": {
        "dealerId": "DEALER_1698756000_def456",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "previousBid": "ObjectId(...)"
    },
    "timestamp": "2025-10-31T11:00:00.000Z"
  }
  ```

#### Get Winner Bid
- **Endpoint**: `GET /api/v1/auction/{auctionId}/winner-bid`
- **Description**: Retrieves information about the highest bid and the dealer who placed it
- **URL Parameters**: 
  - `auctionId`: Unique identifier of the auction
- **Response** (with bids):
  ```json
  {
    "success": true,
    "message": "Winner bid retrieved successfully",
    "data": {
      "auctionId": "AUCTION001",
      "winnerBid": {
        "bidId": "BID_1698756000_abc123",
        "bidAmount": 18000,
        "bidTime": "2025-10-31T11:00:00.000Z"
      },
      "dealer": {
        "dealerId": "DEALER_1698756000_def456",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "auctionStatus": "active"
    },
    "timestamp": "2025-10-31T11:30:00.000Z"
  }
  ```
- **Response** (no bids):
  ```json
  {
    "success": true,
    "message": "No bids found for this auction",
    "data": {
      "auctionId": "AUCTION001",
      "winnerBid": null,
      "dealer": null,
      "auctionStatus": "pending"
    },
    "timestamp": "2025-10-31T11:30:00.000Z"
  }
  ```

### System Health

#### Health Check
- **Endpoint**: `GET /health`
- **Description**: Returns API health status
- **Response**:
  ```json
  {
    "status": "OK",
    "timestamp": "2025-10-31T10:30:00.000Z",
    "service": "Car Auction System API"
  }
  ```

#### API Information
- **Endpoint**: `GET /`
- **Description**: Returns API information and available endpoints
- **Response**:
  ```json
  {
    "message": "Welcome to Car Auction System API",
    "version": "1.0.0",
    "endpoints": {
      "health": "/health",
      "generateToken": "POST /api/v1/auction/token",
      "createAuction": "POST /api/v1/auction/createAuction",
      "updateAuctionStatus": "PATCH /api/v1/auction/status/{auctionId}",
      "getWinnerBid": "GET /api/v1/auction/{auctionId}/winner-bid",
      "placeBid": "POST /api/v1/auction/placeBids"
    }
  }
  ```

## Data Models

### Car Model
Represents a car available for auction.

**Schema**:
```typescript
{
  _id: ObjectId,
  carId: string,        // Unique car identifier
  make: string,         // Car manufacturer (e.g., "Toyota")
  carModel: string,     // Car model (e.g., "Camry")
  year: number,         // Manufacturing year
  createdAt: Date,
  updatedAt: Date
}
```

**Validation**:
- `carId`: Required, unique
- `make`: Required, non-empty string
- `carModel`: Required, non-empty string
- `year`: Required, between 1900 and current year + 1

### Dealer Model
Represents registered dealers who can place bids. **Business Rule: A dealer can only participate in one auction at a time.**

**Schema**:
```typescript
{
  _id: ObjectId,
  dealerId: string,           // Unique dealer identifier
  name: string,               // Dealer name
  email: string,              // Dealer email (unique)
  currentAuctionId: ObjectId, // Reference to current active auction (optional)
  createdAt: Date,
  updatedAt: Date
}
```

**Validation**:
- `dealerId`: Required, unique
- `name`: Required, non-empty string
- `email`: Required, unique, valid email format
- `currentAuctionId`: Optional reference to current active Auction

### Auction Model
Represents an auction for a specific car.

**Schema**:
```typescript
{
  _id: ObjectId,
  auctionId: string,           // Unique auction identifier
  auctionStatus: AuctionStatus, // Current auction status
  startingPrice: number,       // Minimum bid amount
  startTime: Date,            // Auction start time
  endTime: Date,              // Auction end time
  carId: ObjectId,            // Reference to Car being auctioned
  createdAt: Date,
  updatedAt: Date
}
```

**Auction Status Enum**:
- `pending`: Auction created but not started
- `active`: Auction is currently running
- `completed`: Auction has ended
- `cancelled`: Auction was cancelled

**Validation**:
- `auctionId`: Required, unique
- `startingPrice`: Required, must be > 0
- `endTime`: Must be after `startTime`
- `carId`: Required reference to existing Car

### Bid Model
Represents a bid placed by a dealer on an auction.

**Schema**:
```typescript
{
  _id: ObjectId,
  bidId: string,           // Unique bid identifier
  bidAmount: number,       // Bid amount
  previousBid: ObjectId,   // Reference to previous bid (optional)
  bidTime: Date,          // When bid was placed
  auctionId: ObjectId,    // Reference to Auction
  dealerId: ObjectId,     // Reference to Dealer who placed bid
  createdAt: Date,
  updatedAt: Date
}
```

**Validation**:
- `bidId`: Required, unique
- `bidAmount`: Required, must be > 0
- `bidTime`: Required, defaults to current time
- `auctionId`: Required reference to existing Auction
- `dealerId`: Required reference to existing Dealer

## Database Relationships

### One-to-One Relationships
- **Auction ↔ Car**: Each auction auctions exactly one car at a time

### One-to-Many Relationships
- **Auction → Bid**: An auction can have many bids
- **Dealer → Bid**: A dealer can place multiple bids (but only in one auction at a time)
- **Auction → Dealer**: An auction can have many participating dealers

### Foreign Key Relationships
- `auction.carId` → `car._id`
- `bid.auctionId` → `auction._id`
- `bid.dealerId` → `dealer._id`
- `bid.previousBid` → `bid._id` (self-reference)
- `dealer.currentAuctionId` → `auction._id`

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "status": "error" | "fail",
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2025-10-31T10:30:00.000Z",
    "path": "/api/v1/auction/createAuction",
    "method": "POST"
  }
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate resources, invalid state transitions)
- `500`: Internal Server Error

## Testing

### Automated Test Scripts

This project includes comprehensive test scripts that cover the complete auction flow.

#### Test Scripts Available


##### 1. `test-auction-flow.js` (JavaScript)  
A JavaScript version of the same test flow for environments without TypeScript.

**Run with:**
```bash
npm run test:flow:js
# or
yarn test:flow:js
```

#### Test Flow Overview

The test script performs the following steps:

##### 1. 📋 Database Setup
- Adds 3 test cars directly to the database:
  - Toyota Camry 2023
  - Honda Civic 2022  
  - BMW X5 2024
- Adds 3 test dealers to the database

##### 2. 🔐 Admin Authentication
- Logs in as admin using credentials:
  - Username: `Admin`
  - Password: `Admin`
- Retrieves admin authentication token

##### 3. 🏁 Auction Creation
- Admin creates a new auction
- Sets starting price at $15,000
- Associates the first car (Toyota Camry) with the auction
- Sets auction duration for 30 minutes

##### 4. 🎫 Token Generation
- Generates authentication tokens for 3 different dealers:
  - John Dealer (john@dealership.com)
  - Sarah Motors (sarah@motors.com)
  - Mike Auto (mike@auto.com)
- Falls back to admin token if dealer authentication fails

##### 5. 💰 Bidding Process
- Each dealer places 3 rounds of bids
- Bids start at $15,500 and increase by $1,000 each time
- Ensures each subsequent bid is higher than the previous
- Total of 9 bids placed across all dealers

##### 6. 🔒 Auction Closure
- Admin closes the auction
- Changes auction status from 'active' to 'closed'

##### 7. 🏆 Winner Determination
- Fetches the auction winner information
- Displays winner details including:
  - Winner name and email
  - Winning bid amount
  - Bid timestamp
  - Bid ID

#### Prerequisites

##### 1. Server Running
Make sure your server is running before executing the test:
```bash
npm run dev
# or
yarn dev
```

##### 2. MongoDB Connection
Ensure MongoDB is running and accessible at:
- Default: `mongodb://localhost:27017/car-auction-system`
- Or set `MONGODB_URI` in your environment

##### 3. Environment Variables
Make sure your `.env` file contains:
```bash
MONGODB_URI=mongodb://localhost:27017/car-auction-system
JWT_SECRET=your-secret-key
PORT=3000
```

#### Test Results

The script provides detailed console output showing:
- ✅ Successful operations
- ❌ Failed operations  
- ⚠️ Warnings and fallbacks
- 📊 Final test summary

##### Sample Output
```
🚀 Starting Car Auction System Test Flow
=========================================

📋 Step 1: Adding cars directly to database...
✅ Added car: Toyota Camry (2023)
✅ Added car: Honda Civic (2022)
✅ Added car: BMW X5 (2024)
✅ Successfully added 3 cars to database

🔐 Step 2: Admin login...
✅ Admin login successful
📝 Admin token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

... (continued output)

🏆 Step 7: Fetching auction winner...
✅ Winner information retrieved:
🏆 Auction ID: AUCTION_1730332800000
📊 Auction Status: closed
🥇 Winner: Mike Auto (mike@auto.com)
💰 Winning Bid: $23500
⏰ Bid Time: 10/31/2025, 2:15:30 PM
🆔 Bid ID: 6543210fedcba9876543210f

📊 TEST SUMMARY
================
Cars Added: 3
Dealers Added: 3
Admin Login: ✅
Auction Created: ✅
Tokens Generated: 3
Bids Placed: 9
Auction Closed: ✅
Winner Found: ✅

Overall Success: 8/8 steps completed
```

#### Troubleshooting

##### Common Issues

1. **Connection Refused**
   - Make sure the server is running on port 3000
   - Check if MongoDB is running

2. **Authentication Errors**
   - Verify admin credentials in the test script
   - Check JWT_SECRET in environment variables

3. **Database Errors**
   - Ensure MongoDB connection string is correct
   - Check database permissions

4. **Bid Conflicts**
   - The script handles "one dealer per auction" business rule
   - Multiple bids from same dealer are allowed in same auction

### Manual Testing

You can also test individual endpoints manually using tools like Postman or curl:

```bash
# Get admin token
curl -X POST http://localhost:3000/api/v1/auction/token \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Admin"}'

# Create auction (with token)
curl -X POST http://localhost:3000/api/v1/auction/createAuction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "auctionId": "TEST_AUCTION",
    "startingPrice": 15000,
    "startTime": "2025-10-31T10:00:00Z",
    "endTime": "2025-10-31T11:00:00Z", 
    "carId": "CAR001"
  }'
```

#### Testing Notes

- The test script automatically cleans up test data before and after running
- All test data uses prefixed IDs (CAR001, DEALER001, etc.) to avoid conflicts
- The script includes proper error handling and graceful cleanup
- Test execution typically takes 30-60 seconds depending on network latency