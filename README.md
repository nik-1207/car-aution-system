# Car Auction System

A comprehensive car auction system built with Node.js, TypeScript, and MongoDB using Mongoose. This system allows dealers to bid on cars in real-time auctions.

## Features

- **Car Management**: Add, update, delete, and search cars
- **Dealer Management**: Register and manage dealer accounts
- **Auction Management**: Create and manage auctions with time-based bidding
- **Bid Management**: Place bids with validation and history tracking
- **Real-time Bidding**: Support for live auction bidding
- **Data Validation**: Comprehensive validation for all operations
- **Relationship Management**: Proper relationships between cars, dealers, auctions, and bids

## Data Models

### Car
- `carId`: Unique identifier for the car
- `make`: Car manufacturer (e.g., Toyota, Ford)
- `model`: Car model (e.g., Camry, Mustang)
- `year`: Manufacturing year
- `createdAt`, `updatedAt`: Timestamps

### Dealer
- `dealerId`: Unique identifier for the dealer
- `name`: Dealer's full name
- `email`: Unique email address
- `createdAt`, `updatedAt`: Timestamps

### Auction
- `auctionId`: Unique identifier for the auction
- `carId`: Reference to the car being auctioned
- `startingPrice`: Minimum bid amount
- `currentHighestBid`: Current highest bid amount
- `startTime`, `endTime`: Auction duration
- `auctionStatus`: Current status (scheduled, active, ended, cancelled)
- `winnerId`: Reference to the winning dealer
- `createdAt`, `updatedAt`: Timestamps

### Bid
- `bidId`: Unique identifier for the bid
- `auctionId`: Reference to the auction
- `dealerId`: Reference to the dealer who placed the bid
- `bidAmount`: Bid amount
- `previousBid`: Reference to the previous highest bid
- `bidTime`: When the bid was placed
- `createdAt`, `updatedAt`: Timestamps

## Setup

1. **Clone this repository**
   ```bash
   git clone <repository-url>
   cd car-auction-system
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Setup MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database for the auction system
   - Note your connection string

4. **Configure the system**
   - Update the MongoDB connection string in your code
   - Ensure all required environment variables are set

## Usage

### Basic Setup

```typescript
import { CarAuctionSystem } from './src/index';

const auctionSystem = new CarAuctionSystem();

// Initialize with your MongoDB connection string
await auctionSystem.initialize('mongodb://localhost:27017/car-auction-db');

// Get service instances
const carService = auctionSystem.getCarService();
const dealerService = auctionSystem.getDealerService();
const auctionService = auctionSystem.getAuctionService();
const bidService = auctionSystem.getBidService();
```

### Car Management

```typescript
// Create a car
const car = await carService.createCar({
  carId: 'CAR001',
  make: 'Toyota',
  model: 'Camry',
  year: 2022
});

// Get a car
const retrievedCar = await carService.getCarById('CAR001');

// Search cars
const toyotas = await carService.searchCars({ make: 'Toyota' });

// Update car
await carService.updateCar('CAR001', { year: 2023 });
```

### Dealer Management

```typescript
// Register a dealer
const dealer = await dealerService.createDealer({
  dealerId: 'DEALER001',
  name: 'John Smith',
  email: 'john@example.com'
});

// Get dealer by ID
const retrievedDealer = await dealerService.getDealerById('DEALER001');

// Get dealer by email
const dealerByEmail = await dealerService.getDealerByEmail('john@example.com');
```

### Auction Management

```typescript
// Create an auction
const auction = await auctionService.createAuction({
  auctionId: 'AUCTION001',
  carId: 'CAR001',
  startingPrice: 15000,
  startTime: new Date(),
  endTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
});

// Update auction status to active
await auctionService.updateAuctionStatus('AUCTION001', AuctionStatus.ACTIVE);

// Get active auctions  
const activeAuctions = await auctionService.getActiveAuctions();

// Get upcoming auctions
const upcomingAuctions = await auctionService.getUpcomingAuctions();
```

### Bid Management

```typescript
// Place a bid
const bid = await bidService.placeBid({
  bidId: 'BID001',
  auctionId: 'AUCTION001',
  dealerId: 'DEALER001',
  bidAmount: 16000
});

// Get bids for an auction
const auctionBids = await bidService.getBidsByAuction('AUCTION001');

// Get highest bid for an auction
const highestBid = await bidService.getHighestBidForAuction('AUCTION001');

// Get bid history
const bidHistory = await bidService.getBidHistory('AUCTION001');
```

## Business Rules

1. **Auction Timing**: Bids can only be placed during active auction periods
2. **Bid Validation**: Each bid must be higher than the current highest bid or starting price
3. **Car Availability**: A car can only be in one active auction at a time
4. **Dealer Authentication**: Only registered dealers can place bids
5. **Bid Tracking**: Each bid references the previous highest bid for audit trails

## Database Relationships

- **One-to-One**: Auction ↔ Car (one auction per car)
- **One-to-Many**: Auction → Bids (multiple bids per auction)
- **One-to-Many**: Dealer → Bids (multiple bids per dealer)
- **Many-to-One**: Bids → Auction (bids belong to one auction)
- **Many-to-One**: Bids → Dealer (bids belong to one dealer)

## Scripts

- `npm run start`: Start the application with file watching
- `npm run compile`: Compile TypeScript to JavaScript
- `npm run test`: Run Jest tests
- `npm run lint`: Run ESLint for code formatting
- `npm run pretty`: Format code with Prettier

## Development

1. **Build the project**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npm run test
   ```

3. **Start development server**
   ```bash
   npm run start
   ```

## Example Usage

See the `demonstrateAuctionSystem()` function in `src/index.ts` for a complete example of how to use all the system features.

To run the demonstration:
```typescript
// Uncomment the last line in src/index.ts
demonstrateAuctionSystem().catch(console.error);
```

## Error Handling

The system includes comprehensive error handling for:
- Database connection issues
- Validation errors
- Business rule violations
- Not found scenarios
- Duplicate entries

All service methods throw descriptive errors that can be caught and handled appropriately.

## API Endpoints

The system provides REST API endpoints for interacting with the car auction system:

### Base URL
```
http://localhost:3000/api/v1/auction
```

### Authentication
All API endpoints (except token generation) require Bearer token authentication.

#### Generate Token
```http
POST /api/v1/auction/token
Content-Type: application/json

{
  "username": "Admin",
  "password": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token generated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h"
  }
}
```

### API Endpoints

#### 1. Create Auction
```http
POST /api/v1/auction/createAuction
Authorization: Bearer <token>
Content-Type: application/json

{
  "auctionId": "AUCTION001",
  "carId": "CAR001",
  "startingPrice": 15000,
  "startTime": "2025-10-31T10:00:00.000Z",
  "endTime": "2025-10-31T18:00:00.000Z"
}
```

#### 2. Update Auction Status
```http
PATCH /api/v1/auction/status/{auctionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active"
}
```

Valid statuses: `scheduled`, `active`, `ended`, `cancelled`

#### 3. Get Winner Bid
```http
GET /api/v1/auction/{auctionId}/winner-bid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Winner bid retrieved successfully",
  "data": {
    "auctionId": "AUCTION001",
    "auctionStatus": "active",
    "startingPrice": 15000,
    "currentHighestBid": 18000,
    "winnerBid": {
      "bidId": "BID001",
      "bidAmount": 18000,
      "bidTime": "2025-10-31T12:30:00.000Z",
      "dealerId": "DEALER001"
    }
  }
}
```

#### 4. Place Bid
```http
POST /api/v1/auction/placeBids
Authorization: Bearer <token>
Content-Type: application/json

{
  "bidId": "BID001",
  "auctionId": "AUCTION001",
  "dealerId": "DEALER001",
  "bidAmount": 18000
}
```

### Running the API Server

1. **Start the API server:**
   ```bash
   npm run start:api
   ```

2. **Development mode with auto-reload:**
   ```bash
   npm run dev:api
   ```

3. **Check server health:**
   ```bash
   curl http://localhost:3000/health
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/car-auction-db
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGIN=*
```

### API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Example Usage with curl

1. **Generate token:**
```bash
curl -X POST http://localhost:3000/api/v1/auction/token \
  -H "Content-Type: application/json" \
  -d '{"username": "Admin", "password": "Admin"}'
```

2. **Create auction:**
```bash
curl -X POST http://localhost:3000/api/v1/auction/createAuction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "auctionId": "AUCTION001",
    "carId": "CAR001", 
    "startingPrice": 15000,
    "startTime": "2025-10-31T10:00:00.000Z",
    "endTime": "2025-10-31T18:00:00.000Z"
  }'
```

3. **Place bid:**
```bash
curl -X POST http://localhost:3000/api/v1/auction/placeBids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bidId": "BID001",
    "auctionId": "AUCTION001",
    "dealerId": "DEALER001",
    "bidAmount": 18000
  }'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

UNLICENSED