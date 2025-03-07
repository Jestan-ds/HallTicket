import express from "express";
import { get } from "http";
import { createExams, getExams } from "../controllers/examController";

const examRouter = express.Router();

examRouter.get("/exams",getExams); 
examRouter.post("/exams",async (req, res) => {
    await createExams(req, res)
});