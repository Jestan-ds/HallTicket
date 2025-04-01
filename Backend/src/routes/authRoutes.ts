import express from "express";
import { register, login, verifyEmail, logout } from "../controllers/authController";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    await register(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login error" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    await verifyEmail(req, res);  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error verifying email" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await logout(req, res);
  } catch (error) {    
    console.error(error);
    res.status(500).json({ error: "Logout error" });    
  }
});

export default router;
