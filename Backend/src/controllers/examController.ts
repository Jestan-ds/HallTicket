import { Request, Response } from "express";
import {db} from "../db/index"
import {exams} from "../db/schema"
export const getExams = async (req: Request, res: Response) => {
    try {
        const examList = await db.select().from(exams);
        res.json(examList);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch exams" });
    }
};

export const createExams = async (req: Request, res: Response) => {
    try{
        const {id,name,exam_date,exam_time,exam_duration,exam_fee,exam_registrationEndDate,exam_category,exam_description,exam_prerequisites} = req.body;
        if(!id||!name||!exam_date||!exam_time||!exam_duration||!exam_fee||!exam_registrationEndDate||!exam_category||!exam_description||!exam_prerequisites){
            return res.status(400).json({ error: "All fields are required!" });
        }
        await db.insert(exams).values({id,name,exam_date,exam_time,exam_duration,exam_fee,exam_registrationEndDate,exam_category,exam_description,exam_prerequisites});
        res.json({ success: true, message: "Exams created successfully!" });
    }catch(error){
        res.status(500).json({ error: "Failed to create exams" });
    }
}
