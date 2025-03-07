import express from "express";
import { getStudents, uploadStudents } from "../controllers/studentController";

const studentRouter = express.Router();

studentRouter.get("/", getStudents);
studentRouter.post("/upload", uploadStudents);

export default studentRouter;
