import { Request, Response } from "express";
import {db} from "../db/index"
import { students } from "../db/schema";

// Fetch all students
export async function getStudents(req: Request, res: Response) {
  try {
    const studentList = await db.select().from(students);
    res.json(studentList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
}

// Upload students (delete old data and insert new)
export async function uploadStudents(req: Request, res: Response) {
  try {
    const newStudents = req.body;
    await db.delete(students);
    await db.insert(students).values(newStudents);
    res.json({ success: true, message: "Students uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error uploading students" });
  }
}
