import { Router } from "express";
import { AuctionController } from "../controllers/AuctionController";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Authentication endpoint - no auth required
router.post("/token", AuthController.generateAuthToken);

// Auction endpoints - all require authentication
router.post("/createAuction", authenticateToken, AuctionController.createAuction);
router.patch("/status/:auctionId", authenticateToken, AuctionController.updateAuctionStatus);
router.get("/:auctionId/winner-bid", authenticateToken, AuctionController.getWinnerBid);
router.post("/placeBids", authenticateToken, AuctionController.placeBid);

export default router;
