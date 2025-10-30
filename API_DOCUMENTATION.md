# Car Auction API Documentation

## Overview

The Car Auction API provides endpoints for managing car auctions, allowing dealers to create auctions, place bids, and track auction results. The API uses JWT authentication for security.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All API endpoints (except token generation) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Generate Authentication Token

**Endpoint:** `POST /api/v1/auction/token`

**Description:** Generates a JWT token for API authentication using static credentials.

**Request Body:**
```json
{
  "username": "Admin",
  "password": "Admin"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "username": "Admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 2. Create Auction

**Endpoint:** `POST /api/v1/auction/createAuction`

**Description:** Creates a new auction for a specific car.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "auctionId": "AUCTION001",
  "carId": "CAR001",
  "startingPrice": 15000,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T18:00:00Z"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Auction created successfully",
  "data": {
    "auctionId": "AUCTION001",
    "carId": "CAR001",
    "startingPrice": 15000,
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T18:00:00.000Z",
    "auctionStatus": "scheduled",
    "createdAt": "2024-01-10T12:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Missing required fields: auctionId, carId, startingPrice, startTime, endTime"
}
```

### 3. Update Auction Status

**Endpoint:** `PATCH /api/v1/auction/status/{auctionId}`

**Description:** Updates the status of an auction (e.g., start the auction).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `auctionId` (string): The unique identifier of the auction

**Request Body:**
```json
{
  "status": "active",
  "winnerId": "DEALER001" // Optional, for when marking as ended
}
```

**Valid Status Values:**
- `scheduled` - Auction is scheduled but not started
- `active` - Auction is currently running
- `ended` - Auction has ended
- `cancelled` - Auction was cancelled

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Auction status updated successfully",
  "data": {
    "auctionId": "AUCTION001",
    "auctionStatus": "active",
    "winnerId": null,
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Auction not found"
}
```

### 4. Get Winner Bid Information

**Endpoint:** `GET /api/v1/auction/{auctionId}/winner-bid`

**Description:** Retrieves information about the highest bid and the dealer who placed it.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `auctionId` (string): The unique identifier of the auction

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Winner bid retrieved successfully",
  "data": {
    "auctionId": "AUCTION001",
    "startingPrice": 15000,
    "currentHighestBid": 18500,
    "highestBid": {
      "bidId": "BID003",
      "bidAmount": 18500,
      "bidTime": "2024-01-15T14:30:00.000Z",
      "dealer": {
        "dealerId": "DEALER002",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  }
}
```

**Response (No Bids - 200):**
```json
{
  "success": true,
  "message": "No bids found for this auction",
  "data": {
    "auctionId": "AUCTION001",
    "startingPrice": 15000,
    "currentHighestBid": null,
    "highestBid": null,
    "winningDealer": null
  }
}
```

### 5. Place Bid

**Endpoint:** `POST /api/v1/auction/placeBids`

**Description:** Allows a dealer to place a bid on an active auction.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bidId": "BID001",
  "auctionId": "AUCTION001",
  "dealerId": "DEALER001",
  "bidAmount": 16000
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "bidId": "BID001",
    "auctionId": "AUCTION001",
    "dealerId": "DEALER001",
    "bidAmount": 16000,
    "bidTime": "2024-01-15T12:30:00.000Z",
    "previousBid": null
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Failed to place bid",
  "error": "Bid amount must be higher than 15000"
}
```

## Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API server is running.

**Response:**
```json
{
  "success": true,
  "message": "Car Auction API is running",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 3600.123
}
```

## Error Handling

All API responses follow a consistent structure:

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
  "message": "Error description",
  "error": "Detailed error message" // Optional
}
```

### Common HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Invalid or expired token
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

## Example Usage Flow

1. **Generate Token:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auction/token \
     -H "Content-Type: application/json" \
     -d '{"username": "Admin", "password": "Admin"}'
   ```

2. **Create Auction:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auction/createAuction \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "auctionId": "AUCTION001",
       "carId": "CAR001",
       "startingPrice": 15000,
       "startTime": "2024-01-15T10:00:00Z",
       "endTime": "2024-01-15T18:00:00Z"
     }'
   ```

3. **Start Auction:**
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/auction/status/AUCTION001 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"status": "active"}'
   ```

4. **Place Bid:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auction/placeBids \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "bidId": "BID001",
       "auctionId": "AUCTION001",
       "dealerId": "DEALER001",
       "bidAmount": 16000
     }'
   ```

5. **Get Winner Information:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/auction/AUCTION001/winner-bid \
     -H "Authorization: Bearer <token>"
   ```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## Security Notes

- JWT tokens expire after 24 hours
- All endpoints except `/token` require authentication
- CORS is configured to allow specific origins
- Security headers are applied using Helmet
- Input validation is performed on all endpoints

## Development Setup

1. Install dependencies:
   ```bash
   npm install express cors helmet morgan jsonwebtoken bcryptjs
   npm install @types/express @types/cors @types/morgan @types/jsonwebtoken @types/bcryptjs
   ```

2. Start the server:
   ```bash
   npm run start
   ```

3. The API will be available at `http://localhost:3000`