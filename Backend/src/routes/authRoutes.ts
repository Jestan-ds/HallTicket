import express from "express";
import { register, login, verifyEmail, logout, forgotPassword, verifyOtp, resetPassword, getUserAuthDetails, checkAuth } from "../controllers/authController";

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

router.post("/forgot-password", async (req, res) => {
  await forgotPassword(req, res);
});

 router.post("/verify-otp", async (req, res) => {
  await verifyOtp(req, res);
});

router.post("/reset-password", async (req, res) => {
  try {
    await resetPassword(req, res);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

router.get("/:id",async(req, res) => {
  try {
    await getUserAuthDetails(req, res);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user details" });
  }
})

router.get("/check-auth", async (req, res) => {
   await checkAuth(req,res)
});

export default router;
