import express from "express";
import { createExams, editExams, getExams } from "../controllers/examController";

const examRouter = express.Router();

examRouter.get("/exams",getExams); 
examRouter.post("/exams",async (req, res) => {
    await createExams(req, res)
});

examRouter.patch("/exams/:id",async (req, res) => {
    await editExams(req, res)
});

export default examRouter;