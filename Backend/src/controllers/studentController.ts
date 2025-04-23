import { Request, Response } from "express";
import {db} from "../db/index"
import { students } from "../db/schema";
import multer from "multer";
import xlsx from "xlsx";

const upload = multer({storage: multer.memoryStorage()}); // Store files in memory

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
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse the Excel file
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const newStudents = xlsx.utils.sheet_to_json(sheet) as unknown as {
        usn: string;
        studentId: number;
        name: string;
        program: string;
        college: string;
        examCenter: string;
        photo: string; 
      }

      // Validate and process the data
      if (!Array.isArray(newStudents) || newStudents.length === 0) {
        return res.status(400).json({ error: "Invalid or empty Excel file" });
      }

      // Delete old data and insert new data
      await db.delete(students);
      await db.insert(students).values(newStudents);

      res.json({ success: true, message: "Students uploaded successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error uploading students" });
    }
  }

