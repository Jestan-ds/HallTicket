import expres from "express"
import { examRegistration, getRegisteredExam,getRegisteredExamDetailsByApplicationId, getRegisteredExams, approveRegistration, rejectRegistration } from "../controllers/examRegistrationController"


const examRegistrationRouter = expres.Router()

examRegistrationRouter.post("/register", (req, res) => {
    examRegistration(req, res)
})
examRegistrationRouter.get("/getUserExamStats/:id", (req, res) => {
    getRegisteredExam(req, res)
}
)
examRegistrationRouter.get('/registered-exams/:applicationId', (req, res) => {
    getRegisteredExamDetailsByApplicationId(req, res)

});

examRegistrationRouter.get('/registrations', (req, res) => {getRegisteredExams(req, res)}); // Route for RegistrationList.tsx to fetch all
examRegistrationRouter.post('/registrations/:applicationId/approve', (req, res) =>{approveRegistration(req, res)}); // Route for approving
examRegistrationRouter.post('/registrations/:applicationId/reject', (req, res) =>{rejectRegistration(req, res)});   // Route for rejecting

export default examRegistrationRouter