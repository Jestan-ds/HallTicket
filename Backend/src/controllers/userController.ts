import { db } from "../db";
import { users } from "../db/schema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function registerUser(req: Request, res: Response) {
    try {
        const { name, email, password, phone,dob,gender,address,city,state,zipCode } = req.body;

        // Validate Required Fields
        if (!name || !email || !password || !phone||!dob||!gender||!address||!city||!state||!zipCode) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // Hash Password Before Storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check If User Already Exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // Insert Into Database
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword, // Store Hashed Password
            phone,
            dob,
            gender,
            address,
            city,
            state,
            zipCode
        });

        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user:", error); // Log error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate Required Fields
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }
        const user = await db.select().from(users).where(eq(users.email, email));
        if (user.length === 0) {
            return res.status(400).json({ error: "User not found!" });
        }
        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password!" });
        }
        res.json({ success: true, message: "User logged in successfully!" });
    } catch (error) {
        console.error("Error logging in user:", error); // Log error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await db.select().from(users).where(eq(users.id, Number(userId)));
        if (user.length === 0) {
            return res.status(400).json({ error: "User not found!" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error getting user:", error); // Log error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
}


