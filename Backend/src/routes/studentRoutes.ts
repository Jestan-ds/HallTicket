// src/routes/studentRoutes.ts
import express from "express";
import { getStudents, uploadStudents } from "../controllers/studentController";
import multer from "multer";

const studentRouter = express.Router();

// Configure multer for memory storage (good for processing buffer directly)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB file size limit
    fileFilter: (req, file, cb) => {
        // Basic file type check
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
            file.mimetype === 'application/vnd.ms-excel' || // .xls
            file.mimetype === 'text/csv') { // .csv
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel (xlsx, xls) and CSV files are allowed.'));
        }
    }
});

// Route to get all students (for display after upload or general listing)
studentRouter.get("/", getStudents); // Frontend will call this to populate the table

// Route to upload the student data Excel/CSV file
// The 'file' field name in FormData should match upload.single('file')
studentRouter.post("/upload", upload.single("file"), (req, res) => {
    uploadStudents(req, res);
});

export default studentRouter;