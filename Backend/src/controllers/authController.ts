
import { Request, Response } from "express";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { db } from "../db"; // Adjust according to your DB config
import { usersAuth } from "../db/schema"; // Adjust according to your model
import { eq } from "drizzle-orm";
import { sendEmail } from "../utils/sendEmail"; // Adjust according to your email utility
import { saveOTP, verifyOTP } from "../utils/OtpStore";
import { randomInt } from "crypto";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const SENDER_EMAIL = process.env.SENDER_EMAIL!;

console.log(JWT_SECRET, SENDER_EMAIL);

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as "strict",
};

const COOKIE_OPTIONS = {
  httpOnly: true, // 🔐 Prevents JavaScript access
  secure: process.env.NODE_ENV === "production", // 🔒 Only HTTPS in production
  sameSite: "strict" as "strict", // 🚫 Protects against CSRF
  maxAge: 24*60*60*1000, // ⏳ Expires in 1 day
};

// Nodemailer transporter setup
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "jestandsouza03@gmail.com",
//     pass: "",
//   },
//   },
// );

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

    await sendEmail(mailOptions);

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

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("authToken", token, COOKIE_OPTIONS);
    res.json({ message: "Login successful!", token });

  } catch (err: any) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("authToken", clearCookieOptions);
  res.json({ message: "Logged out successfully!" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    

  // Generate OTP (6-digit)
  const otp = randomInt(100000, 999999).toString();
  const mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };
  saveOTP(email, otp); // Store OTP temporarily

  // Send OTP via email
  await sendEmail(mailOptions);

  res.json({ message: "OTP sent to email" });

  } catch (err: any) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};


export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
    const isValid = verifyOTP(email, otp); // Verify OTP
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });
    res.json({ message: "OTP verified successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await db.update(usersAuth).set({ password: hashedPassword }).where(eq(usersAuth.email, email));

    res.json({ message: "Password reset successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

export const getUserAuthDetails = async (req: Request, res: Response) => {
  try {
    const authId = req.params.id
    const user = await db.select().from(usersAuth).where(eq(usersAuth.id, Number(authId)));
    if (!user) return res.status(404).json({ message: "User not found" });
    // Remove password from response
    user[0].password ="";
    // Send user details without password in response

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
};


export const checkAuth = async(req: Request, res: Response) => {
  res.json({message:"i am inside"})
  // const token = req.cookies?.authToken;

  // if (!token) {
  //   return res.status(401).json({ authenticated: false, message: "No token found" });
  // }

  // try {
  //   if (!process.env.JWT_SECRET) {
  //     throw new Error("JWT_SECRET is not defined in the environment variables");
  //   }

  //   const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; role: string };

  //   return res.status(200).json({
  //     authenticated: true,
  //     user: {
  //       id: decoded.userId,
  //       role: decoded.role,
  //     },
  //   });
  // } catch (error: any) {
  //   if (error.name === "TokenExpiredError") {
  //     return res.status(401).json({ authenticated: false, message: "Token has expired" });
  //   }
  //   if (error.name === "JsonWebTokenError") {
  //     return res.status(401).json({ authenticated: false, message: "Invalid token" });
  //   }
  //   console.error("Error verifying token:", error);
  //   return res.status(500).json({ authenticated: false, message: "Internal server error" });
  // }
};



