import { Request, Response } from "express";
import { db } from "../db"
import { usersAuth, usersDetails } from "../db/schema";
import { eq } from "drizzle-orm";

export const addUserDetails = async (req: Request, res: Response) => {
  try {
    const { name, phone, dob, gender, address, city, state, zipCode, email } = req.body;
    const [authUser] = await db
    .select()
    .from(usersAuth)
    .where(eq(usersAuth.email, email));

  if (!authUser) {
    return res.status(404).json({ message: "Auth user not found" });
  }

    await db.insert(usersDetails).values({
      authId: authUser.id,
      name,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      email,
      zipCode,
    });

    res.status(201).json({ message: "User details added successfully!" });

  } catch (err) {
    res.status(500).json({ message: "Error adding user details", error: err });
  }
};
