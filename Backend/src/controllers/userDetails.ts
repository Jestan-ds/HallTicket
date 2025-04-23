import { Request, Response } from "express";
import { db } from "../db"; // Adjust according to your DB configuration
import { usersDetails } from "../db/schema";
import { eq } from "drizzle-orm";

// Fetch all user details
export const getAllUsersDetails = async (req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersDetails);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Fetch a single user's details by ID
export const getUserDetailsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [user] = await db.select().from(usersDetails).where(eq(usersDetails.authId, Number(id)));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Create a new user detail
export const createUserDetails = async (req: Request, res: Response) => {
  try {
    const { authId, name, phone, dob, gender, address, city, state, zipCode, email } = req.body;
    
    if (!authId || !name || !phone || !dob || !gender || !address || !city || !state || !zipCode || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await db
      .select()
      .from(usersDetails)
      .where(eq(usersDetails.authId, authId)|| eq(usersDetails.email, email));
    
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User with the same authId or email already exists" });
    }
    const [newUser] = await db.insert(usersDetails).values({
      authId,
      name,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      zipCode,
      email,
    });

    res.status(201).json({ message: "User details created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user details" });
  }
};

// Update user details by ID
export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, dob, gender, address, city, state, zipCode, email } = req.body;

    const updatedUser = await db
      .update(usersDetails)
      .set({ name, phone, dob, gender, address, city, state, zipCode, email })
      .where(eq(usersDetails.authId, Number(id)));

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user details" });
  }
};

// Delete user details by ID
export const deleteUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await db.delete(usersDetails).where(eq(usersDetails.authId, Number(id)));

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User details deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user details" });
  }
};