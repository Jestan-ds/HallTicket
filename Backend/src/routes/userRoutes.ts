import express from "express";
import { addUserDetails } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add-user-details", authenticate, async (req, res) => {
  try {
    await addUserDetails(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding user details" });
  }
});

export default router;
