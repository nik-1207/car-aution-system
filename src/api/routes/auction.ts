import { AuctionController } from "../controllers/AuctionController";
import { authenticateToken, login } from "../middleware/auth";
import { Router } from "express";

const router = Router();
const auctionController = new AuctionController();

// Authentication routes
router.post("/token", login);

// Protected auction routes
router.post("/createAuction", authenticateToken, auctionController.createAuction);
router.patch("/status/:auctionId", authenticateToken, auctionController.updateAuctionStatus);
router.get("/:auctionId/winner-bid", authenticateToken, auctionController.getWinnerBid);
router.post("/placeBids", authenticateToken, auctionController.placeBid);

export default router;