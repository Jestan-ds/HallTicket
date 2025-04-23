import express from "express";
import { getStudents, uploadStudents } from "../controllers/studentController";
import multer from "multer";
const studentRouter = express.Router();

studentRouter.get("/", getStudents);

const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory
studentRouter.post("/upload",upload.single("file"), async (req, res) => {
    await uploadStudents(req, res);
});

export default studentRouter;
