import express from "express";
import { createExams, deleteExams, editExams, getExam, getExams } from "../controllers/examController";
import { authenticate, authorize } from "../middleware/authMiddleware";


const examRouter = express.Router();

examRouter.get("/",authenticate,getExams); 
examRouter.post("/create",authenticate,authorize(["admin"]),async (req, res) => {
    await createExams(req, res)
});

examRouter.put("/:id",async (req, res) => {
    await editExams(req, res)
});

examRouter.delete("/:id",async (req, res) => {
    await deleteExams(req, res)
});

examRouter.get("/:id",async (req, res) => {
    await getExam(req, res)
});
export default examRouter;