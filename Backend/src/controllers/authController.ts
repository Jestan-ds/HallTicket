
import { Request, Response } from "express";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { db } from "../db"; // Adjust according to your DB config
import { usersAuth } from "../db/schema"; // Adjust according to your model
import { eq } from "drizzle-orm";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const SENDER_EMAIL = process.env.SENDER_EMAIL!;

console.log(JWT_SECRET, SENDER_EMAIL);

const COOKIE_OPTIONS = {
  httpOnly: true, // 🔐 Prevents JavaScript access
  secure: process.env.NODE_ENV === "production", // 🔒 Only HTTPS in production
  sameSite: "strict" as "strict", // 🚫 Protects against CSRF
  maxAge: 24*60*60*1000, // ⏳ Expires in 1 day
};

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "jestandsouza03@gmail.com",
    pass: "yzbvxhhfzimfgmwn",
  },
  },
);

// Temporary OTP storage (in-memory object)
const otpStorage = new Map();

/**
 * 🟢 REGISTER USER & SEND OTP EMAIL
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await db.select().from(usersAuth).where(eq(usersAuth.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP (valid for 5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStorage.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send OTP email using Nodemailer
    const mailOptions = {
      from: SENDER_EMAIL,
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    // Store user but not verified yet
    await db.insert(usersAuth).values({
      email,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    res.status(201).json({ message: "OTP sent to email! Verify to complete registration." });

  } catch (err: any) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

/**
 * 🟢 VERIFY EMAIL OTP
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = otpStorage.get(email);

    if (!storedOtp || storedOtp.otp !== parseInt(otp) || Date.now() > storedOtp.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Mark the user as verified in MySQL
    await db.update(usersAuth).set({ isVerified: true }).where(eq(usersAuth.email, email));

    // Remove OTP from storage after successful verification
    otpStorage.delete(email);

    res.json({ message: "Email verified successfully!" });

  } catch (err: any) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

/**
 * 🟢 LOGIN USER
 */
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(usersAuth).where(eq(usersAuth.email, email));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    } 
  

    if (!user.isVerified) return res.status(400).json({ message: "Email not verified" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("authToken", token, COOKIE_OPTIONS);
    res.json({ message: "Login successful!" });

  } catch (err: any) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("authToken", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully!" });
};

export default router;
